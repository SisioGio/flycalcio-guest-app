import React, { useState } from 'react';

import { Link } from 'react-router-dom';
import apiClient from '../../utils/apiClient';

const RequestPasswordReset = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
 

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      // Replace this with your actual API endpoint for password reset request
      const response = await apiClient.post('/auth/request-password-reset', { email });
      
      if (response.status === 200) {
        setSuccessMessage('A password reset link has been sent to your email!');
      }
    } catch (error) {
      setErrorMessage('Failed to send password reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-indigo-800 via-purple-800 to-fuchsia-700 px-2">
      <div className="w-full max-w-md bg-gray-800 p-8 rounded-lg shadow-lg space-y-8  bg-opacity-25">
        <h2 className="text-3xl font-bold text-center text-white">Reset Your Password</h2>

        {errorMessage && <p className="text-red-500 text-center">{errorMessage}</p>}
        {successMessage && <p className="text-green-500 text-center">{successMessage}</p>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full p-4 bg-slate-800 bg-opacity-60 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:bg-slate-800 focus:bg-opacity-60 transition duration-200"
              required
            />
          </div>
          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition duration-200"
            >
              {loading ? 'Sending...' : 'Request Password Reset'}
            </button>
          </div>
        </form>

        <div className="text-center">
          <Link
            className="text-blue-400 hover:text-blue-500"
            to='/login'
          >
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RequestPasswordReset;
