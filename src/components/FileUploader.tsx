import React, { useState, useCallback, useRef } from 'react';
import { X, Upload, Camera, Home, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import FileItem from '@/components/FileItem';
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuItem 
} from "@/components/ui/dropdown-menu";

import axios from 'axios';

// API base URL - change this to your Flask backend URL
const API_URL = 'http://localhost:5000/api';

type FileWithPreview = {
  file: File;
  id: string;
  preview: string;
  prompt?: string;
};

type BatchStatus = {
  status: string;
  job_details: Array<{
    filename: string;
    status: string;
    progress: number;
    error?: string;
    video_url?: string;
    job_id: string;
  }>;
};

interface BatchResponse {
  batch_id: string;
}

const FileUploader = () => {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [batchId, setBatchId] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [statusPolling, setStatusPolling] = useState<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const toastShownRef = useRef(false);
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

  const updateFilePrompt = useCallback((id: string, prompt: string) => {
    setFiles(prev => 
      prev.map(file => 
        file.id === id ? { ...file, prompt } : file
      )
    );
  }, []);

  const clearFiles = useCallback(() => {
    setFiles([]);
    setVideoUrl(null);
    setBatchId(null);
    
    // Stop polling if it's active
    if (statusPolling) {
      clearInterval(statusPolling);
      setStatusPolling(null);
    }
    
    setProgress(0);
    toastShownRef.current = false;
  }, [statusPolling]);

  // Function to stop polling
  const stopPolling = useCallback(() => {
    if (statusPolling) {
      clearInterval(statusPolling);
      setStatusPolling(null);
    }
  }, [statusPolling]);

  const uploadFiles = useCallback(async () => {
    if (files.length === 0) {
      toast({
        title: "No files selected",
        description: "Please add at least one property image to proceed.",
        variant: "destructive"
      });
      return;
    }

    // Check if all files have prompts
    const missingPrompts = files.some(file => !file.prompt);
    if (missingPrompts) {
      toast({
        title: "Missing prompts",
        description: "Please add a prompt for each image.",
        variant: "destructive"
      });
      return;
    }

    // Stop any existing polling
    stopPolling();
    
    toastShownRef.current = false;
    setIsUploading(true);
    setProgress(0);

    try {
      const formData = new FormData();
      const fileDetails = [];

      files.forEach(fileObj => {
        formData.append('files[]', fileObj.file);
        fileDetails.push({
          filename: fileObj.file.name,
          prompt: fileObj.prompt
        });
      });

      formData.append('aspect_ratio', aspectRatio);
      formData.append('file_details', JSON.stringify(fileDetails));

      const response = await axios.post<BatchResponse>(`${API_URL}/upload-batch`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setBatchId(response.data.batch_id);
      
      // Start polling for status
      const polling = setInterval(() => {
        pollBatchStatus(response.data.batch_id);
      }, 5000);
      
      setStatusPolling(polling);
      
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: "There was an error uploading your files.",
        variant: "destructive"
      });
      setIsUploading(false);
    }
  }, [files, toast, aspectRatio, stopPolling]);

  const pollBatchStatus = async (batchId: string) => {
    try {
      const response = await axios.get<BatchStatus>(`${API_URL}/batch-status/${batchId}`);
      const batchStatus = response.data.status;
      
      // Calculate overall progress
      if (response.data.job_details && response.data.job_details.length > 0) {
        const totalProgress = response.data.job_details.reduce((sum, job) => {
          return sum + (job.progress || 0);
        }, 0);
        
        const overallProgress = Math.round(totalProgress / response.data.job_details.length);
        setProgress(overallProgress);
      }
      
      // Check if processing is complete or failed
      const isFinished = [
        'completed', 
        'failed', 
        'error', 
        'partially_completed'
      ].includes(batchStatus);
      
      // Stop polling if the process is finished
      if (isFinished) {
        stopPolling();
        setIsUploading(false);
        
        // Show appropriate toast based on status
        if (!toastShownRef.current) {
          if (batchStatus === 'completed') {
            toast({
              title: "Property video created!",
              description: "Your property tour video is ready to download",
            });
          } else if (batchStatus === 'failed' || batchStatus === 'error') {
            toast({
              title: "Processing failed",
              description: "There was an error processing your video.",
              variant: "destructive"
            });
          } else if (batchStatus === 'partially_completed') {
            toast({
              title: "Processing partially completed",
              description: "Some videos were processed successfully, others failed.",
            });
          }
          toastShownRef.current = true;
        }
      }
    } catch (error) {
      console.error('Status polling error:', error);
      
      // Show error toast only once
      if (!toastShownRef.current) {
        toast({
          title: "Status check failed",
          description: "Failed to check processing status.",
          variant: "destructive"
        });
        toastShownRef.current = true;
      }
      
      // Stop polling on error
      stopPolling();
      setIsUploading(false);
    }
  };
  
  const downloadVideo = useCallback(() => {
    if (!batchId) return;
    
    // Redirect to download all endpoint
    window.location.href = `${API_URL}/download-all/${batchId}`;
  }, [batchId]);

  // Cleanup interval on unmount
  React.useEffect(() => {
    return () => {
      if (statusPolling) {
        clearInterval(statusPolling);
      }
    };
  }, [statusPolling]);

  return (
    <div className="w-full max-w-3xl mx-auto space-y-8">
    <div className="flex items-center space-x-4 mb-4">
      <label htmlFor="aspect-ratio">Aspect Ratio:</label>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="rounded-md border p-2" disabled={isUploading}>
            {aspectRatio}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onSelect={() => setAspectRatio("16:9")}>
            16:9 (Widescreen)
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setAspectRatio("4:3")}>
            4:3 (Standard)
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setAspectRatio("1:1")}>
            1:1 (Square)
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setAspectRatio("9:16")}>
            9:16 (Vertical)
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
      
      <div
        className={`relative flex flex-col items-center justify-center w-full min-h-[300px] p-8 border-2 border-dashed rounded-xl transition-all ${
          isDragging ? 'border-primary bg-primary/5' : 'border-muted'
        } ${files.length > 0 ? 'hidden md:flex' : 'flex'}`}
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
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={clearFiles}
                disabled={isUploading}
              >
                <X className="mr-2 h-4 w-4" />
                Clear All
              </Button>
              {!videoUrl && !batchId && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBrowseFiles}
                  disabled={isUploading}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Add More
                </Button>
              )}
            </div>
          </div>

          <div className="grid gap-6 max-h-[600px] overflow-y-auto px-1 py-2">
            {files.map((file) => (
              <div key={file.id} className="grid md:grid-cols-2 gap-4 border rounded-lg p-4 bg-card shadow-sm">
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
                      onClick={() => removeFile(file.id)}
                      disabled={isUploading}
                    >
                      <X className="h-4 w-4" />
                      <span className="sr-only">Remove file</span>
                    </Button>
                  </div>
                </div>
                
                <div className="flex flex-col h-full">
                  <Label htmlFor={`prompt-${file.id}`} className="mb-2">Image Description</Label>
                  <Textarea 
                    id={`prompt-${file.id}`}
                    placeholder="Describe this image or provide details about what you want to highlight (e.g., 'Spacious living room with natural light and modern furniture')"
                    value={file.prompt}
                    onChange={(e) => updateFilePrompt(file.id, e.target.value)}
                    className="flex-grow resize-none"
                    disabled={isUploading}
                  />
                </div>
              </div>
            ))}
          </div>

          {isUploading ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Creating property video...</span>
                <span className="text-sm font-medium">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          ) : batchId ? (
            <Button className="w-full" onClick={downloadVideo}>
              <Download className="mr-2 h-4 w-4" />
              Download Property Videos
            </Button>
          ) : (
            <Button className="w-full" onClick={uploadFiles}>
              <Home className="mr-2 h-4 w-4" />
              Create Property Video
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default FileUploader;