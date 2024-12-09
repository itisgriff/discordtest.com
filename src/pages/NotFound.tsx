import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function NotFound() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check if the current path should be handled by our app
    if (location.pathname.startsWith('/vanity') || 
        location.pathname.startsWith('/lookup')) {
      // This is a valid route, reload the app properly
      window.location.href = location.pathname;
    }
  }, [location]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-indigo-400 to-purple-400 text-transparent bg-clip-text">
        404 - Page Not Found
      </h1>
      <p className="text-muted-foreground mb-8">
        Oops! The page you're looking for doesn't exist.
      </p>
      <button
        onClick={() => navigate('/')}
        className="px-4 py-2 bg-accent hover:bg-accent/90 text-accent-foreground rounded-md"
      >
        Return Home
      </button>
    </div>
  );
} 