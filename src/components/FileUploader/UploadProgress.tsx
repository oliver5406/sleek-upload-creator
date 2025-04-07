
// src/components/FileUploader/UploadProgress.tsx
import React from 'react';
import { Download, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface UploadProgressProps {
  isUploading: boolean;
  progress: number;
  batchId: string | null;
  onDownload: () => void;
  onUpload: () => void;
}

const UploadProgress: React.FC<UploadProgressProps> = ({
  isUploading,
  progress,
  batchId,
  onDownload,
  onUpload
}) => {
  if (isUploading) {
    return (
      <div className="space-y-4">
        <div className="text-sm font-medium text-center">
          Creating property video...
        </div>
        <Progress 
          isIndeterminate={true} 
          className="h-2"
        />
        <p className="text-xs text-muted-foreground text-center">
          Do not leave the page, this may take a few minutes depending on the number of images
        </p>
      </div>
    );
  }

  if (batchId) {
    return (
      <Button className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600" onClick={onDownload}>
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
