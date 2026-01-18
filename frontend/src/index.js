import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './utils/AuthContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { NotificationProvider } from './components/Notification';
import { ScenarioProvider } from './utils/ScenarioContext';
import { GoogleOAuthProvider } from '@react-oauth/google';
const queryClient = new QueryClient();
const root = ReactDOM.createRoot(document.getElementById('root'));
const REACT_APP_GOOGLE_ID_CLIENT='83814777016-c72m88emc6ao9hb8v7tt9ooa31d6l7eg.apps.googleusercontent.com'



root.render(

    <GoogleOAuthProvider clientId={REACT_APP_GOOGLE_ID_CLIENT}>
<QueryClientProvider client={queryClient}>
    <BrowserRouter>
     <NotificationProvider>
        <AuthProvider>
            <ScenarioProvider>
               
                    <App />
           
          </ScenarioProvider>
        </AuthProvider>
             </NotificationProvider>
    </BrowserRouter>
</QueryClientProvider>
</GoogleOAuthProvider>

);
