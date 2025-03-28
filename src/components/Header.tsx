
import React from 'react';

const Header = () => {
  return (
    <header className="w-full py-6">
      <div className="container">
        <div className="flex flex-col items-center text-center space-y-3">
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-500 to-green-500 bg-clip-text text-transparent">
            Property Video Maker
          </h1>
          <p className="max-w-lg text-muted-foreground">
            Transform your property listings into engaging video tours. Upload images from your listings and create professional videos to showcase properties to potential buyers.
          </p>
        </div>
      </div>
    </header>
  );
};

export default Header;
