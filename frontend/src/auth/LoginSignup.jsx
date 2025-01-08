import React, { useEffect, useState } from 'react';
import { Tabs, Tab, Button, Input} from "@nextui-org/react";
import { FaEye, FaEyeSlash, FaGoogle, FaEnvelope, FaArrowLeft } from 'react-icons/fa';
import Logo2 from '../assets/rabas.webp';
import Swal from 'sweetalert2'; // Change import to sweetalert2
import { Link } from 'react-router-dom';
// Use the environment variable for the base URL
const BASE_URL = import.meta.env.VITE_BASE_URL; 

const showErrorAlert = (message) => {
  Swal.fire({
    title: 'Error!',
    text: message,
    icon: 'error',
    confirmButtonText: 'Ok',
    confirmButtonColor: '#0BDA51', // Green color for confirmation
    cancelButtonText: 'Close',
    cancelButtonColor: '#D33736',  // Red color for cancellation
  });
};

const LoginSignup = () => {
  const [view, setView] = useState("initial"); // initial, email, signup, forgotPassword
  const [selected, setSelected] = useState("login");

  const [identifier, setIdentifier] = useState(''); // Update state to hold identifier (username or email) for login
  const [loginPassword, setLoginPassword] = useState('');

  const [isLoggedIn, setIsLoggedIn] = useState(false); // Add state to track login status

  const [email, setEmail] = useState(''); // Add state to manage email for forgot password
  const [otp, setOtp] = useState(''); // OTP state
  const [otpSession, setOtpSession] = useState(null); // Track OTP session
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [loadingSpinning, setLoadingSpinning] = useState(false);

  useEffect(() => {
    document.title = 'Login/Signup';

    // Check login status when the component mounts
    const checkLoginStatus = async () => {
      try {
        const response = await fetch(`${BASE_URL}/check-login`, {
          method: 'GET',
          credentials: 'include', // Include credentials
        });
        const data = await response.json();
        setIsLoggedIn(data.isLoggedIn);
      } catch (error) {
        console.error('Error checking login status:', error);
      }
    };

    checkLoginStatus(); // Call the function
  }, []);

  const handleLogin = async (event) => {
    event.preventDefault();
    setLoadingSpinning(true);
    try {
      const response = await fetch(`${BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('sessionId')}` // Include session ID in the headers
        },
        credentials: 'include',
        body: JSON.stringify({
          identifier: identifier, // Send identifier instead of username
          password: loginPassword
        })
      });
      const data = await response.json();
      if (data.success) {
        setLoadingSpinning(false);
        Swal.fire({
          title: 'Login Successful!',
          text: ' ',
          icon: 'success',
          showConfirmButton: false,
          timer: 1500,
        }).then(() => {         
          window.location.href = '/'; // Redirect to home page after the alert is closed
        });
      } else {
        setLoadingSpinning(false);
        Swal.fire({
          title: 'Login Failed!',
          text: 'Invalid username or password',
          icon: 'error',
          showConfirmButton: false,
          timer: 2000,
        });
      }
    } catch (error) {
      setLoadingSpinning(false);
      console.error('Error:', error); 
      alert('An error occurred while logging in. Please try again later.'); // Display a generic error message to the user      
    }
    setLoadingSpinning(false);
  };
  
  const [signupData, setSignupData] = useState({
    username: '',
    firstName: '',
    lastName: '',
    email: '',
    address: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });

  const handleSignupChange = (e) => {
    const { name, value } = e.target;
    setSignupData(prevFields => ({
      ...prevFields,
      [name]: value
    }));
  };
  
  const [showPassword, setShowPassword] = useState(false);

  const handleSignup = async (event) => {
    event.preventDefault();
    setLoadingSpinning(true);
    try {
      const response = await fetch(`${BASE_URL}/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(signupData)
      });
      const data = await response.json();
      if (data.success) {
        setLoadingSpinning(false);
        setOtpSession(data.sessionId); // Save OTP session ID
        setView("otp"); // Redirect to OTP view
        Swal.fire('OTP Sent!', 'Check your email for the OTP.', 'success');
        setIsOtpSent(true); //
      } else {
        setLoadingSpinning(false);
        Swal.fire('Signup Failed!', data.error, 'error');
      }
    } catch (error) {
      console.error(error);
      Swal.fire('Error!', 'An error occurred. Please try again.', 'error');
    }
    setLoadingSpinning(false);
  };

  const handleLoginOtpVerification = async (event) => {
    event.preventDefault();
    setLoadingSpinning(true);
    try {
      const response = await fetch(`${BASE_URL}/login-verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ otp, sessionId: otpSession })
      });
      const data = await response.json();
      if (data.success) {
        setLoadingSpinning(false);
        Swal.fire('Verification Successful!', 'You are now signed up.', 'success').then(() => {
          window.location.href = '/';
        });
      } else {
        setLoadingSpinning(false);
        Swal.fire('Verification Failed!', data.error, 'error');
      }
    } catch (error) {
      console.error(error);
      setLoadingSpinning(false);
      Swal.fire('Error!', 'An error occurred. Please try again.', 'error');
    }
    setLoadingSpinning(false);
  };

  const handleOtpVerification = async (event) => {
    event.preventDefault();
    setLoadingSpinning(true);
    try {
      const response = await fetch(`${BASE_URL}/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ otp, sessionId: otpSession })
      });
      const data = await response.json();
      if (data.success) {
        setLoadingSpinning(false);
        Swal.fire('Verification Successful!', 'You are now signed up.', 'success').then(() => {
          window.location.href = '/';
        });
      } else {
        setLoadingSpinning(false);
        Swal.fire('Verification Failed!', data.error, 'error');
      }
    } catch (error) {
      setLoadingSpinning(false);
      console.error(error);
      Swal.fire('Error!', 'An error occurred. Please try again.', 'error');
    }
    setLoadingSpinning(false);
  };

  const handleGoogleLogin = () => {
    window.location.href = `${BASE_URL}/auth/google`;
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setLoadingSpinning(true);
    try {
      const response = await fetch(`${BASE_URL}/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email }) // Send email in the request body
      });
      const data = await response.json();
      if (data.success) {
        setLoadingSpinning(false);
        Swal.fire({
          title: 'Email Sent!',
          text: 'Check your email for the password reset link.',
          icon: 'success',
          showConfirmButton: true, // Show confirm button
          confirmButtonColor: '#0BDA51', // Set confirm button color
        }).then(() => {
          window.location.href = '/'; 
        });
      } else {
        setLoadingSpinning(false);
        Swal.fire({
          title: 'Error!',
          text: data.message || error.message,
          icon: 'error',
          showConfirmButton: true, // Show confirm button
          confirmButtonColor: '#0BDA51', // Set confirm button color
        });
      }
    } catch (error) {
      // console.error('Error:', error);
      setLoadingSpinning(false);
      Swal.fire({
        title: 'Error!',
        text: 'An error occurred while sending the reset link. Please try again later.',
        icon: 'error',
        showConfirmButton: true, // Show confirm button
        confirmButtonColor: '#0BDA51', // Set confirm button color
      });
    }
    setLoadingSpinning(false);
  };

  const renderInitialView = () => (
    <div className="flex flex-col h-full w-full items-center justify-center gap-2 p-4 ">
      <img className="w-[9rem] mt-7" src={Logo2} />
      <h1 className="text-center font-semibold font-font1 text-xl md:text-2xl   ">
        Sign in to explore more in RabaSorsogon
      </h1>
      <div className='w-full flex flex-col gap-2 mt-9'>
      <div className='border-b-2 py-4 border-gray-300'>
      <Button
        className=" border-2 text-center justify-center flex-wrap items-center hover:bg-color2 hover:text-white transition rounded-full"
        onClick={handleGoogleLogin}
        fullWidth
      >
        <FaGoogle className="" /> Continue with Google
      </Button>
      </div>

       <div className='p-8 flex flex-col gap-2'>
      <Button
        color="primary"
        className="hover:bg-color2 rounded-full"
        onClick={() => setView("login")}
        fullWidth
      >
        Login
      </Button>

      <Button 
        color="primary"
        className="hover:bg-color2  rounded-full"
        onClick={() => setView("signup")}
        fullWidth
      >
        Sign Up
      </Button>
      </div>
      </div>
      
    </div>
  );

  const renderLoginForm = () => (
    <div className="flex  flex-col w-full  items-center justify-center p-4 gap-2  ">
      <button
      className="absolute top-5 left-5 flex items-center text-gray-500 hover:text-black transition-all mb-4"
      onClick={() => setView("initial")}
      >
        <FaArrowLeft className="mr-2" /> Back
      </button>
      <img className="max-w-[10rem]" src={Logo2} />
      <h1 className="text-center font-semibold font-font1 text-2xl  ">Login!</h1>
      <form onSubmit={handleLogin} className="flex flex-col  p-2 w-[20rem] gap-4  ">
        <Input
          label="Email/username"
          type="text"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          required
        />
        <Input
          label="Password"
          type={showPassword ? "text" : "password"}
          value={loginPassword}
          onChange={(e) => setLoginPassword(e.target.value)}
          required
          endContent={
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="focus:outline-none"
            >
              {showPassword ? (
                <FaEyeSlash className="text-2xl text-default-400" />
              ) : (
                <FaEye className="text-2xl text-default-400" />
              )}
            </button>
          }
        />
        <div className="flex  justify-between gap-24 items-center  text-xs">
          <div>
            <Link
              className="cursor-pointer hover:underline text-color2"
              size="sm"
              onClick={() => setView("forgotpassword")}
            >
              Forgot Password?
            </Link>
          </div>
          
        </div>
        <Button type="submit" color="primary" className="hover:bg-color2" fullWidth>
          Login
        </Button>
      </form>
      <div className='flex gap-1 flex-wrap'>
        <p>Need an account?</p>
        <Link
          className="cursor-pointer ml-1 hover:underline text-color2"
          size="sm"
          onClick={() => setView("signup")}
        >
          Sign up
        </Link>
      </div>
    </div>
  );
  
  const renderSignupForm = () => (
    <div className="flex flex-col h-full items-center justify-center gap-6 px-5 py-20">
      <img className="w-[11rem]" src={Logo2} />
      <button
        className="absolute top-5 left-5 flex items-center text-gray-500 hover:text-black transition-all mb-4"
        onClick={() => setView("initial")}
      >
        <FaArrowLeft className="mr-2" /> Back
      </button>
      <h1 className="font-font1 text-center text-2xl mb-2">Signup!</h1>
      <form onSubmit={handleSignup} className="grid grid-cols-1 sm:grid-cols-2 gap-4 min-w-[260px] w-auto">
        <Input
          label="First Name"
          type="text"
          name="firstName"
          value={signupData.firstName}
          onChange={handleSignupChange}
          required
        />
        <Input
          label="Last Name"
          type="text"
          name="lastName"
          value={signupData.lastName}
          onChange={handleSignupChange}
          required
        />
        <Input
          label="Email"
          type="email"
          name="email"
          value={signupData.email}
          onChange={handleSignupChange}
          required
        />
        <Input
          label="Username"
          type="text"
          name="username"
          value={signupData.username}
          onChange={handleSignupChange}
          required
        />
        <Input
          label="Address"
          type="text"
          name="address"
          value={signupData.address}
          onChange={handleSignupChange}
          required
        />
        <Input
          label="Contact Number"
          type="text"
          name="phone"
          value={signupData.phone}
          onChange={handleSignupChange}
          required
        />
        <Input
          label="Password"
          type={showPassword ? "text" : "password"}
          name="password"
          value={signupData.password}
          onChange={handleSignupChange}
          required
          endContent={
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="focus:outline-none"
            >
              {showPassword ? (
                <FaEyeSlash className="text-2xl text-default-400" />
              ) : (
                <FaEye className="text-2xl text-default-400" />
              )}
            </button>
          }
        />
        <Input
          label="Confirm Password"
          type={showPassword ? "text" : "password"}
          name="confirmPassword"
          value={signupData.confirmPassword}
          onChange={handleSignupChange}
          required
          endContent={
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="focus:outline-none"
            >
              {showPassword ? (
                <FaEyeSlash className="text-2xl text-default-400" />
              ) : (
                <FaEye className="text-2xl text-default-400" />
              )}
            </button>
          }
        />
        <div className="col-span-1 sm:col-span-2">
          <Button type="submit" color="primary" className="hover:bg-color2" fullWidth>
            Sign Up
          </Button>
        </div>
      </form>
    </div>

  );

  // Render OTP form
  const renderOtpForm = () => (
    <div className="flex flex-col gap-4 py-20">
      <h1 className="font-font1 text-center text-2xl mb-4">Enter OTP</h1>
      <form onSubmit={handleOtpVerification} className="flex flex-col gap-4">
        <Input
          label="OTP"
          type="text"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          required
        />
        <Button type="submit" color="primary" className="hover:bg-color2" fullWidth>
          Verify OTP
        </Button>
      </form>

      {/* Resend OTP button */}
      {isOtpSent && (
        <div className="mt-4 text-center">
          <Button 
            onClick={handleSignup} 
            color="secondary" 
            className="hover:bg-color2"
            fullWidth
          >
            Resend OTP
          </Button>
        </div>
      )}
    </div>
  );

  // Render OTP form
  const renderLoginOtpForm = () => (
    <div className="flex flex-col h-full items-center justify-center gap-6 px-5 py-20">
      <button
      className="absolute top-5 left-5 flex items-center text-gray-500 hover:text-black transition-all mb-4"
      onClick={() => setView("initial")}
      >
        <FaArrowLeft className="mr-2" /> Back
      </button>
      <img className="w-[11rem]" src={Logo2} />
      <h1 className="font-font1 text-center text-2xl mb-4 px-20 py-5">Enter OTP</h1>
      <form onSubmit={handleLoginOtpVerification} className="flex flex-col gap-4">
        <Input
          label="OTP"
          type="text"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          required
        />
        <Button type="submit" color="primary" className="hover:bg-color2" fullWidth>
          Verify OTP
        </Button>
      </form>

      {/* Resend OTP button */}
      {isOtpSent && (
        <div className="mt-4 text-center">
          <Button 
            onClick={handleLogin} 
            color="secondary" 
            className="hover:bg-color2"
            fullWidth
          >
            Resend OTP
          </Button>
        </div>
      )}
    </div>
  );

  const renderForgotPasswordForm = () => (
    <div className="flex flex-col gap-4">
      <button
        className="flex items-center text-gray-500 hover:text-black transition-all mb-4"
        onClick={() => setView("email")}
      >
        <FaArrowLeft className="mr-2" /> Back
      </button>
      <h2 className="text-center text-2xl font-semibold mb-4">Forgot Password?</h2>
      <h2>No problem! Just enter your email address below, and we’ll send you a link to reset your password.</h2>
      <form onSubmit={handleForgotPassword} className="flex flex-col gap-4">
        <Input
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Button type="submit" color="primary" className="hover:bg-color2" fullWidth>
          Send Password Reset Link
        </Button>
      </form>
    </div>
  );

  return (
    <div className="container mx-auto flex justify-center items-center">
      {loadingSpinning && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-70 z-50 flex justify-center items-center">
          <div className="flex flex-col items-center">
            <div className="spinner"></div>
            <p className="mt-4 text-lg text-white font-semibold animate-pulse">Loading, please wait...</p>
          </div>
        </div>
      )}
      {view === "otp" ? (
        renderOtpForm()
      ) : view === "loginotp" ? (
        renderLoginOtpForm()
      ) : view === "signup" ? (
        renderSignupForm()
      ) : view === "login" ? (
        renderLoginForm()
      ) : view === "forgotpassword" ? (
        renderForgotPasswordForm()
      ) : (
        renderInitialView()
      )}
    </div>
  );
};

export default LoginSignup;