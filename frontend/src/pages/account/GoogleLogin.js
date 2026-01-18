import React from 'react';
import { useAuth } from '../../utils/AuthContext';
import apiClient from '../../utils/apiClient';
import { useNavigate } from 'react-router-dom';

import { GoogleLogin } from '@react-oauth/google';
const GoogleLoginButton = ({setError}) => {
  const {loginWithToken} = useAuth()
   const navigate = useNavigate();

   
  const responseMessage = async (googleResponse) => {
  try {
    console.log(googleResponse);
    const token = googleResponse.credential;
    // Await the API call
    const res = await apiClient.post("/auth/google", { google_token: token });
    const data = res.data
    const access_token = data['access_token'];
    const refresh_token = data['refresh_token'];
    localStorage.setItem('access_token', access_token);
    localStorage.setItem('refresh_token', refresh_token);
    loginWithToken(access_token);
    navigate("/");

  } catch (err) {
    console.log(err);
    setError(err?.response?.data?.message || "An unexpected error occurred.");
  }
};



    const errorMessage = (error) => {
       console.log(error)
       setError( "An unexpected error occurred.");
      
    };



  return (
  

           <div className="w-full">
    <GoogleLogin
      onSuccess={responseMessage}
      onError={errorMessage}
      width="100%"
      size="large"
      text="signin_with"
      shape="rectangular"
    />
          </div>
          
  
  );
};

export default GoogleLoginButton;
