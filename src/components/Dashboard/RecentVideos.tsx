
import React from 'react';
import { Play, History, Download } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// Sample video data - in a real app, this would come from an API
const sampleVideos = [
  {
    id: '1',
    title: '123 Main Street',
    description: '4 bed, 3 bath luxury home',
  },
  {
    id: '2',
    title: '456 Park Avenue',
    description: 'Modern 2 bed apartment',
  },
  {
    id: '3',
    title: '789 Ocean Drive',
    description: 'Beachfront 5 bed villa',
  },
];

const RecentVideos: React.FC = () => {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {sampleVideos.map((video) => (
        <Card key={video.id}>
          <CardHeader className="pb-2">
            <CardTitle>{video.title}</CardTitle>
            <CardDescription>{video.description}</CardDescription>
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
      ))}
    </div>
  );
};

export default RecentVideos;
