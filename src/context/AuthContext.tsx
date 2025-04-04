import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { Auth0Provider, useAuth0 } from '@auth0/auth0-react';
import { setAuthToken, clearAuthToken } from '@/components/services/api';

interface User {
  id: string;
  email: string;
  name: string;
  picture?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  token: string | null;
  loginWithRedirect: (options?: any) => void;  // Accepts optional params
  logout: () => void;
  getToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const AuthProviderContent: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { 
    user: auth0User, 
    isAuthenticated, 
    isLoading, 
    loginWithRedirect, 
    logout: auth0Logout,
    getAccessTokenSilently
  } = useAuth0();
  
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const navigate = useNavigate();

  // Get and set the access token when authentication state changes
  useEffect(() => {
    const getToken = async () => {
      if (isAuthenticated) {
        try {
          const accessToken = await getAccessTokenSilently();
          setToken(accessToken);
          setAuthToken(accessToken);
        } catch (error) {
          console.error('Error getting access token:', error);
        }
      } else {
        setToken(null);
        clearAuthToken();
      }
    };

    getToken();
  }, [isAuthenticated, getAccessTokenSilently]);

  // Update local user state when Auth0 user changes
  useEffect(() => {
    if (isAuthenticated && auth0User) {
      const userProfile: User = {
        id: auth0User.sub || '',
        email: auth0User.email || '',
        name: auth0User.name || '',
        picture: auth0User.picture
      };
      setUser(userProfile);
      
      // Show welcome toast on successful login
      toast({
        title: "Login successful",
        description: `Welcome, ${userProfile.name}!`,
      });
    } else if (!isLoading) {
      setUser(null);
    }
  }, [auth0User, isAuthenticated, isLoading]);

  const logout = () => {
    clearAuthToken();
    auth0Logout({ 
      logoutParams: {
        returnTo: window.location.origin 
      }
    });
    
    toast({
      title: "Logged out",
      description: "You have been logged out successfully",
    });
    
    navigate('/');
  };

  // Function to get a fresh token when needed
  const getToken = async (): Promise<string | null> => {
    if (!isAuthenticated) return null;
    
    try {
      const accessToken = await getAccessTokenSilently();
      // Update our stored token
      setToken(accessToken);
      setAuthToken(accessToken);
      return accessToken;
    } catch (error) {
      console.error('Error refreshing token:', error);
      return null;
    }
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        isAuthenticated, 
        isLoading,
        token,
        loginWithRedirect, 
        logout,
        getToken
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Root Auth0 provider that wraps the application
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const domain = "dev-mg7w364v4f1mhd6j.us.auth0.com";
  const clientId = "PEUWQKQys9i8USpAAGvOzaWPMnSAqWQn";
  const redirectUri = "http://localhost:8080";
  const audience = "https://dev-mg7w364v4f1mhd6j.us.auth0.com/api/v2/"; // Add this - represents your API identifier in Auth0

  if (!domain || !clientId) {
    console.error('Auth0 configuration is missing. Please set REACT_APP_AUTH0_DOMAIN and REACT_APP_AUTH0_CLIENT_ID environment variables.');
    return <>{children}</>;
  }

  return (
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={{
        redirect_uri: redirectUri,
        audience: audience, // Important: this tells Auth0 to issue tokens for your API
        scope: 'openid profile email'
      }}
    >
      <AuthProviderContent>{children}</AuthProviderContent>
    </Auth0Provider>
  );
};