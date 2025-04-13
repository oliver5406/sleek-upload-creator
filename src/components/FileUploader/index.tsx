// src/components/FileUploader/index.tsx
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import FileDropZone from './FileDropZone';
import FileList from './FileList';
import UploadProgress from './UploadProgress';
import { FileWithPreview, FileUploaderProps } from './types';
import { uploadBatch, getBatchStatus, getDownloadUrl } from '@/components/services/api';
import { Skeleton } from '@/components/ui/skeleton'; // Make sure you have this component

const STORAGE_KEY = 'fileUploader_state';

const FileUploader: React.FC<FileUploaderProps> = ({ settingsContext, useUniformSettings, onFilesChanged, globalPrompt }) => {
  const { toast } = useToast();
  const { getToken } = useAuth();
  const toastShownRef = useRef(false);
  const initialCheckDoneRef = useRef(false);
  const pollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const getInitialState = () => {
    try {
      const savedState = localStorage.getItem(STORAGE_KEY);
      if (savedState) {
        const parsedState = JSON.parse(savedState);
        
        if (parsedState && 
            typeof parsedState === 'object' && 
            (parsedState.batchId || parsedState.files?.length > 0)) {
          return {
            batchId: parsedState.batchId || null,
            processingComplete: parsedState.processingComplete || false,
            files: Array.isArray(parsedState.files) ? parsedState.files : [],
            progress: typeof parsedState.progress === 'number' ? parsedState.progress : 0,
          };
        }
      }
      return {
        batchId: null,
        processingComplete: false,
        files: [],
        progress: 0,
      };
    } catch (e) {
      console.error('Error loading saved state:', e);
      localStorage.removeItem(STORAGE_KEY);
      return {
        batchId: null,
        processingComplete: false,
        files: [],
        progress: 0,
      };
    }
  };
  
  const initialState = getInitialState();
  
  const [files, setFiles] = useState<FileWithPreview[]>(initialState.files);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(initialState.progress);
  const [batchId, setBatchId] = useState<string | null>(initialState.batchId);
  const [processingComplete, setProcessingComplete] = useState(initialState.processingComplete);
  const [hasError, setHasError] = useState(false);
  const [initialLoading, setInitialLoading] = useState(!!initialState.batchId);

  const maxFiles = settingsContext === 'single' ? 1 : 3;
  
  const showIndividualPrompts = settingsContext === 'multi' && !useUniformSettings;

  const statusPollingInterval = 5000;

  useEffect(() => {
    if (globalPrompt && files.length > 0 && !showIndividualPrompts) {
      setFiles(prev => prev.map(file => ({
        ...file,
        prompt: globalPrompt
      })));
    }
  }, [globalPrompt, files.length, showIndividualPrompts]);

  useEffect(() => {
    if (onFilesChanged) {
      onFilesChanged(files);
    }
  }, [files, onFilesChanged]);

  useEffect(() => {
    if (batchId || files.length > 0) {
      const stateToSave = {
        batchId,
        processingComplete,
        files,
        progress,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [batchId, processingComplete, files, progress]);

  const addFiles = useCallback((newFiles: FileWithPreview[]) => {
    setFiles(prev => {
      if (settingsContext === 'single') {
        const filesWithPrompt = newFiles.slice(0, 1).map(file => ({
          ...file,
          prompt: globalPrompt || file.prompt || 'Modern luxury home interior'
        }));
        return filesWithPrompt;
      }
      const updatedFiles = [...prev, ...newFiles];
      const limitedFiles = updatedFiles.slice(0, maxFiles);

      if (!showIndividualPrompts && globalPrompt) {
        return limitedFiles.map(file => ({
          ...file,
          prompt: globalPrompt
        }));
      }

      return limitedFiles;
    });
    setHasError(false);
  }, [settingsContext, maxFiles, showIndividualPrompts, globalPrompt]);

  const removeFile = useCallback((id: string) => {
    setFiles(prev => {
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
    setFiles(prev => {
      const updatedFiles = prev.map(file => 
        file.id === id ? { ...file, prompt } : file
      );
      
      if (settingsContext === 'single' && prev.length === 1 && onFilesChanged) {
        onFilesChanged(updatedFiles);
      }
      
      return updatedFiles;
    });
  }, [settingsContext, onFilesChanged]);

  const clearFiles = useCallback(() => {
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
  }, []);

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

  useEffect(() => {
    const validateSavedState = async () => {
      try {
        if (!batchId) {
          setIsUploading(false);
          setInitialLoading(false);
          return;
        }
        
        const token = await getToken();
        if (!token) {
          clearFiles();
          return;
        }
        
        const batchStatus = await getBatchStatus(batchId, token);
        
        if (!batchStatus || !batchStatus.status) {
          clearFiles();
          return;
        }
        
        const status = batchStatus.status;
        const isProcessing = ['queued', 'processing', 'started'].includes(status);
        setIsUploading(isProcessing);
        
        if (batchStatus.job_details && batchStatus.job_details.length > 0) {
          const totalProgress = batchStatus.job_details.reduce((sum, job) => {
            return sum + (job.progress || 0);
          }, 0);
          
          const overallProgress = Math.round(totalProgress / batchStatus.job_details.length);
          setProgress(overallProgress);
        }
        
        const isFinished = ['completed', 'failed', 'error', 'partially_completed'].includes(status);
        if (isFinished) {
          setProcessingComplete(true);
          setIsUploading(false);
        } else if (isProcessing && !pollTimeoutRef.current) {
          pollBatchStatus(batchId);
        }
      } catch (error) {
        console.error('Error validating saved state:', error);
        setHasError(true);
        setIsUploading(false);
      } finally {
        setInitialLoading(false);
      }
    };
    
    if (batchId) {
      validateSavedState();
    } else {
      setInitialLoading(false);
    }
  }, [batchId, getToken, clearFiles, pollBatchStatus]);

  useEffect(() => {
    if (files.length > maxFiles) {
      setFiles(prev => prev.slice(0, maxFiles));
    } else if (files.length > 0 && (!showIndividualPrompts || settingsContext === 'single') && globalPrompt) {
      setFiles(prev => prev.map(file => ({
        ...file,
        prompt: globalPrompt
      })));
    }
  }, [settingsContext, maxFiles, files.length, showIndividualPrompts, globalPrompt]);

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
          isUploading={isUploading}
          hasVideo={!!batchId && processingComplete}
          showIndividualPrompts={showIndividualPrompts}
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
