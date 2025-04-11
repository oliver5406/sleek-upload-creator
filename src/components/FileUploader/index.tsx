
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

const FileUploader: React.FC<FileUploaderProps> = ({ settingsContext, useUniformSettings }) => {
  const { toast } = useToast();
  const { getToken } = useAuth();
  const toastShownRef = useRef(false);
  const initialCheckDoneRef = useRef(false);
  const pollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Initialize from localStorage if available
  const getInitialState = () => {
    try {
      const savedState = localStorage.getItem(STORAGE_KEY);
      if (savedState) {
        const parsedState = JSON.parse(savedState);
        
        // Validate that we have a proper state
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
      // If we get here, either there's no saved state or it's invalid
      return {
        batchId: null,
        processingComplete: false,
        files: [],
        progress: 0,
      };
    } catch (e) {
      console.error('Error loading saved state:', e);
      // Clear potentially corrupt state
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
  const [isUploading, setIsUploading] = useState(false); // Start with false and determine during validation
  const [progress, setProgress] = useState(initialState.progress);
  const [batchId, setBatchId] = useState<string | null>(initialState.batchId);
  const [processingComplete, setProcessingComplete] = useState(initialState.processingComplete);
  const [hasError, setHasError] = useState(false);
  const [initialLoading, setInitialLoading] = useState(!!initialState.batchId); // Only set to loading if we have a batchId to validate
  const [aspectRatio, setAspectRatio] = useState('16:9');

  // Use this ref to manage the interval instead of state to avoid re-renders
  const statusPollingInterval = 5000; // 5 seconds

  // Save state to localStorage whenever relevant state changes
  useEffect(() => {
    // Only save if we have meaningful state to save
    if (batchId || files.length > 0) {
      const stateToSave = {
        batchId,
        processingComplete,
        files,
        progress,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
    } else {
      // Clear localStorage if we have no state to save
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [batchId, processingComplete, files, progress]);

  const addFiles = useCallback((newFiles: FileWithPreview[]) => {
    setFiles(prev => [...prev, ...newFiles]);
    // Reset any error state when new files are added
    setHasError(false);
  }, []);

  const removeFile = useCallback((id: string) => {
    setFiles(prev => {
      const updatedFiles = prev.filter(file => file.id !== id);
      // If removing the last file, also clear batch state
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
    setFiles([]);
    setBatchId(null);
    setProcessingComplete(false);
    setHasError(false);
    
    // Clear local storage
    localStorage.removeItem(STORAGE_KEY);
    
    // Stop polling if it's active
    if (pollTimeoutRef.current) {
      clearTimeout(pollTimeoutRef.current);
      pollTimeoutRef.current = null;
    }
    
    setProgress(0);
    setIsUploading(false);
    toastShownRef.current = false;
    initialCheckDoneRef.current = true; // Prevent initial check after clearing
    setInitialLoading(false); // Ensure we're not in loading state
  }, []);

  // Function to stop polling
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
    setProcessingComplete(false);
    setHasError(false);
    setIsUploading(true);
    setProgress(0);
  
    try {
      // Get the token from the context
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
  
      // Pass the token to the API request
      const response = await uploadBatch(files, token);
      
      if (response && response.batch_id) {
        setBatchId(response.batch_id);
        // Start polling for status immediately
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
  }, [files, toast, stopPolling, getToken]);  

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
      
      // Calculate overall progress
      if (batchStatus.job_details && batchStatus.job_details.length > 0) {
        const totalProgress = batchStatus.job_details.reduce((sum, job) => {
          return sum + (job.progress || 0);
        }, 0);
        
        const overallProgress = Math.round(totalProgress / batchStatus.job_details.length);
        setProgress(overallProgress);
      }
      
      // Clear error state since we got a successful response
      setHasError(false);
      
      // Check if processing is complete or failed
      const isFinished = ['completed', 'failed', 'error', 'partially_completed'].includes(status);
      
      if (isFinished) {
        // Stop polling if the process is finished
        stopPolling();
        setIsUploading(false);
        setProcessingComplete(true);
        
        // Show appropriate toast based on status
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
        // If processing is not finished, schedule another poll
        pollTimeoutRef.current = setTimeout(() => {
          pollBatchStatus(currentBatchId);
        }, statusPollingInterval);
      }
    } catch (error) {
      console.error('Status polling error:', error);
      
      // Set error state
      setHasError(true);
      
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
    } finally {
      // Make sure we're done with initial loading
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
      // Create a hidden anchor element for download
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', '');
      link.setAttribute('target', '_blank');
      
      // Append custom headers through fetch API
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
  
  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (pollTimeoutRef.current) {
        clearTimeout(pollTimeoutRef.current);
      }
    };
  }, []);

  // Validate saved state on mount - improved version
  useEffect(() => {
    const validateSavedState = async () => {
      try {
        // If we have no batchId, we're definitely not uploading
        if (!batchId) {
          setIsUploading(false);
          setInitialLoading(false);
          return;
        }
        
        const token = await getToken();
        if (!token) {
          clearFiles(); // Clear invalid state if no token
          return;
        }
        
        // Try to fetch the batch status to verify it exists
        const batchStatus = await getBatchStatus(batchId, token);
        
        if (!batchStatus || !batchStatus.status) {
          // If the batch doesn't exist or has no status, clear the saved state
          clearFiles();
          return;
        }
        
        // Set uploading status based on batch status
        const status = batchStatus.status;
        const isProcessing = ['queued', 'processing', 'started'].includes(status);
        setIsUploading(isProcessing);
        
        // Calculate progress if available
        if (batchStatus.job_details && batchStatus.job_details.length > 0) {
          const totalProgress = batchStatus.job_details.reduce((sum, job) => {
            return sum + (job.progress || 0);
          }, 0);
          
          const overallProgress = Math.round(totalProgress / batchStatus.job_details.length);
          setProgress(overallProgress);
        }
        
        // Check if processing is complete or failed
        const isFinished = ['completed', 'failed', 'error', 'partially_completed'].includes(status);
        if (isFinished) {
          setProcessingComplete(true);
          setIsUploading(false);
        } else if (isProcessing && !pollTimeoutRef.current) {
          // If still processing but no active polling, start polling
          pollBatchStatus(batchId);
        }
      } catch (error) {
        console.error('Error validating saved state:', error);
        // If we can't verify the batch status, mark as error but keep the state
        setHasError(true);
        setIsUploading(false);
      } finally {
        setInitialLoading(false);
      }
    };
    
    // If we have a batchId, we need to validate
    if (batchId) {
      validateSavedState();
    } else {
      setInitialLoading(false);
    }
  }, [batchId, getToken, clearFiles, pollBatchStatus]);

  // Show loading skeleton while initializing
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

  // We can now use settingsContext and useUniformSettings props if needed
  // For now, we're just accepting them but not using them directly
  // They could be used to modify FileUploader behavior based on the settings context

  return (
    <div className="w-full max-w-3xl mx-auto space-y-8">
      <FileDropZone 
        onFilesAdded={addFiles}
        isUploading={isUploading}
        hasFiles={files.length > 0}
        currentFileCount={files.length} 
      />

      {files.length > 0 && (
        <FileList 
          files={files}
          onRemoveFile={removeFile}
          onUpdatePrompt={updateFilePrompt}
          onClearAll={clearFiles}
          isUploading={isUploading}
          hasVideo={!!batchId && processingComplete}
          // If we need to modify FileList behavior based on settings:
          // settingsContext={settingsContext}
          // useUniformSettings={useUniformSettings}
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

// Set default props
FileUploader.defaultProps = {
  settingsContext: "single",
  useUniformSettings: true
};

export default FileUploader;
