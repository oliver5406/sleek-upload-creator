// src/components/FileUploader/FileList.tsx
import React from 'react';
import { X, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import FileItem from './FileItem';
import { FileWithPreview } from './types';

interface FileListProps {
  files: FileWithPreview[];
  onRemoveFile: (id: string) => void;
  onUpdatePrompt: (id: string, prompt: string) => void;
  onClearAll: () => void;
  isUploading: boolean;
  hasVideo: boolean;
  onBrowseFiles: () => void; // Changed this prop to match original functionality
}

const FileList: React.FC<FileListProps> = ({ 
  files,
  onRemoveFile,
  onUpdatePrompt,
  onClearAll,
  isUploading,
  hasVideo,
  onBrowseFiles
}) => {
  if (files.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">
          {files.length} {files.length === 1 ? 'Image' : 'Images'} Selected
        </h3>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onClearAll}
            disabled={isUploading}
          >
            <X className="mr-2 h-4 w-4" />
            Clear All
          </Button>
        </div>
      </div>

      <div className="grid gap-6 max-h-[600px] overflow-y-auto px-1 py-2">
        {files.map((file) => (
          <FileItem
            key={file.id}
            file={file}
            onRemove={onRemoveFile}
            onPromptChange={onUpdatePrompt}
            disabled={isUploading}
          />
        ))}
      </div>
    </div>
  );
};

export default FileList;