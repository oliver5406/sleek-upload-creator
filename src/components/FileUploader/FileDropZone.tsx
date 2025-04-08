// src/components/FileUploader/FileDropZone.tsx
import React, { useCallback, useState, useRef } from 'react';
import { Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { FileWithPreview } from './types';

interface FileDropZoneProps {
  onFilesAdded: (files: FileWithPreview[]) => void;
  isUploading: boolean;
  hasFiles: boolean;
  currentFileCount: number; // 🆕 ADD THIS
}

const FileDropZone: React.FC<FileDropZoneProps> = ({ 
  onFilesAdded, 
  isUploading, 
  hasFiles,
  currentFileCount // 🆕 RECEIVE THIS
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const processFiles = useCallback((newFiles: FileList | null) => {
    if (!newFiles) return;

    const validImageTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp', 'image/gif'];

    const newFilesArray = Array.from(newFiles)
      .filter(file => validImageTypes.includes(file.type))
      .map(file => {
        const id = Math.random().toString(36).substring(2, 9);
        return {
          file,
          id,
          preview: URL.createObjectURL(file),
          prompt: ''
        };
      });

    if (newFilesArray.length === 0) {
      toast({
        title: "Invalid files",
        description: "Please upload image files only (JPG, PNG, WebP, GIF).",
        variant: "destructive"
      });
      return;
    }

    onFilesAdded(newFilesArray);
  }, [toast, onFilesAdded]);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (currentFileCount + files.length > 3) {
      toast({
        title: "Too many files",
        description: "You can only upload a maximum of 3 images.",
        variant: "destructive"
      });
      return;
    }

    processFiles(files);
  }, [processFiles, toast, currentFileCount]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    if (currentFileCount + files.length > 3) {
      toast({
        title: "Too many files",
        description: "You can only upload a maximum of 3 images.",
        variant: "destructive"
      });

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    processFiles(files);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [processFiles, toast, currentFileCount]);

  const handleBrowseFiles = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div
      className={`relative flex flex-col items-center justify-center w-full min-h-[300px] p-8 border-2 border-dashed rounded-xl transition-all ${
        isDragging ? 'border-primary bg-primary/5' : 'border-muted'
      } ${hasFiles ? 'hidden md:flex' : 'flex'}`}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <input
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleFileChange}
        ref={fileInputRef}
      />

      <div className="flex flex-col items-center gap-4 text-center">
        <div className="p-4 rounded-full bg-muted/50">
          <Camera className="w-12 h-12 text-primary" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-semibold">Upload Property Images</h3>
          <p className="text-muted-foreground">Drag and drop your best property photos</p>
        </div>
        <Button
          variant="outline"
          onClick={handleBrowseFiles}
          className="mt-2"
          disabled={isUploading}
        >
          Browse Files
        </Button>
      </div>
    </div>
  );
};

export default FileDropZone;
