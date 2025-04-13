
// src/components/FileUploader/FileList.tsx
import React from 'react';
import { X, FolderOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import FileItem from './FileItem';
import { FileWithPreview } from './types';

interface FileListProps {
  files: FileWithPreview[];
  onRemoveFile: (id: string) => void;
  onUpdatePrompt: (id: string, prompt: string) => void;
  onClearAll: () => void;
  onBrowseFiles: () => void;
  isUploading: boolean;
  hasVideo: boolean;
  showIndividualPrompts?: boolean;
  maxFiles: number;
}

const FileList: React.FC<FileListProps> = ({ 
  files,
  onRemoveFile,
  onUpdatePrompt,
  onClearAll,
  onBrowseFiles,
  isUploading,
  hasVideo,
  showIndividualPrompts = true,
  maxFiles,
}) => {
  if (files.length === 0) {
    return null;
  }

  const canAddMoreFiles = files.length < maxFiles;

  return (
    <div className="space-y-4 mt-4 border border-border rounded-lg p-4 bg-card">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">
          {files.length} {files.length === 1 ? 'Image' : 'Images'} Selected
          {maxFiles > 1 && (
            <span className="text-sm text-muted-foreground ml-2">
              (Maximum {maxFiles})
            </span>
          )}
        </h3>
        <div className="flex gap-2">
          {canAddMoreFiles && (
            <Button
              variant="outline"
              size="sm"
              onClick={onBrowseFiles}
              disabled={isUploading}
            >
              <FolderOpen className="mr-2 h-4 w-4" />
              Browse Files
            </Button>
          )}
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

      <div className="grid gap-6 max-h-[400px] overflow-y-auto px-1 py-2">
        {files.map((file) => (
          <FileItem
            key={file.id}
            file={file}
            onRemove={onRemoveFile}
            onPromptChange={onUpdatePrompt}
            disabled={isUploading}
            showPromptField={showIndividualPrompts}
          />
        ))}
      </div>
    </div>
  );
};

export default FileList;
