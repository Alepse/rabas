import React, { useState } from 'react';
import { Button, Input, Spacer } from '@nextui-org/react';
import Swal from 'sweetalert2';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const ResetPW = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Separate states for each password visibility
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const isFormValid = () => {
    return (
      currentPassword &&
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

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!isFormValid()) {
      Swal.fire({
        icon: 'warning',
        title: 'Invalid Input',
        text: 'Please ensure all fields are filled, the new password is at least 8 characters long, and contains a number and a special character.',
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

    Swal.fire({
      title: 'Confirm Password Change',
      text: 'Are you sure you want to reset your password?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#0BDA51',
      cancelButtonColor: '#D33736',
      confirmButtonText: 'Yes, reset it!',
    }).then((result) => {
      if (result.isConfirmed) {
        // Reset password logic here
        Swal.fire({
          icon: 'success',
          title: 'Password Reset Successfully!',
          text: 'Your password has been updated.',
          confirmButtonColor: '#0BDA51',
        });
      }
    });
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-light">
      <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-xl">
        <div className='w-full flex justify-center'><img className='w-42 h-40' src={Logo2} alt="Logo" /></div>
        <h2 className="text-2xl font-semibold text-center text-gray-800 mb-6">Reset Your Password</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4" aria-label="Reset Password Form">
          <Input
            label="Current Password"
            placeholder="Enter your current password"
            required
            fullWidth
            clearable
            bordered
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="border rounded-lg"
            aria-required="true"
            type={showCurrentPassword ? "text" : "password"}
            endContent={
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="focus:outline-none"
              >
                {showCurrentPassword ? (
                  <FaEyeSlash className="text-2xl text-default-400" />
                ) : (
                  <FaEye className="text-2xl text-default-400" />
                )}
              </button>
            }
          />
          <Spacer y={0.5} />
          
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
