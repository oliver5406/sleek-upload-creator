
import React, { memo } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FileItemProps {
  file: File;
  id: string;
  preview: string;
  onRemove: (id: string) => void;
  disabled?: boolean;
}

const FileItem: React.FC<FileItemProps> = ({ file, id, preview, onRemove, disabled }) => {
  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRemove(id);
  };

  return (
    <div className="file-item flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="relative flex-shrink-0 w-12 h-12 overflow-hidden rounded-md">
          <img 
            src={preview} 
            alt={file.name} 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex flex-col min-w-0">
          <p className="text-sm font-medium truncate">{file.name}</p>
          <p className="text-xs text-muted-foreground">
            {(file.size / 1024).toFixed(2)} KB
          </p>
        </div>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="flex-shrink-0 text-muted-foreground hover:text-destructive"
        onClick={handleRemove}
        disabled={disabled}
      >
        <X className="h-4 w-4" />
        <span className="sr-only">Remove file</span>
      </Button>
    </div>
  );
};

export default memo(FileItem);
