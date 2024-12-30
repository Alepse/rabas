import React, { useState, useEffect, useCallback } from 'react';
import { Input, Button } from '@nextui-org/react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import Logo2 from '../../assets/rabas.png';
import Swal from 'sweetalert2'; // For alerts
import { useNavigate } from 'react-router-dom';

const BASE_URL = import.meta.env.VITE_BASE_URL; // Base API URL

const SuperAdminLogin = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [identifier, setIdentifier] = useState(''); // Username/Email
  const [password, setPassword] = useState(''); // Password
  const [showPassword, setShowPassword] = useState(false); // Toggle password visibility
  const navigate = useNavigate();

  // Function to check login status
  const checkLoginStatus = useCallback(async () => {
    try {
      const response = await fetch(`${BASE_URL}/superadmin/check-login`, {
        method: 'GET',
        credentials: 'include', // Include cookies
      });
      if (response.ok) {
        const data = await response.json();
        setIsLoggedIn(data.isLoggedIn); // Set login status

        if (data.isLoggedIn) {
          window.location.href = '/superadmindashboard';
        } 
      } else {
        setIsLoggedIn(false);
      }
    } catch (error) {
      console.error('Error checking login status:', error);
    }
  }, []);

  useEffect(() => {
    checkLoginStatus();
  }, []);  

  const handleLogin = async (event) => {
    event.preventDefault();
    try {
      const response = await fetch(`${BASE_URL}/superadmin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ identifier, password }),
      });

      const data = await response.json();
      if (data.success) {
        Swal.fire({
          title: 'Login Successful!',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false,
        }).then(() => navigate('/superadmindashboard')); // Redirect to dashboard
      } else {
        Swal.fire({
          title: 'Login Failed!',
          text: 'Invalid username or password',
          icon: 'error',
          timer: 2000,
          showConfirmButton: false,
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      Swal.fire({
        title: 'Error!',
        text: 'Something went wrong. Please try again later.',
        icon: 'error',
        showConfirmButton: true,
      });
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 shadow-md rounded-md w-full max-w-md">
        <img src={Logo2} alt="RabaSorsogon Logo" className="w-32 mx-auto mb-6" />
        <h1 className="text-center text-2xl font-semibold mb-4">Super Admin Login</h1>
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <Input
            label="Username"
            type="text"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            required
          />
          <Input
            label="Password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            endContent={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="focus:outline-none"
              >
                {showPassword ? <FaEyeSlash className="text-lg" /> : <FaEye className="text-lg" />}
              </button>
            }
          />
          <Button type="submit" color="primary" fullWidth>
            Login
          </Button>
        </form>
      </div>
    </div>
  );
};

export default SuperAdminLogin;
