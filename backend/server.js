require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise'); // Use promise-based MySQL for better async handling
const cors = require('cors'); // npm install cors
const multer = require('multer'); // npm install multer
const fs = require('fs');
const path = require('path'); // Built-in Node.js module
const sharp = require('sharp');
const session = require('express-session'); // npm install express-session
const MySQLStore = require('express-mysql-session')(session); // npm install express-mysql-session
const bcrypt = require('bcryptjs'); // npm install bcryptjs
const nodemailer = require('nodemailer'); // npm install nodemailer
const crypto = require('crypto'); // Built-in Node.js module
const { v4: uuidv4 } = require('uuid');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const cookieParser = require('cookie-parser'); // Import cookie-parser
const app = express();
const { exec } = require('child_process');
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Enable CORS with credentials
const allowedOrigins = [
  "http://localhost:5173",
  "http://ubuntu-24.localhost:5173",
  "http://192.168.254.145:5173",
  "https://rabasorsogon.com", 
  "https://www.rabasorsogon.com",
  "http://147.93.19.247:5173",
  "http://192.168.56.1:5173",
];

// Configure CORS with allowed origins and credentials
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true); // Allow the origin
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true, 
  })
);

app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(cookieParser()); // Use cookie-parser middleware

// Create a connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10, // Adjust this based on your needs
  queueLimit: 0,
  timezone: '+08:00', 
});

// Test the connection pool
(async () => {
  try {
    const connection = await pool.getConnection();
    console.log('Connected to database');
    connection.release(); // Release the connection back to the pool
  } catch (err) {
    console.error('Error connecting to database:', err);
  }
})();

// MySQL session store configuration
const sessionStore = new MySQLStore({}, pool); // Pass the pool directly

// Log session store configuration
// console.log('Session store initialized');

// Error handling for session store initialization
sessionStore.on('error', (error) => {
  console.error('Session store error:', error);
});

// Configure session middleware
app.use(
  session({
    secret: 'whats-on-your-mind',
    resave: false,
    saveUninitialized: true,
    cookie: {
      httpOnly: true,          // For security: Prevents client-side JS access to cookies
      secure: false,  // Set to true when in production (HTTPS)
      sameSite: 'lax',        // Required for cross-origin cookies (ensure cookies work between frontend and backend)
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    },
    store: sessionStore,  // Use MySQL session store
  })
);


// Routes and API Endpoints
app.get('/', (req, res) => {
  req.session.viewCount = (req.session.viewCount || 0) + 1;
  res.json({ message: `You've visited this page ${req.session.viewCount} times` });
});

// Error handling middleware for Express
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

app.use((req, res, next) => {
  // console.log("Session cookie:", req.cookies['connect.sid']); // Log session cookie
  next();
});

// Super Admin Login Endpoint
app.post('/superadmin/login', async (req, res) => {
  const { identifier, password } = req.body; // Use 'identifier' for username or email

  // Validate input
  if (!identifier || !password) {
    return res.status(400).json({
      success: false,
      message: 'Username or email and password are required',
    });
  }

  try {
    // Query the database for the admin using identifier
    const [rows] = await pool.query(
      'SELECT * FROM admin WHERE username = ? OR email = ?',
      [identifier, identifier] // Check both username and email
    );

    if (rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'User not found',
      });
    }

    const user = rows[0];

    // Check if the user registered using Google
    if (!user.password) {
      return res.status(401).json({
        success: false,
        message: 'Please log in using Google',
      });
    }

    // Compare the provided password with the hashed password from the database
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid password',
      });
    }

    // Set the user session
    req.session.admin = { admin_id: user.admin_id }; // Fixed admin reference
    return res.json({
      success: true,
      message: 'Login successful',
    });
  } catch (err) {
    console.error('Database query error:', err);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

// Endpoint for checking superadmin login status
app.get('/superadmin/check-login', async (req, res) => {
  try {
    // Query the sessions table to retrieve session data using the session ID
    const [results] = await pool.query(
      'SELECT data FROM sessions WHERE session_id = ?',
      [req.sessionID]
    );

    if (results.length === 0) {
      // Session not found
      return res.status(200).json({
        isLoggedIn: false,
        message: 'Session not found',
      });
    }

    // Parse the session data from the database
    let session;
    try {
      session = JSON.parse(results[0].data);
    } catch (parseError) {
      console.error('Error parsing session data:', parseError);
      return res.status(500).json({
        isLoggedIn: false,
        error: 'Failed to parse session data',
      });
    }

    // Check if the session contains admin data
    if (session && session.admin) {
      return res.status(200).json({
        isLoggedIn: true,
        admin: session.admin,
      });
    } else {
      // Session exists but no admin data
      return res.status(200).json({
        isLoggedIn: false,
        message: 'Admin data not found in session',
      });
    }
  } catch (err) {
    console.error('Error fetching session data from database:', err);
    return res.status(500).json({
      isLoggedIn: false,
      error: 'Internal server error',
    });
  }
});

// Endpoint for admin logout
app.post('/superadmin/logout', (req, res) => {
  if (req.session && req.session.admin) {
    delete req.session.admin; // Remove only the admin data from the session

    req.session.save((err) => {
      if (err) {
        return res.status(500).json({ success: false, message: 'Could not log out the admin session' });
      }
      res.json({ success: true, message: 'Admin logout successful' });
    });
  } else {
    res.status(400).json({ success: false, message: 'No admin session found to log out' });
  }
});

// User Login Endpoint
app.post('/login', async (req, res) => {
  const { identifier, password } = req.body; // Use 'identifier' to accept either username or email

  if (!identifier || !password) {
    return res.status(400).json({ success: false, message: 'Username or email and password are required' });
  }

  try {
    // Use a pooled connection to query the database
    const [rows] = await pool.query(
      'SELECT * FROM users WHERE (username = ? OR email = ?)',
      [identifier, identifier]
    );

    if (rows.length > 0) {
      const user = rows[0];

      // Check if the user registered using Google
      if (user.password === null) {
        return res.status(401).json({ success: false, message: 'Please log in using Google' });
      }

      // Compare the provided password with the hashed password from the database
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (passwordMatch) {

        // Generate OTP and session ID
        const otp = Math.floor(100000 + Math.random() * 900000); // 6-digit OTP
        const sessionId = crypto.randomBytes(16).toString('hex'); // Unique session ID

        // Save all user data along with OTP and session ID to the `otp_sessions` table
        const otpSql = `
          INSERT INTO otp_sessions (session_id, user_id, email, otp, expires_at)
          VALUES (?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL 10 MINUTE))
        `;
        await pool.query(otpSql, [sessionId, user.user_id, user.email, otp]);

        // Send OTP to the user's email
        const transporter = nodemailer.createTransport({
          service: 'Gmail', // Replace with your email service provider
          auth: {
            user: process.env.GMAIL_USER, // Your email address
            pass: process.env.GMAIL_PASS  // Your email password
          }
        });

        await transporter.sendMail({
          from: '"RabaSorsogon Support" <support@rabasorsogon.com>',
          to: user.email,
          subject: 'Your OTP Code for Login',
          text: `Your OTP code is ${otp}. It will expire in 10 minutes.`
        });

        // Set the user session
        // req.session.user = { user_id: user.user_id };
        return res.json({ 
          success: true, 
          message: 'Login successful. Please verify your OTP.',
          sessionId: sessionId
        });
      } else {
        return res.status(401).json({ success: false, message: 'Invalid password' });
      }
    } else {
      return res.status(401).json({ success: false, message: 'User not found' });
    }
  } catch (err) {
    console.error('Database query error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Verify OTP Endpoint
app.post('/login-verify-otp', async (req, res) => {
  const { otp, sessionId } = req.body;

  // Validate input
  if (!otp) {
    return res.status(400).json({ success: false, error: 'OTP are required' });
  }
  if (!sessionId) {
    return res.status(400).json({ success: false, error: 'Session ID are required' });
  }

  try {
    // Query to validate OTP and session ID
    const otpSql = `
      SELECT * 
      FROM otp_sessions 
      WHERE session_id = ? 
        AND otp = ? 
        AND expires_at > NOW()
    `;
    const [results] = await pool.query(otpSql, [sessionId, otp]);

    // Check if OTP is valid and not expired
    if (results.length === 0) {
      return res.status(400).json({ success: false, error: 'Invalid or expired OTP' });
    }

    const user = results[0];

    // Remove OTP session after verification
    const deleteOtpSql = 'DELETE FROM otp_sessions WHERE session_id = ?';
    await pool.query(deleteOtpSql, [sessionId]);

    // Initialize session if not already initialized
    if (!req.session) {
      req.session = {};
    }

    // Save user ID to session
    req.session.user = { user_id: user.user_id };
    // console.log(req.session);

    return res.json({ success: true, message: 'OTP verified successfully' });
  } catch (err) {
    console.error('Error verifying OTP:', err.message || err);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Endpoint for checking login status
app.get('/check-login', async (req, res) => {
  // console.log('Current session:', req.session); // Log the session object
  try {
    // Query the sessions table to retrieve session data using the session ID
    const [results] = await pool.query(
      'SELECT data FROM sessions WHERE session_id = ?',
      [req.sessionID]
    );

    if (results.length === 0) {
      // Session not found
      return res.status(200).json({ isLoggedIn: false });
    }

    // Parse the session data from the database
    const session = JSON.parse(results[0].data);

    // Check if the session has user data
    if (session && session.user) {
      // User is logged in
      return res.status(200).json({ isLoggedIn: true, user: session.user });
    } else {
      // No user data in session
      return res.status(200).json({ isLoggedIn: false });
    }
  } catch (err) {
    console.error('Error fetching session data from database:', err);
    return res.status(500).json({ isLoggedIn: false, error: 'Internal server error' });
  }
});

// Endpoint to get userData from users table based on user_id
app.get('/get-userData', async (req, res) => {
  try {
    // Check if user is logged in and session contains user_id
    if (req.session.user && req.session.user.user_id) {
      const userId = req.session.user.user_id;
      const sql = 'SELECT user_id, google_id, Fname, Lname, username, contact, email, address, image, image_path FROM users WHERE user_id = ?';
      
      // Query the database to fetch user data based on user_id
      const [results] = await pool.query(sql, [userId]);

      if (results.length > 0) {
        const userData = results[0];
        return res.json({ success: true, userData });
      } else {
        return res.status(404).json({ success: false, message: 'User data not found' });
      }
    } else {
      // If user is not authenticated or session user_id is not set
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }
  } catch (err) {
    console.error('Error fetching user data:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Endpoint for updating user profile
app.put('/update-profile', async (req, res) => {
  try {
    // Retrieve updated user profile data from the request body
    const { user_id, Fname, Lname, username, email, contact } = req.body;

    // Validate required fields
    if (!user_id || !Fname || !Lname || !username || !email || !contact) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    const sql = `
      UPDATE users 
      SET Fname = ?, Lname = ?, username = ?, email = ?, contact = ? 
      WHERE user_id = ?
    `;

    // Execute the update query
    const [results] = await pool.query(sql, [Fname, Lname, username, email, contact, user_id]);

    // Check if the update was successful
    if (results.affectedRows > 0) {
      return res.json({ success: true, message: 'Profile updated successfully' });
    } else {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
  } catch (error) {
    console.error('Error updating profile:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Endpoint to get liked pages
app.get('/liked-pages', async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized access' });
    }

    const userId = req.session.user.user_id;
    const sql = `SELECT liked_pages.*, 
                  b.business_id, 
                  b.businessLogo as image, 
                  b.businessName as name, 
                  b.location AS destination,
                  IF(
                    JSON_UNQUOTE(JSON_EXTRACT(b.businessCard, '$.description')) IS NULL OR 
                    JSON_UNQUOTE(JSON_EXTRACT(b.businessCard, '$.description')) = '', 
                    NULL, 
                    JSON_UNQUOTE(JSON_EXTRACT(b.businessCard, '$.description'))
                  ) AS description,
                  b.category,
                  AVG(r.ratings) AS rating,
                  MIN(CAST(p.price AS DECIMAL)) AS lowest_price,
                  MAX(CAST(p.price AS DECIMAL)) AS highest_price
                FROM liked_pages
                LEFT JOIN 
                  businesses b ON liked_pages.business_id = b.business_id
                LEFT JOIN
                  business_ratings r ON b.business_id = r.business_id
                LEFT JOIN 
                  products p ON b.business_id = p.business_id
                WHERE liked_pages.user_id = ?
                GROUP BY liked_pages.id, b.business_id;`;
    const [results] = await pool.query(sql, [userId]);

    if (results.length > 0) {
      const likedPages = results.map(result => ({
        id: result.id,
        business_id: result.business_id,
        user_id: result.user_id,
        liked_at: result.liked_at,
        name: result.name,
        description: result.description,
        budget: result.budget,
        image: result.image,
        category: result.category,
        rating: result.rating,
        lowest_price: result.lowest_price,
        highest_price: result.highest_price,
        destination: result.destination
      }));
      res.json({ success: true, likedPages });
    } else {
      return res.status(404).json({ success: false, message: 'No liked pages found' });
    }
  } catch (error) {
    console.error('Error fetching liked pages:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Endpoint to get liked businesses
app.get('/liked-businesses', async (req, res) => {
  const userId = req.session.user.user_id;
  const sql = 'SELECT * FROM liked_pages WHERE user_id = ?';
  const [results] = await pool.query(sql, [userId]);
  res.json({ success: true, likedBusinesses: results });
});

// Endpoint to like pages
app.post('/like-business', async (req, res) => {
  const { businessId } = req.body;
  const userId = req.session.user.user_id;
  const sql = 'INSERT INTO liked_pages (business_id, user_id) VALUES (?, ?)';
  const [results] = await pool.query(sql, [businessId, userId]);
  res.json({ success: results.affectedRows > 0, message: results.affectedRows > 0 ? 'Page liked successfully' : 'Page not found' });
});

// Endpoint to unlike pages
app.delete('/unlike-business/:business_id', async (req, res) => {
  const { business_id } = req.params;
  const userId = req.session.user.user_id;
  const sql = 'DELETE FROM liked_pages WHERE business_id = ? AND user_id = ?';
  const [results] = await pool.query(sql, [business_id, userId]);
  res.json({ success: results.affectedRows > 0, message: results.affectedRows > 0 ? 'Page unliked successfully' : 'Page not found' });
});

// Endpoint to unlike pages
app.delete('/unlike-businessInProfile/:id', async (req, res) => {
  const { id } = req.params;
  const userId = req.session.user.user_id;
  const sql = 'DELETE FROM liked_pages WHERE id = ? AND user_id = ?';
  const [results] = await pool.query(sql, [id, userId]);
  res.json({ success: results.affectedRows > 0, message: results.affectedRows > 0 ? 'Page unliked successfully' : 'Page not found' });
});


// Endpoint to set business_id in session
app.post('/set-business-id', (req, res) => {
  const { businessId } = req.body;
  if (!businessId) {
    return res.status(400).json({ success: false, message: 'Business ID is required' });
  }

  req.session.user.business_id = businessId;
  res.json({ success: true, message: 'Business ID set in session' });
});

// Multer configuration for storing uploaded images
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Store files in the 'uploads' directory
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname)); // Filename includes timestamp to avoid conflicts
  }
});

const upload = multer({ storage: storage });

// Middleware to convert images to WebP and compress
const convertToWebP = async (req, res, next) => {
  if (!req.files || req.files.length === 0) {
    return next();
  }

  try {
    for (const file of req.files) {
      const originalPath = file.path;
      const webpPath = `uploads/${path.parse(file.filename).name}.webp`;

      // Convert and compress image to WebP
      await sharp(originalPath)
        .webp({ quality: 80 }) // Adjust quality between 75-85
        .toFile(webpPath);

      // Remove the original file after conversion
      fs.unlinkSync(originalPath);

      // Update the file path in req.files for further processing
      file.path = webpPath;
      file.filename = `${path.parse(file.filename).name}.webp`;
    }

    next();
  } catch (error) {
    console.error('Error processing image:', error);
    res.status(500).json({ error: 'Image processing failed' });
  }
};

// Serve static files from the 'uploads' directory
app.use('/uploads', express.static('uploads'));

// Endpoint for updating user profile
app.put('/updateUserProfile/:id', upload.single('profilePic'), convertToWebP, async (req, res) => {
  const userId = req.params.id;
  let { username, email, phoneNumber, address } = req.body;
  let imagePath = req.body.image_path; // Existing image path
  let imageFileName = req.body.image;  // Existing image filename

  // If a new file is uploaded, replace both image path and filename
  if (req.file) {
    imagePath = req.file.path; // Update the image path with the newly uploaded file
    imageFileName = req.file.filename; // Save the uploaded filename
  }

  try {
    // Build dynamic SQL query for updating fields
    let sql = 'UPDATE users SET ';
    const params = [];

    // Only update the username if it's provided
    if (username) {
      sql += 'username = ?, ';
      params.push(username);
    }

    if (email) {
      sql += 'email = ?, ';
      params.push(email);
    }

    if (phoneNumber) {
      sql += 'contact = ?, ';
      params.push(phoneNumber);
    }

    if (address) {
      sql += 'address = ?, ';
      params.push(address);
    }

    // Always update image filename and image path if file was uploaded
    if (imageFileName && imagePath) {
      sql += 'image = ?, image_path = ?, ';
      params.push(imageFileName, imagePath);
    }

    // Remove the last comma and space from the SQL query
    sql = sql.slice(0, -2) + ' WHERE user_id = ?';
    params.push(userId);

    // Execute the query using the pool connection
    const [results] = await pool.query(sql, params);

    if (results.affectedRows === 0) {
      // No user found with the given ID
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    return res.json({
      success: true,
      message: 'User updated successfully',
      updatedUserData: { username, email, phoneNumber, imageFileName, imagePath }
    });
  } catch (err) {
    console.error('Error updating user profile:', err);
    return res.status(500).json({ success: false, message: 'Failed to update user profile' });
  }
});

// Endpoint for updating user password
app.put('/update-password', async (req, res) => {
  try {
    // Retrieve updated user password data from the request body
    const { user_id, currentPassword, newPassword, confirmNewPassword } = req.body;

    console.log('Received Updated Password request:', req.body);

    // Check if newPassword and confirmPassword are equal
    if (!newPassword || !confirmNewPassword || newPassword !== confirmNewPassword) {
      return res.status(400).json({ error: "New password and confirm password do not match or are empty" });
    }

    // Fetch the hashed password of the user from the database
    const fetchPasswordSql = 'SELECT password FROM users WHERE user_id = ?';

    const [results] = await pool.query(fetchPasswordSql, [user_id]);
    if (results.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const user = results[0];
    const passwordMatch = await bcrypt.compare(currentPassword, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect' });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the user password in the database
    const updatePasswordSql = 'UPDATE users SET password = ? WHERE user_id = ?';

    const [updateResults] = await pool.query(updatePasswordSql, [hashedPassword, user_id]);
    if (updateResults.affectedRows > 0) {
      return res.json({ success: true, message: 'Password Changed Successfully' });
    } else {
      return res.status(500).json({ success: false, message: 'Failed to update password' });
    }
  } catch (error) {
    console.error('Error changing password:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Signup Endpoint with OTP Integration
app.post('/signup', async (req, res) => {
  const { username, firstName, lastName, email, address, phone, password, confirmPassword } = req.body;

  console.log('Received signup request:', req.body);

  // Check if password and confirmPassword are equal
  if (password !== confirmPassword) {
    return res.status(400).json({ error: "Password and confirm password do not match or are empty" });
  }

  try {
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate OTP and session ID
    const otp = Math.floor(100000 + Math.random() * 900000); // 6-digit OTP
    const sessionId = crypto.randomBytes(16).toString('hex'); // Unique session ID

    // Save all user data along with OTP and session ID to the `otp_sessions` table
    const otpSql = `
      INSERT INTO otp_sessions (session_id, username, first_name, last_name, email, address, phone, password, otp, expires_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL 10 MINUTE))
    `;
    await pool.query(otpSql, [sessionId, username, firstName, lastName, email, address, phone, hashedPassword, otp]);

    // Send OTP to the user's email
    const transporter = nodemailer.createTransport({
      service: 'Gmail', // Replace with your email service provider
      auth: {
        user: process.env.GMAIL_USER, // Your email address
        pass: process.env.GMAIL_PASS  // Your email password
      }
    });

    await transporter.sendMail({
      from: '"RabaSorsogon Support" <support@rabasorsogon.com>',
      to: email,
      subject: 'Your OTP Code for Signup',
      text: `Your OTP code is ${otp}. It will expire in 10 minutes.`
    });

    console.log('OTP sent to:', email);

    // Return a success response with session info
    return res.json({
      success: true,
      message: 'Signup successful. Please verify your OTP.',
      sessionId: sessionId // Return session ID for client-side OTP verification
    });
  } catch (err) {
    console.error('Error executing SQL query:', err);

    // Check if the error is a duplicate entry error
    if (err.code === 'ER_DUP_ENTRY') {
      if (err.message.includes('username_UNIQUE')) {
        return res.status(400).json({ success: false, error: 'Username is already taken' });
      } else if (err.message.includes('email_UNIQUE')) {
        return res.status(400).json({ success: false, error: 'Email is already taken' });
      }
    }

    return res.status(500).json({ success: false, message: 'Internal server error', error: err.message });
  }
});

// Verify OTP Endpoint
app.post('/verify-otp', async (req, res) => {
  const { otp, sessionId } = req.body;

  try {
    // Check if the OTP and session ID are valid and not expired
    const otpSql = 'SELECT * FROM otp_sessions WHERE session_id = ? AND otp = ? AND expires_at > NOW()';
    const [results] = await pool.query(otpSql, [sessionId, otp]);

    if (results.length === 0) {
      return res.status(400).json({ success: false, error: 'Invalid or expired OTP' });
    }

    const user = results[0];

    // Remove OTP session after verification
    const deleteOtpSql = 'DELETE FROM otp_sessions WHERE session_id = ?';
    await pool.query(deleteOtpSql, [sessionId]);

    // Insert user data into the database after successful OTP verification
    const userSql = `
      INSERT INTO users (username, password, Fname, Lname, address, email, contact)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const [userInsertResult] = await pool.query(userSql, [
      user.username, // username from otp_sessions
      user.password, // hashed password from otp_sessions
      user.first_name, // first_name from otp_sessions
      user.last_name, // last_name from otp_sessions
      user.address, // address from otp_sessions
      user.email, // email from otp_sessions
      user.phone // phone from otp_sessions
    ]);

    req.session.user = { user_id: userInsertResult.insertId };
    // console.log(req.session);
    return res.json({ success: true, message: 'OTP verified and user registered successfully' });
  } catch (err) {
    console.error('Error verifying OTP:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});


// Passport setup
app.use(passport.initialize());
app.use(passport.session());

const getRedirectionURL = () => {
  switch (process.env.NODE_ENV) {
    case 'production':
      return process.env.REDIRECTION_URL_PRODUCTION;
    case 'staging':
      return process.env.REDIRECTION_URL_STAGING;
    case 'development':
    default:
      return process.env.REDIRECTION_URL_LOCAL;
  }
};

// Function to get the base URL based on the environment
const getBaseURL = () => {
  switch (process.env.NODE_ENV) {
    case 'production':
      return process.env.BASE_URL_PRODUCTION;
    case 'staging':
      return process.env.BASE_URL_STAGING;
    case 'development':
    default:
      return process.env.BASE_URL_LOCAL;
  }
};

// Function to get the callback URL
const getCallbackURL = () => {
  return `${getRedirectionURL()}/auth/google/callback`;
};

// Configure Google Strategy for Passport
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: getCallbackURL() // Use the dynamic callback URL
},
async (accessToken, refreshToken, profile, done) => {
  try {
    // Check if user exists based on Google ID or email
    const [results] = await pool.query(
      'SELECT * FROM users WHERE google_id = ? OR email = ?',
      [profile.id, profile.emails[0].value]
    );

    if (results.length > 0) {
      // User already exists, return the existing user
      return done(null, results[0]);
    } else {
      // Generate a unique username
      const baseName = profile.displayName.replace(/\s+/g, '').toLowerCase(); // Remove spaces and lowercase
      const uniqueUsername = await generateUniqueUsername(baseName);

      const newUser = {
        google_id: profile.id,
        Fname: profile.name.givenName,
        Lname: profile.name.familyName,
        username: uniqueUsername,
        email: profile.emails[0].value,
        image: profile.photos[0].value
      };

      // Insert the new user into the database
      const [insertResult] = await pool.query('INSERT INTO users SET ?', newUser);

      // Add the new user ID to the user object
      newUser.user_id = insertResult.insertId;

      // Return the newly created user
      return done(null, newUser);
    }
  } catch (err) {
    console.error('Error during Google login:', err);
    return done(err);
  }
}));

// Serialize user to the session
passport.serializeUser((user, done) => {
  done(null, user.user_id); // Ensure a valid identifier is used
});

// Deserialize user from the session
passport.deserializeUser(async (id, done) => {
  try {
    const [results] = await pool.query('SELECT * FROM users WHERE user_id = ?', [id]);

    if (results.length === 0) {
      console.error('No user found for ID:', id);
      return done(new Error('User not found'));
    }

    done(null, results[0]); // Pass the user data to the next middleware
  } catch (err) {
    console.error('Error deserializing user:', err);
    done(err);
  }
});

// Routes for Google authentication
app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get(
  '/auth/google/callback',
  passport.authenticate('google', { failureRedirect: getBaseURL() }), // Use the base URL for failure
  (req, res) => {
    if (!req.user || !req.user.user_id) {
      console.error('User object is invalid:', req.user);
      return res.status(500).json({ success: false, message: 'Invalid user object' });
    }

    // Assign user details to session
    req.session.user = {
      user_id: req.user.user_id,
      name: `${req.user.Fname} ${req.user.Lname}`,
    };

    // Save the session
    req.session.save((err) => {
      if (err) {
        console.error('Error saving session:', err);
        return res.status(500).json({ success: false, message: 'Failed to save session' });
      }

      // Redirect to the base URL
      res.redirect(getBaseURL());
    });
  }
);

// Root route to check session
app.get('/', (req, res) => {
  // Redirect if no user session
  if (!req.session.user) {
    return res.redirect(getBaseURL()); // Use the base URL for redirection
  }

  // Respond with session user details
  res.json({ name: req.session.user.name });
});


// Endpoint for forgot password
app.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ success: false, message: 'Email is required' });
  }

  try {
    // Generate a secure token
    const token = crypto.randomBytes(20).toString('hex');

    // Set token expiration time (e.g., 1 hour)
    const tokenExpiration = Date.now() + 3600000;

    // Store the token and expiration in the database for the user
    const [results] = await pool.query(
      'UPDATE users SET reset_password_token = ?, reset_password_expires = ? WHERE email = ?',
      [token, tokenExpiration, email]
    );

    if (results.affectedRows === 0) {
      console.log('Email not found:', email); // Log the email not found
      return res.status(404).json({ success: false, message: 'Email not found' });
    }

    // Send email with the token
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS
      }
    });

    const mailOptions = {
      to: email,
      from: process.env.GMAIL_USER,
      subject: 'Password Reset',
      text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n
             Please click on the following link, or paste this into your browser to complete the process:\n\n
             ${getRedirectionURL()}/reset-password/${token}\n\n
             If you did not request this, please ignore this email and your password will remain unchanged.\n`
    };

    // Send the email and respond
    transporter.sendMail(mailOptions, (err) => {
      if (err) {
        console.error('Error sending email:', err);
        return res.status(500).json({ success: false, message: 'Failed to send email' });
      }
      res.json({ success: true, message: 'Password reset email sent' });
    });
  } catch (err) {
    console.error('Database query error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Endpoint to handle password reset
app.post('/reset-password/:token', async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;

  if (!newPassword) {
    return res.status(400).json({ success: false, message: 'New password is required' });
  }

  try {
    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the user's password in the database
    const [results] = await pool.query(
      'UPDATE users SET password = ?, reset_password_token = NULL, reset_password_expires = NULL WHERE reset_password_token = ?',
      [hashedPassword, token]
    );

    if (results.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Invalid or expired token' });
    }

    res.json({ success: true, message: 'Password has been reset' });
  } catch (err) {
    console.error('Error during password reset:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Redirect to the React frontend for password reset
app.get('/reset-password/:token', (req, res) => {
  const { token } = req.params;

  // Redirect to the React frontend with the token as a query parameter
  res.redirect(`${getBaseURL()}/resetpassword?token=${token}`);
});

// Handle the password reset form submission
app.post('/reset-password/:token', async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;

  // Log the new password to ensure it's defined
  console.log('New password:', newPassword);

  if (!newPassword) {
    return res.status(400).json({ success: false, message: 'New password is required' });
  }

  try {
    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the user's password in the database
    const [results] = await pool.query(
      'UPDATE users SET password = ?, reset_password_token = NULL, reset_password_expires = NULL WHERE reset_password_token = ?',
      [hashedPassword, token]
    );

    if (results.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Invalid or expired token' });
    }

    res.json({ success: true, message: 'Password has been reset' });
  } catch (err) {
    console.error('Error during password reset:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Endpoint for user logout
app.post('/logout', (req, res) => {
  if (req.session && req.session.user) {
    delete req.session.user; // Remove only the user data from the session

    req.session.save((err) => {
      if (err) {
        return res.status(500).json({ success: false, message: 'Could not log out the user session' });
      }
      res.json({ success: true, message: 'User logout successful' });
    });
  } else {
    res.status(400).json({ success: false, message: 'No user session found to log out' });
  }
});

// Admin Login Endpoint
app.post('/admin/login', async (req, res) => {
  const { identifier, password } = req.body; // Use 'identifier' to accept either username or email
  const sql = 'SELECT * FROM admin WHERE (username = ? OR email = ?)'; // SQL query to retrieve admin by username or email

  try {
    // Execute the query using the pool, no need to manually acquire and release connections
    const [results] = await pool.query(sql, [identifier, identifier]);

    if (results.length > 0) {
      const admin = results[0];

      // Compare the provided password with the hashed password from the database
      const passwordMatch = await bcrypt.compare(password, admin.password);

      if (passwordMatch) {
        // Set admin data in the session upon successful login
        req.session.admin = {
          admin_id: admin.admin_id
        };
        console.log('Admin logged in:', req.session.admin);
        return res.json({ success: true, message: 'Admin login successful' });
      } else {
        return res.status(401).json({ success: false, message: 'Invalid password' });
      }
    } else {
      return res.status(401).json({ success: false, message: 'Admin not found' });
    }
  } catch (err) {
    console.error('Error executing SQL query:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Endpoint for checking login status
app.get('/admin/check-login', async (req, res) => {
  try {
    // Retrieve session data from the database
    const [session] = await pool.query('SELECT * FROM sessions WHERE session_id = ?', [req.sessionID]);

    // Check if session exists and has user data
    if (session && session[0] && session[0].data) {
      const sessionData = JSON.parse(session[0].data); // Session data is stored as a JSON string in the 'data' column
      if (sessionData.admin) {
        // User is logged in
        return res.status(200).json({ isLoggedIn: true, admin: sessionData.admin });
      }
    }

    // Session not found or user not logged in
    return res.status(200).json({ isLoggedIn: false });
  } catch (err) {
    console.error('Error fetching session from database:', err);
    return res.status(500).json({ isLoggedIn: false, error: 'Internal server error' });
  }
});

// Endpoint for updating user password
app.put('/admin/update-password', async (req, res) => {
  try {
    // Retrieve updated user password data from the request body
    const { admin_id, currentPassword, newPassword, confirmNewPassword } = req.body;

    console.log('Received Updated Password request:', req.body);

    // Check if newPassword and confirmPassword are equal
    if (!newPassword || !confirmNewPassword || newPassword !== confirmNewPassword) {
      return res.status(400).json({ error: "New password and confirm password do not match or are empty" });
    }

    // Fetch the hashed password of the user from the database
    const [results] = await pool.query('SELECT password FROM admin WHERE admin_id = ?', [admin_id]);

    if (results.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const user = results[0];
    const passwordMatch = await bcrypt.compare(currentPassword, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect' });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the user password in the database
    const [updateResults] = await pool.query('UPDATE admin SET password = ? WHERE admin_id = ?', [hashedPassword, admin_id]);

    if (updateResults.affectedRows > 0) {
      return res.json({ success: true, message: 'Password Changed Successfully' });
    } else {
      return res.status(500).json({ success: false, message: 'Failed to update password' });
    }
  } catch (error) {
    console.error('Error changing password:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Admin Logout Endpoint
app.post('/admin/logout', async (req, res) => {
  // Check if admin session exists
  if (req.session.admin) {
    // Remove admin data from the session
    delete req.session.admin;
  }

  try {
    // Check if both admin and user sessions are empty
    if (!req.session.admin && !req.session.user && !req.session.employee) {
      // Destroy the session in the database using the session ID
      await sessionStore.destroy(req.sessionID);

      // Clear the session cookie
      res.clearCookie('connect.sid');

      // Destroy the session on the server
      req.session.destroy((err) => {
        if (err) {
          console.error('Error destroying session:', err);
          return res.status(500).json({ success: false, message: 'Internal server error' });
        }
        // Session destroyed successfully
        return res.json({ success: true, message: 'Admin logout successful, session destroyed' });
      });
    } else {
      // If either admin or user session exists, respond with success message
      return res.json({ success: true, message: 'Logout successful' });
    }
  } catch (err) {
    console.error('Error destroying session in database:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Business application endpoint
app.post('/submitBusinessApplication', async (req, res) => {
  const {
    user_id,
    firstName,
    lastName,
    businessName,
    certificateNo,
    businessScope,
    businessType,
    category,
    completeAddress,
    latitude,
    longitude    
  } = req.body;

  // Input validation (ensure all fields are provided)
  if (
    !user_id || !firstName || !lastName || !businessName ||
    !certificateNo || !businessScope || !businessType || !category
  ) {
    return res.status(400).json({ error: 'Please fill in all required fields' });
  }

  // Function to generate a random 6-digit number for application_id
  const generateApplicationId = () => {
    return Math.floor(100000 + Math.random() * 900000); // Generates a number between 100000 and 999999
  };

  // Function to check if application_id exists in the database
  const isApplicationIdUnique = async (application_id) => {
    const [rows] = await pool.query('SELECT COUNT(*) AS count FROM business_applications WHERE application_id = ?', [application_id]);
    return rows[0].count === 0; // Returns true if unique (count is 0)
  };

  // Generate a unique 6-digit application_id
  let application_id;
  let unique = false;

  while (!unique) {
    application_id = generateApplicationId();
    unique = await isApplicationIdUnique(application_id);
  }

  // Convert category array to JSON string
  const categoryJSON = JSON.stringify(category);

  // Set pin_location to null if latitude or longitude is null
  const pinLocationJSON = (latitude == null || longitude == null) 
  ? null 
  : JSON.stringify({ latitude, longitude });

  try {
    // SQL query to insert business application data into the database, including application_id
    const sql = `
      INSERT INTO business_applications (
        application_id, user_id, firstName, lastName, businessName, businessTerritory,
        certNumber, businessScope, businessType, category, completeAddress, pin_location
      ) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    // Execute the SQL query
    const [results] = await pool.query(
      sql, 
      [application_id, user_id, firstName, lastName, businessName, businessScope, certificateNo, businessScope, businessType, categoryJSON, completeAddress, pinLocationJSON]
    );

    console.log('Business application submitted successfully. Affected rows:', results.affectedRows);

    // Configure email transporter
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS
      }
    });

    let subject = 'New Business Application';
    let text = `
      Rabasorsogon has a new business application from <b>${firstName} ${lastName}</b> with business application id <b>${application_id}</b>. 
      \nVisit admin dashboard for more information. 
      \nClick <a href="https://rabasorsogon.com/superadmindashboard" target="_blank">here</a> to navigate to the admin dashboard.
      \n\nBest regards,
      \nRabaSorsogon
    `;

    // Send the email notification
    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: 'rabasorsogon@gmail.com, per.yongyong71@gmail.com, nebrejrempis18@gmail.com, Alepse@gmail.com', // add dd ang ibang account ng member
      subject,
      text,
      html: text,
    });

    // Return a success response with the generated application_id
    return res.json({ success: true, message: 'Business application submitted successfully', application_id });
  } catch (error) {
    console.error('Error processing business application:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Endpoint to fetch applications for the logged-in user
app.get('/businesses-application', async (req, res) => {
  const userId = req.session?.user?.user_id;

  if (!userId) {
    // Send a response if userId is not found
    return res.status(400).json({ success: false, message: 'User not logged in or user ID missing' });
  }

  try {
    // Execute the SQL query with the user ID using the connection pool
    const [rows] = await pool.query(
      'SELECT * FROM business_applications WHERE user_id = ?',
      [userId]
    );

    // Send the list of business applications for the logged-in user
    return res.json({ success: true, business_applications: rows });
  } catch (err) {
    console.error('Error executing SQL query:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

//Para sa pag display ng business

// Endpoint to fetch businesses
app.get('/get-businessData', async (req, res) => {
  const userId = req.session?.user?.user_id;

  if (!userId) {
    return res.status(400).json({ success: false, message: 'User not logged in or user ID missing' });
  }

  try {
    // Use the pool to query the businesses data for the logged-in user
    const [rows] = await pool.query('SELECT * FROM businesses WHERE user_id = ?', [userId]);

    if (rows.length > 0) {
      return res.json({ success: true, businessData: rows });
    } else {
      return res.status(404).json({ success: false, message: 'Business data not found' });
    }
  } catch (err) {
    console.error('Error executing SQL query:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Endpoint for updating business logo
app.put('/updateBusinessLogo/:id', upload.single('businessLogo'), async (req, res) => {
  const businessId = req.params.id;

  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No logo file uploaded' });
  }

  const newLogoPath = req.file.path;

  try {
    // Fetch the current logo path using the pool
    const [results] = await pool.query('SELECT businessLogo FROM businesses WHERE business_id = ?', [businessId]);

    if (results.length === 0) {
      return res.status(404).json({ success: false, message: 'Business not found' });
    }

    const currentLogoPath = results[0].businessLogo;

    // Update the business logo
    const [updateResults] = await pool.query('UPDATE businesses SET businessLogo = ? WHERE business_id = ?', [newLogoPath, businessId]);

    if (updateResults.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Business not found' });
    }

    // If there was an old logo, delete it
    if (currentLogoPath) {
      fs.unlink(currentLogoPath, (unlinkErr) => {
        if (unlinkErr) {
          console.error('Error deleting the old logo file:', unlinkErr);
          return res.status(500).json({ success: false, message: 'Failed to delete the old logo file from server' });
        }

        return res.json({
          success: true,
          message: 'Business logo updated successfully',
          updatedLogoPath: newLogoPath,
        });
      });
    } else {
      return res.json({
        success: true,
        message: 'Business logo updated successfully',
        updatedLogoPath: newLogoPath,
      });
    }
  } catch (err) {
    console.error('Error fetching or updating business logo:', err);
    return res.status(500).json({ success: false, message: 'Failed to update business logo' });
  }
});

// Endpoint for updating business name
app.put('/updateBusinessName/:id', async (req, res) => {
  const businessId = req.params.id;
  const { businessName } = req.body;

  try {
    // Update the businessName field in the businesses table
    const [results] = await pool.query(
      'UPDATE businesses SET businessName = ? WHERE business_id = ?',
      [businessName, businessId]
    );

    if (results.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Business not found' });
    }

    return res.json({
      success: true,
      message: 'Business name updated successfully'
    });
  } catch (err) {
    console.error('Error updating business name:', err);
    return res.status(500).json({ success: false, message: 'Failed to update business name' });
  }
});

// Endpoint for updating business about us
app.put('/updateBusinessAboutUs/:id', async (req, res) => {
  const businessId = req.params.id;
  const { aboutUs } = req.body;

  if (!aboutUs) {
    return res.status(400).json({ success: false, message: 'About Us content is required' });
  }

  try {
    // Use a pooled connection to update the 'aboutUs' field in the businesses table
    const [results] = await pool.query(
      'UPDATE businesses SET aboutUs = ? WHERE business_id = ?',
      [aboutUs, businessId]
    );

    if (results.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Business not found' });
    }

    return res.json({
      success: true,
      message: 'Business about us updated successfully',
    });
  } catch (err) {
    console.error('Error updating business about us:', err);
    return res.status(500).json({ success: false, message: 'Failed to update business about us' });
  }
});

// Endpoint for updating Contacts
app.put('/updateBusinessContactInfo/:id', async (req, res) => {
  const businessId = req.params.id;
  const { contactInfo } = req.body; // Expecting the updated contactInfo array

  if (!contactInfo || !Array.isArray(contactInfo)) {
    return res.status(400).json({ success: false, message: 'Invalid contact information format' });
  }

  try {
    // Update the contactInfo JSON in the database
    const [results] = await pool.query(
      'UPDATE businesses SET contactInfo = ? WHERE business_id = ?',
      [JSON.stringify(contactInfo), businessId]
    );

    // Check if any row was affected (i.e., businessId exists)
    if (results.affectedRows > 0) {
      return res.json({
        success: true,
        message: 'Contact information updated successfully',
        updatedContactInfo: contactInfo, // Return the updated contact info
      });
    } else {
      return res.status(404).json({ success: false, message: 'Business not found' });
    }
  } catch (err) {
    console.error('Error updating contact info:', err);
    return res.status(500).json({ success: false, message: 'Failed to update contact information' });
  }
});

// Endpoint for updating the openhours
app.put('/update-opening-hours/:id', async (req, res) => {
  const businessId = req.params.id;
  const { openingHours } = req.body;

  // Validate openingHours format
  if (!openingHours || !Array.isArray(openingHours)) {
    return res.status(400).json({ success: false, message: 'Invalid opening hours format' });
  }

  // Example validation for each entry
  const isValid = openingHours.every(hour => {
    return hour.day && (hour.open === "Closed" || hour.close === "Closed" || (hour.open && hour.close));
  });

  if (!isValid) {
    return res.status(400).json({ success: false, message: 'Each entry must have day, and either "Closed" or valid open and close times' });
  }

  try {
    // Update the database using the connection pool
    const [results] = await pool.query(
      'UPDATE businesses SET openingHours = ? WHERE business_id = ?',
      [JSON.stringify(openingHours), businessId]
    );

    if (results.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Business not found' });
    }

    return res.json({ success: true, message: 'Opening hours updated successfully' });
  } catch (err) {
    console.error('Error updating opening hours:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Endpoint for updating Facilities
app.put('/updateBusinessFacilities/:id', async (req, res) => {
  const businessId = req.params.id;
  const { facilities } = req.body; // Expecting an array of facilities

  if (!facilities || !Array.isArray(facilities)) {
    return res.status(400).json({ success: false, message: 'Invalid facilities format' });
  }

  try {
    // Update the facilities JSON in the database using the connection pool
    const [results] = await pool.query(
      'UPDATE businesses SET facilities = ? WHERE business_id = ?',
      [JSON.stringify(facilities), businessId]
    );

    if (results.affectedRows > 0) {
      return res.json({
        success: true,
        message: 'Facilities updated successfully',
        updatedFacilities: facilities, // Return the updated facilities
      });
    } else {
      return res.status(404).json({ success: false, message: 'Business not found' });
    }
  } catch (err) {
    console.error('Error updating facilities:', err);
    return res.status(500).json({ success: false, message: 'Failed to update facilities' });
  }
});

// Endpoint for updating business policies
app.put('/updateBusinessPolicies/:id', async (req, res) => {
  const businessId = req.params.id;
  const { policies } = req.body; // Expecting an array of policies

  if (!policies || !Array.isArray(policies)) {
    return res.status(400).json({ success: false, message: 'Invalid policies format' });
  }

  try {
    // Update the policies JSON in the database using the connection pool
    const [results] = await pool.query(
      'UPDATE businesses SET policies = ? WHERE business_id = ?',
      [JSON.stringify(policies), businessId]
    );

    if (results.affectedRows > 0) {
      return res.json({
        success: true,
        message: 'Policies updated successfully',
        updatedPolicies: policies, // Return the updated policies
      });
    } else {
      return res.status(404).json({ success: false, message: 'Business not found' });
    }
  } catch (err) {
    console.error('Error updating policies:', err);
    return res.status(500).json({ success: false, message: 'Failed to update policies' });
  }
});

// Endpoint for updating business card image
app.put('/updateBusinessCardImage/:id', upload.single('businessCardImage'), async (req, res) => {
  const businessId = req.params.id;

  try {
    // Fetch the current business data to get the existing businessCard JSON
    const [results] = await pool.query(
      'SELECT businessCard FROM businesses WHERE business_id = ?',
      [businessId]
    );

    if (results.length === 0) {
      return res.status(404).json({ success: false, message: 'Business not found' });
    }

    // The businessCard is already a JavaScript object, no need to parse it
    let businessCard = results[0].businessCard;

    // Update the cardImage if a new file was uploaded
    if (req.file) {
      businessCard.cardImage = req.file.path; // Update the cardImage path
    }

    // Update the database with the modified businessCard JSON
    await pool.query(
      'UPDATE businesses SET businessCard = ? WHERE business_id = ?',
      [JSON.stringify(businessCard), businessId]
    );

    return res.json({
      success: true,
      message: 'Business card image updated successfully',
      updatedBusinessCard: businessCard,
    });

  } catch (err) {
    console.error('Error handling request:', err);
    return res.status(500).json({ success: false, message: 'Failed to update business card image' });
  }
});

// Endpoint for updating business details
app.put('/updateBusinessDetails/:id', async (req, res) => {
  const businessId = req.params.id;
  const { description, location } = req.body;

  if (!location) {
    return res.status(400).json({ success: false, message: 'All fields are required' });
  }

  try {
    // Fetch the current business data to get the existing businessCard JSON
    const [results] = await pool.query(
      'SELECT businessCard FROM businesses WHERE business_id = ?', 
      [businessId]
    );

    if (results.length === 0) {
      return res.status(404).json({ success: false, message: 'Business not found' });
    }

    // Parse businessCard if it exists, otherwise use an empty object
    let businessCard = results[0].businessCard || {};

    // Update the businessCard object with the new details
    businessCard.description = description;
    businessCard.location = location;

    // Update the database with the modified businessCard JSON
    await pool.query(
      'UPDATE businesses SET businessCard = ? WHERE business_id = ?', 
      [JSON.stringify(businessCard), businessId]
    );

    return res.json({
      success: true,
      message: 'Business details updated successfully',
      updatedDetails: { description, location },
    });
  } catch (err) {
    console.error('Database query error:', err);
    return res.status(500).json({ success: false, message: 'Failed to update business details' });
  }
});

// Endpoint for updating business cover images
app.put('/updateBusinessCover/:id', upload.array('heroImages', 10), async (req, res) => {
  const businessId = req.params.id;
  const { imageTitle } = req.body;

  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ success: false, message: "No files uploaded" });
  }

  // Map the uploaded files to objects with id, path, and title
  const newHeroImages = req.files.map(file => ({
    id: uuidv4(),
    path: file.path,
    title: imageTitle
  }));

  try {
    // Fetch the current heroImages from the businesses table using a pooled connection
    const [results] = await pool.query('SELECT heroImages FROM businesses WHERE business_id = ?', [businessId]);

    if (results.length === 0) {
      return res.status(404).json({ success: false, message: 'Business not found' });
    }

    // Check if heroImages is an object or null and handle accordingly
    let currentHeroImages = results[0].heroImages;
    if (currentHeroImages === null) {
      currentHeroImages = []; // Initialize as an empty array if it's null
    } else if (typeof currentHeroImages === 'string') {
      try {
        currentHeroImages = JSON.parse(currentHeroImages); // Attempt to parse if it's a string
      } catch (parseError) {
        console.error('Failed to parse heroImages:', parseError);
        currentHeroImages = []; // Initialize as an empty array if parsing fails
      }
    } else if (typeof currentHeroImages === 'object' && !Array.isArray(currentHeroImages)) {
      currentHeroImages = [currentHeroImages]; // Wrap it in an array if it's a single object
    }

    // Flatten any nested arrays in heroImages and merge with newHeroImages
    const updatedHeroImages = [...currentHeroImages.flat(), ...newHeroImages];

    // Update the database with the modified heroImages as a JSON string using a pooled connection
    await pool.query(
      'UPDATE businesses SET heroImages = ? WHERE business_id = ?',
      [JSON.stringify(updatedHeroImages), businessId]
    );

    return res.json({
      success: true,
      message: 'Business cover images updated successfully',
      updatedHeroImages, // Respond with the updated images
    });
  } catch (err) {
    console.error('Error updating business cover images:', err);
    return res.status(500).json({ success: false, message: 'Failed to update business cover images' });
  }
});

// Endpoint to update the image title for a specific business cover image
app.put('/updateBusinessCoverImagesTitle/:businessId', async (req, res) => {
  const businessId = req.params.businessId;
  const { imageId, title } = req.body;

  try {
    // Fetch the current heroImages from the businesses table using pool.query
    const [results] = await pool.query('SELECT heroImages FROM businesses WHERE business_id = ?', [businessId]);

    if (results.length === 0) {
      return res.status(404).json({ success: false, message: 'Business not found' });
    }

    let currentHeroImages = results[0].heroImages;

    // Check if heroImages is already a string and parse it
    if (typeof currentHeroImages === 'string') {
      try {
        currentHeroImages = JSON.parse(currentHeroImages);
      } catch (parseError) {
        console.error('Failed to parse heroImages:', parseError);
        return res.status(500).json({ success: false, message: 'Failed to parse heroImages' });
      }
    }

    // Ensure it's an array
    if (!Array.isArray(currentHeroImages)) {
      currentHeroImages = [currentHeroImages];
    }

    // Find and update the image with the specified imageId
    const imageToUpdate = currentHeroImages.find((img) => img.id === imageId);

    if (!imageToUpdate) {
      return res.status(404).json({ success: false, message: 'Image not found' });
    }

    // Update the title
    imageToUpdate.title = title;

    // Update the database with the modified heroImages using pool.query
    await pool.query(
      'UPDATE businesses SET heroImages = ? WHERE business_id = ?',
      [JSON.stringify(currentHeroImages), businessId]
    );

    return res.json({
      success: true,
      message: 'Image title updated successfully',
      updatedHeroImages: currentHeroImages, // Return updated heroImages
    });
  } catch (err) {
    console.error('Error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Endpoint to delete business card image
app.delete('/businessCardImage/:id', async (req, res) => {
  const businessId = req.params.id;

  try {
    // Fetch the current business data to get the existing businessCard JSON
    const [results] = await pool.query(
      'SELECT businessCard FROM businesses WHERE business_id = ?',
      [businessId]
    );

    if (results.length === 0) {
      return res.status(404).json({ success: false, message: 'Business not found' });
    }

    // The businessCard is already a JavaScript object, no need to parse it
    let businessCard = results[0].businessCard;

    // Check if there is a cardImage to delete
    if (!businessCard || !businessCard.cardImage) {
      return res.status(404).json({ success: false, message: 'No business card image to delete' });
    }

    // Store the path of the current cardImage to delete it from the server
    const cardImagePath = businessCard.cardImage;

    // Set cardImage to null in the businessCard object
    businessCard.cardImage = null;

    // Update the database with the modified businessCard JSON
    await pool.query(
      'UPDATE businesses SET businessCard = ? WHERE business_id = ?',
      [JSON.stringify(businessCard), businessId]
    );

    // Remove the file from the server
    fs.unlink(cardImagePath, (unlinkErr) => {
      if (unlinkErr) {
        console.error('Error deleting the image file:', unlinkErr);
        return res.status(500).json({ success: false, message: 'Failed to delete the image file from server' });
      }

      return res.json({
        success: true,
        message: 'Business card image deleted successfully',
        updatedBusinessCard: businessCard, // Respond with the updated business card
      });
    });

  } catch (err) {
    console.error('Database query error:', err);
    return res.status(500).json({ success: false, message: 'Failed to process the request' });
  }
});

// Endpoint to delete cover photo
app.delete('/businessCoverPhoto/:id', async (req, res) => {
  const businessId = req.params.id;
  const { imagePath } = req.body; // Image path to be deleted should be passed in the request body

  if (!imagePath) {
    return res.status(400).json({ success: false, message: 'No image path provided' });
  }

  try {
    // Fetch the current heroImages from the businesses table using the connection pool
    const [results] = await pool.query('SELECT heroImages FROM businesses WHERE business_id = ?', [businessId]);

    if (results.length === 0) {
      return res.status(404).json({ success: false, message: 'Business not found' });
    }

    let currentHeroImages = results[0].heroImages;

    // Check if heroImages is null
    if (currentHeroImages === null) {
      return res.status(404).json({ success: false, message: 'No cover photos to delete' });
    } else if (typeof currentHeroImages === 'string') {
      // Parse heroImages from JSON or comma-separated string
      try {
        currentHeroImages = JSON.parse(currentHeroImages);
      } catch (parseError) {
        console.error('Failed to parse heroImages:', parseError);
        currentHeroImages = []; // Initialize as an empty array if parsing fails
      }
    } else if (typeof currentHeroImages === 'object' && !Array.isArray(currentHeroImages)) {
      currentHeroImages = [currentHeroImages]; // Wrap it in an array if it's a single object
    }

    // Find and remove the specified image path from heroImages
    const updatedHeroImages = currentHeroImages.filter(img => img.path !== imagePath);

    if (updatedHeroImages.length === currentHeroImages.length) {
      return res.status(404).json({ success: false, message: 'Image not found in heroImages' });
    }

    // Update the database with the modified heroImages using the connection pool
    await pool.query(
      'UPDATE businesses SET heroImages = ? WHERE business_id = ?',
      [updatedHeroImages.length > 0 ? JSON.stringify(updatedHeroImages) : null, businessId]
    );

    // Remove the file from the server
    const filePath = path.join(__dirname, imagePath); // Build the full path to the file
    fs.unlink(filePath, (unlinkErr) => {
      if (unlinkErr) {
        console.error('Error deleting the image file:', unlinkErr);
        return res.status(500).json({ success: false, message: 'Failed to delete the image file from server' });
      }

      return res.json({
        success: true,
        message: 'Cover photo deleted successfully',
        updatedHeroImages: updatedHeroImages.length > 0 ? updatedHeroImages : null, // Respond with the updated list of hero images
      });
    });
  } catch (err) {
    console.error('Database query error:', err);
    return res.status(500).json({ success: false, message: 'Failed to delete cover photo' });
  }
});

// Endpoint to get business location and pin_location
app.get('/getBusinessLocation', async (req, res) => {
  const userId = req.session?.user?.user_id;

  if (!userId) {
    return res.status(400).json({ success: false, message: 'User not logged in or user ID missing' });
  }

  try {
    const [rows] = await pool.query(
      'SELECT location, pin_location FROM businesses WHERE user_id = ?',
      [userId]
    );

    if (rows.length > 0) {
      return res.json({ success: true, businessLocation: rows[0] });
    } else {
      return res.status(404).json({ success: false, message: 'Business not found' });
    }
  } catch (err) {
    console.error('Error executing SQL query:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Endpoint to update business location and pin_location
app.put('/updateBusinessLocation', async (req, res) => {
  const userId = req.session?.user?.user_id;
  const { location, pin_location } = req.body;
  if (!userId) {
    return res.status(400).json({ success: false, message: 'User not logged in or user ID missing' });
  }

  if (!location && !pin_location) {
    return res.status(400).json({ success: false, message: 'At least one of location or pin_location must be provided' });
  }

  try {
    const updateFields = [];
    const updateValues = [];

    if (location) {
      updateFields.push('location = ?');
      updateValues.push(location);
    }

    if (pin_location) {
      updateFields.push('pin_location = ?');
      updateValues.push(JSON.stringify(pin_location));
    }

    updateValues.push(userId);

    const [result] = await pool.query(
      `UPDATE businesses SET ${updateFields.join(', ')} WHERE user_id = ?`,
      updateValues
    );

    if (result.affectedRows > 0) {
      return res.json({ success: true, message: 'Location updated successfully' });
    } else {
      return res.status(404).json({ success: false, message: 'Business not found or no changes made' });
    }
  } catch (err) {
    console.error('Error executing SQL query:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// May babaguhin pa dito, dapat yung products lang nung business na selected ang lalabas
// Endpoint to get all business products
app.get('/getAllBusinessProduct', async (req, res) => {
  const sql = `
    SELECT 
        products.*, 
        MAX(deals.discount) AS discount, 
        MAX(deals.expirationDate) AS expiration,
        AVG(r.ratings) AS rating
    FROM 
        products
    LEFT JOIN 
        deals 
    ON 
        products.product_id = deals.product_id 
        AND (deals.expirationDate IS NULL OR deals.expirationDate > NOW())
    LEFT JOIN
        product_ratings r 
    ON 
        products.product_id = r.product_id
    GROUP BY 
        products.product_id
    ORDER BY 
        expiration DESC
    LIMIT 0, 1000
  `;

  try {
    // Use the connection pool to execute the query
    const [results] = await pool.query(sql);
    return res.json({ success: true, businessProducts: results.length > 0 ? results : [] });
  } catch (err) {
    console.error('Error executing SQL query:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Endpoint to get business product
app.get('/getBusinessProduct', async (req, res) => {
  const userId = req.session?.user?.user_id;
  const category = req.query.category;
  // console.log(req.session);
  if (!userId) {
    return res.status(400).json({ success: false, message: 'User not logged in or user ID missing' });
  }

  try {
    const [rows] = await pool.query(
      'SELECT * FROM products WHERE user_id = ? AND product_category = ?',
      [userId, category]
    );

    if (rows.length > 0) {
      return res.json({ success: true, businessProducts: rows });
    } else {
      // Return an empty array instead of a 404 error
      return res.json({ success: true, businessProducts: [] });
    }
  } catch (err) {
    console.error('Error executing SQL query:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Handle upload image product
app.put('/upload-image-product', upload.single('productImage'), async (req, res) => {
  const { title } = req.body;

  console.log(title);

  // Log the uploaded file for debugging
  console.log('Uploaded file:', req.file);

  // Check if req.file exists and construct the image object
  const uploadedProductImage = req.file
    ? {
        id: uuidv4(),
        path: req.file.path,
        title: title || ''
      }
    : null; // Return null if no file was uploaded

  console.log('Uploaded image:', uploadedProductImage);

  // Respond with the image object
  res.json({ success: true, image: uploadedProductImage });
});

// Endpoint for adding product
app.post('/add-product', upload.array('productImages', 5), async (req, res) => {
  const {
    category,
    type,
    name,
    description,
    price,
    pricing_unit,
    numberOfGuests,
    booking_operation,
    inclusions,
    termsAndConditions,
    images
  } = req.body;
  const user_id = req.session?.user?.user_id;

  if (!user_id || !name || !price) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }

  // Parse Images
  let parsedImages = [];
  try {
    parsedImages = images ? images.map(image => JSON.parse(image)) : [];
  } catch (error) {
    console.error('Error parsing images:', error);
  }

  try {
    // Ensure inclusions is an array of objects
    const inclusionsArray = Array.isArray(inclusions)
      ? inclusions.map(item => JSON.parse(item)) // Parse each string to an object
      : [];

    const termsArray = Array.isArray(termsAndConditions)
      ? termsAndConditions.map(item => JSON.parse(item)) // Assuming this is already in the correct format
      : [];

    // Query to get the business_id based on user_id using the pool
    const [businessResults] = await pool.query('SELECT business_id FROM businesses WHERE user_id = ?', [user_id]);

    if (businessResults.length === 0) {
      console.error('No business found for user');
      return res.status(500).json({ success: false, message: 'Failed to fetch business ID' });
    }

    const business_id = businessResults[0].business_id;

    // Now insert the product with the retrieved business_id using the pool
    const query = `
      INSERT INTO products (business_id, product_category, user_id, type, name, description, price, pricing_unit, numberOfGuests, booking_operation, inclusions, termsAndConditions, images)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      business_id,
      category || null,
      user_id,
      type || null,
      name || null,
      description || null,
      price || null,
      pricing_unit || null,
      numberOfGuests,
      parseInt(booking_operation) || 0,
      JSON.stringify(inclusionsArray), // Convert inclusions to JSON
      JSON.stringify(termsArray), // Convert termsAndConditions to JSON
      JSON.stringify(parsedImages), // Store images as JSON array with id, path, and title
    ];

    const [insertResults] = await pool.query(query, values);

    // Return all relevant data about the newly added product
    const addedProduct = {
      success: true,
      message: 'Product added successfully',
      product_id: insertResults.insertId,
      business_id,
      category,
      user_id,
      type,
      name,
      description,
      price,
      pricing_unit: pricing_unit || '',
      numberOfGuests,
      booking_operation: parseInt(booking_operation) || 0,
      inclusions: inclusionsArray, // Return the original array
      termsAndConditions: termsArray, // Return the original array
      images: parsedImages, // Each image will have id, path, and title
    };

    res.json(addedProduct);

  } catch (error) {
    console.error('Error adding product:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Endpoint to fetch images for a specific product
app.get('/get-product-images/:product_id', async (req, res) => {
  const { product_id } = req.params;

  // Query to fetch images for the specific product
  const query = 'SELECT images FROM products WHERE product_id = ?';

  try {
    // Use a pooled connection to query the database
    const [rows] = await pool.query(query, [product_id]);

    if (rows.length === 0) {
      // No product found for the user
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const current_image = rows[0].images;
    res.json({ success: true, images: current_image });
  } catch (err) {
    console.error('Error fetching product images:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch product images' });
  }
});

// Endpoint to update an existing product
app.put('/update-product', upload.array('productImages', 5), async (req, res) => {
  const { 
    product_id, 
    type, 
    category,
    name, 
    description,
    price, 
    pricing_unit, 
    numberOfGuests,
    booking_operation, 
    inclusions, 
    termsAndConditions, 
    removedImages, 
    images 
  } = req.body;
  
  const user_id = req.session?.user?.user_id;

  if (!user_id || !product_id || !name || !price) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }

  // Parse Images
  let parsedImages = [];
  try {
    parsedImages = images ? images.map(image => JSON.parse(image)) : [];
  } catch (error) {
    console.error('Error parsing images:', error);
  }

  // Parse removedImages
  let parsedRemovedImages = [];
  try {
    parsedRemovedImages = JSON.parse(removedImages);
  } catch (error) {
    console.error('Error parsing removedImages:', error);
    parsedRemovedImages = [];
  }

  // Ensure inclusions is an array of objects
  const inclusionsArray = Array.isArray(inclusions) 
    ? inclusions.map(item => JSON.parse(item)) // Parse each string to an object
    : [];

  const termsAndConditionsArray = Array.isArray(termsAndConditions) 
    ? termsAndConditions.map(item => JSON.parse(item)) // Assuming this is already in the correct format
    : [];

  const query = `
    UPDATE products 
    SET type = ?, name = ?, description = ?, price = ?, pricing_unit = ?, numberOfGuests = ?, booking_operation = ?, inclusions = ?, termsAndConditions = ?, images = ?
    WHERE product_id = ? AND user_id = ?
  `;

  const values = [
    type,
    name,
    description,
    price,
    pricing_unit || null,
    numberOfGuests,
    parseInt(booking_operation) || 0,
    JSON.stringify(inclusionsArray), // Store inclusions as a JSON string
    JSON.stringify(termsAndConditionsArray), // Store terms and conditions as a JSON string
    JSON.stringify(parsedImages), // Store merged images as a JSON string
    product_id,
    user_id,
  ];

  try {
    // Using the connection pool to execute the query
    const [results] = await pool.query(query, values);

    if (results.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // If there are images to remove, delete them from the filesystem
    if (Array.isArray(parsedRemovedImages) && parsedRemovedImages.length > 0) {
      parsedRemovedImages.forEach((image) => {
        const imagePath = image.path;
        const absolutePath = path.resolve(__dirname, imagePath.replace(/\\/g, '/'));

        fs.access(absolutePath, fs.constants.F_OK, (accessErr) => {
          if (accessErr) {
            console.error(`File not found, unable to delete: ${absolutePath}`);
          } else {
            fs.unlink(absolutePath, (unlinkErr) => {
              if (unlinkErr) {
                console.error(`Error deleting the image file (${absolutePath}):`, unlinkErr);
              } else {
                console.log(`Removed image file deleted successfully: ${absolutePath}`);
              }
            });
          }
        });
      });
    } else {
      console.log("No images to remove.");
    }

    // Construct the updated product object for response
    const updatedProduct = {
      success: true,
      message: 'Product updated successfully',
      product_id,
      user_id,
      type,
      category,
      name,
      description,
      price,
      pricing_unit: pricing_unit || null,
      numberOfGuests,
      booking_operation: parseInt(booking_operation) || 0,
      inclusions: inclusionsArray,
      termsAndConditions: termsAndConditionsArray,
      images: parsedImages,
    };

    res.json(updatedProduct);
  } catch (err) {
    console.error('Error updating product:', err);
    return res.status(500).json({ success: false, message: 'Failed to update product' });
  }
});

// Endpoint to delete a product
app.delete('/delete-product', async (req, res) => {
  const { selectedProduct } = req.body;

  // Validate input
  if (!selectedProduct) {
    return res.status(400).json({ success: false, message: 'No selected product' });
  }

  // Ensure selectedProduct is an array
  const productIds = Array.isArray(selectedProduct) ? selectedProduct : [selectedProduct];

  // SQL query to delete the product(s)
  const placeholders = productIds.map(() => '?').join(', ');
  const query = `DELETE FROM products WHERE product_id IN (${placeholders})`;

  try {
    // Use the connection pool to execute the query
    const [results] = await pool.query(query, productIds);

    if (results.affectedRows === 0) {
      // No rows affected, meaning none of the products were found
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Successfully deleted the product(s)
    res.json({ success: true, message: 'Product(s) deleted successfully' });
  } catch (err) {
    console.error('Error deleting product:', err);
    return res.status(500).json({ success: false, message: 'Failed to delete product' });
  }
});

app.get('/getProducts', async (req, res) => {
  const userId = req.session?.user?.user_id;
  if (!userId) {
    return res.status(400).json({ success: false, message: 'User not logged in or user ID missing' });
  }

  try {
    const [rows] = await pool.query(
      'SELECT * FROM products WHERE user_id = ?',
      [userId]
    );

    if (rows.length > 0) {
      return res.json({ success: true, businessProducts: rows });
    } else {
      // Return an empty array instead of a 404 error
      return res.json({ success: true, businessProducts: [] });
    }
  } catch (err) {
    console.error('Error executing SQL query:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

app.get('/getProductsWithActiveDeals', async (req, res) => {
  const userId = req.session?.user?.user_id;

  if (!userId) {
    return res.status(400).json({ success: false, message: 'User not logged in or user ID missing' });
  }

  try {
    const currentDate = new Date().toISOString().split('T')[0]; // Get current date in 'YYYY-MM-DD' format

    // Query to fetch products with active deals
    const [rows] = await pool.query(
      `SELECT 
          p.*, 
          d.discount, 
          d.expirationDate 
        FROM products p
        JOIN deals d ON p.product_id = d.product_id
        WHERE p.user_id = ? 
          AND d.expirationDate > ?`,
      [userId, currentDate]
    );

    if (rows.length > 0) {
      return res.json({ success: true, productsWithDeals: rows });
    } else {
      // Return an empty array if no products with active deals are found
      return res.json({ success: true, productsWithDeals: [] });
    }
  } catch (err) {
    console.error('Error executing SQL query:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

app.get('/getMostReviewedProducts', async (req, res) => {
  const userId = req.session?.user?.user_id;

  if (!userId) {
    return res.status(400).json({ success: false, message: 'User not logged in or user ID missing' });
  }

  try {
    // Query to get the most reviewed products
    const [rows] = await pool.query(
      `SELECT p.product_id, p.name, p.description, p.price, p.pricing_unit, p.images,  AVG(r.ratings) AS rating, COUNT(r.ratings_id) AS review_count
       FROM products p
       LEFT JOIN product_ratings r ON p.product_id = r.product_id
       WHERE p.user_id = ?
       GROUP BY p.product_id
       ORDER BY review_count DESC`,
      [userId]
    );

    if (rows.length > 0) {
      return res.json({ success: true, products: rows });
    } else {
      return res.json({ success: true, products: [] });
    }
  } catch (err) {
    console.error('Error executing SQL query:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

app.get('/getBusinessRatings', async (req, res) => {
  const userId = req.session?.user?.user_id;  // Get user_id from the session
  // console.log('userId:', userId);

  if (!userId) {
    return res.status(400).json({ success: false, message: 'User not logged in or user ID missing' });
  }

  try {
    // Query to get the business associated with the user
    const businessQuery = `
      SELECT business_id
      FROM businesses
      WHERE user_id = ?
      LIMIT 1
    `;
    
    // Execute the query to find the business for the given user
    const [businessResult] = await pool.query(businessQuery, [userId]);
    console.log(businessResult);

    if (businessResult.length === 0) {
      return res.status(404).json({ success: false, message: 'No business found for the user' });
    }

    const businessId = businessResult[0].business_id;  // Get the business_id from the result

    // Query to get the count of reviews and average rating for the business
    const reviewQuery = `
      SELECT 
        AVG(br.ratings) AS rating,
        COUNT(br.ratings_id) AS rateCount
      FROM 
        business_ratings br
      WHERE 
        br.business_id = ?
    `;

    // Execute the query to get the review count and average rating
    const [reviewResult] = await pool.query(reviewQuery, [businessId]);

    // Return the review count and rating
    return res.json({
      success: true,
      rating: reviewResult[0].rating || 0,  // Default to 0 if no reviews exist
      rateCount: reviewResult[0].rateCount || 0  // Default to 0 if no reviews exist
    });

  } catch (err) {
    console.error('Error executing SQL query:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Endpoint to get business deals
app.get('/getDeals', async (req, res) => {
  const userId = req.session?.user?.user_id;
  const category = req.query.category;

  if (!userId) {
    return res.status(400).json({ success: false, message: 'User not logged in or user ID missing' });
  }

  try {
    // Use a pooled connection to query the database
    const [rows] = await pool.query(
      'SELECT * FROM deals WHERE user_id = ? AND category = ?',
      [userId, category]
    );

    if (rows.length > 0) {
      return res.json({ success: true, deals: rows });
    } else {
      // Return an empty array if no deals are found
      return res.json({ success: true, deals: [] });
    }
  } catch (err) {
    console.error('Error executing SQL query:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Endpoint to add new business deals
app.post('/add-deals', async (req, res) => {
  const { category, productId, discount, expirationDate } = req.body;
  const userId = req.session?.user?.user_id;

  if (!userId || !category || !productId || !discount || !expirationDate) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }

  try {
    const query = `
      INSERT INTO deals (category, user_id, product_id, discount, expirationDate)
      VALUES (?, ?, ?, ?, ?)
    `;

    const values = [
      category,
      userId,
      productId,
      discount,
      expirationDate
    ];

    // Use the pool for querying
    const [result] = await pool.query(query, values);

    // Return all relevant data about the newly added deal
    const addedDeal = {
      success: true,
      message: 'Deal added successfully',
      deal_id: result.insertId,
      user_id: userId,
      category,
      productId,
      discount,
      expirationDate
    };

    res.json(addedDeal);
  } catch (error) {
    console.error('Error adding deal:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Endpoint to update existing business deals
app.put('/update-deal', async (req, res) => {
  const { dealId, discount, expirationDate } = req.body; // Match the key names in the destructure
  const userId = req.session?.user?.user_id; // Get user ID from the session

  // Validate the incoming data
  if (!userId || !dealId || discount === undefined || !expirationDate) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }

  try {
    const query = `
      UPDATE deals
      SET discount = ?, expirationDate = ?
      WHERE deal_id = ? AND user_id = ?;
    `;
    
    const values = [discount, expirationDate, dealId, userId]; // Ensure the user is authorized to update the deal

    // Use the pool to execute the query
    const [result] = await pool.query(query, values);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Deal not found or not authorized' });
    }

    // Return the updated deal information
    const updatedDeal = {
      success: true,
      message: 'Deal updated successfully',
      dealId, // Ensure we return the correct ID
      discount,
      expirationDate,
    };

    res.json(updatedDeal); // Respond with the updated deal
  } catch (error) {
    console.error('Error updating deal:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Endpoint to delete deals
app.delete('/delete-deals/:dealId', async (req, res) => {
  const dealId = req.params.dealId;

  // Validate input
  if (!dealId) {
    return res.status(400).json({ success: false, message: 'No deal selected' });
  }

  try {
    const userId = req.session?.user?.user_id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    // Execute the query to delete the deal
    const [result] = await pool.query(
      'DELETE FROM deals WHERE deal_id = ? AND user_id = ?',
      [dealId, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Deal not found or not authorized' });
    }

    res.json({ success: true, message: 'Deal deleted successfully', dealId });
  } catch (error) {
    console.error('Error processing delete request:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// endpoint for booking
app.post('/book-accommodation', async (req, res) => {
  const { 
    business_id,
    user_id,
    product_id,
    firstName,
    lastName,
    productName,
    email,
    phone,
    type,
    checkInOutDates,
    originalPrice,    // Added
    discount,         // Added
    discountedPrice,  // Added
    amountToPay,
    specialRequests,
    numberOfGuests,
    status
  } = req.body;

  // console.log('Request Body Data:', req.body);
  
  if (!firstName || !lastName || !email || !checkInOutDates || !checkInOutDates.start || !checkInOutDates.end) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }

  // Convert checkInOutDates to MySQL-compatible datetime format
  const formatDate = ({ year, month, day }) => 
    `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')} 00:00:00`;
  
  const dateIn = formatDate(checkInOutDates.start);
  const dateOut = formatDate(checkInOutDates.end);

  try {
    const query = `
      INSERT INTO bookings (
        user_id, business_id, product_id, customerName, productName, numberOfGuests, 
        email, phone, type, dateIn, dateOut, specialRequests, 
        originalPrice, discount, discountedPrice, amountToPay, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      user_id,
      business_id,
      product_id,
      `${firstName} ${lastName}`,      // combined name
      productName,
      numberOfGuests,
      email,
      phone,
      type,  
      dateIn,
      dateOut || null,
      specialRequests || '',
      originalPrice || 0,
      discount || 0,
      discountedPrice || originalPrice || 0,
      amountToPay,
      status || 0
    ];

    // Use the connection pool to execute the query
    const [result] = await pool.query(query, values);

    res.json({
      success: true,
      message: 'Booking added successfully',
      booking_id: result.insertId,
      user_id: user_id,
      business_id: business_id,
      customerName: `${firstName} ${lastName}`,
      productName: productName,
      numberOfGuests,
      email,
      phone,
      type: type,
      dateIn,
      dateOut,
      specialRequests,
      originalPrice,
      discount,
      discountedPrice,
      amountToPay,
      status
    });
    
  } catch (error) {
    console.error('Error on booking:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

app.post('/book-table', async (req, res) => {
  const {
    business_id,
    user_id,
    product_id,
    firstName,
    lastName,
    productName,
    email,
    phone,
    reservationDate,
    reservationTime,
    originalPrice,    // Added
    discount,         // Added
    discountedPrice,  // Added
    amountToPay,
    specialRequests,
    numberOfGuests,
    type,
    status
  } = req.body;

  // console.log('Request Body Data:', req.body);

  if (
    !business_id || 
    user_id == null || 
    !product_id || 
    !firstName || 
    !lastName || 
    !productName || 
    !email || 
    !phone || 
    !reservationDate || 
    !reservationTime || 
    !type
  ) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }

  // Combine reservation date and time into a single datetime string
  const formatDate = ({ year, month, day }) => 
    `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  const dateIn = `${formatDate(reservationDate)} ${reservationTime}:00`;

  const customerName = `${firstName} ${lastName}`;

  try {
    const query = `
      INSERT INTO bookings (
        user_id, business_id, product_id, customerName, productName, numberOfGuests, 
        email, phone, type, dateIn, dateOut, specialRequests, 
        originalPrice, discount, discountedPrice, amountToPay, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      user_id,
      business_id,
      product_id,
      customerName,
      productName,
      numberOfGuests,
      email,
      phone,
      type,
      dateIn,
      null, // dateOut is null for single-date reservations
      specialRequests || '',
      Number(originalPrice) || 0,
      Number(discount) || 0,
      Number(discountedPrice) || originalPrice || 0,
      amountToPay,
      status || 0
    ];

    // Using pool.query with async/await
    const [result] = await pool.query(query, values);

    res.json({
      success: true,
      message: 'Table booked successfully',
      booking_id: result.insertId,
      user_id,
      business_id,
      product_id,
      customerName,
      productName,
      numberOfGuests,
      email,
      phone,
      type,
      dateIn,
      specialRequests,
      originalPrice,
      discount,
      discountedPrice,
      amountToPay,
      status
    });
  } catch (error) {
    console.error('Error booking table:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

app.post('/book-activity', async (req, res) => {
  const {
    business_id,
    user_id,
    product_id,
    firstName,
    lastName,
    email,
    phone,
    visitDate,
    activityTime,
    originalPrice,    // Added
    discount,         // Added
    discountedPrice,  // Added
    amountToPay,
    type,
    specialRequests,
    numberOfGuests,
    productName,
    status
  } = req.body;

  if (
    !user_id ||
    !firstName ||
    !lastName ||
    !email ||
    !phone ||
    !visitDate ||
    !activityTime ||
    !type ||
    !productName
  ) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }

  const formatDate = ({ year, month, day }) => 
    `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  const dateIn = `${formatDate(visitDate)} ${activityTime}:00`;

  const customerName = `${firstName} ${lastName}`;

  try {
    const query = `
      INSERT INTO bookings (
        user_id, business_id, product_id, customerName, productName, numberOfGuests, 
        email, phone, type, dateIn, dateOut, specialRequests, 
        originalPrice, discount, discountedPrice, amountToPay, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      user_id,
      business_id,
      product_id,
      customerName,
      productName,
      numberOfGuests,
      email,
      phone,
      type,
      dateIn,
      null, // dateOut is null for single-date activity bookings
      specialRequests || '',
      originalPrice || 0,
      discount || 0,
      discountedPrice || originalPrice || 0,
      amountToPay,
      status || 0
    ];

    // Use the pool to execute the query
    const [result] = await pool.query(query, values);

    res.json({
      success: true,
      message: 'Activity booked successfully',
      booking_id: result.insertId,
      user_id,
      business_id,
      product_id,
      customerName,
      productName,
      numberOfGuests,
      email,
      phone,
      type,
      dateIn,
      specialRequests,
      originalPrice,
      discount,
      discountedPrice,
      amountToPay,
      status
    });
  } catch (error) {
    console.error('Error booking activity:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Endpoint to fetch bookings
app.get('/bookings', async (req, res) => {
  const userId = req.session?.user?.user_id;

  if (!userId) {
    return res.status(401).json({ success: false, message: 'User not logged in' });
  }

  const sql = `
    SELECT 
      b.*,
      p.name AS product_name,
      p.images AS product_image,
      p.type AS product_type,
      bs.businessName,
      bs.businessLogo
    FROM bookings b
    LEFT JOIN products p ON b.product_id = p.product_id
    LEFT JOIN businesses bs ON b.business_id = bs.business_id
    WHERE b.user_id = ?
    ORDER BY b.dateIn DESC
  `;

  try {
    // Use the pool to execute the query
    const [results] = await pool.query(sql, [userId]);

    // Format dates and process results
    const formattedBookings = results.map(booking => {
      // Convert status number to string
      let statusText;
      switch(Number(booking.status)) {
        case 0:
          statusText = 'pending';
          break;
        case 1:
          statusText = 'confirmed';
          break;
        case 2:
          statusText = 'completed';
          break;
        case 3:
          statusText = 'cancelled';
          break;
        default:
          statusText = 'pending';
      }

      return {
        booking_id: booking.booking_id,
        user_id: booking.user_id,
        business_id: booking.business_id,
        product_id: booking.product_id,
        customerName: booking.customerName,
        productName: booking.productName,
        numberOfGuests: booking.numberOfGuests,
        email: booking.email,
        phone: booking.phone,
        type: booking.type,
        dateIn: booking.dateIn ? new Date(booking.dateIn).toISOString() : null,
        dateOut: booking.dateOut ? new Date(booking.dateOut).toISOString() : null,
        specialRequests: booking.specialRequests || '',
        priceDetails: {
          originalPrice: parseFloat(booking.originalPrice || 0).toFixed(2),
          discount: parseFloat(booking.discount || 0).toFixed(2),
          discountedPrice: parseFloat(booking.discountedPrice || 0).toFixed(2)
        },
        status: statusText,
        // Additional product and business details
        product_name: booking.product_name,
        product_image: booking.product_image,
        product_type: booking.product_type,
        businessName: booking.businessName,
        businessLogo: booking.businessLogo
      };
    });

    res.json({
      success: true,
      bookings: formattedBookings
    });
  } catch (err) {
    console.error('Error fetching bookings:', err);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch bookings'
    });
  }
});

// Endpoint for cancel booking
app.put('/cancel-booking/:id', async (req, res) => {
  const bookingId = req.params.id;
  const userId = req.session?.user?.user_id;

  if (!userId) {
    return res.status(401).json({ 
      success: false, 
      message: 'User not logged in' 
    });
  }

  const sql = `
    UPDATE bookings 
    SET status = 3
    WHERE booking_id = ? AND user_id = ?
  `;

  try {
    // Use a pooled connection to execute the update query
    const [result] = await pool.query(sql, [bookingId, userId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Booking not found or not authorized' 
      });
    }

    res.json({ 
      success: true, 
      message: 'Booking cancelled successfully',
      bookingId: bookingId
    });
  } catch (err) {
    console.error('Error cancelling booking:', err);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to cancel booking' 
    });
  }
});

// Fetch booking dates for a specific product
app.get('/product-booking-dates/:productId', async (req, res) => {
  const productId = req.params.productId;
  // console.log(productId);
  const declined = "-1";
  if (!productId) {
    return res.status(400).json({
      success: false,
      message: 'Product ID is required',
    });
  }

  const sql = `
    SELECT 
        b.dateIn, 
        b.dateOut, 
        b.customerName, 
        b.productName, 
        b.numberOfGuests, 
        b.status,
        p.name AS productName,
        p.product_category,
        p.price,
        p.pricing_unit
    FROM 
        bookings b
    LEFT JOIN 
        products p ON b.product_id = p.product_id
    WHERE 
        b.product_id = ? AND b.status != ?
    ORDER BY 
        b.dateIn ASC;
  `;

  try {
    const [results] = await pool.query(sql, [productId, declined]);

    return res.json({
      success: true,
      bookings: results,
    });
  } catch (err) {
    console.error('Error fetching booking dates:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch booking dates',
    });
  }
});

// Get business bookings
app.get('/business-bookings', async (req, res) => {
  const userId = req.session?.user?.user_id;

  if (!userId) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized',
    });
  }

  try {
    // Fetch the business ID associated with the user ID
    const businessQuery = `SELECT business_id FROM businesses WHERE user_id = ?`;
    const [businessResult] = await pool.query(businessQuery, [userId]);

    if (!businessResult.length) {
      return res.status(404).json({
        success: false,
        message: 'Business not found for this user',
      });
    }

    const businessId = businessResult[0].business_id;

    // Query to fetch bookings for the business
    const bookingsQuery = `
      SELECT b.*, 
        p.product_category AS reservationType
      FROM bookings b
      LEFT JOIN products p ON b.product_id = p.product_id
      WHERE b.business_id = ?
      ORDER BY b.dateIn DESC
    `;
    const [bookings] = await pool.query(bookingsQuery, [businessId]);

    return res.json({
      success: true,
      bookings: bookings,
    });
  } catch (err) {
    console.error('Error fetching business bookings:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch bookings',
    });
  }
});

// Update booking status
app.put('/update-booking-status/:id', async (req, res) => {
  const bookingId = req.params.id;
  const { status } = req.body;

  const userId = req.session?.user?.user_id;

  if (!userId) {
    return res.status(401).json({ 
      success: false, 
      message: 'Not authorized' 
    });
  }

  try {
    // Query to get the business associated with the user
    const businessQuery = `
      SELECT business_id
      FROM businesses
      WHERE user_id = ?
      LIMIT 1
    `;
    
    // Execute the query to find the business for the given user
    const [businessResult] = await pool.query(businessQuery, [userId]);
    // console.log(businessResult);

    if (businessResult.length === 0) {
      return res.status(404).json({ success: false, message: 'No business found for the user' });
    }

    const businessId = businessResult[0].business_id;  // Get the business_id from the result

    // Update the booking status
    const [updateResult] = await pool.query(
      `
      UPDATE bookings 
      SET status = ? 
      WHERE booking_id = ? AND business_id = ?
      `,
      [status, bookingId, businessId]
    );

    if (updateResult.affectedRows === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Booking not found or not authorized' 
      });
    }

    // Fetch the user details and product information for the booking
    const [bookingDetails] = await pool.query(
      `
      SELECT 
        b.user_id, 
        b.productName AS product, 
        bu.businessName,
        u.email AS email, 
        u.Fname AS firstName, 
        u.Lname AS lastName 
      FROM 
        bookings AS b
      LEFT JOIN
        businesses AS bu
      ON
        b.business_id = bu.business_id
      LEFT JOIN 
        users AS u 
      ON 
        b.user_id = u.user_id 
      WHERE 
        b.booking_id = ?
      `,
      [bookingId]
    );

    if (bookingDetails.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Booking details not found' 
      });
    }

    const { user_id: receiverId, product, email, firstName, lastName, businessName } = bookingDetails[0];

    // Configure email transporter
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS
      }
    });

    // Determine the email content based on the booking status
    let subject, text;
    if (status === 1) { // Booking confirmed
      subject = 'Booking Confirmed';
      text = `Dear ${firstName} ${lastName},\n\nYour booking for ${product} from ${businessName} has been confirmed. Thank you for choosing us!\n\nBest regards,\nRabaSorsogon`;
    } else if (status === 2) { // Booking completed
      subject = 'Booking Completed';
      text = `Dear ${firstName} ${lastName},\n\nYour booking for ${product} from ${businessName} has been completed. Thank you for choosing us!\n\nBest regards,\nRabaSorsogon`;
    } else if (status === -1) { // Booking declined
      subject = 'Booking Declined';
      text = `Dear ${firstName} ${lastName},\n\nWe regret to inform you that your booking for ${product} from ${businessName} has been declined. Please contact us for more information.\n\nBest regards,\nRabaSorsogon`;
    } else {
      subject = 'Booking Status Updated';
      text = `Dear ${firstName} ${lastName},\n\nYour booking status for ${product} from ${businessName} has been updated. Please check your account for details.\n\nBest regards,\nRabaSorsogon`;
    }

    // Send the email notification
    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: email,
      subject,
      text
    });

    return res.json({ 
      success: true, 
      message: 'Booking status updated and email notification sent successfully',
      receiver_id: receiverId,
      title: product,
    });
  } catch (err) {
    console.error('Error updating booking status:', err);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to update booking status' 
    });
  }
});

// Endpoint to fetch trips
app.get('/trips', async (req, res) => {
  const userId = req.session?.user?.user_id;

  if (!userId) {
    return res.status(401).json({ success: false, message: 'User not logged in' });
  }

  try {
    // Use pooled connection to query trips
    const [results] = await pool.query('SELECT * FROM trips WHERE user_id = ?', [userId]);
    res.json({ success: true, trips: results });
  } catch (err) {
    console.error('Error fetching trips:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Endpoint to add a new trip
app.post('/add-trip', async (req, res) => {
  const { tripName, imageUrl, destination, startDate, endDate, itinerary, userId } = req.body;

  if (!userId) {
    return res.status(401).json({ success: false, message: 'User not logged in' });
  }

  const sql = `
    INSERT INTO trips (user_id, tripName, imageUrl, destination, startDate, endDate, itinerary)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  const values = [userId, tripName, imageUrl, destination, startDate, endDate, JSON.stringify(itinerary)];

  try {
    // Use pooled connection to insert a new trip
    const [result] = await pool.query(sql, values);
    res.status(201).json({ success: true, message: 'Trip added successfully', tripId: result.insertId });
  } catch (err) {
    console.error('Error adding trip:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Endpoint to update a trip
app.put('/update-trip/:id', async (req, res) => {
  const tripId = req.params.id;
  const { tripName, imageUrl, destination, startDate, endDate, itinerary } = req.body;
  const userId = req.session?.user?.user_id;

  if (!userId) {
    return res.status(401).json({ success: false, message: 'User not logged in' });
  }

  const sql = `
    UPDATE trips 
    SET tripName = ?, imageUrl = ?, destination = ?, startDate = ?, endDate = ?, itinerary = ?
    WHERE tripId = ? AND user_id = ?
  `;
  const values = [
    tripName,
    imageUrl,
    destination,
    startDate,
    endDate,
    JSON.stringify(itinerary),
    tripId,
    userId
  ];

  try {
    // Use the connection pool to execute the query
    const [result] = await pool.query(sql, values);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Trip not found or not authorized' });
    }

    res.json({ success: true, message: 'Trip updated successfully' });
  } catch (err) {
    console.error('Error updating trip:', err);
    return res.status(500).json({ success: false, message: 'Failed to update trip' });
  }
});

// Endpoint to delete a trip
app.delete('/delete-trip/:id', async (req, res) => {
  const tripId = req.params.id;
  const userId = req.session?.user?.user_id;

  if (!userId) {
    return res.status(401).json({ success: false, message: 'User not logged in' });
  }

  try {
    // Use a pooled connection to execute the query
    const [result] = await pool.query('DELETE FROM trips WHERE tripId = ? AND user_id = ?', [tripId, userId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Trip not found' });
    }

    res.json({ success: true, message: 'Trip deleted successfully' });
  } catch (err) {
    console.error('Error deleting trip:', err);
    res.status(500).json({ success: false, message: 'Failed to delete trip' });
  }
});

//Para sa pag display ng accomodations
// Endpoint to fetch accommodations
app.get('/accommodations', async (req, res) => {
  const sql = `
    SELECT * FROM accommodations
  `;

  try {
    // Execute the SQL query using the connection pool
    const [results] = await pool.query(sql);

    // Send the list of accommodations as the response
    return res.json({ success: true, accommodations: results });
  } catch (err) {
    console.error('Error executing SQL query:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

//Para sa pag display ng foods
// Endpoint to fetch foods
app.get('/foods', async (req, res) => {
  const sql = `SELECT * FROM foods`;

  try {
    // Use the connection pool to execute the query
    const [results] = await pool.query(sql);

    // Send the list of foods as the response
    return res.json({ success: true, foods: results });
  } catch (err) {
    console.error('Error executing SQL query:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

//para sa pag display ng mga rooms
// Endpoint to fetch rooms
app.get('/rooms', async (req, res) => {
  const sql = `
    SELECT * FROM rooms
  `;

  try {
    // Use a pooled connection to execute the query
    const [results] = await pool.query(sql);

    // Send the list of rooms as the response
    return res.json({ success: true, rooms: results });
  } catch (err) {
    console.error('Error executing SQL query:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

//para sa pag display ng mga activities
// Endpoint to fetch activities
app.get('/activities', async (req, res) => {
  const sql = 'SELECT * FROM activities';

  try {
    // Use the pool to execute the query
    const [results] = await pool.query(sql);

    // Send the list of activities as the response
    return res.json({ success: true, activities: results });
  } catch (err) {
    console.error('Error executing SQL query:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

//para sa pag display ng mga amenities
// Endpoint to fetch amenities
app.get('/getAmenities', async (req, res) => {
  const sql = `
    SELECT 
      b.business_id,
      b.facilities,
      JSON_ARRAYAGG(JSON_UNQUOTE(JSON_EXTRACT(b.facilities, '$[*].name'))) AS raw_amenities
    FROM 
      businesses b
    GROUP BY 
      b.business_id
    ORDER BY 
      b.business_id;
  `;

  try {
    // Use pooled connection to query the database
    const [results] = await pool.query(sql);

    // Post-process the results to clean up the unique_amenities
    const cleanedResults = results.map(business => {
      const uniqueAmenitiesSet = new Set();

      // Parse each raw_amenity entry and add unique items to the set
      business.raw_amenities.forEach(amenity => {
        if (amenity) {
          try {
            const amenitiesArray = JSON.parse(amenity);
            amenitiesArray.forEach(item => uniqueAmenitiesSet.add(item));
          } catch (e) {
            console.error('Error parsing amenity:', e);
          }
        }
      });

      return {
        ...business,
        amenities: Array.from(uniqueAmenitiesSet)
      };
    });

    return res.json({ success: true, businesses: cleanedResults });
  } catch (err) {
    console.error('Error executing SQL query:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

//para sa pag display ng mga deals
// Endpoint to fetch deals
app.get('/deals', async (req, res) => {
  const sql = `
    SELECT * FROM deals
  `;

  try {
    // Use a pooled connection to execute the query
    const [results] = await pool.query(sql);
    
    // Send the list of deals as the response
    return res.json({ success: true, deals: results });
  } catch (err) {
    console.error('Error executing SQL query:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

//para sa pag display ng mga products
// Endpoint to fetch products
app.get('/products', async (req, res) => {
  const sql = `SELECT * FROM products`;

  try {
    // Use the pool to execute the SQL query
    const [results] = await pool.query(sql);

    // Send the list of products as the response
    return res.json({ success: true, products: results });
  } catch (err) {
    console.error('Error executing SQL query:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

//para sa pag display ng mga location
// Endpoint to fetch locations
app.get('/locations', async (req, res) => {
  const sql = `
    SELECT * FROM locations
  `;

  try {
    // Use a pooled connection to execute the SQL query
    const [results] = await pool.query(sql);

    // Send the list of locations as the response
    return res.json({ success: true, locations: results });
  } catch (err) {
    console.error('Error executing SQL query:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

//SUPER 
// Endpoint to fetch all data
app.get('/superAdmin-fetchAllData', async (req, res) => {
  try {
    const queries = {
      pendingVerifications: 'SELECT COUNT(*) AS count FROM business_applications WHERE status = 0',
      businessOwners: 'SELECT COUNT(DISTINCT user_id) AS count FROM businesses',
      tourists: 'SELECT COUNT(*) AS count FROM users WHERE user_id NOT IN (SELECT DISTINCT user_id FROM businesses)',
      reports: 'SELECT COUNT(*) AS count FROM reports WHERE status = "open"'
    };

    const results = {};

    // Execute all queries concurrently using Promise.all
    const queryPromises = Object.keys(queries).map(async (key) => {
      const [rows] = await pool.query(queries[key]);
      results[key] = rows[0].count;
    });

    // Wait for all queries to complete
    await Promise.all(queryPromises);

    // Respond with the results
    res.json({
      success: true,
      pendingVerifications: results.pendingVerifications,
      businessOwners: results.businessOwners,
      tourists: results.tourists,
      reports: results.reports
    });
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Endpoint to fetch all users
app.get('/superAdmin-fetchAllUsers', async (req, res) => {
  const sql = `
    SELECT 
      u.user_id,
      u.Fname,
      u.Lname,
      u.email,
      b.business_id,
      b.businessName,
      b.businessType
    FROM users u
    LEFT JOIN businesses b ON u.user_id = b.user_id
  `;

  try {
    // Use pooled connection to execute query
    const [results] = await pool.query(sql);

    // Transform the results to include user type
    const formattedUsers = results.map(user => ({
      user_id: user.user_id,
      name: `${user.Fname} ${user.Lname}`,
      email: user.email,
      type: user.business_id ? 'Business Owner' : 'Tourist',
      // Include business details if they exist
      ...(user.business_id && {
        businessName: user.businessName,
        businessType: user.businessType,
      }),
    }));

    return res.json({ 
      success: true, 
      users: formattedUsers 
    });
  } catch (err) {
    console.error('Error executing SQL query:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Endpoint to delete user
app.delete('/superAdmin-deleteUser/:id', async (req, res) => {
  const userId = req.params.id;

  try {
    // Check if the user exists
    const [userCheckResults] = await pool.query('SELECT * FROM users WHERE user_id = ?', [userId]);
    if (userCheckResults.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Delete related records from businesses table
    await pool.query('DELETE FROM businesses WHERE user_id = ?', [userId]);

    // Delete related records from business_applications table
    await pool.query('DELETE FROM business_applications WHERE user_id = ?', [userId]);

    // Finally delete the user
    const [deleteResult] = await pool.query('DELETE FROM users WHERE user_id = ?', [userId]);
    if (deleteResult.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    return res.json({
      success: true,
      message: 'User and associated records deleted successfully',
    });
  } catch (err) {
    console.error('Error processing request:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Endpoint to fetch all business owners with their businesses and business products
app.get('/superAdmin-fetchAllBusinessOwners', async (req, res) => {
  const sql = `
    SELECT 
      u.user_id,
      u.Fname AS firstName,
      u.Lname AS lastName,
      u.email,
      b.business_id,
      b.businessName,
      b.businessType,
      b.location,
      COUNT(p.product_id) AS products
    FROM users u
    JOIN businesses b ON u.user_id = b.user_id
    LEFT JOIN products p ON b.business_id = p.business_id
    GROUP BY b.business_id
  `;

  try {
    // Use the connection pool to query the database
    const [results] = await pool.query(sql);

    const formattedResults = results.map(owner => ({
      name: `${owner.firstName} ${owner.lastName}`,
      type: owner.businessType,
      products: owner.products,
      location: owner.location,
      status: 'Not Reported', // Placeholder, update as needed
      ranking: 0 // Placeholder, update with actual logic if needed
    }));

    return res.json({ success: true, data: formattedResults });
  } catch (err) {
    console.error('Error fetching business owners:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Endpoint to fetch all business products
app.get('/superAdmin-fetchAllBusinessProducts', async (req, res) => {
  try {
    const sql = `
      SELECT 
        p.*,
        b.businessName,
        u.username as owner_name,
        COALESCE(d.discount, 0) as discount,
        COALESCE(d.expirationDate, 'No Expiration') as expiration
      FROM products p
      LEFT JOIN businesses b ON p.business_id = b.business_id
      LEFT JOIN users u ON p.user_id = u.user_id
      LEFT JOIN (
        SELECT product_id, MAX(discount) as discount, MAX(expirationDate) as expirationDate
        FROM deals
        WHERE expirationDate > NOW() OR expirationDate IS NULL
        GROUP BY product_id
      ) d ON p.product_id = d.product_id
      ORDER BY p.created_at DESC
    `;

    // Use the connection pool to execute the query
    const [results] = await pool.query(sql);

    return res.json({
      success: true,
      products: results
    });
  } catch (err) {
    console.error('Error fetching business products:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch business products',
      error: err.message
    });
  }
});

// Endpoint to fetch all business listings
app.get('/superAdmin-fetchAllBusinessListings', async (req, res) => {
  const sql = `
    SELECT 
      b.*,
      u.username AS owner_name,
      u.email AS owner_email,
      ba.status AS application_status
    FROM businesses b
    LEFT JOIN users u ON b.user_id = u.user_id
    LEFT JOIN business_applications ba ON b.application_id = ba.application_id
    ORDER BY b.business_id DESC
  `;

  try {
    // Query the database using the pool
    const [results] = await pool.query(sql);

    // Helper function to handle JSON fields
    const handleJSONField = (field) => {
      if (!field) return null;
      if (typeof field === 'object') return field; // Already an object/array
      try {
        return JSON.parse(field); // Parse if it's a string
      } catch (e) {
        return field; // Return raw value if parsing fails
      }
    };

    // Process the results
    const formattedResults = results.map((business) => ({
      business_id: business.business_id,
      user_id: business.user_id,
      application_id: business.application_id,
      businessName: business.businessName,
      businessType: business.businessType || '',
      owner_name: business.owner_name,
      owner_email: business.owner_email,
      application_status: business.application_status,

      // Handle JSON fields
      category: handleJSONField(business.category),
      businessLogo: business.businessLogo,
      businessCard: handleJSONField(business.businessCard),
      heroImages: handleJSONField(business.heroImages),
      aboutUs: business.aboutUs,
      facilities: handleJSONField(business.facilities),
      policies: handleJSONField(business.policies),
      contactInfo: handleJSONField(business.contactInfo),
      openingHours: handleJSONField(business.openingHours),

      // Add formatted fields for frontend display
      displayStatus: business.application_status === 1 ? 'Active' : 'Pending',
      logoUrl: business.businessLogo ? `${business.businessLogo}` : null,
      mainHeroImage: business.heroImages
        ? handleJSONField(business.heroImages)[0] || null
        : null,
    }));

    // Respond with the formatted data
    return res.json({
      success: true,
      businesses: formattedResults,
      total: formattedResults.length,
    });
  } catch (err) {
    console.error('Error fetching business listings:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch business listings',
      error: err.message,
    });
  }
});

// Endpoint to fetch all business applications
app.get('/superAdmin-businessApplications', async (req, res) => {
  const sql = `
    SELECT 
      ba.*,
      b.businessName AS updatedBusinessName
    FROM business_applications ba
    LEFT JOIN businesses b ON ba.application_id = b.application_id
  `;

  try {
    // Execute the SQL query using the connection pool
    const [results] = await pool.query(sql);

    // Send the list of business applications as the response
    return res.json({ success: true, businessApplications: results });
  } catch (err) {
    console.error('Error executing SQL query:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Backend: /superAdmin-businessApplications endpoint
app.get('/superAdmin-applicationReports', async (req, res) => {
  const sql = `
    SELECT 
      MONTH(application_date) AS month,
      COUNT(*) AS applicationsCount
    FROM business_applications
    WHERE status = 1
    GROUP BY month
    ORDER BY month
  `;

  try {
    const [results] = await pool.query(sql);

    // Map results to the required chart format
    const businessOwnersData = {
      labels: results.map(row => {
        // Convert month number (1-12) to month name
        const date = new Date(0);
        date.setMonth(row.month - 1);
        return date.toLocaleString('default', { month: 'long' });
      }),
      datasets: [
        {
          label: 'Business Owners Applications',
          data: results.map(row => row.applicationsCount),
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1,
        },
      ],
    };

    return res.json({ success: true, businessOwnersData });
  } catch (err) {
    console.error('Error executing SQL query:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

app.get('/superAdmin-userReports', async (req, res) => {
  const sql = `
    SELECT 
      MONTH(created_at) AS month, 
      COUNT(*) AS activeUsersCount
    FROM users 
    GROUP BY month
    ORDER BY month
  `;

  try {
    const [results] = await pool.query(sql);

    // Map results to the required chart format
    const activeUsersData = {
      labels: results.map(row => {
        // Convert month number (1-12) to month name
        const date = new Date(0);
        date.setMonth(row.month - 1); // Adjust to zero-based month
        return date.toLocaleString('default', { month: 'long' }); // Get the month name
      }),
      datasets: [
        {
          label: 'User Registration',
          data: results.map(row => row.activeUsersCount),
          backgroundColor: 'rgba(255, 206, 86, 0.2)',  // A color for the chart background
          borderColor: 'rgba(255, 206, 86, 1)',  // A color for the chart border
          borderWidth: 1,
        },
      ],
    };

    return res.json({ success: true, activeUsersData });
  } catch (err) {
    console.error('Error executing SQL query:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Endpoint to update the business application status
app.put('/updateStatus-businessApplications/:id', async (req, res) => {
  const { id } = req.params; // Get the application ID from the URL
  const { status } = req.body; // Get the new status from the request body

  if (typeof status !== 'number') {
    return res.status(400).json({ message: 'Invalid status value' });
  }

  try {
    // Update the status
    const [updateResults] = await pool.query(
      'UPDATE business_applications SET status = ? WHERE application_id = ?',
      [status, id]
    );

    if (updateResults.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Business application not found' });
    }

    // Fetch updated application data with email using LEFT JOIN
    const [applicationResults] = await pool.query(
      `
      SELECT 
        ba.*, 
        u.email AS email 
      FROM 
        business_applications AS ba 
      LEFT JOIN 
        users AS u 
      ON 
        ba.user_id = u.user_id 
      WHERE 
        ba.application_id = ?
      `,
      [id]
    );

    if (applicationResults.length === 0) {
      return res.status(404).json({ success: false, message: 'Business application not found' });
    }

    const applicationData = applicationResults[0]; // Extract application data

    // Configure email transporter
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS
      }
    });

    if (status === 1) { // Approval logic
      // Send approval email
      await transporter.sendMail({
        from: process.env.GMAIL_USER,
        to: applicationData.email,
        subject: 'Business Application Approved',
        text: `Dear ${applicationData.businessName},\n\nYour business application has been approved! Welcome aboard.\n\nBest regards,\nRabaSorsogon`
      });

      // Prepare data for insertion
      const {
        user_id,
        application_id,
        businessName,
        certNumber,
        businessType,
        category,
        businessScope,
        completeAddress,
        pin_location,
      } = applicationData;

      const insertQuery = `
        INSERT INTO businesses 
        (user_id, application_id, businessName, certNumber, businessType, category, location, completeAddress, pin_location, businessLogo, businessCard, heroImages, aboutUs, facilities, policies, contactInfo, openingHours) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

      const insertValues = [
        user_id,
        application_id,
        businessName,
        certNumber,
        businessType,
        JSON.stringify(category),
        businessScope,
        completeAddress,
        JSON.stringify(pin_location),
        null, // businessLogo
        JSON.stringify({ category, location: businessScope, cardImage: '', priceRange: '', description: '' }), // businessCard
        null, // heroImages
        null, // aboutUs
        null, // facilities
        null, // policies
        null, // contactInfo
        null, // openingHours
      ];

      await pool.query(insertQuery, insertValues);

      return res.json({
        success: true,
        message: 'Business application approved and data copied to businesses table successfully',
      });
    } else { // Decline logic
      // Send decline email
      await transporter.sendMail({
        from: process.env.GMAIL_USER,
        to: applicationData.email,
        subject: 'Business Application Declined',
        text: `Dear ${applicationData.businessName},\n\nWe regret to inform you that your business application has been declined. Please contact us for more information.\n\nBest regards,\nRabaSorsogon`
      });

      return res.json({
        success: true,
        message: 'Business application status updated successfully',
      });
    }
  } catch (error) {
    console.error('Error updating status:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


// ************************************************************
// ************************************************************
// **************** For the chat system ***********************
// ************************************************************
// ************************************************************

// Endpoint to get messages


// const crypto = require('crypto');
const algorithm = 'aes-256-ctr'; // You can use any algorithm you'd like
const secretKey = 'your-secret-key'; // This key should be securely stored (e.g., in environment variables)
const iv = crypto.randomBytes(16); // Initialization vector

// Hash the secretKey to ensure it's always 32 bytes
const key = crypto.createHash('sha256').update(secretKey).digest();

// Encrypt function
function encrypt(text) {
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return { iv: iv.toString('hex'), encryptedData: encrypted };
}

// Decrypt function
function decrypt(encryptedText, iv) {
  const decipher = crypto.createDecipheriv(algorithm, key, Buffer.from(iv, 'hex'));
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

// Example usage of encryption and decryption:
const encryptedMessage = encrypt('This is a secret message.');
// console.log('Encrypted:', encryptedMessage);

const decryptedMessage = decrypt(encryptedMessage.encryptedData, encryptedMessage.iv);
// console.log('Decrypted:', decryptedMessage);

// Endpoint to send messages
app.post('/sendMessage', upload.single('photo'), async (req, res) => {
  const { sender_id, sender_account, receiver_id, receiver_account, text, formType, form_details } = req.body;
  const photoPath = req.file ? req.file.path : null; // Get the uploaded photo path if it exists

  // Encrypt the message text
  const encryptedMessage = encrypt(text);

  // Construct the message object
  const message = {
    sender_id,
    sender_account,
    receiver_id,
    receiver_account,
    text: encryptedMessage.encryptedData, // Store encrypted message
    formType,
    form_details,
    image: photoPath, // Include the photo path in the message
    iv: encryptedMessage.iv, // Store the IV used for encryption
    time: new Date() // Add a timestamp
  };

  try {
    // Insert the message into the database using the connection pool
    const [result] = await pool.query('INSERT INTO messages SET ?', message);

    res.json({ success: true, message: 'Message sent successfully', messageId: result.insertId });
  } catch (err) {
    console.error('Error sending message:', err);
    res.status(500).json({ success: false, message: 'Failed to send message' });
  }
});

// Endpoint to get messages for users
app.get('/userMessages/:userId', async (req, res) => {
  const { userId } = req.params; // Extract userId from URL parameters
  const account = 'user';

  try {
    // Query the database for messages where either sender_id or receiver_id matches the userId
    const [results] = await pool.query(
      'SELECT * FROM messages WHERE (sender_id = ? AND sender_account = ?) OR (receiver_id = ? AND receiver_account = ?) ORDER BY time ASC',
      [userId, account, userId, account]
    );

    // Group messages by businessId
    const groupedMessages = results.reduce((acc, message) => {
      const businessId = message.sender_id === parseInt(userId) ? message.receiver_id : message.sender_id;
      const decryptedText = decrypt(message.text, message.iv); // Decrypt the message text

      if (!acc[businessId]) {
        acc[businessId] = [];
      }
      acc[businessId].push({
        id: message.id,
        senderId: message.sender_id,
        senderAccount: message.sender_account,
        receiverId: message.receiver_id,
        receiverAccount: message.receiver_account,
        text: decryptedText, // Store decrypted text
        time: message.time,
        image: message.image,
        formType: message.formType,
        formDetails: message.form_details,
        additionalInfo: message.additionalInfo,
        messageNote: message.messageNote
      });
      return acc;
    }, {});

    // Format the response
    const response = Object.keys(groupedMessages).map(businessId => ({
      businessId: parseInt(businessId),
      messages: groupedMessages[businessId]
    }));

    res.json(response); // Send formatted messages in response
  } catch (error) {
    console.error('Unexpected error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Endpoint to get messages for businesses
app.get('/businessMessages/:businessId', async (req, res) => {
  const { businessId } = req.params; // Extract businessId from URL parameters
  const account = 'business';

  try {
    // Query the database for messages where either sender_id or receiver_id matches the businessId
    const [results] = await pool.query(
      'SELECT * FROM messages WHERE (sender_id = ? AND sender_account = ?) OR (receiver_id = ? AND receiver_account = ?) ORDER BY time ASC',
      [businessId, account, businessId, account]
    );

    if (results.length === 0) {
      return res.status(404).json({ message: 'No messages found.' });
    }

    // Group messages by userId
    const groupedMessages = results.reduce((acc, message) => {
      const userId = message.sender_id === parseInt(businessId) ? message.receiver_id : message.sender_id;
      const decryptedText = decrypt(message.text, message.iv); // Decrypt the message text

      if (!acc[userId]) {
        acc[userId] = [];
      }
      acc[userId].push({
        id: message.id,
        senderId: message.sender_id,
        senderAccount: message.sender_account,
        receiverId: message.receiver_id,
        receiverAccount: message.receiver_account,
        text: decryptedText, // Store decrypted text
        time: message.time,
        image: message.image,
        formType: message.formType,
        formDetails: message.form_details,
        additionalInfo: message.additionalInfo,
        messageNote: message.messageNote
      });
      return acc;
    }, {});

    // Format the response
    const response = Object.keys(groupedMessages).map(userId => ({
      userId: parseInt(userId),
      messages: groupedMessages[userId]
    }));

    res.json(response); // Send formatted messages in response
  } catch (error) {
    console.error('Unexpected error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


app.get('/businessesInChat/:userId', async (req, res) => {
  const { userId } = req.params;
  const sql = `
    SELECT DISTINCT
      b.business_id AS id,
      b.user_id,
      b.businessName AS name,
      b.businessType,
      b.businessLogo AS avatarUrl,
      b.location,
      b.contactInfo
    FROM businesses b
    WHERE b.user_id = ?
    ORDER BY b.business_id
  `;

  try {
    // Use a pooled connection to query the database
    const [results] = await pool.query(sql, [userId]);
    res.json(results);
  } catch (err) {
    console.error('Error fetching businesses:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch businesses' });
  }
});

// Get users in chat based on user ID
app.get('/usersInChat/:userId', async (req, res) => {
  const { userId } = req.params;

  const sql = `
    SELECT DISTINCT
      u.user_id,
      CONCAT(u.Fname, ' ', u.Lname) AS name,
      u.email,
      u.image,
      u.image_path,
      u.contact
    FROM users u
    WHERE u.user_id = ?
  `;

  try {
    // Use the pool to execute the query
    const [results] = await pool.query(sql, [userId]);

    // Send the response with the fetched data
    res.json(results);
  } catch (err) {
    console.error('Error fetching users in chat:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch users in chat' });
  }
});

// ************************************************************
// ************************************************************
// ************ Displaying data for the pages *****************
// ************************************************************
// ************************************************************
// ayuson mo ung amenities mamaya
// Endpoint to display all the business with its price ranges based on the business products
app.get('/getAllBusinesses', async (req, res) => {
  const sql = `
    SELECT 
      b.business_id,
      b.user_id,
      b.businessName,
      b.businessType,
      b.category,
      b.businessLogo,
      b.heroImages AS coverPhotos,
      b.location AS destination,
      b.completeAddress AS defaultAddress,
      b.pin_location,
      b.contactInfo,
      b.openingHours,
      b.facilities,
      b.policies,
      b.dateOrigin,
      IF(
        JSON_UNQUOTE(JSON_EXTRACT(b.businessCard, '$.description')) IS NULL OR 
        JSON_UNQUOTE(JSON_EXTRACT(b.businessCard, '$.description')) = '', 
        NULL, 
        JSON_UNQUOTE(JSON_EXTRACT(b.businessCard, '$.description'))
      ) AS description,
      IF(
        JSON_UNQUOTE(JSON_EXTRACT(b.businessCard, '$.cardImage')) IS NULL OR 
        JSON_UNQUOTE(JSON_EXTRACT(b.businessCard, '$.cardImage')) = '', 
        NULL, 
        JSON_UNQUOTE(JSON_EXTRACT(b.businessCard, '$.cardImage'))
      ) AS cardImage,
      IF(
        JSON_UNQUOTE(JSON_EXTRACT(b.businessCard, '$.location')) IS NULL OR 
        JSON_UNQUOTE(JSON_EXTRACT(b.businessCard, '$.location')) = '', 
        NULL, 
        JSON_UNQUOTE(JSON_EXTRACT(b.businessCard, '$.location'))
      ) AS completeAddress,
      b.aboutUs,
      MIN(CAST(p.price AS DECIMAL)) AS lowest_price,
      MAX(CAST(p.price AS DECIMAL)) AS highest_price,
      (
        SELECT COUNT(*) 
        FROM liked_pages l 
        WHERE l.business_id = b.business_id
      ) AS likes,
      AVG(r.ratings) AS rating,
      (
        SELECT COUNT(*) 
        FROM business_ratings br 
        WHERE br.business_id = b.business_id
      ) AS rateCount,
      AVG(r.ratings) AS rating,
      JSON_ARRAYAGG(JSON_UNQUOTE(JSON_EXTRACT(b.facilities, '$[*].name'))) AS raw_amenities
    FROM 
      businesses b
    LEFT JOIN 
      products p ON b.business_id = p.business_id
    LEFT JOIN
      business_ratings r ON b.business_id = r.business_id
    GROUP BY 
      b.business_id, b.businessName, b.businessType, b.businessLogo, 
      b.location, b.businessCard, b.aboutUs
    ORDER BY 
      b.business_id;
  `;

  try {
    // Use pooled connection to query the database
    const [results] = await pool.query(sql);

    // Post-process the results to clean up the unique_amenities
    const cleanedResults = results.map(business => {
      const uniqueAmenitiesSet = new Set();

      // Parse each raw_amenity entry and add unique items to the set
      business.raw_amenities.forEach(amenity => {
        if (amenity) {
          try {
            const amenitiesArray = JSON.parse(amenity);
            amenitiesArray.forEach(item => uniqueAmenitiesSet.add(item));
          } catch (e) {
            console.error('Error parsing amenity:', e);
          }
        }
      });

      return {
        ...business,
        amenities: Array.from(uniqueAmenitiesSet)
      };
    });

    return res.json({ success: true, businesses: cleanedResults });
  } catch (err) {
    console.error('Error executing SQL query:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Endpoint to fetch businesses likes count
app.get('/getLikesCount/:businessId', async (req, res) => {
  const { businessId } = req.params;

  // SQL query to count likes for the specified business
  const sql = `
    SELECT 
      b.business_id,
      (
        SELECT COUNT(*) 
        FROM liked_pages l 
        WHERE l.business_id = b.business_id
      ) AS likes
    FROM 
      businesses b
    WHERE 
      b.business_id = ?
    GROUP BY 
      b.business_id;
  `;

  try {
    // Use pooled connection to query the database
    const [results] = await pool.query(sql, [businessId]);

    // Check if a result was found
    if (results.length === 0) {
      return res.status(404).json({ success: false, message: 'Business not found' });
    }

    return res.json({ success: true, businessLikes: results[0] });
  } catch (err) {
    console.error('Error executing SQL query:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Endpoint to fetch businesses based on business location
app.get('/getBusinessesByLocation/:location', async (req, res) => {
  // Normalize the input by removing spaces and converting to lowercase
  const location = req.params.location.replace(/\s+/g, '').toLowerCase();

  const sql = `
    SELECT 
      b.business_id, 
      b.businessName AS name, 
      b.businessType, 
      b.businessLogo AS businessLogo, 
      b.location AS destination, 
      b.contactInfo, 
      b.openingHours, 
      b.facilities, 
      b.policies, 
      b.pin_location,
      IF(
        JSON_UNQUOTE(JSON_EXTRACT(b.businessCard, '$.description')) IS NULL OR 
        JSON_UNQUOTE(JSON_EXTRACT(b.businessCard, '$.description')) = '', 
        NULL, 
        JSON_UNQUOTE(JSON_EXTRACT(b.businessCard, '$.description'))
      ) AS description,
      IF(
        JSON_UNQUOTE(JSON_EXTRACT(b.businessCard, '$.cardImage')) IS NULL OR 
        JSON_UNQUOTE(JSON_EXTRACT(b.businessCard, '$.cardImage')) = '', 
        NULL, 
        JSON_UNQUOTE(JSON_EXTRACT(b.businessCard, '$.cardImage'))
      ) AS image,
      IF(
        JSON_UNQUOTE(JSON_EXTRACT(b.businessCard, '$.location')) IS NULL OR 
        JSON_UNQUOTE(JSON_EXTRACT(b.businessCard, '$.location')) = '', 
        NULL, 
        JSON_UNQUOTE(JSON_EXTRACT(b.businessCard, '$.location'))
      ) AS completeAddress,
      b.aboutUs, 
      MIN(CAST(p.price AS DECIMAL)) AS lowest_price,
      MAX(CAST(p.price AS DECIMAL)) AS highest_price,
      AVG(r.ratings) AS rating 
    FROM businesses b
    LEFT JOIN products p ON b.business_id = p.business_id
    LEFT JOIN business_ratings r ON b.business_id = r.business_id
    WHERE REPLACE(LOWER(b.location), ' ', '') = ?
    GROUP BY b.business_id, b.businessName, b.businessType, b.facilities, b.businessLogo, 
      b.location, b.contactInfo, b.openingHours, b.facilities, 
      b.policies, b.aboutUs
  `;

  try {
    const [results] = await pool.query(sql, [location]);
    res.json(results);
  } catch (err) {
    console.error('Error fetching businesses by location:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Endpoint to fetch businesses based on business location
app.get('/getBusinessesByBusinessType/:businessType', async (req, res) => {
  // Normalize the input by removing spaces and converting to lowercase
  const businessType = req.params.businessType.replace(/\s+/g, '').toLowerCase();

  const sql = `
    SELECT 
      b.business_id, 
      b.businessName AS name, 
      b.businessType, 
      b.businessLogo AS businessLogo, 
      b.heroImages AS coverPhotos,
      b.location AS destination, 
      b.contactInfo, 
      b.openingHours, 
      b.facilities, 
      b.policies, 
      b.pin_location,
      b.dateOrigin,
      IF(
        JSON_UNQUOTE(JSON_EXTRACT(b.businessCard, '$.description')) IS NULL OR 
        JSON_UNQUOTE(JSON_EXTRACT(b.businessCard, '$.description')) = '', 
        NULL, 
        JSON_UNQUOTE(JSON_EXTRACT(b.businessCard, '$.description'))
      ) AS description,
      IF(
        JSON_UNQUOTE(JSON_EXTRACT(b.businessCard, '$.cardImage')) IS NULL OR 
        JSON_UNQUOTE(JSON_EXTRACT(b.businessCard, '$.cardImage')) = '', 
        NULL, 
        JSON_UNQUOTE(JSON_EXTRACT(b.businessCard, '$.cardImage'))
      ) AS image,
      IF(
        JSON_UNQUOTE(JSON_EXTRACT(b.businessCard, '$.location')) IS NULL OR 
        JSON_UNQUOTE(JSON_EXTRACT(b.businessCard, '$.location')) = '', 
        NULL, 
        JSON_UNQUOTE(JSON_EXTRACT(b.businessCard, '$.location'))
      ) AS completeAddress,
      b.aboutUs, 
      MIN(CAST(p.price AS DECIMAL)) AS lowest_price,
      MAX(CAST(p.price AS DECIMAL)) AS highest_price,
      (
        SELECT COUNT(*) 
        FROM liked_pages l 
        WHERE l.business_id = b.business_id
      ) AS likes,
      AVG(r.ratings) AS rating,
      (
        SELECT COUNT(*) 
        FROM business_ratings br 
        WHERE br.business_id = b.business_id
      ) AS rateCount
    FROM businesses b
    LEFT JOIN products p ON b.business_id = p.business_id
    LEFT JOIN business_ratings r ON b.business_id = r.business_id
    WHERE REPLACE(LOWER(b.businessType), ' ', '') = ?
    GROUP BY b.business_id, b.businessName, b.businessType, b.businessLogo, 
      b.location, b.contactInfo, b.openingHours, b.facilities, 
      b.policies, b.aboutUs
    ORDER BY b.dateOrigin DESC;
  `;

  try {
    const [results] = await pool.query(sql, [businessType]);
    res.json(results);
  } catch (err) {
    console.error('Error fetching businesses by businessType:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Endpoint for reviews and ratings
app.get('/getAllReviewsAndRatings', async (req, res) => {
  const sql = `
    SELECT 
      product_ratings.*, 
      products.name AS title, 
      products.description,
      users.username, 
      users.user_id,
      users.email
    FROM 
      product_ratings
    LEFT JOIN 
      products ON products.product_id = product_ratings.product_id
    LEFT JOIN 
      users ON users.user_id = product_ratings.user_id
  `;

  try {
    // Use the connection pool to query the database
    const [results] = await pool.query(sql);

    return res.json({ success: true, reviewsAndRatings: results });
  } catch (err) {
    console.error('Error fetching reviews and ratings:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Endpoint to add reviews and ratings
app.post('/addReviewsAndRatings', async (req, res) => {
  const { product_id, user_id, rating, comment } = req.body;

  // Validate the input
  if (!product_id || !user_id || !rating) {
    return res.status(400).json({ success: false, message: 'Product ID, User ID, and Rating are required' });
  }

  try {
    // SQL query to insert the review and rating
    const sql = `
      INSERT INTO product_ratings (product_id, user_id, ratings, comment)
      VALUES (?, ?, ?, ?)
    `;
    
    // Use pool.query to interact with the database
    const [results] = await pool.query(sql, [product_id, user_id, rating, comment || '']);

    return res.json({ success: true, message: 'Review and rating added successfully' });
  } catch (err) {
    console.error('Error adding review and rating:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Endpoint for reviews and ratings
app.get('/business-getAllReviewsAndRatings', async (req, res) => {
  const sql = `
    SELECT 
      br.*, 
      b.businessName AS title, 
      u.username, 
      u.user_id,
      u.email,
      u.image,
      u.image_path
    FROM 
      business_ratings br
    LEFT JOIN 
      businesses b ON b.business_id = br.business_id
    LEFT JOIN 
      users u ON u.user_id = br.user_id
  `;

  try {
    // Use the connection pool to query the database
    const [results] = await pool.query(sql);

    return res.json({ success: true, reviewsAndRatings: results });
  } catch (err) {
    console.error('Error fetching reviews and ratings:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Endpoint to add reviews and reatings to the buisness in business profile
app.post('/business-addReviewsAndRatings', async (req, res) => {
  const { business_id, user_id, rating, comment } = req.body;

  // Validate the input
  if (!business_id || !user_id || !rating) {
    return res.status(400).json({ success: false, message: 'Business ID, User ID, and Rating are required' });
  }

  try {
    // SQL query to insert the review and rating
    const sql = `
      INSERT INTO business_ratings (business_id, user_id, ratings, comment)
      VALUES (?, ?, ?, ?)
    `;
    
    // Use pool.query to interact with the database
    const [results] = await pool.query(sql, [business_id, user_id, rating, comment || '']);

    return res.json({ success: true, message: 'Review and rating added successfully' });
  } catch (err) {
    console.error('Error adding review and rating:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});


// Endpoint to edit reviews and ratings
app.put('/business-editReviewAndRating', async (req, res) => {
  const { ratings_id, rating, comment } = req.body;

  // Validate the input
  if (!ratings_id || !rating) {
    return res.status(400).json({ success: false, message: 'Rating ID and Rating are required' });
  }

  try {
    // SQL query to update the review and rating
    const sql = `
      UPDATE business_ratings
      SET ratings = ?, comment = ?
      WHERE ratings_id = ?
    `;

    // Use pool.query to interact with the database
    const [results] = await pool.query(sql, [rating, comment || '', ratings_id]);

    // Check if any row was affected (to ensure the ID exists)
    if (results.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Review and rating not found' });
    }

    return res.json({ success: true, message: 'Review and rating updated successfully' });
  } catch (err) {
    console.error('Error updating review and rating:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

////////////////////////////
////////////////////////////
////////Transportation//////
///////////////////////////
//////////////////////////




//////////////////////////////
/////////////////////////////
/////////////////////////////
//Download Database/////////
///////////////////////////
//////////////////////////
// app.get('/download-database', (req, res) => {
//   const dumpFile = path.join(__dirname, 'dumpfile.sql');

//   // Command to dump the database
//   const dumpCommand = `mysqldump -u username -p'password' database_name > ${dumpFile}`;
  
//   exec(dumpCommand, (error) => {
//       if (error) {
//           console.error('Error creating database dump:', error);
//           return res.status(500).send('Failed to create database dump');
//       }

//       // Send the dump file as a download
//       res.download(dumpFile, 'database_dump.sql', (err) => {
//           if (err) {
//               console.error('Error sending file:', err);
//           }

//           // Optional: Delete the dump file after sending it
//           fs.unlink(dumpFile, (unlinkErr) => {
//               if (unlinkErr) console.error('Error deleting dump file:', unlinkErr);
//           });
//       });
//   });
// });

app.get('/download-database', async (req, res) => {
  adminId = req.session?.admin?.admin_id;

  if (!adminId) {
    return res.status(400).json({ success: false, message: "You don't have access to this file" });
  }
  
  console.log(adminId);
  try {
    // Get all tables in the database
    const [tables] = await pool.query("SHOW TABLES");

    // Prepare a string to hold the SQL dump
    let sqlDump = '';

    for (const tableRow of tables) {
      const tableName = Object.values(tableRow)[0];

      // Get table creation schema
      const [[createTable]] = await pool.query(`SHOW CREATE TABLE \`${tableName}\``);
      sqlDump += `${createTable['Create Table']};\n\n`;

      // Get table data
      const [rows] = await pool.query(`SELECT * FROM \`${tableName}\``);

      if (rows.length > 0) {
        const columns = Object.keys(rows[0]);
        rows.forEach(row => {
          const values = columns.map(col => pool.escape(row[col])).join(', ');
          sqlDump += `INSERT INTO \`${tableName}\` (${columns.join(', ')}) VALUES (${values});\n`;
        });
        sqlDump += '\n';
      }
    }

    // Save the SQL dump to a file
    const dumpFile = path.join(__dirname, 'database_dump.sql');
    fs.writeFileSync(dumpFile, sqlDump);

    // Send the dump file as a download
    res.download(dumpFile, 'database_dump.sql', (err) => {
      if (err) {
        console.error('Error sending file:', err);
      }

      // Delete the dump file after sending it
      fs.unlink(dumpFile, (unlinkErr) => {
        if (unlinkErr) console.error('Error deleting dump file:', unlinkErr);
      });
    });

  } catch (error) {
    console.error('Error generating database dump:', error);
    res.status(500).send('Failed to generate database dump');
  }
});

// Middleware for headers and logging
app.use((req, res, next) => {
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
  console.log('Api request: ');
  console.log(`${req.method} ${req.url} - ${JSON.stringify(req.body)}`);
  next();
});

const PORT = process.env.PORT || 5000;

// Listen on all interfaces (0.0.0.0) to make it accessible externally
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server started on port ${PORT}`);
});

// Refactored generateUniqueUsername function using connection pool
async function generateUniqueUsername(baseName) {
  const randomSuffix = Math.floor(Math.random() * 10000); // Generate a random number
  const username = `${baseName}${randomSuffix}`;

  try {
    // Query the database to check if the username already exists
    const [rows] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);

    if (rows.length > 0) {
      // If the username exists, try again
      return generateUniqueUsername(baseName); 
    } else {
      // If the username is unique, return it
      return username;
    }
  } catch (err) {
    console.error('Database error:', err);
    throw err; // Rethrow the error to be handled elsewhere
  }
}
