
import { ReactNode } from 'react';

export interface FileWithPreview {
  id: string;
  file: File;
  preview: string;
  prompt: string;
}

export interface BatchResponse {
  batch_id: string;
  status: string;
  message?: string;
}

export interface BatchStatus {
  status: string;
  job_details?: {
    progress?: number;
    status?: string;
    job_id?: string;
  }[];
  message?: string;
}

export interface FileUploaderProps {
  settingsContext: "single" | "multi";
  useUniformSettings: boolean;
  onFilesChanged?: (files: FileWithPreview[]) => void;
  globalPrompt?: string;
}
