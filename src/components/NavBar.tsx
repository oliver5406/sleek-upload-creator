import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { LogOut, User, Home, Settings } from 'lucide-react';

const NavBar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="w-full py-4 border-b border-muted">
      <div className="container">
        <div className="flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-green-500 bg-clip-text text-transparent flex items-center gap-2">
            <Home size={24} className="text-blue-500" />
            Propify
          </Link>
          
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="relative" ref={menuRef}>
                <button 
                  onClick={toggleMenu}
                  className="flex items-center space-x-2 rounded-full hover:bg-gray-100 p-2 transition-colors focus:outline-none"
                >
                  {user?.picture ? (
                    <img 
                      src={user.picture} 
                      alt="Profile" 
                      className="w-8 h-8 rounded-full"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
                      {user?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                    </div>
                  )}
                  <span className="text-sm font-medium hidden sm:inline">{user?.name}</span>
                </button>
                
                {isMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                    <div className="py-1">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
                        <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                      </div>
                      {/* <Link 
                        to="/profile" 
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <Settings size={16} className="mr-2" />
                        Update Profile
                      </Link> */}
                      <button
                        onClick={() => {
                          setIsMenuOpen(false);
                          logout();
                        }}
                        className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <LogOut size={16} className="mr-2" />
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Button variant="outline" size="sm" asChild>
                  <Link to="/login">Sign in</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link to="/register">Sign up</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;