import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';

const Login = () => {
  const { loginWithRedirect, isLoading } = useAuth();

  const handleLogin = () => {
    loginWithRedirect();
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Image to Video Converter
          </h1>
          <h2 className="mt-6 text-2xl font-semibold">Sign in to your account</h2>
        </div>
        
        <div className="mt-8 space-y-6">
          <Button 
            onClick={handleLogin}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600" 
            disabled={isLoading}
          >
            {isLoading ? 'Signing in...' : 'Sign in'}
          </Button>
          
          <div className="text-center mt-4">
            <p className="text-sm text-muted-foreground">
              Don't have an account? You can sign up during the login process.
            </p>
            <Link to="/" className="text-sm text-primary hover:underline block mt-2">
              Back to home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;