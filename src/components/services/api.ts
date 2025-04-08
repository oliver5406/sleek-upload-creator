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
  token: string // The token you will pass to the function
): Promise<BatchResponse> => {
  const formData = new FormData();
  const fileDetails = [];

  files.forEach(fileObj => {
    formData.append('files[]', fileObj.file);
    fileDetails.push({
      filename: fileObj.file.name,
      prompt: fileObj.prompt
    });
  });

  formData.append('file_details', JSON.stringify(fileDetails));

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

export const getDownloadUrl = (batchId: string): string => {
  return `${API_URL}/download-all/${batchId}`;
};


