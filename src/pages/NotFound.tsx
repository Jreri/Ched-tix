import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="text-center">
        <h1 className="text-5xl md:text-6xl font-bold mb-4 text-red-500 animate-pulse dark:text-red-400">
          404
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-6">
          Oops! Page not found
        </p>
        <Link
          to="/"
          className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors dark:bg-blue-400 dark:hover:bg-blue-500"
        >
          Return to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
