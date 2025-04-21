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
  outputFilename = "property_videos", 
  settings = { cfg: 0.6, time: 5, transitionTime: 1, isCombined: false }  // Make sure isCombined is included here
}) => {
  const { toast } = useToast();
  const { getToken, isAuthenticated } = useAuth();
  const toastShownRef = useRef(false);

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
  
  const getInitialState = () => {
    if (!isAuthenticated) {
      return {
        batchId: null,
        processingComplete: false,
        files: [],
        progress: 0,
      };
    }

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

  const maxFiles = settingsContext === "single" ? 1 : 3;
  const showIndividualPrompts = settingsContext === "multi" && !useUniformSettings;

  const statusPollingInterval = 5000;

  useEffect(() => {
    if (!isAuthenticated) {
      clearFiles();
      return;
    }

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
  }, [batchId, processingComplete, files, progress, isAuthenticated]);

  const addFiles = useCallback((newFiles: FileWithPreview[]) => {
    const currentPrompt = customPrompt || globalPrompt || "";
    setFiles(prev => {
      const newFilesWithPrompt = newFiles.map(file => ({
        ...file,
        prompt: currentPrompt,
        cfg: settings.cfg,
        time: settings.time
      }));

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
  
      const response = await uploadBatch(files, token, settings.isCombined);
      
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
  }, [files, toast, stopPolling, getToken, showIndividualPrompts, settings.isCombined]);

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
      
      // Simplified status check - only 'completed' or 'processing'
      if (status === 'completed') {
        stopPolling();
        setIsUploading(false);
        setProcessingComplete(true);
        
        if (!toastShownRef.current) {
          toast({
            title: "Property video created!",
            description: "Your property tour video is ready to download",
          });
          toastShownRef.current = true;
        }
      } else {
        // Assume any other status is 'processing'
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
      link.href = await downloadUrl;
      link.setAttribute('download', '');
      link.setAttribute('target', '_blank');
      
      fetch(await downloadUrl, {
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
          // Use the custom filename if provided, otherwise use default with batch ID
          const filename = outputFilename ? `${outputFilename}.zip` : `property_videos_${batchId}.zip`;
          link.setAttribute('download', filename);
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
  }, [batchId, getToken, toast, outputFilename]);

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
        // Simplified status check - only 'completed' or 'processing'
        const isProcessing = status !== 'completed';
        setIsUploading(isProcessing);
        
        if (batchStatus.job_details && batchStatus.job_details.length > 0) {
          const totalProgress = batchStatus.job_details.reduce((sum, job) => {
            return sum + (job.progress || 0);
          }, 0);
          
          const overallProgress = Math.round(totalProgress / batchStatus.job_details.length);
          setProgress(overallProgress);
        }
        
        if (status === 'completed') {
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
            return {
              file,
              id,
              preview: URL.createObjectURL(file),
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
