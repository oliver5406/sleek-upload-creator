// src/services/api.ts
import axios from 'axios';
import { BatchResponse, BatchStatus, FileWithPreview } from '@/components/FileUploader/types';

// API base URL - change this to your Flask backend URL
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Create an axios instance
const apiClient = axios.create({
  baseURL: API_URL
});

// Function to set the auth token
export const setAuthToken = (token: string) => {
  apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
};

// Function to clear the auth token
export const clearAuthToken = () => {
  delete apiClient.defaults.headers.common['Authorization'];
};

export const uploadBatch = async (
  files: FileWithPreview[],
  token: string, // The token you will pass to the function
  isCombined: boolean = false // New flag for combining videos
): Promise<BatchResponse> => {
  const formData = new FormData();
  const fileDetails = [];

  files.forEach(fileObj => {
    formData.append('files[]', fileObj.file);
    fileDetails.push({
      filename: fileObj.file.name,
      prompt: fileObj.prompt,
      cfg: fileObj.cfg,
      time: fileObj.time
    });
  });

  formData.append('file_details', JSON.stringify(fileDetails));
  // Add the isCombined flag to the request
  formData.append('is_combined', String(isCombined));

  const response = await apiClient.post<BatchResponse>(
    '/upload-batch', 
    formData, 
    {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${token}`
      }
    }
  );

  return response.data;
};

export const getBatchStatus = async (
  batchId: string,
  token: string
): Promise<BatchStatus> => {
  const response = await apiClient.get<BatchStatus>(
    `/batch-status/${batchId}`,
    {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );
  return response.data;
};

export const getDownloadUrl = async (batchId: string): Promise<string> => {
  // Simulate a small delay to ensure the URL is ready
  // You can remove this if your backend already has a natural delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return `${API_URL}/download-all/${batchId}`;
};