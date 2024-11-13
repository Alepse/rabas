require('dotenv').config();
const express = require('express');
const mysql = require('mysql2'); // npm install mysql2
const cors = require('cors'); // npm install cors
const multer = require('multer'); // npm install multer
const fs = require('fs');
const path = require('path'); // path is a built-in Node.js module, no need to install
const session = require('express-session'); // npm install express-session
const MySQLStore = require('express-mysql-session')(session); // npm install express-mysql-session
const bcrypt = require('bcryptjs'); //install bcrypt using this commant 'npm install bcryptjs'
const nodemailer = require('nodemailer'); // npm install nodemailer
const crypto = require('crypto'); // crypto is a built-in Node.js module, no need to install
const { v4: uuidv4 } = require('uuid');

const app = express();
// app.use(cors());
// Enable CORS with credentials
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

app.use(express.json()); // Parse JSON bodies

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

// Error handling for database connection
connection.connect((err) => {
  if (err) {
      console.error('Error connecting to database:', err);
      return;
  }
  console.log('Connected to database');
});

// MySQL session store configuration
const sessionStore = new MySQLStore({
  database: process.env.SESSION_DB_NAME,
  table: 'sessions',
  host: process.env.SESSION_DB_HOST,
  user: process.env.SESSION_DB_USER,
  password: process.env.SESSION_DB_PASSWORD,
  expiration: 86400000, // Session expiration time in milliseconds
  createDatabaseTable: true, // Automatically create sessions table if not exists
  schema: {
    tableName: 'sessions',
    columnNames: {
      session_id: 'session_id',
      expires: 'expires',
      data: 'data'
    }
  }
}, connection);

// Log session store configuration
console.log('Session store configuration:', sessionStore.options);

// Error handling for session store initialization
sessionStore.on('error', (error) => {
  console.error('Session store error:', error);
});

// Configure session middleware
app.use(session({
  secret: 'whats-on-your-mind',
  store: sessionStore,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 24 * 60 * 60 * 1000, // 1 day
    secure: false, // Set to true if using HTTPS
    httpOnly: true // Prevents client-side access to the cookie
  }
}));

// Error handling middleware for Express
app.use((err, req, res, next) => {
  console.error('Error:', err);
   res.status(500).json({ success: false, message: 'Internal server error' });
});


// User Login Endpoint
app.post('/login', (req, res) => {
  const { identifier, password } = req.body; // Use 'identifier' to accept either username or email
  const sql = 'SELECT * FROM users WHERE (username = ? OR email = ?)'; // Update SQL query to retrieve user by username or email
  connection.query(sql, [identifier, identifier], async (err, results) => { // Removed 'AND password = ?' from SQL query
    if (err) {
      console.error(err);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
    if (results.length > 0) {
      const user = results[0];
      try {
        // Compare the provided password with the hashed password from the database
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (passwordMatch) {
          // Set user data in the session upon successful login
          req.session.user = {
            user_id: user.user_id
          };
          // console.log('User logged in:', req.session.user); // Log session use
          return res.json({ success: true, message: 'Login successful' });
        } else {
          return res.status(401).json({ success: false, message: 'Invalid password' });
        }
      } catch (error) {
        console.error('Error comparing passwords:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
      }
    } else {
      return res.status(401).json({ success: false, message: 'User not found' });
    }
  });
});

// Endpoint for checking login status
app.get('/check-login', (req, res) => {
  // Retrieve session data from the database
  sessionStore.get(req.sessionID, (err, session) => {
    if (err) {
      console.error('Error fetching session from database:', err);
      return res.status(500).json({ isLoggedIn: false, error: 'Internal server error' });
    }

    // Check if session exists and has user data
    if (session && session.user) {
      // User is logged in
      return res.status(200).json({ isLoggedIn: true, user: session.user });
    } else {
      // Session not found or user not logged in
      return res.status(200).json({ isLoggedIn: false });
    }
  });
});

// Endpoint to get userData from users table based on user_id
app.get('/get-userData', (req, res) => {
  // Check if user is logged in and session contains user_id
  if (req.session.user && req.session.user.user_id) {
    const userId = req.session.user.user_id;
    const sql = 'SELECT user_id, Fname, Lname, username, contact, email, image, image_path FROM users WHERE user_id = ?';

    connection.query(sql, [userId], (err, results) => {
      if (err) {
        console.error('Error fetching user data:', err);
        return res.status(500).json({ success: false, message: 'Internal server error' });
      }
      if (results.length > 0) {
        const userData = results[0];
        return res.json({ success: true, userData });
      } else {
        return res.status(404).json({ success: false, message: 'User data not found' });
      }
    });
  } else {
    // If user is not authenticated or session user_id is not set
    return res.status(401).json({ success: false, message: 'User not authenticated' });
  }
});

// Endpoint for updating user profile
app.put('/update-profile', async (req, res) => {
  try {
    // Retrieve updated user profile data from the request body
    const { user_id, Fname, Lname, username, email, contact } = req.body;

    //console.log('Received Updated Profile request:', req.body);

    // Update the user profile in the database
    const sql = 'UPDATE users SET Fname = ?, Lname = ?, username = ?, email = ?, contact = ? WHERE user_id = ?';
    connection.query(sql, [Fname, Lname, username, email, contact, user_id], (err, results) => {
      if (err) {
        console.error('Error updating profile:', err);
        return res.status(500).json({ success: false, message: 'Internal server error' });
      }

      // Check if the user profile was successfully updated
      if (results.affectedRows > 0) {
        return res.json({ success: true, message: 'Profile updated successfully' });
      } else {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
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

// Serve static files from the 'uploads' directory
app.use('/uploads', express.static('uploads'));

// Endpoint for updating user profile
app.put('/updateUserProfile/:id', upload.single('profilePic'), (req, res) => {
  const userId = req.params.id;
  let { username } = req.body;
  let imagePath = req.body.image_path; // Existing image path
  let imageFileName = req.body.image;  // Existing image filename

  // If a new file is uploaded, replace both image path and filename
  if (req.file) {
    imagePath = req.file.path; // Update the image path with the newly uploaded file
    imageFileName = req.file.filename; // Save the uploaded filename
  }

  // Build dynamic SQL query for updating fields
  let sql = 'UPDATE users SET ';
  const params = [];

  // Only update the username if it's provided
  if (username) {
    sql += 'username = ?, ';
    params.push(username);
  }

  // Always update image filename and image path if file was uploaded
  if (imageFileName && imagePath) {
    sql += 'image = ?, image_path = ?, ';
    params.push(imageFileName, imagePath);
  }

  // Remove the last comma and space from the SQL query
  sql = sql.slice(0, -2) + ' WHERE user_id = ?';
  params.push(userId);

  // Execute the query
  connection.query(sql, params, (err, results) => {
    if (err) {
      console.error('Error updating user profile:', err);
      return res.status(500).json({ success: false, message: 'Failed to update user profile' });
    }
    if (results.affectedRows === 0) {
      // No user found with the given ID
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    return res.json({ success: true, message: 'User updated successfully', updatedUserData: { username, imageFileName, imagePath } });
  });
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
    const sql = 'SELECT password FROM users WHERE user_id = ?';
    connection.query(sql, [user_id], async (err, results) => {
      if (err) {
        console.error('Error fetching user password:', err);
        return res.status(500).json({ success: false, message: 'Internal server error' });
      }

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
      const updateSql = 'UPDATE users SET password = ? WHERE user_id = ?';
      connection.query(updateSql, [hashedPassword, user_id], (err, updateResults) => {
        if (err) {
          console.error('Error updating password:', err);
          return res.status(500).json({ success: false, message: 'Internal server error' });
        }

        if (updateResults.affectedRows > 0) {
          return res.json({ success: true, message: 'Password Changed Successfully' });
        } else {
          return res.status(500).json({ success: false, message: 'Failed to update password' });
        }
      });
    });
  } catch (error) {
    console.error('Error changing password:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Signup Endpoint
app.post('/signup', async (req, res) => {
  const { username, firstName, lastName, email, address, phone, password, confirmPassword } = req.body;

  console.log('Received signup request:', req.body);

  // Check if password and confirmPassword are equal
  if (password !== confirmPassword) {
    return res.status(400).json({ error: "Password and confirm password do not match or are empty" });
  }

  try {    
    const hashedPassword = await bcrypt.hash(password, 10);

    const sql = 'INSERT INTO users (username, password, Fname, Lname, address, email, contact) VALUES (?, ?, ?, ?, ?, ?, ?)';
    
    connection.query(sql, [username, hashedPassword, firstName, lastName, address, email, phone], (err, results) => {
      if (err) {
        console.error('Error executing SQL query:', err);
        // Check if the error is a duplicate entry error
        if (err.code === 'ER_DUP_ENTRY') {
          // Customize the message based on the field that caused the duplication
          if (err.message.includes('username_UNIQUE')) {
            return res.status(400).json({ success: false, error: 'Username is already taken' });
          } else if (err.message.includes('email_UNIQUE')) {
            return res.status(400).json({ success: false, error: 'Email is already taken' });
          }
        }
        return res.status(500).json({ success: false, message: 'Internal server error', error: err.message });
      }

      console.log('Signup successful. Affected rows:', results.affectedRows);

      // Return a success response
      return res.json({ success: true, message: 'Signup successful' });
    });  
  } catch (error) {
    console.error('Error hashing password:', error);
    return res.status(500).json({ success: false, message: 'Error hashing password' });
  }
});

const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client('YOUR_GOOGLE_CLIENT_ID'); // Replace with your Google Client ID

//google login endpoint
app.post('/google-login', async (req, res) => {
  const { token } = req.body;

  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: 'YOUR_GOOGLE_CLIENT_ID', // Specify the client ID of the app
    });

    const payload = ticket.getPayload();
    const { sub: googleId, email, given_name: firstName, family_name: lastName } = payload;

    // Check if the user exists in your database
    const checkUserSql = 'SELECT * FROM users WHERE email = ?';
    connection.query(checkUserSql, [email], (err, results) => {
      if (err) {
        console.error('Error querying the database:', err);
        return res.status(500).json({ success: false, message: 'Internal server error' });
      }

      if (results.length > 0) {
        // User already exists, login the user
        return res.json({ success: true, message: 'Login successful', user: results[0] });
      } else {
        // User doesn't exist, create a new user in the database
        const insertUserSql = 'INSERT INTO users (username, Fname, Lname, address, email, contact) VALUES (?, ?, ?, ?, ?, ?)';
        const defaultUsername = email.split('@')[0]; // Generate username from email
        const defaultAddress = 'N/A'; // You can set a default address if none is provided
        const defaultPhone = 'N/A'; // Default phone number if not available

        connection.query(insertUserSql, [defaultUsername, firstName, lastName, defaultAddress, email, defaultPhone], (insertErr, insertResults) => {
          if (insertErr) {
            console.error('Error inserting user into the database:', insertErr);
            return res.status(500).json({ success: false, message: 'Internal server error' });
          }

          console.log('New Google user created successfully.');
          return res.json({ success: true, message: 'Signup and login successful', userId: insertResults.insertId });
        });
      }
    });
  } catch (error) {
    console.error('Error verifying Google token:', error);
    return res.status(401).json({ success: false, message: 'Invalid Google token' });
  }
});

// Endpoint for user logout
app.post('/logout', (req, res) => {
  // Check if user session exists
  if (req.session.user) {
    // Remove user data from the session
    delete req.session.user;
  } 

  // Check if both admin and user sessions are zero
  if (!req.session.admin && !req.session.user && !req.session.employee) {
    // Destroy the session in the database using the session ID
    sessionStore.destroy(req.sessionID, (err) => {
      if (err) {
        console.error('Error destroying session in database:', err);
        return res.status(500).json({ success: false, message: 'Internal server error' });
      }

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
    });
  } else {
    // If either admin or user session exists, respond with success message
    return res.json({ success: true, message: 'Logout successful' });
  }

});

// Admin Login Endpoint
app.post('/admin/login', (req, res) => {
  const { identifier, password } = req.body; // Use 'identifier' to accept either username or email
  const sql = 'SELECT * FROM admin WHERE (username = ? OR email = ?)'; // Update SQL query to retrieve admin by username or email
  connection.query(sql, [identifier, identifier], async (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
    if (results.length > 0) {
      const admin = results[0];
      try {
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
      } catch (error) {
        console.error('Error comparing passwords:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
      }
    } else {
      return res.status(401).json({ success: false, message: 'Admin not found' });
    }
  });
});

// Endpoint for checking login status
app.get('/admin/check-login', (req, res) => {
  // Retrieve session data from the database
  sessionStore.get(req.sessionID, (err, session) => {
    if (err) {
      console.error('Error fetching session from database:', err);
      return res.status(500).json({ isLoggedIn: false, error: 'Internal server error' });
    }

    // Check if session exists and has user data
    if (session && session.admin) {
      // User is logged in
      return res.status(200).json({ isLoggedIn: true, admin: session.admin });
    } else {
      // Session not found or user not logged in
      return res.status(200).json({ isLoggedIn: false });
    }
  });
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
    const sql = 'SELECT password FROM admin WHERE admin_id = ?';
    connection.query(sql, [admin_id], async (err, results) => {
      if (err) {
        console.error('Error fetching user password:', err);
        return res.status(500).json({ success: false, message: 'Internal server error' });
      }

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
      const updateSql = 'UPDATE admin SET password = ? WHERE admin_id = ?';
      connection.query(updateSql, [hashedPassword, admin_id], (err, updateResults) => {
        if (err) {
          console.error('Error updating password:', err);
          return res.status(500).json({ success: false, message: 'Internal server error' });
        }

        if (updateResults.affectedRows > 0) {
          return res.json({ success: true, message: 'Password Changed Successfully' });
        } else {
          return res.status(500).json({ success: false, message: 'Failed to update password' });
        }
      });
    });
  } catch (error) {
    console.error('Error changing password:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Admin Logout Endpoint
app.post('/admin/logout', (req, res) => {
  // Check if admin session exists
  if (req.session.admin) {
    // Remove admin data from the session
    delete req.session.admin;
  } 
  
  // Check if both admin and user sessions are zero
  if (!req.session.admin && !req.session.user && !req.session.employee) {
    // Destroy the session in the database using the session ID
    sessionStore.destroy(req.sessionID, (err) => {
      if (err) {
        console.error('Error destroying session in database:', err);
        return res.status(500).json({ success: false, message: 'Internal server error' });
      }
      
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
    });
  } else {
    // If either admin or user session exists, respond with success message
    return res.json({ success: true, message: 'Logout successful' });
  }
});

// Business application endpoint
app.post('/submitBusinessApplication', async (req, res) => {
  const {
    user_id,
    firstName,
    lastName,
    businessName,
    businessTerritory,
    certificateNo,
    businessScope,
    businessType,
    category,
    location    
  } = req.body;

  console.log('Received business application request:', req.body);

  // Input validation (ensure all fields are provided)
  if (
    !user_id || !firstName || !lastName || !businessName || !businessTerritory ||
    !certificateNo || !businessScope || !businessType || !category || !location
  ) {
    return res.status(400).json({ error: 'Please fill in all required fields' });
  }

  // Function to generate a random 6-digit number for application_id
  const generateApplicationId = () => {
    return Math.floor(100000 + Math.random() * 900000); // Generates a number between 100000 and 999999
  };

  // Function to check if application_id exists in the database
  const isApplicationIdUnique = async (application_id) => {
    const sql = 'SELECT COUNT(*) AS count FROM business_applications WHERE application_id = ?';
    return new Promise((resolve, reject) => {
      connection.query(sql, [application_id], (err, results) => {
        if (err) return reject(err);
        resolve(results[0].count === 0); // Returns true if unique (count is 0)
      });
    });
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

  try {
    // SQL query to insert business application data into the database, including application_id
    const sql = `
      INSERT INTO business_applications (
        application_id, user_id, firstName, lastName, businessName, businessTerritory,
        certNumber, businessScope, businessType, category, location
      ) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    // Execute the SQL query
    connection.query(
      sql, 
      [application_id, user_id, firstName, lastName, businessName, businessTerritory, certificateNo, businessScope, businessType, categoryJSON, location],
      (err, results) => {
        if (err) {
          console.error('Error executing SQL query:', err);

          // Handle potential errors, e.g., unique constraints, SQL errors
          return res.status(500).json({ success: false, message: 'Internal server error', error: err.message });
        }

        console.log('Business application submitted successfully. Affected rows:', results.affectedRows);

        // Return a success response with the generated application_id
        return res.json({ success: true, message: 'Business application submitted successfully', application_id });
      }
    );
  } catch (error) {
    console.error('Error processing business application:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Endpoint to fetch applications for the logged-in user
app.get('/businesses-application', (req, res) => {

  const userId = req.session?.user?.user_id;

  if (!userId) {
    // Send a response if userId is not found
    return res.status(400).json({ success: false, message: 'User not logged in or user ID missing' });
  }

  const sql = `
    SELECT * FROM business_applications WHERE user_id = ?
  `;
  
  // Execute the SQL query with the user ID
  connection.query(sql, [userId], (err, results) => {
    if (err) {
      console.error('Error executing SQL query:', err);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
    
    // Send the list of business applications for the logged-in user
    return res.json({ success: true, business_applications: results });
  });
});


//Para sa pag display ng business

// Endpoint to fetch businesses
app.get('/get-businessData', (req, res) => {
  const userId = req.session?.user?.user_id;

  if (!userId) {
    return res.status(400).json({ success: false, message: 'User not logged in or user ID missing' });
  }

  const sql = `SELECT * FROM businesses WHERE user_id = ?`;
  
  connection.query(sql, [userId], (err, results) => {
    if (err) {
      console.error('Error executing SQL query:', err);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }

    if (results.length > 0) {
      return res.json({ success: true, businessData: results });
    } else {
      return res.status(404).json({ success: false, message: 'Business data not found' });
    }
  });
});

// Endpoint for updating business logo
app.put('/updateBusinessLogo/:id', upload.single('businessLogo'), (req, res) => {
  const businessId = req.params.id;

  // Check if a new logo file was uploaded
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No logo file uploaded' });
  }

  // Prepare the new logo path
  const newLogoPath = req.file.path; // Update with the correct path where the logo is stored

  // Fetch the current business logo to delete the old file
  connection.query('SELECT businessLogo FROM businesses WHERE business_id = ?', [businessId], (err, results) => {
    if (err) {
      console.error('Error fetching business logo:', err);
      return res.status(500).json({ success: false, message: 'Failed to fetch business logo' });
    }

    if (results.length === 0) {
      return res.status(404).json({ success: false, message: 'Business not found' });
    }

    // Get the current logo path
    const currentLogoPath = results[0].businessLogo;

    // Update the businessLogo field in the businesses table
    connection.query('UPDATE businesses SET businessLogo = ? WHERE business_id = ?', [newLogoPath, businessId], (err, updateResults) => {
      if (err) {
        console.error('Error updating business logo:', err);
        return res.status(500).json({ success: false, message: 'Failed to update business logo' });
      }

      if (updateResults.affectedRows === 0) {
        return res.status(404).json({ success: false, message: 'Business not found' });
      }

      // Remove the old logo file from the server
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
    });
  });
});

// Endpoint for updating business name
app.put('/updateBusinessName/:id', (req, res) => {
  const businessId = req.params.id;
  const {businessName} = req.body;

  // Update the businessName field in the businesses table
  connection.query('UPDATE businesses SET businessName = ? WHERE business_id = ?', [businessName, businessId], (err, results) => {
    if (err) {
      console.error('Error updating business name:', err);
      return res.status(500).json({ success: false, message: 'Failed to update business name' });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Business not found' });
    }

    return res.json({
      success: true,
      message: 'Business name updated successfully'
    });
  });
});

// Endpoint for updating business about us
app.put('/updateBusinessAboutUs/:id', (req, res) => {
  const businessId = req.params.id;
  const {aboutUs} = req.body;

  // Update the aboutUs field in the businesses table
  connection.query('UPDATE businesses SET aboutUs = ? WHERE business_id = ?', [aboutUs, businessId], (err, results) => {
    if (err) {
      console.error('Error updating business about us:', err);
      return res.status(500).json({ success: false, message: 'Failed to update business about us' });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Business not found' });
    }

    return res.json({
      success: true,
      message: 'Business about us updated successfully'
    });
  });
});

// Endpoint for updating Contacts
app.put('/updateBusinessContactInfo/:id', (req, res) => {
  const businessId = req.params.id;
  const { contactInfo } = req.body; // Expecting the updated contactInfo array

  if (!contactInfo || !Array.isArray(contactInfo)) {
    return res.status(400).json({ success: false, message: 'Invalid contact information format' });
  }

  // Update the contactInfo JSON in the database
  connection.query(
    'UPDATE businesses SET contactInfo = ? WHERE business_id = ?',
    [JSON.stringify(contactInfo), businessId],
    (err, results) => {
      if (err) {
        console.error('Error updating contact info:', err);
        return res.status(500).json({ success: false, message: 'Failed to update contact information' });
      }

      return res.json({
        success: true,
        message: 'Contact information updated successfully',
        updatedContactInfo: contactInfo, // Return the updated contact info
      });
    }
  );
});

// Endpoint for updating Facilities
app.put('/updateBusinessFacilities/:id', (req, res) => {
  const businessId = req.params.id;
  const { facilities } = req.body; // Expecting an array of facilities

  if (!facilities ||!Array.isArray(facilities)) {
    return res.status(400).json({ success: false, message: 'Invalid facilities format' });
  }

  // Update the facilities JSON in the database
  connection.query(
    'UPDATE businesses SET facilities = ? WHERE business_id = ?',
    [JSON.stringify(facilities), businessId],
    (err, results) => {
      if (err) {
        console.error('Error updating facilities:', err);
        return res.status(500).json({ success: false, message: 'Failed to update facilities' });
      }

      return res.json({
        success: true,
        message: 'Facilities updated successfully',
        updatedFacilities: facilities, // Return the updated facilities
      });
    }
  );
});

// Endpoint for updating business policies
app.put('/updateBusinessPolicies/:id', (req, res) => {
  const businessId = req.params.id;
  const { policies } = req.body; // Expecting an array of policies

  if (!policies || !Array.isArray(policies)) {
    return res.status(400).json({ success: false, message: 'Invalid policies format' });
  }

  // Update the policies JSON in the database
  connection.query(
    'UPDATE businesses SET policies = ? WHERE business_id = ?',
    [JSON.stringify(policies), businessId],
    (err, results) => {
      if (err) {
        console.error('Error updating policies:', err);
        return res.status(500).json({ success: false, message: 'Failed to update policies' });
      }

      return res.json({
        success: true,
        message: 'Policies updated successfully',
        updatedPolicies: policies, // Return the updated policies
      });
    }
  );
});

// Endpoint for updating business card image
app.put('/updateBusinessCardImage/:id', upload.single('businessCardImage'), (req, res) => {
  const businessId = req.params.id;

  // Fetch the current business data to get the existing businessCard JSON
  connection.query(
    'SELECT businessCard FROM businesses WHERE business_id = ?', 
    [businessId], (err, results) => {
    if (err) {
      console.error('Error fetching business data:', err);
      return res.status(500).json({ success: false, message: 'Failed to fetch business data' });
    }
    
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
    connection.query('UPDATE businesses SET businessCard = ? WHERE business_id = ?', [JSON.stringify(businessCard), businessId], (err) => {
      if (err) {
        console.error('Error updating business card image:', err);
        return res.status(500).json({ success: false, message: 'Failed to update business card image' });
      }

      return res.json({
        success: true,
        message: 'Business card image updated successfully',
        updatedBusinessCard: businessCard,
      });
    });
  });
});

// Endpoint for updating business details
app.put('/updateBusinessDetails/:id', (req, res) => {
  const businessId = req.params.id;
  const { description, location, priceRange } = req.body;

  if (!description || !location || !priceRange) {
    return res.status(400).json({ success: false, message: 'All fields are required' });
  }

  // Fetch the current business data to get the existing businessCard JSON
  connection.query(
    'SELECT businessCard FROM businesses WHERE business_id = ?', 
    [businessId], 
    (err, results) => {
      if (err) {
        console.error('Error fetching business details:', err);
        return res.status(500).json({ success: false, message: 'Failed to fetch business details' });
      }

      if (results.length === 0) {
        return res.status(404).json({ success: false, message: 'Business not found' });
      }

      // Parse businessCard if it exists, otherwise use an empty object
      let businessCard = results[0].businessCard;

      // Update the businessCard object with the new details
      businessCard.description = description;
      businessCard.location = location;
      businessCard.priceRange = priceRange;

      // Update the database with the modified businessCard JSON
      connection.query(
        'UPDATE businesses SET businessCard = ? WHERE business_id = ?', 
        [JSON.stringify(businessCard), businessId], 
        (err) => {
          if (err) {
            console.error('Error updating business card details:', err);
            return res.status(500).json({ success: false, message: 'Failed to update business card details' });
          }

          return res.json({
            success: true,
            message: 'Business details updated successfully',
            updatedDetails: { description, location, priceRange },
          });
        }
      );
    }
  );
});

// Endpoint for updating business cover images
app.put('/updateBusinessCover/:id', upload.array('heroImages', 10), (req, res) => {
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

  // Fetch the current heroImages from the businesses table
  connection.query('SELECT heroImages FROM businesses WHERE business_id = ?', [businessId], (err, results) => {
    if (err) {
      console.error('Error fetching business heroImages:', err);
      return res.status(500).json({ success: false, message: 'Failed to fetch business heroImages' });
    }

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

    // Update the database with the modified heroImages as a JSON string
    connection.query(
      'UPDATE businesses SET heroImages = ? WHERE business_id = ?',
      [JSON.stringify(updatedHeroImages), businessId],
      (err) => {
        if (err) {
          console.error('Error updating business cover images:', err);
          return res.status(500).json({ success: false, message: 'Failed to update business cover images' });
        }

        // console.log(updatedHeroImages);

        return res.json({
          success: true,
          message: 'Business cover images updated successfully',
          updatedHeroImages, // Respond with the updated images
        });
      }
    );
  });
});

// Endpoint to update the image title for a specific business cover image
app.put('/updateBusinessCoverImagesTitle/:businessId', (req, res) => {
  const businessId = req.params.businessId;
  const { imageId, title } = req.body;

  // Fetch the current heroImages from the businesses table
  connection.query('SELECT heroImages FROM businesses WHERE business_id = ?', [businessId], (err, results) => {
    if (err) {
      console.error('Error fetching business heroImages:', err);
      return res.status(500).json({ success: false, message: 'Failed to fetch business heroImages' });
    }

    if (results.length === 0) {
      return res.status(404).json({ success: false, message: 'Business not found' });
    }

    let currentHeroImages = results[0].heroImages;

    // Check if heroImages is already an object
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

    // Update the database with the modified heroImages
    connection.query(
      'UPDATE businesses SET heroImages = ? WHERE business_id = ?',
      [JSON.stringify(currentHeroImages), businessId],
      (updateErr) => {
        if (updateErr) {
          console.error('Error updating business cover image title:', updateErr);
          return res.status(500).json({ success: false, message: 'Failed to update image title' });
        }

        return res.json({
          success: true,
          message: 'Image title updated successfully',
          updatedHeroImages: currentHeroImages, // Return updated heroImages
        });
      }
    );
  });
});

// Endpoint to delete business card image
app.delete('/businessCardImage/:id', (req, res) => {
  const businessId = req.params.id;

  // Fetch the current business data to get the existing businessCard JSON
  connection.query(
    'SELECT businessCard FROM businesses WHERE business_id = ?', 
    [businessId], (err, results) => {
      if (err) {
        console.error('Error fetching business data:', err);
        return res.status(500).json({ success: false, message: 'Failed to fetch business data' });
      }

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
      connection.query(
        'UPDATE businesses SET businessCard = ? WHERE business_id = ?', 
        [JSON.stringify(businessCard), businessId], (err) => {
          if (err) {
            console.error('Error updating business card image:', err);
            return res.status(500).json({ success: false, message: 'Failed to update business card image' });
          }

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
        }
      );
    }
  );
});

// Endpoint to delete cover photo
app.delete('/businessCoverPhoto/:id', (req, res) => {
  const businessId = req.params.id;
  const { imagePath } = req.body; // Image path to be deleted should be passed in the request body
  // console.log("imagePath:", imagePath);

  if (!imagePath) {
    return res.status(400).json({ success: false, message: 'No image path provided' });
  }

  // Fetch the current heroImages from the businesses table
  connection.query('SELECT heroImages FROM businesses WHERE business_id = ?', [businessId], (err, results) => {
    if (err) {
      console.error('Error fetching heroImages:', err);
      return res.status(500).json({ success: false, message: 'Failed to fetch business heroImages' });
    }

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

    // console.log('Current hero images:', currentHeroImages);

    // Find and remove the specified image path from heroImages
    const updatedHeroImages = currentHeroImages.filter(img => img.path !== imagePath);

    // console.log('updatedHeroImages:', updatedHeroImages);

    if (updatedHeroImages.length === currentHeroImages.length) {
      return res.status(404).json({ success: false, message: 'Image not found in heroImages' });
    }

    // Update the database with the modified heroImages
    connection.query(
      'UPDATE businesses SET heroImages = ? WHERE business_id = ?',
      [updatedHeroImages.length > 0 ? JSON.stringify(updatedHeroImages) : null, businessId],
      (err) => {
        if (err) {
          console.error('Error updating heroImages:', err);
          return res.status(500).json({ success: false, message: 'Failed to update heroImages' });
        }

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
      }
    );
  });
});

// Endpoint to get all business product
app.get('/getAllBusinessProduct', (req, res) => {
  const sql = `
    SELECT 
        products.*, 
        MAX(COALESCE(deals.discount, 0)) AS discount, 
        MAX(COALESCE(deals.expirationDate, 'No Expiration')) AS expiration
    FROM 
        products
    LEFT JOIN 
        deals 
    ON 
        products.product_id = deals.product_id
    GROUP BY 
        products.product_id
    ORDER BY 
        expiration DESC
    LIMIT 0, 1000
  `;

  connection.query(sql, (err, results) => {
    if (err) {
      console.error('Error executing SQL query:', err);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }

    return res.json({ success: true, businessProducts: results.length > 0 ? results : [] });
  });
});

// Endpoint to get business product
app.get('/getBusinessProduct', (req, res) => {
  // console.log('Session:', req.session);
  const userId = req.session?.user?.user_id;
  const category = req.query.category;

  if (!userId) {
    return res.status(400).json({ success: false, message: 'User not logged in or user ID missing' });
  }

  const sql = `SELECT * FROM products WHERE user_id = ? AND product_category = ?`;
  
  connection.query(sql, [userId, category], (err, results) => {
    if (err) {
      console.error('Error executing SQL query:', err);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }

    if (results.length > 0) {
      return res.json({ success: true, businessProducts: results });
    } else {
      // Return an empty string or an empty array instead of a 404 error
      return res.json({ success: true, businessProducts: [] });
    }
  });
});

// handle upload image product
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

    // Query to get the business_id based on user_id
    const queryGetBusinessId = `SELECT business_id FROM businesses WHERE user_id = ?`;
    
    connection.query(queryGetBusinessId, [user_id], (err, results) => {
      if (err || results.length === 0) {
        console.error('Error fetching business_id:', err || 'No business found for user');
        return res.status(500).json({ success: false, message: 'Failed to fetch business ID' });
      }

      const business_id = results[0].business_id;

      // Now insert the product with the retrieved business_id
      const query = `
        INSERT INTO products (business_id, product_category, user_id, type, name, description, price, pricing_unit, booking_operation, inclusions, termsAndConditions, images)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
        parseInt(booking_operation) || 0,
        JSON.stringify(inclusionsArray), // Convert inclusions to JSON
        JSON.stringify(termsArray), // Convert termsAndConditions to JSON
        JSON.stringify(parsedImages), // Store images as JSON array with id, path, and title
      ];

      connection.query(query, values, (err, results) => {
        if (err) {
          console.error('Error adding product:', err);
          return res.status(500).json({ success: false, message: 'Failed to add product' });
        }

        // Return all relevant data about the newly added product
        const addedProduct = {
          success: true,
          message: 'Product added successfully',
          product_id: results.insertId,
          business_id,
          category,
          user_id,
          type,
          name,
          description,
          price,
          pricing_unit: pricing_unit || '',
          booking_operation: parseInt(booking_operation) || 0,
          inclusions: inclusionsArray, // Return the original array
          termsAndConditions: termsArray, // Return the original array
          images: parsedImages, // Each image will have id, path, and title
        };
        // console.log(addedProduct);
        res.json(addedProduct);
      });
    });
    
  } catch (error) {
    console.error('Error adding product:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Endpoint to fetch images for a specific product
app.get('/get-product-images/:product_id', (req, res) => {
  const { product_id } = req.params;

  // Query to fetch images for the specific product
  const query = 'SELECT images FROM products WHERE product_id = ?';

  connection.query(query, [product_id], (err, results) => {
    if (err) {
      console.error('Error fetching product images:', err);
      return res.status(500).json({ success: false, message: 'Failed to fetch product images' });
    }

    if (results.length === 0) {
      // No product found for the user
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    let current_image = results[0].images;

    res.json({ success: true, images: current_image });
  });
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
    SET type = ?, name = ?, description = ?, price = ?, pricing_unit = ?, booking_operation = ?, inclusions = ?, termsAndConditions = ?, images = ?
    WHERE product_id = ? AND user_id = ?
  `;

  const values = [
    type,
    name,
    description,
    price,
    pricing_unit || null,
    parseInt(booking_operation) || 0,
    JSON.stringify(inclusionsArray), // Store inclusions as a JSON string
    JSON.stringify(termsAndConditionsArray), // Store terms and conditions as a JSON string
    JSON.stringify(parsedImages), // Store merged images as a JSON string
    product_id,
    user_id,
  ];

  connection.query(query, values, (err, results) => {
    if (err) {
      console.error('Error updating product:', err);
      return res.status(500).json({ success: false, message: 'Failed to update product' });
    }

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
      booking_operation: parseInt(booking_operation) || 0,
      inclusions: inclusionsArray,
      termsAndConditions: termsAndConditionsArray,
      images: parsedImages,
    };

    res.json(updatedProduct);
  });
});

// Endpoint to delete a product
app.delete('/delete-product', (req, res) => {
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

  connection.query(query, productIds, (err, results) => {
    if (err) {
      console.error('Error deleting product:', err);
      return res.status(500).json({ success: false, message: 'Failed to delete product' });
    }

    if (results.affectedRows === 0) {
      // No rows affected, meaning none of the products were found
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Successfully deleted the product(s)
    res.json({ success: true, message: 'Product(s) deleted successfully' });
  });
});

// Endpoint to get business deals
app.get('/getDeals', (req, res) => {
  // console.log('Session:', req.session);
  const userId = req.session?.user?.user_id;
  const category = req.query.category;

  if (!userId) {
    return res.status(400).json({ success: false, message: 'User not logged in or user ID missing' });
  }

  const sql = `SELECT * FROM deals WHERE user_id = ? AND category = ?`;
  
  connection.query(sql, [userId, category], (err, results) => {
    if (err) {
      console.error('Error executing SQL query:', err);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }

    if (results.length > 0) {
      return res.json({ success: true, deals: results });
    } else {
      // Return an empty string or an empty array instead of a 404 error
      return res.json({ success: true, deals: [] });
    }
  });
});

// Endpoint to add new business deals
app.post('/add-deals', async (req, res) => {
  const { category, productId, discount, expirationDate } = req.body;
  const userId = req.session?.user?.user_id;

  // console.log('Request Body:', req.body);
  // console.log('User ID:', userId);


  if(!userId || !category || !productId || !discount || !expirationDate) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }

  try {
    const query = `
      INSERT INTO deals ( category, user_id, product_id, discount, expirationDate)
      VALUES (?,?,?,?,?)
    `;
    
    const values = [
      category,
      userId,
      productId,
      discount,
      expirationDate
    ]

    connection.query(query, values, (err, result) => {
      if (err) {
        console.error('Error adding deals:', err);
        return res.status(500).json({ success: false, message: 'Failed to add product' });
      }

      // console.log('resulttttttt: ', result);

      // Return all relevant data about the newly added product
      const addedDeal = {
        success: true,
        message: 'Deals added successfully',
        deal_id: result.insertId,
        user_id: userId,
        category,
        productId,
        discount,
        expirationDate
      };
      // console.log('Added deal: ', addedDeal);
      res.json(addedDeal);
    });
  } catch (error) {
    console.error('Error adding deal:', error);
    res.status(500).json({ success: false, message: 'Internal server error'});
  }
});

// Endpoint to update existing business deals
app.put('/update-deal', async (req, res) => {
  console.log('Received update deal request:', req.body);
  const { dealId, discount, expirationDate } = req.body; // Match the key names in the destructure
  const userId = req.session?.user?.user_id; // Get user ID from the session

  // console.log('Request Body:', req.body);
  // console.log('User ID:', userId);

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

    connection.query(query, values, (err, result) => {
      if (err) {
        console.error('Error updating deal:', err);
        return res.status(500).json({ success: false, message: 'Failed to update deal' });
      }

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

      // console.log('Updated deal:', updatedDeal);
      res.json(updatedDeal); // Respond with the updated deal
    });
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
    const query = `DELETE FROM deals WHERE deal_id = ? AND user_id = ?`;
    const userId = req.session?.user?.user_id;

    // Execute the query to delete the deal
    connection.query(query, [dealId, userId], (err, result) => {
      if (err) {
        console.error('Error deleting deal:', err);
        return res.status(500).json({ success: false, message: 'Failed to delete deal' });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ success: false, message: 'Deal not found or not authorized' });
      }

      res.json({ success: true, message: 'Deal deleted successfully', dealId });
    });
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
    specialRequests,
    numberOfGuests
  } = req.body;

  console.log('Request Body Data:', req.body);
  
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
        originalPrice, discount, discountedPrice
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
      discountedPrice || originalPrice || 0
    ];

    connection.query(query, values, (err, result) => {
      if (err) {
        console.error('Error on booking:', err);
        return res.status(500).json({ success: false, message: 'Failed to book the product' });
      }

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
        status: 0
      });
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
    specialRequests,
    numberOfGuests,
    type,
  } = req.body;

  if (
    !business_id || 
    !user_id || 
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
        originalPrice, discount, discountedPrice
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
      Number(discountedPrice) || originalPrice || 0
    ];

    connection.query(query, values, (err, result) => {
      if (err) {
        console.error('Error booking table:', err);
        return res.status(500).json({ success: false, message: 'Failed to book table' });
      }

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
      });
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
    type,
    specialRequests,
    numberOfGuests,
    productName
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
        originalPrice, discount, discountedPrice
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
      discountedPrice || originalPrice || 0
    ];

    connection.query(query, values, (err, result) => {
      if (err) {
        console.error('Error booking activity:', err);
        return res.status(500).json({ success: false, message: 'Failed to book activity' });
      }

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
      });
    });
  } catch (error) {
    console.error('Error booking activity:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Endpoint to fetch bookings
app.get('/bookings', (req, res) => {
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

  connection.query(sql, [userId], (err, results) => {
    if (err) {
      console.error('Error fetching bookings:', err);
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to fetch bookings'
      });
    }

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
  });
});

//Endpoint for cancel booking
app.put('/cancel-booking/:id', (req, res) => {
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

  connection.query(sql, [bookingId, userId], (err, result) => {
    if (err) {
      console.error('Error cancelling booking:', err);
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to cancel booking' 
      });
    }

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
  });
});

// Get business bookings
app.get('/business-bookings', (req, res) => {
  const businessId = req.session?.user?.business_id;

  if (!businessId) {
    return res.status(401).json({ 
      success: false, 
      message: 'Not authorized' 
    });
  }

  const sql = `
    SELECT * FROM bookings 
    WHERE business_id = ?
    ORDER BY dateIn DESC
  `;

  connection.query(sql, [businessId], (err, results) => {
    if (err) {
      console.error('Error fetching business bookings:', err);
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to fetch bookings' 
      });
    }

    res.json({ 
      success: true, 
      bookings: results 
    });
  });
});

// Update booking status
app.put('/update-booking-status/:id', (req, res) => {
  const bookingId = req.params.id;
  const { status } = req.body;
  const businessId = req.session?.user?.business_id;

  if (!businessId) {
    return res.status(401).json({ 
      success: false, 
      message: 'Not authorized' 
    });
  }

  const sql = `
    UPDATE bookings 
    SET status = ?
    WHERE booking_id = ? AND business_id = ?
  `;

  connection.query(sql, [status, bookingId, businessId], (err, result) => {
    if (err) {
      console.error('Error updating booking status:', err);
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to update booking status' 
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Booking not found or not authorized' 
      });
    }

    res.json({ 
      success: true, 
      message: 'Booking status updated successfully' 
    });
  });
});

//Para sa pag display ng accomodations
// Endpoint to fetch accomodations
app.get('/accomodations', (req, res) => {
  const sql = `
    SELECT * FROM accomodations
  `;
  
  // Execute the SQL query
  connection.query(sql, (err, results) => {
    if (err) {
      console.error('Error executing SQL query:', err);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
    // Send the list of accomodations as the response
    return res.json({ success: true, accomodations: results });
  });
});

//Para sa pag display ng foods
// Endpoint to fetch foods
app.get('/foods', (req, res) => {
  const sql = `
    SELECT * FROM foods
  `;
  
  // Execute the SQL query
  connection.query(sql, (err, results) => {
    if (err) {
      console.error('Error executing SQL query:', err);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
    // Send the list of foods as the response
    return res.json({ success: true, foods: results });
  });
});

//para sa pag display ng mga rooms
//Endpoint to fetch rooms
app.get('/rooms', (req, res) => {
  const sql = `
    SELECT * FROM rooms
  `;
  // Execute the SQL query
  connection.query(sql, (err, results) => {
    if (err) {
      console.error('Error executing SQL query:', err);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
    // Send the list of rooms as the response
    return res.json({ success: true, rooms: results });
  });
});

//para sa pag display ng mga activities
//Endpoint to fetch activities
app.get('/activities', (req, res) => {
  const sql = `
    SELECT * FROM activities
  `;
  // Execute the SQL query
  connection.query(sql, (err, results) => {
    if (err) {
      console.error('Error executing SQL query:', err);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
    // Send the list of activities as the response
    return res.json({ success: true, activities: results });
  });
});

//para sa pag display ng mga amenities
//Endpoint to fetch amenities
app.get('/amenities', (req, res) => {
  const sql = `
    SELECT * FROM amenities
  `;
  // Execute the SQL query
  connection.query(sql, (err, results) => {
    if (err) {
      console.error('Error executing SQL query:', err);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
    // Send the list of amenities as the response
    return res.json({ success: true, amenities: results });
  });
});

//para sa pag display ng mga deals
//Endpoint to fetch deals
app.get('/deals', (req, res) => {
  const sql = `
    SELECT * FROM deals
  `;
  // Execute the SQL query
  connection.query(sql, (err, results) => {
    if (err) {
      console.error('Error executing SQL query:', err);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
    // Send the list of deals as the response
    return res.json({ success: true, deals: results });
  });
});

//para sa pag display ng mga products
//Endpoint to fetch products
app.get('/products', (req, res) => {
  const sql = `
    SELECT * FROM products
  `;
  // Execute the SQL query
  connection.query(sql, (err, results) => {
    if (err) {
      console.error('Error executing SQL query:', err);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
    // Send the list of products as the response
    return res.json({ success: true, products: results });
  });
});

//para sa pag display ng mga location
//Endpoint to fetch locations
app.get('/locations', (req, res) => {
  const sql = `
    SELECT * FROM locations
  `;
  // Execute the SQL query
  connection.query(sql, (err, results) => {
    if (err) {
      console.error('Error executing SQL query:', err);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
    // Send the list of locations as the response
    return res.json({ success: true, locations: results });
  });
});

//SUPER ADMIN
//Endpoint to fetch all business applications
app.get('/superAdmin-businessApplications', (req, res) => {
  const sql = `
    SELECT * FROM business_applications
  `;
  // Execute the SQL query
  connection.query(sql, (err, results) => {
    if (err) {
      console.error('Error executing SQL query:', err);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
    // Send the list of business applications as the response
    return res.json({ success: true, businessApplications: results });
  });
});

// Endpoint to update the business application status
app.put('/updateStatus-businessApplications/:id', async (req, res) => {
  const { id } = req.params;  // Get the application ID from the URL
  const { status } = req.body; // Get the new status from the request body

  if (typeof status !== 'number') {
    return res.status(400).json({ message: 'Invalid status value' });
  }

  try {
    // Start with updating the status
    connection.query('UPDATE business_applications SET status = ? WHERE application_id = ?', [status, id], (err, results) => {
      if (err) {
        console.error('Error updating business application status:', err);
        return res.status(500).json({ success: false, message: 'Failed to update business application status' });
      }

      if (results.affectedRows === 0) {
        return res.status(404).json({ success: false, message: 'Business application not found' });
      }

      // If status is 1 (Approved), copy data to businesses table
      if (status === 1) {
        connection.query('SELECT * FROM business_applications WHERE application_id = ?', [id], (err, applicationResults) => {
          if (err) {
            console.error('Error fetching business application:', err);
            return res.status(500).json({ success: false, message: 'Failed to fetch business application' });
          }

          if (applicationResults.length === 0) {
            return res.status(404).json({ success: false, message: 'Business application not found' });
          }

          // Extract data from business application
          const applicationData = applicationResults[0];
          const { user_id, application_id, businessName, businessType, category, location } = applicationData;

          // Prepare to insert into businesses table
          const insertQuery = `
            INSERT INTO businesses 
            (user_id, application_id, businessName, businessType, category, businessLogo, businessCard, heroImages, aboutUs, facilities, policies, contactInfo, openingHours) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

          // Set default values for the new business entry
          const insertValues = [
            user_id,
            application_id,
            businessName,
            businessType,
            JSON.stringify(category),
            null, // businessLogo, you can update this later
            JSON.stringify({ category, location, cardImage: '', priceRange: '', description: '' }), // businessCard
            null, // heroImages, you can update later
            null, // aboutUs, you can update later
            null, // facilities, you can update later
            null, // policies, you can update later
            null, // contactInfo, you can update later
            null, // openingHours, you can update later
          ];

          // Insert into businesses table
          connection.query(insertQuery, insertValues, (err, insertResults) => {
            if (err) {
              console.error('Error inserting into businesses table:', err);
              return res.status(500).json({ success: false, message: 'Failed to copy application to businesses' });
            }

            return res.json({
              success: true,
              message: 'Business application approved and data copied to businesses table successfully',
            });
          });
        });
      } else {
        return res.json({
          success: true,
          message: 'Business application status updated successfully',
        });
      }
    });
  } catch (error) {
    console.error('Error updating status:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.use((req, res, next) => {
  console.log('Api request: ');
  console.log(`${req.method} ${req.url} - ${JSON.stringify(req.body)}`);
  next();
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));