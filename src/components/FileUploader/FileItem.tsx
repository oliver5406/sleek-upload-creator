
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
    <div className="grid md:grid-cols-2 gap-4 border rounded-lg p-4 bg-card shadow-sm">
      <div className="space-y-3">
        <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-muted">
          <img 
            src={file.preview} 
            alt={file.file.name} 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium truncate">{file.file.name}</p>
          <Button
            variant="ghost"
            size="icon"
            className="flex-shrink-0 text-muted-foreground hover:text-destructive"
            onClick={() => onRemove(file.id)}
            disabled={disabled}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Remove file</span>
          </Button>
        </div>
      </div>
      
      {showPromptField && (
        <div className="flex flex-col h-full">
          <Label htmlFor={`prompt-${file.id}`} className="mb-2">Prompt</Label>
          <Textarea 
            id={`prompt-${file.id}`}
            placeholder="Generate a smooth, dynamic video with natural motion"
            value={file.prompt}
            onChange={(e) => onPromptChange(file.id, e.target.value)}
            className="flex-grow resize-none"
            disabled={disabled}
          />
        </div>
      )}
    </div>
  );
};

export default FileItem;
