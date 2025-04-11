
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import NavBar from '@/components/NavBar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CreateContent from '@/components/Dashboard/CreateContent';
import RecentVideos from '@/components/Dashboard/RecentVideos';

const DASHBOARD_TAB_KEY = 'dashboard_active_tab';

const Dashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem(DASHBOARD_TAB_KEY) || 'create';
  });

  useEffect(() => {
    localStorage.setItem(DASHBOARD_TAB_KEY, activeTab);
  }, [activeTab]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      
      <main className="flex-1 container py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-2">Welcome, {user.name}!</h2>
          <p className="text-muted-foreground">
            Create and manage your property videos. Upload images from your listings to generate engaging video tours.
          </p>
        </div>
        
        <Tabs 
          defaultValue={activeTab}
          onValueChange={(value) => setActiveTab(value)}
        >
          <TabsList className="mb-6">
            <TabsTrigger value="create">Create New Video</TabsTrigger>
            <TabsTrigger value="recent">Recent Videos</TabsTrigger>
          </TabsList>
          
          <TabsContent value="create">
            <CreateContent />
          </TabsContent>
          
          <TabsContent value="recent">
            <RecentVideos />
          </TabsContent>
        </Tabs>
      </main>
      
      <footer className="py-6 border-t border-muted">
        <div className="container text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Propify. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;
