import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Link } from 'react-router-dom';
import apiClient from '../../utils/apiClient';

const AccountConfirmation = () => {
  const [loading, setLoading] = useState(true);
  const [confirmationStatus, setConfirmationStatus] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [email, setEmail] = useState('');
  const [emailSent, setEmailSent] = useState(false);

  const location = useLocation();

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const token = queryParams.get('token');
    
    if (token) {
      confirmAccount(token);
    } else {
      setLoading(false);
    }
  }, [location]);

  const confirmAccount = async (token) => {
    try {
      const response = await apiClient.post('/auth/confirm', { token });
      if (response.status === 200) {
        setConfirmationStatus('success');
        setLoading(false);
      } else {
        setConfirmationStatus('error');
        setErrorMessage('There was an issue confirming your account.');
        setLoading(false);
      }
    } catch (error) {
      setConfirmationStatus('error');
      setErrorMessage(error.response?.data?.message || 'Error confirming the account.');
      setLoading(false);
    }
  };

  const handleResendEmail = async (e) => {
    e.preventDefault();
    if (!email) {
      setErrorMessage('Please enter your email address.');
      return;
    }

    try {
      setLoading(true);
      const response = await apiClient.get(`/auth/confirm?email=${email}`);
      if (response.status === 200) {
        setEmailSent(true);
        setErrorMessage('');
      } else {
        setEmailSent(false);
        setErrorMessage('There was an issue resending the confirmation email.');
      }
      setLoading(false);
    } catch (error) {
      setEmailSent(false);
      setErrorMessage(error.response?.data?.message || 'Error sending the confirmation email.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
      <div className="w-full max-w-md bg-gray-800 p-8 rounded-lg shadow-lg space-y-8">
        {loading ? (
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white">Confirming your account...</h2>
          </div>
        ) : confirmationStatus === 'success' ? (
          <div className="text-center flex flex-col space-y-6">
            <h2 className="text-3xl font-bold text-green-500">Account successfully confirmed!</h2>
            <p className="text-gray-300 mt-4 block">You can now log in to your account.</p>
            <Link to='/login'
              className="mt-4 px-6 py-2 text-white bg-green-500 rounded-lg hover:bg-green-600 transition duration-200"
            >
              Go to Login
            </Link>
          </div>
        ) : (
          <div className="text-center">
            <h2 className="text-3xl font-bold text-red-500">Account confirmation failed</h2>
            <p className="text-gray-300 mt-4">{errorMessage}</p>
            
            {/* Form to resend the confirmation email */}
            {!emailSent && (
              <form onSubmit={handleResendEmail} className="space-y-6 mt-6">
                <div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="w-full p-4 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full px-6 py-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition duration-200"
                >
                  {loading ? 'Sending...' : 'Resend Confirmation Email'}
                </button>
              </form>
            )}

            {emailSent && !loading && (
              <div className="mt-4 text-green-500">
                <p>Confirmation email has been sent! Please check your inbox.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AccountConfirmation;
