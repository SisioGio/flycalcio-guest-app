
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext'; // Assuming you are using a context to manage auth state

const ProtectedRoute = ({ children }) => {

  const { auth } = useAuth();


  if (auth === null) {
    return <div>Loading...</div>; // or spinner
  }

  if (!auth) {
      return <Navigate to="/login" replace />;
    }



  // Once loading is complete, check auth and render the appropriate component
    if (auth) {
      return children;
    }

};

export default ProtectedRoute;
