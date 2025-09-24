import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const PortalSelectionPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate("/login", { replace: true });
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <p className="text-gray-700 dark:text-gray-200">Redirecting to login...</p>
    </div>
  );
};

export default PortalSelectionPage;
