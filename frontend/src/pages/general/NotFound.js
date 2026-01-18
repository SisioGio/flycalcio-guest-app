
import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-900 text-white">
      <h1 className="text-4xl font-bold text-red-500 mb-4">404 - Page Not Found</h1>
      <Link to="/" className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition">
        Back to Home
      </Link>
    </div>
  );
};

export default NotFound;
