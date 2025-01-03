import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Button, Input, Spacer } from '@nextui-org/react';
import Swal from 'sweetalert2';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import axios from 'axios';
import Logo2 from '../../assets/rabas.webp';
// Use the environment variable for the base URL
const BASE_URL = import.meta.env.VITE_BASE_URL; 

const ResetPW = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [token, setToken] = useState('');

  const location = useLocation();

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const token = query.get('token');
    setToken(token);
  }, [location]);

  const isFormValid = () => {
    return (
      newPassword &&
      confirmPassword &&
      newPassword.length >= 8 &&
      checkPasswordStrength(newPassword)
    );
  };

  const checkPasswordStrength = (password) => {
    const regex = /^(?=.*[0-9])(?=.*[!@#$%^&*])/;
    return regex.test(password);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isFormValid()) {
      Swal.fire({
        icon: 'warning',
        title: 'Invalid Input',
        text: 'Please ensure the new password is at least 8 characters long and contains a number and a special character.',
        confirmButtonColor: '#0BDA51',
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      Swal.fire({
        icon: 'error',
        title: "Passwords don't match",
        text: 'Please make sure your new passwords match.',
        confirmButtonColor: '#0BDA51',
      });
      return;
    }

    try {
      const response = await axios.post(`${BASE_URL}/reset-password/${token}`, {
        newPassword,
      });

      if (response.data.success) {
        Swal.fire({
          icon: 'success',
          title: 'Password Reset Successfully!',
          text: 'Your password has been updated.',
          confirmButtonColor: '#0BDA51',
        }).then(() => {          
          window.location.href = '/'; // Redirect to home page after the alert is closed
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: response.data.message,
          confirmButtonColor: '#0BDA51',
        });
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'An error occurred while resetting your password.',
        confirmButtonColor: '#0BDA51',
      });
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-light">
      <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-xl">
        <div className='w-full flex justify-center'><img className='w-42 h-40' src={Logo2} alt="Logo" /></div>
        <h2 className="text-2xl font-semibold text-center text-gray-800 mb-6">Reset Your Password</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4" aria-label="Reset Password Form">
          <Input
            label="New Password"
            placeholder="Enter your new password"
            required
            fullWidth
            clearable
            bordered
            onChange={(e) => setNewPassword(e.target.value)}
            className="border rounded-lg"
            aria-required="true"
            type={showNewPassword ? "text" : "password"}
            endContent={
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="focus:outline-none"
              >
                {showNewPassword ? (
                  <FaEyeSlash className="text-2xl text-default-400" />
                ) : (
                  <FaEye className="text-2xl text-default-400" />
                )}
              </button>
            }
          />
          <Spacer y={0.5} />
          
          <Input
            label="Confirm New Password"
            placeholder="Confirm your new password"
            required
            fullWidth
            clearable
            bordered
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="border rounded-lg"
            aria-required="true"
            type={showConfirmPassword ? "text" : "password"}
            endContent={
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="focus:outline-none"
              >
                {showConfirmPassword ? (
                  <FaEyeSlash className="text-2xl text-default-400" />
                ) : (
                  <FaEye className="text-2xl text-default-400" />
                )}
              </button>
            }
          />
          <Spacer y={1} />

          <Button
            type="submit"
            color="primary"
            className="w-full mt-4 hover:bg-color2"
            auto
            rounded
          >
            Reset Password
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ResetPW;
