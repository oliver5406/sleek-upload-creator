
import React from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import FileUploader from '@/components/FileUploader';
import { Button } from '@/components/ui/button';
import FeedbackButton from '@/components/FeedbackButton';
import { useAuth } from '@/context/AuthContext';

const Index = () => {
  const { isAuthenticated } = useAuth();
  
  return (
    <div className="min-h-screen flex flex-col">
      <header className="w-full py-6">
        <div className="container">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Image to Video Converter
              </h1>
              <p className="mt-2 max-w-lg text-muted-foreground">
                Upload your images and we'll transform them into a beautiful video. 
                Drag and drop files or browse your system to get started.
              </p>
            </div>
            <div className="flex items-center space-x-3">
              {isAuthenticated ? (
                <Button asChild>
                  <Link to="/dashboard">Dashboard</Link>
                </Button>
              ) : (
                <>
                  <Button variant="outline" asChild>
                    <Link to="/login">Sign in</Link>
                  </Button>
                  <Button asChild>
                    <Link to="/register">Sign up</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>
      
      <main className="flex-1 container py-8">
        <section className="mb-12">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <h2 className="text-2xl sm:text-3xl font-bold">Create stunning videos from your images</h2>
              <p className="text-muted-foreground">
                Our powerful AI will transform your static images into dynamic, 
                professional-quality videos in just seconds. Perfect for social media, 
                presentations, or sharing memories.
              </p>
              <div className="pt-4">
                <Button size="lg" asChild>
                  <Link to={isAuthenticated ? "/dashboard" : "/register"}>
                    {isAuthenticated ? "Go to Dashboard" : "Get Started for Free"}
                  </Link>
                </Button>
              </div>
            </div>
            <div className="bg-muted rounded-xl p-6">
              <FileUploader />
            </div>
          </div>
        </section>
        
        <section className="py-12 bg-muted rounded-xl">
          <div className="container">
            <div className="text-center max-w-3xl mx-auto space-y-6">
              <h2 className="text-2xl sm:text-3xl font-bold">How It Works</h2>
              <div className="grid md:grid-cols-3 gap-8 mt-8">
                <div className="space-y-3">
                  <div className="bg-secondary h-12 w-12 rounded-full flex items-center justify-center mx-auto">
                    <span className="text-xl font-bold">1</span>
                  </div>
                  <h3 className="text-lg font-medium">Upload Images</h3>
                  <p className="text-muted-foreground">Drag and drop your images or select them from your device.</p>
                </div>
                <div className="space-y-3">
                  <div className="bg-secondary h-12 w-12 rounded-full flex items-center justify-center mx-auto">
                    <span className="text-xl font-bold">2</span>
                  </div>
                  <h3 className="text-lg font-medium">Process</h3>
                  <p className="text-muted-foreground">Our AI processes your images and creates a video sequence.</p>
                </div>
                <div className="space-y-3">
                  <div className="bg-secondary h-12 w-12 rounded-full flex items-center justify-center mx-auto">
                    <span className="text-xl font-bold">3</span>
                  </div>
                  <h3 className="text-lg font-medium">Download</h3>
                  <p className="text-muted-foreground">Download your finished video in high quality format.</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <footer className="py-6 border-t border-muted">
        <div className="container text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Image to Video Converter. All rights reserved.</p>
        </div>
      </footer>
      
      <FeedbackButton />
    </div>
  );
};

export default Index;
