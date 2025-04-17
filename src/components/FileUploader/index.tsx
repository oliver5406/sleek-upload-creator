// src/components/FileUploader/index.tsx
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import FileDropZone from './FileDropZone';
import FileList from './FileList';
import UploadProgress from './UploadProgress';
import { FileWithPreview, FileUploaderProps } from './types';
import { uploadBatch, getBatchStatus, getDownloadUrl } from '@/components/services/api';
import { Skeleton } from '@/components/ui/skeleton';

const STORAGE_KEY = 'fileUploader_state';

const FileUploader: React.FC<FileUploaderProps> = ({ 
  settingsContext, 
  useUniformSettings,
  globalPrompt = "",
  customPrompt = "",
  settings = { cfg: 0.6, time: 5, transitionTime: 1 }
}) => {
  const { toast } = useToast();
  const { getToken, isAuthenticated } = useAuth();
  const toastShownRef = useRef(false);
  const blobUrlsRef = useRef<string[]>([]);

  useEffect(() => {
    const currentPrompt = customPrompt || globalPrompt || "";
    setFiles(prev => prev.map(file => ({
      ...file,
      prompt: currentPrompt
    })));
  }, [globalPrompt, customPrompt]);

  const initialCheckDoneRef = useRef(false);
  const pollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [batchId, setBatchId] = useState<string | null>(null);
  const [processingComplete, setProcessingComplete] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [initialLoading, setInitialLoading] = useState(false);

  const maxFiles = settingsContext === "single" ? 1 : 3;
  const showIndividualPrompts = settingsContext === "multi" && !useUniformSettings;

  const statusPollingInterval = 5000;

  useEffect(() => {
    return () => {
      blobUrlsRef.current.forEach(url => {
        try {
          URL.revokeObjectURL(url);
        } catch (e) {
          console.error('Failed to revoke blob URL:', e);
        }
      });
    };
  }, []);

  useEffect(() => {
    clearFiles();
  }, [isAuthenticated]);

  const addFiles = useCallback((newFiles: FileWithPreview[]) => {
    const currentPrompt = customPrompt || globalPrompt || "";
    setFiles(prev => {
      const newFilesWithPrompt = newFiles.map(file => {
        blobUrlsRef.current.push(file.preview);
        
        return {
          ...file,
          prompt: currentPrompt,
          cfg: settings.cfg,
          time: settings.time
        };
      });

      if (settingsContext === "single") {
        return newFilesWithPrompt.slice(0, 1);
      }
      const updatedFiles = [...prev, ...newFilesWithPrompt];
      return updatedFiles.slice(0, maxFiles);
    });
    setHasError(false);
  }, [settingsContext, maxFiles, globalPrompt, customPrompt, settings]);

  const removeFile = useCallback((id: string) => {
    setFiles(prev => {
      const fileToRemove = prev.find(file => file.id === id);
      if (fileToRemove) {
        try {
          const urlIndex = blobUrlsRef.current.indexOf(fileToRemove.preview);
          if (urlIndex >= 0) {
            URL.revokeObjectURL(fileToRemove.preview);
            blobUrlsRef.current.splice(urlIndex, 1);
          }
        } catch (e) {
          console.error('Failed to revoke blob URL:', e);
        }
      }
      
      const updatedFiles = prev.filter(file => file.id !== id);
      if (updatedFiles.length === 0) {
        setBatchId(null);
        setProcessingComplete(false);
        setProgress(0);
        setHasError(false);
        localStorage.removeItem(STORAGE_KEY);
      }
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
    files.forEach(file => {
      try {
        URL.revokeObjectURL(file.preview);
      } catch (e) {
        console.error('Failed to revoke blob URL:', e);
      }
    });
    blobUrlsRef.current = [];
    
    setFiles([]);
    setBatchId(null);
    setProcessingComplete(false);
    setHasError(false);
    
    localStorage.removeItem(STORAGE_KEY);
    
    if (pollTimeoutRef.current) {
      clearTimeout(pollTimeoutRef.current);
      pollTimeoutRef.current = null;
    }
    
    setProgress(0);
    setIsUploading(false);
    toastShownRef.current = false;
    initialCheckDoneRef.current = true;
    setInitialLoading(false);
  }, [files]);

  const stopPolling = useCallback(() => {
    if (pollTimeoutRef.current) {
      clearTimeout(pollTimeoutRef.current);
      pollTimeoutRef.current = null;
    }
  }, []);

  const uploadFiles = useCallback(async () => {
    if (files.length === 0) {
      toast({
        title: "No files selected",
        description: "Please add at least one property image to proceed.",
        variant: "destructive"
      });
      return;
    }
  
    if (showIndividualPrompts) {
      const missingPrompts = files.some(file => !file.prompt);
      if (missingPrompts) {
        toast({
          title: "Missing prompts",
          description: "Please add a prompt for each image.",
          variant: "destructive"
        });
        return;
      }
    }
  
    stopPolling();
  
    toastShownRef.current = false;
    setProcessingComplete(false);
    setHasError(false);
    setIsUploading(true);
    setProgress(0);
  
    try {
      const token = await getToken();
      
      if (!token) {
        toast({
          title: "Authentication failed",
          description: "You are not authenticated. Please log in again.",
          variant: "destructive"
        });
        setIsUploading(false);
        return;
      }
  
      const response = await uploadBatch(files, token);
      
      if (response && response.batch_id) {
        setBatchId(response.batch_id);
        pollBatchStatus(response.batch_id);
      } else {
        throw new Error("No batch ID returned from upload");
      }
  
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: "There was an error uploading your files.",
        variant: "destructive"
      });
      setIsUploading(false);
      setHasError(true);
    }
  }, [files, toast, stopPolling, getToken, showIndividualPrompts]);

  const pollBatchStatus = useCallback(async (currentBatchId: string) => {
    if (!currentBatchId) return;
    
    try {
      const token = await getToken();
      if (!token) {
        console.error('No token available for status check');
        setHasError(true);
        setIsUploading(false);
        return;
      }

      const batchStatus = await getBatchStatus(currentBatchId, token);
      
      if (!batchStatus) {
        throw new Error("Failed to get batch status");
      }
      
      const status = batchStatus.status;
      
      if (batchStatus.job_details && batchStatus.job_details.length > 0) {
        const totalProgress = batchStatus.job_details.reduce((sum, job) => {
          return sum + (job.progress || 0);
        }, 0);
        
        const overallProgress = Math.round(totalProgress / batchStatus.job_details.length);
        setProgress(overallProgress);
      }
      
      setHasError(false);
      
      const isFinished = ['completed', 'failed', 'error', 'partially_completed'].includes(status);
      
      if (isFinished) {
        stopPolling();
        setIsUploading(false);
        setProcessingComplete(true);
        
        if (!toastShownRef.current) {
          if (status === 'completed') {
            toast({
              title: "Property video created!",
              description: "Your property tour video is ready to download",
            });
          } else if (status === 'failed' || status === 'error') {
            toast({
              title: "Processing failed",
              description: "There was an error processing your video.",
              variant: "destructive"
            });
          } else if (status === 'partially_completed') {
            toast({
              title: "Processing partially completed",
              description: "Some videos were processed successfully, others failed.",
            });
          }
          toastShownRef.current = true;
        }
      } else {
        pollTimeoutRef.current = setTimeout(() => {
          pollBatchStatus(currentBatchId);
        }, statusPollingInterval);
      }
    } catch (error) {
      console.error('Status polling error:', error);
      
      setHasError(true);
      
      if (!toastShownRef.current) {
        toast({
          title: "Status check failed",
          description: "Failed to check processing status.",
          variant: "destructive"
        });
        toastShownRef.current = true;
      }
      
      stopPolling();
      setIsUploading(false);
    } finally {
      setInitialLoading(false);
    }
  }, [getToken, stopPolling, toast]);

  const downloadVideo = useCallback(async () => {
    if (!batchId) return;
  
    try {
      const token = await getToken();
      if (!token) {
        toast({
          title: "Authentication failed",
          description: "You are not authenticated. Please log in again.",
          variant: "destructive"
        });
        return;
      }

      const downloadUrl = getDownloadUrl(batchId);
    
      toast({
        title: "Download started",
        description: "Your property videos are being downloaded.",
      });
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', '');
      link.setAttribute('target', '_blank');
      
      fetch(downloadUrl, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
        .then(res => {
          if (!res.ok) throw new Error('Download failed');
          return res.blob();
        })
        .then(blob => {
          const url = window.URL.createObjectURL(blob);
          link.setAttribute('href', url);
          link.setAttribute('download', `property_videos_${batchId}.zip`);
          document.body.appendChild(link);
          link.click();
          link.remove();
          window.URL.revokeObjectURL(url);
        })
        .catch(err => {
          console.error('Download error:', err);
          setHasError(true);
          toast({
            title: "Download failed",
            description: "There was an error downloading your video.",
            variant: "destructive"
          });
        });
    } catch (error) {
      console.error('Token retrieval error:', error);
      setHasError(true);
      toast({
        title: "Authentication error",
        description: "Failed to authenticate for download.",
        variant: "destructive"
      });
    }
  }, [batchId, getToken, toast]);

  useEffect(() => {
    return () => {
      if (pollTimeoutRef.current) {
        clearTimeout(pollTimeoutRef.current);
      }
    };
  }, []);

  const handleBrowseFiles = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, []);

  useEffect(() => {
    if (files.length > maxFiles) {
      setFiles(prev => prev.slice(0, maxFiles));
    }
  }, [settingsContext, maxFiles, files.length]);

  if (initialLoading) {
    return (
      <div className="w-full max-w-3xl mx-auto space-y-8">
        <Skeleton className="h-40 w-full rounded-md" />
        <div className="space-y-4">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto space-y-8">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple={maxFiles > 1}
        className="hidden"
        onChange={(e) => {
          const newFiles = e.target.files;
          if (!newFiles) return;
          
          if (files.length + newFiles.length > maxFiles) {
            toast({
              title: "Too many files",
              description: `You can only upload a maximum of ${maxFiles} image${maxFiles === 1 ? '' : 's'}.`,
              variant: "destructive"
            });
            e.target.value = '';
            return;
          }
          
          const processedFiles = Array.from(newFiles).map(file => {
            const id = Math.random().toString(36).substring(2, 9);
            const previewUrl = URL.createObjectURL(file);
            blobUrlsRef.current.push(previewUrl);
            
            return {
              file,
              id,
              preview: previewUrl,
              prompt: ''
            };
          });
          
          addFiles(processedFiles);
          e.target.value = '';
        }}
      />
      
      <FileDropZone 
        onFilesAdded={addFiles}
        isUploading={isUploading}
        hasFiles={files.length > 0}
        currentFileCount={files.length}
        maxFiles={maxFiles}
      />

      {files.length > 0 && (
        <FileList 
          files={files}
          onRemoveFile={removeFile}
          onUpdatePrompt={updateFilePrompt}
          onClearAll={clearFiles}
          onBrowseFiles={handleBrowseFiles}
          isUploading={isUploading}
          hasVideo={!!batchId && processingComplete}
          showIndividualPrompts={showIndividualPrompts}
          maxFiles={maxFiles}
        />
      )}

      {(files.length > 0 || batchId) && (
        <UploadProgress 
          isUploading={isUploading}
          progress={progress}
          batchId={batchId}
          onDownload={downloadVideo}
          onUpload={uploadFiles}
          hasError={hasError}
        />
      )}
    </div>
  );
};

FileUploader.defaultProps = {
  settingsContext: "single",
  useUniformSettings: true
};

export default FileUploader;
