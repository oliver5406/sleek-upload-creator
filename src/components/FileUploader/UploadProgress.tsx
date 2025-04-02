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
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Creating property video...</span>
          <span className="text-sm font-medium">{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>
    );
  }

  if (batchId) {
    return (
      <Button className="w-full" onClick={onDownload}>
        <Download className="mr-2 h-4 w-4" />
        Download Property Videos
      </Button>
    );
  }

  return (
    <Button className="w-full" onClick={onUpload}>
      <Home className="mr-2 h-4 w-4" />
      Create Property Video
    </Button>
  );
};

export default UploadProgress;