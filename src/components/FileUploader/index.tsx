
// src/components/FileUploader/index.tsx
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import FileDropZone from './FileDropZone';
import FileList from './FileList';
import AspectRatioSelector from './AspectRatioSelector';
import UploadProgress from './UploadProgress';
import { FileWithPreview } from './types';
import { uploadBatch, getBatchStatus, getDownloadUrl } from '@/components/services/api';

const STORAGE_KEY = 'fileUploader_state';

const FileUploader = () => {
  const { token, getToken } = useAuth();
  const { toast } = useToast();
  const toastShownRef = useRef(false);
  const initialCheckDoneRef = useRef(false);

  // Initialize state from localStorage if available
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [batchId, setBatchId] = useState<string | null>(() => {
    const savedState = localStorage.getItem(STORAGE_KEY);
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        return parsed.batchId || null;
      } catch (e) {
        return null;
      }
    }
    return null;
  });
  
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [statusPolling, setStatusPolling] = useState<NodeJS.Timeout | null>(null);
  const [processingComplete, setProcessingComplete] = useState(false);

  // Save state to localStorage whenever batchId changes
  useEffect(() => {
    const stateToSave = {
      batchId,
      processingComplete
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
  }, [batchId, processingComplete]);

  const addFiles = useCallback((newFiles: FileWithPreview[]) => {
    setFiles(prev => [...prev, ...newFiles]);
  }, []);

  const removeFile = useCallback((id: string) => {
    setFiles(prev => prev.filter(file => file.id !== id));
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
    
    // Clear local storage
    localStorage.removeItem(STORAGE_KEY);
    
    // Stop polling if it's active
    if (statusPolling) {
      clearInterval(statusPolling);
      setStatusPolling(null);
    }
    
    setProgress(0);
    toastShownRef.current = false;
    initialCheckDoneRef.current = true; // Prevent initial check after clearing
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
    setProcessingComplete(false);
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
      
      setBatchId(response.batch_id);
  
      // Start polling for status
      const polling = setInterval(() => {
        pollBatchStatus(response.batch_id);
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
  }, [files, toast, stopPolling, getToken]);  

  const pollBatchStatus = async (batchId: string) => {
    if (!batchId) return;
    
    try {
      const token = await getToken();
      if (!token) {
        console.error('No token available for status check');
        return;
      }

      const batchStatus = await getBatchStatus(batchId, token);
      const status = batchStatus.status;
      
      // Calculate overall progress
      if (batchStatus.job_details && batchStatus.job_details.length > 0) {
        const totalProgress = batchStatus.job_details.reduce((sum, job) => {
          return sum + (job.progress || 0);
        }, 0);
        
        const overallProgress = Math.round(totalProgress / batchStatus.job_details.length);
        setProgress(overallProgress);
      }
      
      // Check if processing is complete or failed
      const isFinished = ['completed', 'failed', 'error', 'partially_completed'].includes(status);
      
      // Stop polling if the process is finished
      if (isFinished) {
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
    
      // Set token in request headers using a fetch
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
          const a = document.createElement('a');
          a.href = url;
          a.download = `videos_${batchId}.zip`;
          document.body.appendChild(a);
          a.click();
          a.remove();
          window.URL.revokeObjectURL(url);
        })
        .catch(err => {
          console.error('Download error:', err);
          toast({
            title: "Download failed",
            description: "There was an error downloading your video.",
            variant: "destructive"
          });
        });
    } catch (error) {
      console.error('Token retrieval error:', error);
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
      if (statusPolling) {
        clearInterval(statusPolling);
      }
    };
  }, [statusPolling]);

  // Check status on initial load if we have a batchId from localStorage
  useEffect(() => {
    // Only run this once and if we have a batchId but no active polling
    if (batchId && !initialCheckDoneRef.current && !statusPolling) {
      initialCheckDoneRef.current = true;
      
      // Check if processing was already complete
      const savedState = localStorage.getItem(STORAGE_KEY);
      if (savedState) {
        try {
          const parsed = JSON.parse(savedState);
          setProcessingComplete(!!parsed.processingComplete);
          
          // Only start polling if processing wasn't complete
          if (!parsed.processingComplete) {
            setIsUploading(true);
            pollBatchStatus(batchId);
          }
        } catch (e) {
          console.error("Error parsing saved state", e);
          pollBatchStatus(batchId);
        }
      } else {
        pollBatchStatus(batchId);
      }
    }
  }, [batchId, statusPolling]);

  return (
    <div className="w-full max-w-3xl mx-auto space-y-8">
      {/* <AspectRatioSelector 
        aspectRatio={aspectRatio}
        setAspectRatio={setAspectRatio}
        disabled={isUploading}
      /> */}
      
      {(!batchId || !processingComplete) && (
        <FileDropZone 
          onFilesAdded={addFiles}
          isUploading={isUploading}
          hasFiles={files.length > 0}
        />
      )}

      {files.length > 0 && (
        <FileList 
          files={files}
          onRemoveFile={removeFile}
          onUpdatePrompt={updateFilePrompt}
          onClearAll={clearFiles}
          isUploading={isUploading}
          hasVideo={!!batchId && processingComplete}
        />
      )}

      {(files.length > 0 || batchId) && (
        <UploadProgress 
          isUploading={isUploading}
          progress={progress}
          batchId={batchId}
          onDownload={downloadVideo}
          onUpload={uploadFiles}
        />
      )}
    </div>
  );
};

export default FileUploader;
