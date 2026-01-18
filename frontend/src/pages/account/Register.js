import React, { useState,useEffect } from 'react';
import axios from 'axios';
import { Navigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { useLocation } from 'react-router-dom';

import { useNotification } from "../../components/Notification";
import {jwtDecode} from 'jwt-decode';


const useDecodedToken = (token) => {
  const [decoded, setDecoded] = useState(null);
  
  useEffect(() => {
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        setDecoded(decodedToken);
      } catch (error) {
        setDecoded(null)
        console.error("Error decoding token:", error);
      }
    }
  }, [token]);

  return decoded;
};
const Register = () => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [last_name,setLastName] = useState('');
const { showNotification } = useNotification();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loginSuccess, setLoginSuccess] = useState(false);

  const location = useLocation();

    
  const queryParams = new URLSearchParams(location.search);
  const token = queryParams.get('token');
  const decodedToken = useDecodedToken(token);
  
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('https://3347krtx3j.execute-api.eu-central-1.amazonaws.com/prod/auth/register', 
        { email, password,name,last_name },
      {
        headers:{'Authorization': `${token}`},
      });
  
      setLoginSuccess(true);
      showNotification({ text: "User created", error:false });
    } catch (err) {
showNotification({ text: "Failed to register new user", error:true });
      setError(err?.response?.data?.message || 'Registration failed. Please try again.')
    }
  };

  if (loginSuccess) {
    return <Navigate to="/login" />;
  }

  if (!token){
    return <span>Loading...</span>
  }
  return (
    <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-indigo-800 via-purple-800 to-fuchsia-700 px-2">
      <div className="w-full max-w-md bg-gray-800 p-8 rounded-lg shadow-lg space-y-6  bg-opacity-25">
        <h2 className="text-3xl font-bold text-center text-white">Register</h2>
        {error && <p className="text-red-500 text-center">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your Name"
              className="w-full p-4 bg-slate-800 bg-opacity-60 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:bg-slate-800 focus:bg-opacity-60 transition duration-200"
              required
            />
           
          </div>

          <div>
           <input
              type="text"
              value={last_name}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Your last name"
              className="w-full p-4 bg-slate-800 bg-opacity-60 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:bg-slate-800 focus:bg-opacity-60 transition duration-200"
              required
            />

            </div>
            <div>
            <input
              type="email"
              value={email}
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
              className="w-full p-4 bg-slate-800 bg-opacity-60 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:bg-slate-800 focus:bg-opacity-60 transition duration-200"
              required
            />
          </div>
          <div>
            <button
              type="submit"
              className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200"
            >
              Register
            </button>
          </div>
        </form>
        <div className="flex justify-center text-sm text-white">
          <span>Already have an account? </span>
          <Link to='/login' className="ml-1 text-blue-400 hover:text-blue-500">Login</Link>
          
        </div>
      </div>
    </div>
  );
};

export default Register;
