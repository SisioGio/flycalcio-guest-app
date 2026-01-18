import React, { useState } from 'react';
import { useAuth } from '../../utils/AuthContext';
import apiClient from '../../utils/apiClient';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import GoogleLoginButton from './GoogleLogin';

const Login = () => {
  const { loginWithToken } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');


  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await apiClient.post('auth/login', { email, password });
      const data = await response.data;
      const access_token = data['access_token'];
      const refresh_token = data['refresh_token'];
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('refresh_token', refresh_token);
      
      loginWithToken(access_token);
      navigate('/'); 
    } catch (err) {
       // Check if err.response and err.response.data are defined
       console.log(error)
       setError(err?.response?.data?.message || "An unexpected error occurred.");
    }
  };




  return (
    <div className="min-h-screen flex justify-center items-center  px-2">
    <div className="w-full max-w-md bg-slate-900 p-8 rounded-xl shadow-xl space-y-8 bg-opacity-25">
      <h2 className="text-3xl font-bold text-center text-white">Login</h2>
  
      {error && <p className="text-red-500 text-center">{error}</p>}
  
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <input
            type="email"
            value={email}
            defaultValue={'testuser2083@example.com'}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full p-4 bg-slate-800 bg-opacity-60 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:bg-slate-800 focus:bg-opacity-60 transition duration-200"
            required
          />
        </div>
        <div>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            defaultValue={'password'}
            className="w-full p-4 bg-slate-800 bg-opacity-60 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:bg-slate-800 focus:bg-opacity-60 transition duration-200"
            required
          />
        </div>
        <div className='flex flex-col gap-2'>
          <button
            type="submit"
            className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-cyan-700 transition duration-200"
          >
            Login
          </button>

           <GoogleLoginButton setError={setError}/>    
           </div>
      </form>
  
      <div className="text-sm text-white text-center">
        
        <Link to="/request-password-reset" className="text-red-400 hover:text-red-300 block mt-2">
          I forgot my password
        </Link>
      </div>
    </div>
  </div>
  
  );
};

export default Login;
