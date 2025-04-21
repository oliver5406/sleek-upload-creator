
import React, { useState } from 'react';
import { Download, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { getDownloadUrl } from '@/components/services/api';

interface UploadProgressProps {
  isUploading: boolean;
  progress: number;
  batchId: string | null;
  onDownload: () => void;
  onUpload: () => void;
  hasError?: boolean;
}

const UploadProgress: React.FC<UploadProgressProps> = ({
  isUploading,
  progress,
  batchId,
  onDownload,
  onUpload,
  hasError = false
}) => {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    if (!batchId) return;
    
    setIsDownloading(true);
    
    try {
      // Get the download URL - this will stop the loading state when complete
      await getDownloadUrl(batchId);
      
      // Call the original onDownload function
      onDownload();
    } catch (error) {
      console.error('Error getting download URL:', error);
    } finally {
      // Set downloading to false when the URL is returned
      setIsDownloading(false);
    }
  };

  if (isUploading || isDownloading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">
            {isDownloading ? "Downloading property video..." : "Creating property video..."}
          </span>
          <span className="text-sm font-medium">
            {isDownloading ? "Preparing files..." : (progress ? `${Math.round(progress)}%` : 'Processing...')}
          </span>
        </div>
        <Progress 
          value={isDownloading ? 50 : (progress || undefined)}
          isIndeterminate={isDownloading || !progress} 
          className="h-2"
        />
        <p className="text-xs text-muted-foreground text-center">
          {isDownloading 
            ? "Your download will begin shortly. Please wait..." 
            : "Do not leave the page, this may take a few minutes depending on the number of images"}
        </p>
      </div>
    );
  }

  if (hasError && batchId) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-destructive">Status check failed. Unable to verify video processing status.</p>
        <div className="flex space-x-3">
          <Button 
            variant="outline" 
            className="w-1/2"
            onClick={onUpload}
          >
            <Home className="mr-2 h-4 w-4" />
            Start New Video
          </Button>
          <Button 
            className="w-1/2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600" 
            onClick={handleDownload}
          >
            <Download className="mr-2 h-4 w-4" />
            Try Download
          </Button>
        </div>
      </div>
    );
  }

  // Only show download button when batch is completed (batchId exists and not uploading)
  if (batchId && !isUploading) {
    return (
      <Button className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600" onClick={handleDownload}>
        <Download className="mr-2 h-4 w-4" />
        Download Property Videos
      </Button>
    );
  }

  return (
    <Button className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600" onClick={onUpload}>
      <Home className="mr-2 h-4 w-4" />
      Create Property Video
    </Button>
  );
};

export default UploadProgress;
