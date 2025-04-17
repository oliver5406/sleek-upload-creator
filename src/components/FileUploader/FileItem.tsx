// src/components/FileUploader/FileItem.tsx
import React from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { FileWithPreview } from './types';

interface FileItemProps {
  file: FileWithPreview;
  onRemove: (id: string) => void;
  onPromptChange: (id: string, prompt: string) => void;
  disabled?: boolean;
  showPromptField?: boolean;
}

const FileItem: React.FC<FileItemProps> = ({ 
  file, 
  onRemove, 
  onPromptChange, 
  disabled = false,
  showPromptField = true
}) => {
  return (
    <div className={`relative grid ${showPromptField ? 'md:grid-cols-2' : 'md:grid-cols-1'} gap-4 border rounded-lg p-4 bg-card shadow-sm`}>
      {/* Filename at the top left */}
      <div className="absolute top-4 left-4 z-10">
        <p className="text-sm font-medium truncate">{file.file.name}</p>
      </div>
      
      {/* X Button in the top right corner */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2 flex-shrink-0 text-muted-foreground hover:text-destructive z-10"
        onClick={() => onRemove(file.id)}
        disabled={disabled}
      >
        <X className="h-4 w-4" />
        <span className="sr-only">Remove file</span>
      </Button>
      
      {/* Prompt label in the top right of the second column */}
      {showPromptField && (
        <div className="absolute top-4 left-1/2 z-10">
          <Label htmlFor={`prompt-${file.id}`} className="font-medium">Prompt</Label>
        </div>
      )}
      
      <div className={`space-y-3 mt-10 ${!showPromptField ? 'mx-auto max-w-md w-full md:w-3/5' : ''}`}>
        <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-muted">
          <img 
            src={file.preview} 
            alt={file.file.name} 
            className="w-full h-full object-cover"
          />
        </div>
      </div>
      
      {showPromptField && (
        <div className="mt-10">
          <Textarea 
            id={`prompt-${file.id}`}
            placeholder="Generate a smooth, dynamic video with natural motion"
            value={file.prompt}
            onChange={(e) => onPromptChange(file.id, e.target.value)}
            className="resize-none h-[12rem] overflow-auto"
            disabled={disabled}
          />
        </div>
      )}
    </div>
  );
};

export default FileItem;