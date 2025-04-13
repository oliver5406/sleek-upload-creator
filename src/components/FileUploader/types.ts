
// src/components/FileUploader/types.ts
import { ReactNode } from 'react';

export interface FileWithPreview {
  id: string;
  file: File;
  preview: string;
  prompt: string;
}

export interface FileUploaderProps {
  settingsContext: "single" | "multi";
  useUniformSettings: boolean;
  onFilesChanged?: (files: FileWithPreview[]) => void;
  globalPrompt?: string;
}
