
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import NavBar from '@/components/NavBar';
// import FileUploader from '@/components/FileUploader';
import FileUploader from '@/components/FileUploader/index';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Download, Play, History, Settings, Plus } from 'lucide-react';

const Dashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

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
        
        <Tabs defaultValue="create">
          <TabsList className="mb-6">
            <TabsTrigger value="create">Create New Video</TabsTrigger>
            <TabsTrigger value="recent">Recent Videos</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
          </TabsList>
          
          <TabsContent value="create" className="space-y-6">
            <FileUploader />
          </TabsContent>
          
          <TabsContent value="recent">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {/* Sample recent videos - these would be dynamically populated */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>123 Main Street</CardTitle>
                  <CardDescription>4 bed, 3 bath luxury home</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="aspect-video bg-muted rounded-md flex items-center justify-center">
                    <Play className="h-12 w-12 text-muted-foreground opacity-50" />
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" size="sm">
                    <History className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                  <Button size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                </CardFooter>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>456 Park Avenue</CardTitle>
                  <CardDescription>Modern 2 bed apartment</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="aspect-video bg-muted rounded-md flex items-center justify-center">
                    <Play className="h-12 w-12 text-muted-foreground opacity-50" />
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" size="sm">
                    <History className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                  <Button size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                </CardFooter>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>789 Ocean Drive</CardTitle>
                  <CardDescription>Beachfront 5 bed villa</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="aspect-video bg-muted rounded-md flex items-center justify-center">
                    <Play className="h-12 w-12 text-muted-foreground opacity-50" />
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" size="sm">
                    <History className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                  <Button size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="templates">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Luxury Home</CardTitle>
                  <CardDescription>Elegant transitions with text overlays</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="aspect-video bg-muted rounded-md flex items-center justify-center">
                    <div className="text-center">
                      <Settings className="h-12 w-12 text-muted-foreground opacity-50 mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">Premium Template</p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full">
                    <Plus className="mr-2 h-4 w-4" />
                    Use Template
                  </Button>
                </CardFooter>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Urban Apartment</CardTitle>
                  <CardDescription>Fast-paced with dynamic transitions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="aspect-video bg-muted rounded-md flex items-center justify-center">
                    <div className="text-center">
                      <Settings className="h-12 w-12 text-muted-foreground opacity-50 mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">Standard Template</p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full">
                    <Plus className="mr-2 h-4 w-4" />
                    Use Template
                  </Button>
                </CardFooter>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Vacation Rental</CardTitle>
                  <CardDescription>Smooth transitions with location highlights</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="aspect-video bg-muted rounded-md flex items-center justify-center">
                    <div className="text-center">
                      <Settings className="h-12 w-12 text-muted-foreground opacity-50 mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">Premium Template</p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full">
                    <Plus className="mr-2 h-4 w-4" />
                    Use Template
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
      
      <footer className="py-6 border-t border-muted">
        <div className="container text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} PropertyVideoMaker. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;
