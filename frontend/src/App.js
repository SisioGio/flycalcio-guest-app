import React from 'react';

import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";

import Home from "./pages/general/Home";
import NotFound from "./pages/general/NotFound";
import Login from './pages/account/Login';
import Private from './pages/general/Private';
import ProtectedRoute from './utils/ProtectedRoute'
import CRMPage from './pages/financials/CRM';

import DashboardPage from './pages/financials/DashboardPage';
import ActualsManager from './pages/financials/ActualsManager';
import ActualsHistory from './pages/financials/ActualsHistory';

const App = () => {



  return (


     
       <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />

        <Route
          path="/private"
          element={<ProtectedRoute children={<Private />} />}
        />

        {/* Unified CRM Page (Scenarios, Entries, Categories) */}
        <Route
          path="/settings"
          element={<ProtectedRoute children={<CRMPage />} />}
        />

        {/* Dashboard / Financial Charts */}
        <Route
          path="/dashboard"
          element={<ProtectedRoute children={<DashboardPage />} />}
        />

        <Route
          path="/actuals"
          element={<ProtectedRoute children={<ActualsManager />} />}
        />

        <Route
          path="/actuals-history"
          element={<ProtectedRoute children={<ActualsHistory />} />}
        />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Layout>
   
  );
};

export default App;
