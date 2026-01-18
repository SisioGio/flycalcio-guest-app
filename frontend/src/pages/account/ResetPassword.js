import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import apiClient from '../../utils/apiClient';

const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const [token, setToken] = useState('');

  // Extract the reset token from the URL query parameters
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const tokenFromUrl = queryParams.get('token');
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
    } else {
      setErrorMessage('Invalid or missing token');
    }
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match');
      return;
    }

    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      // Send the reset password request to your backend API
      const response = await apiClient.post('/auth/reset-password', {
        token,
        newPassword,
      });

      if (response.status === 200) {
        setSuccessMessage('Password reset successful. You can now log in with your new password.');
        // Optionally, redirect the user to login page after success
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      }
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-indigo-800 via-purple-800 to-fuchsia-700 px-2">
      <div className="w-full max-w-md bg-gray-800 p-8 rounded-lg shadow-lg space-y-8  bg-opacity-25">
        <h2 className="text-3xl font-bold text-center text-white">Reset Password</h2>
        {errorMessage && <p className="text-red-500 text-center">{errorMessage}</p>}
        {successMessage && <p className="text-green-500 text-center">{successMessage}</p>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="newPassword" className="text-white">New Password</label>
            <input
              type="password"
              id="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
              className="w-full p-4 bg-slate-800 bg-opacity-60 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:bg-slate-800 focus:bg-opacity-60 transition duration-200"
              required
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="text-white">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your new password"
              className="w-full p-4 bg-slate-800 bg-opacity-60 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:bg-slate-800 focus:bg-opacity-60 transition duration-200"
              required
            />
          </div>

          <div>
            <button
              type="submit"
              className={`w-full py-3 text-white rounded-lg ${loading ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-600'}`}
              disabled={loading}
            >
              {loading ? 'Resetting Password...' : 'Reset Password'}
            </button>
          </div>
        </form>

        <div className="text-center">
          <p className="text-gray-400">Remembered your password? <a href="/login" className="text-blue-500">Log in here</a></p>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
