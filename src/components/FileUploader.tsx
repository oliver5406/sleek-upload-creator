
import React, { useState, useCallback, useRef } from 'react';
import { Cloud, X, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/components/ui/use-toast';
import FileItem from '@/components/FileItem';

type FileWithPreview = {
  file: File;
  id: string;
  preview: string;
};

const FileUploader = () => {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
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

  const addFiles = useCallback((newFiles: FileList | null) => {
    if (!newFiles) return;

    const validImageTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp', 'image/gif'];
    
    const newFilesArray = Array.from(newFiles)
      .filter(file => validImageTypes.includes(file.type))
      .map(file => {
        const id = Math.random().toString(36).substring(2, 9);
        return {
          file,
          id,
          preview: URL.createObjectURL(file)
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

    setFiles(prev => [...prev, ...newFilesArray]);
  }, [toast]);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    addFiles(e.dataTransfer.files);
  }, [addFiles]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    addFiles(e.target.files);
    // Reset the input value so the same file can be uploaded again if removed
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [addFiles]);

  const handleBrowseFiles = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const removeFile = useCallback((id: string) => {
    setFiles(prev => {
      const updatedFiles = prev.filter(file => file.id !== id);
      return updatedFiles;
    });
  }, []);

  const clearFiles = useCallback(() => {
    setFiles([]);
    setVideoUrl(null);
  }, []);

  const mockApiCall = useCallback(() => {
    if (files.length === 0) {
      toast({
        title: "No files selected",
        description: "Please add at least one image to proceed.",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);
    setProgress(0);

    // Mock API call with progress updates
    let progressValue = 0;
    const interval = setInterval(() => {
      progressValue += Math.random() * 10;
      
      if (progressValue >= 100) {
        progressValue = 100;
        clearInterval(interval);
        
        // Simulate API response delay
        setTimeout(() => {
          setIsUploading(false);
          setVideoUrl('https://example.com/generated-video.mp4');
          toast({
            title: "Video generated successfully",
            description: "Your video is ready to download",
          });
        }, 500);
      }
      
      setProgress(progressValue);
    }, 500);
  }, [files, toast]);

  const downloadVideo = useCallback(() => {
    // In a real app, this would trigger the actual file download
    toast({
      title: "Download started",
      description: "Your video will be downloaded shortly",
    });
  }, [toast]);

  return (
    <div className="w-full max-w-3xl mx-auto space-y-8">
      <div
        className={`relative flex flex-col items-center justify-center w-full min-h-[300px] p-8 border-2 border-dashed rounded-xl transition-all ${
          isDragging ? 'drag-active' : 'border-muted'
        }`}
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
            <Cloud className="w-12 h-12 text-primary" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-semibold">Drag and drop images here</h3>
            <p className="text-muted-foreground">or click the button below to browse your files</p>
          </div>
          <Button
            variant="outline"
            onClick={handleBrowseFiles}
            className="mt-2"
            disabled={isUploading}
          >
            <Upload className="mr-2 h-4 w-4" />
            Browse Files
          </Button>
        </div>
      </div>

      {files.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">
              {files.length} {files.length === 1 ? 'Image' : 'Images'} Selected
            </h3>
            <Button
              variant="outline"
              size="sm"
              onClick={clearFiles}
              disabled={isUploading}
            >
              <X className="mr-2 h-4 w-4" />
              Clear All
            </Button>
          </div>

          <div className="grid gap-3 max-h-[300px] overflow-y-auto p-1">
            {files.map((file) => (
              <FileItem
                key={file.id}
                file={file.file}
                id={file.id}
                preview={file.preview}
                onRemove={removeFile}
                disabled={isUploading}
              />
            ))}
          </div>

          {isUploading ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Processing images...</span>
                <span className="text-sm font-medium">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          ) : videoUrl ? (
            <Button className="w-full" onClick={downloadVideo}>
              Download Generated Video
            </Button>
          ) : (
            <Button className="w-full" onClick={mockApiCall}>
              Generate Video
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default FileUploader;
