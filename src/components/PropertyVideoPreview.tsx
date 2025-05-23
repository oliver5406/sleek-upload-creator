
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Share2 } from 'lucide-react';

interface PropertyVideoPreviewProps {
  title: string;
  description: string;
  imageSrc?: string;
  onDownload?: () => void;
  onShare?: () => void;
}

const PropertyVideoPreview: React.FC<PropertyVideoPreviewProps> = ({
  title,
  description,
  imageSrc,
  onDownload,
  onShare
}) => {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardFooter className="flex justify-between">
        <Button variant="outline" size="sm" onClick={onShare}>
          <Share2 className="mr-2 h-4 w-4" />
          Share
        </Button>
        <Button size="sm" onClick={onDownload}>
          <Download className="mr-2 h-4 w-4" />
          Download
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PropertyVideoPreview;
