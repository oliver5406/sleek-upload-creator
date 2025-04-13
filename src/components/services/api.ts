// src/components/services/api.ts
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
  token: string
): Promise<BatchResponse> => {
  const formData = new FormData();
  const fileDetails = [];

  // Enhanced logging to better debug the prompt issue
  console.log("📤 Starting upload with files:", files.length);
  console.log("📝 File prompts being sent:", files.map(f => ({
    name: f.file.name,
    prompt: f.prompt || "NO PROMPT SET"
  })));

  files.forEach(fileObj => {
    formData.append('files[]', fileObj.file);
    // Ensure each file has a prompt
    const prompt = fileObj.prompt || 'Modern luxury home interior';
    fileDetails.push({
      filename: fileObj.file.name,
      prompt: prompt
    });
  });

  // Log the file details being sent to API
  console.log("🔍 File details object being sent to API:", fileDetails);
  
  formData.append('file_details', JSON.stringify(fileDetails));

  // Log raw form data content for debugging
  console.log("📦 FormData created with file_details appended");
  
  // Add a direct header check
  console.log("🔐 Auth header will be:", `Bearer ${token.substring(0, 5)}...`);

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

  console.log("✅ Upload response received:", response.data);
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
