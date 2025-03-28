
import React from 'react';

const Header = () => {
  return (
    <header className="w-full py-6">
      <div className="container">
        <div className="flex flex-col items-center text-center space-y-3">
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Image to Video Converter
          </h1>
          <p className="max-w-lg text-muted-foreground">
            Upload your images and we'll transform them into a beautiful video. Drag and drop files or browse your system to get started.
          </p>
        </div>
      </div>
    </header>
  );
};

export default Header;
