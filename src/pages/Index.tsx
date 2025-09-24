import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/login', { replace: true });
    }, 1000); // 1 second delay
    return () => clearTimeout(timer);
  }, [navigate]);
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Redirecting to Login...</h1>
        <p className="text-xl text-gray-600">Please wait.</p>
        <p className="mt-4 text-gray-500">
          If you are not redirected automatically,{' '}
          <a href="/login" className="text-blue-600 underline">click here</a>.
        </p>
      </div>
    </div>
  );
};

export default Index;
