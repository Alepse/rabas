import React, { useEffect, useState } from 'react';
import { Tabs, Tab, Button, Input, Link } from "@nextui-org/react";
import { FaEye, FaEyeSlash, FaGoogle, FaEnvelope, FaArrowLeft } from 'react-icons/fa';
import Logo2 from '../assets/Rabas.png';
import swal from 'sweetalert'; //npm install sweetalert

const LoginSignup = () => {
  const [view, setView] = useState("initial"); // initial, email, signup, forgotPassword
  const [selected, setSelected] = useState("login");

  const [identifier, setIdentifier] = useState(''); // Update state to hold identifier (username or email) for login
  const [loginPassword, setLoginPassword] = useState('');

  const [isLoggedIn, setIsLoggedIn] = useState(false); // Add state to track login status

  useEffect(() => {
    document.title = 'Login/Signup - Spa-ntaneous';

    // Check login status when the component mounts
    const checkLoginStatus = async () => {
      try {
        const response = await fetch('http://localhost:5000/check-login', {
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
    try {
      const response = await fetch('http://localhost:5000/login', {
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
        swal({
          title: 'Login Successful!',
          text: ' ',
          icon: 'success',
          buttons: false,
          timer: 1500,
        }).then(() => {         
          window.location.href = '/login'; // Redirect to home page after the alert is closed
        });
      } else {
        swal({
          title: 'Login Failed!',
          text: 'Invalid username or password',
          icon: 'error',
          buttons: false,
          timer: 2000,
        });
      }
    } catch (error) {
      console.error('Error:', error); 
      alert('An error occurred while logging in. Please try again later.'); // Display a generic error message to the user      
    }
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
    try {
      const response = await fetch('http://localhost:5000/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include', 
        body: JSON.stringify(signupData)
      });
      const data = await response.json();
      console.log(data);
      if(data.success){
        swal({
          title: 'Signup Successful!',
          text: ' ',
          icon: 'success',
          buttons: false,
          timer: 1500,
        }).then(() => {          
          window.location.href = '/'; // Redirect to home page after the alert is closed
        });
      }
      else{
        swal({
          title: 'Signup Failed!',
          text: data.error,
          icon: 'error',
          buttons: false,
          timer: 2000,
        });
      }
    } catch (error) {
      console.error('Error:', error);      
      alert('An error occurred while signing up. Please try again later.'); // Display a generic error message to the user
    }
  }

  const handleGoogleLogin = () => {
    // Handle Google sign-in logic here
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    // Handle forgot password logic here
  };

  const renderInitialView = () => (
    <div className="flex flex-col h-full items-center justify-center gap-4">
      <img className="w-[11rem]" src={Logo2} />
      <h1 className="text-center font-semibold font-font1 text-2xl mb-9">
        Sign in to explore more in RabaSorsogon
      </h1>
      <Button
        className="flex items-center justify-center border-2 py-2 hover:bg-color2 hover:text-white transition rounded-full"
        onClick={handleGoogleLogin}
        fullWidth
      >
        <FaGoogle className="mr-2" /> Continue with Google
      </Button>
      <Button
        className="flex items-center justify-center border-2 py-2 hover:bg-gray-100 transition rounded-full"
        onClick={() => setView("email")}
        fullWidth
      >
        <FaEnvelope className="mr-2" /> Continue with Email
      </Button>
    </div>
  );

  const renderEmailForm = () => (
    <div className="flex flex-col gap-4">
      <button
        className="flex items-center text-gray-500 hover:text-black transition-all mb-4"
        onClick={() => setView("initial")}
      >
        <FaArrowLeft className="mr-2" /> Back
      </button>
      <Tabs
        fullWidth
        size="md"
        aria-label="Login or Signup"
        selectedKey={selected}
        onSelectionChange={setSelected}
        className="flex justify-center items-center "
      >
        <Tab key="login" title="Login">
          <form onSubmit={handleLogin} className="flex flex-col gap-4 ">
          <h1 className='font-font1 text-center text-2xl mb-2'>Welcome Back, Tara Rabas kita !</h1>
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
            <div className="flex justify-between text-small">
              <Link
                className="cursor-pointer hover:text-color2"
                size="sm"
                onClick={() => setView("forgotPassword")}
              >
                Forgot Password?
              </Link>
              <p>
                Need an account?{" "}
                <Link
                  className="cursor-pointer hover:text-color2"
                  size="sm"
                  onPress={() => setSelected("signup")}
                >
                  Sign up
                </Link>
              </p>
            </div>
            <Button type="submit" color="primary" className="hover:bg-color2" fullWidth>
              Login
            </Button>
          </form>
        </Tab>

        <Tab key="signup" title="Sign Up">
          <form onSubmit={handleSignup} className="flex flex-col gap-4">
            <Input
              label="First Name"
              type="text"
              name='firstName'
              value={signupData.firstName}
              onChange={handleSignupChange}
              required
            />
            <Input
              label="Last Name"
              type="text"
              name='lastName'
              value={signupData.lastName}
              onChange={handleSignupChange}
              required
            />
            <Input
              label="Email"
              type="email"
              name='email'
              value={signupData.email}
              onChange={handleSignupChange}
              required
            />
            <Input
              label="Username"
              type="text"
              name='username'
              value={signupData.username}
              onChange={handleSignupChange}
              required
            />
            <Input
              label="Address"
              type="text"
              name='address'
              value={signupData.address}
              onChange={handleSignupChange}
              required
            />
            <Input
              label="Contact Number"
              type="text"
              name='phone'
              value={signupData.phone}
              onChange={handleSignupChange}
              required
            />
            <Input
              label="Password"
              type={showPassword ? "text" : "password"}
              name='password'
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
              name='confirmPassword'
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
      
            <Button type="submit" color="primary" className="hover:bg-color2" fullWidth>
              Sign Up
            </Button>
          </form>
        </Tab>
      </Tabs>
    </div>
  );

  const renderForgotPasswordForm = () => (
    <div className="flex flex-col  gap-4">
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
    <div className="flex flex-col w-full p-4 h-full">
      {view === "initial"
        ? renderInitialView()
        : view === "forgotPassword"
        ? renderForgotPasswordForm()
        : renderEmailForm()}
    </div>
  );
};

export default LoginSignup;
