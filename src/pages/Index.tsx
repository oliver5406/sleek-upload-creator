
import React from 'react';
import Header from '@/components/Header';
import FileUploader from '@/components/FileUploader';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container py-8">
        <FileUploader />
      </main>
      <footer className="py-6 border-t border-muted">
        <div className="container text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Image to Video Converter. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
