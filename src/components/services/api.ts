// src/services/api.ts
import axios from 'axios';
import { BatchResponse, BatchStatus, FileWithPreview } from '@/components/FileUploader/types';

// API base URL - change this to your Flask backend URL
export const API_URL = 'http://localhost:5000/api';

export const uploadBatch = async (
  files: FileWithPreview[]
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

  const response = await axios.post<BatchResponse>(
    `${API_URL}/upload-batch`, 
    formData, 
    {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }
  );

  return response.data;
};

export const getBatchStatus = async (batchId: string): Promise<BatchStatus> => {
  const response = await axios.get<BatchStatus>(`${API_URL}/batch-status/${batchId}`);
  return response.data;
};

export const getDownloadUrl = (batchId: string): string => {
  return `${API_URL}/download-all/${batchId}`;
};