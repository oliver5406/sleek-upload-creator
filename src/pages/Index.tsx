
import React from 'react';
import { Link } from 'react-router-dom';
import NavBar from '@/components/NavBar';
import FileUploader from '@/components/FileUploader';
import { Button } from '@/components/ui/button';
import FeedbackButton from '@/components/FeedbackButton';
import { useAuth } from '@/context/AuthContext';
import { Home, Video, Camera, MapPin } from 'lucide-react';

const Index = () => {
  const { isAuthenticated } = useAuth();
  
  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      
      <main className="flex-1 container py-8">
        <section className="mb-12">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <h2 className="text-2xl sm:text-3xl font-bold">Create stunning property videos instantly</h2>
              <p className="text-muted-foreground">
                Our powerful tool transforms your property listing images into engaging, 
                professional-quality video tours in seconds. Perfect for real estate agents 
                looking to showcase properties and attract more potential buyers.
              </p>
              <div className="pt-4">
                <Button size="lg" asChild>
                  <Link to={isAuthenticated ? "/dashboard" : "/register"}>
                    {isAuthenticated ? "Go to Dashboard" : "Get Started"}
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
                    <Camera className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-medium">Upload Property Images</h3>
                  <p className="text-muted-foreground">Upload images of the property including interior, exterior, and key features.</p>
                </div>
                <div className="space-y-3">
                  <div className="bg-secondary h-12 w-12 rounded-full flex items-center justify-center mx-auto">
                    <Video className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-medium">Create Video Tour</h3>
                  <p className="text-muted-foreground">Our AI processes your images and creates a professional video tour with transitions.</p>
                </div>
                <div className="space-y-3">
                  <div className="bg-secondary h-12 w-12 rounded-full flex items-center justify-center mx-auto">
                    <MapPin className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-medium">Share with Clients</h3>
                  <p className="text-muted-foreground">Download and share your property video tour with potential buyers.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-12">
          <div className="container">
            <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8">Benefits for Real Estate Professionals</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-card p-6 rounded-lg shadow-sm">
                <h3 className="text-xl font-semibold mb-2">Increased Engagement</h3>
                <p className="text-muted-foreground">Video listings receive 403% more inquiries than properties without video tours.</p>
              </div>
              <div className="bg-card p-6 rounded-lg shadow-sm">
                <h3 className="text-xl font-semibold mb-2">Save Time</h3>
                <p className="text-muted-foreground">Create professional property videos in minutes, not hours or days.</p>
              </div>
              <div className="bg-card p-6 rounded-lg shadow-sm">
                <h3 className="text-xl font-semibold mb-2">Stand Out</h3>
                <p className="text-muted-foreground">Differentiate your listings with high-quality video content.</p>
              </div>
              <div className="bg-card p-6 rounded-lg shadow-sm">
                <h3 className="text-xl font-semibold mb-2">Remote Viewings</h3>
                <p className="text-muted-foreground">Enable potential buyers to tour properties virtually from anywhere.</p>
              </div>
              <div className="bg-card p-6 rounded-lg shadow-sm">
                <h3 className="text-xl font-semibold mb-2">Social Media Ready</h3>
                <p className="text-muted-foreground">Create content perfect for sharing across all social platforms.</p>
              </div>
              <div className="bg-card p-6 rounded-lg shadow-sm">
                <h3 className="text-xl font-semibold mb-2">Higher Conversion</h3>
                <p className="text-muted-foreground">Convert more leads to viewings with engaging video presentations.</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <footer className="py-6 border-t border-muted">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-3">PropertyVideoMaker</h3>
              <p className="text-sm text-muted-foreground">
                The ultimate tool for real estate professionals to create engaging property video tours.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-3">Quick Links</h3>
              <ul className="space-y-2 text-sm">
                <li><Link to="/" className="text-muted-foreground hover:text-foreground">Home</Link></li>
                <li><Link to="/dashboard" className="text-muted-foreground hover:text-foreground">Dashboard</Link></li>
                <li><Link to="/login" className="text-muted-foreground hover:text-foreground">Login</Link></li>
                <li><Link to="/register" className="text-muted-foreground hover:text-foreground">Register</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-3">Contact</h3>
              <p className="text-sm text-muted-foreground">
                For support or inquiries, reach out to our team at support@propertyvideomaker.com
              </p>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-muted text-center text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} PropertyVideoMaker. All rights reserved.</p>
          </div>
        </div>
      </footer>
      
      <FeedbackButton />
    </div>
  );
};

export default Index;
