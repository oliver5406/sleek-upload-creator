// src/components/FileUploader/types.ts
export type FileWithPreview = {
    file: File;
    id: string;
    preview: string;
    prompt?: string;
    cfg?: number;
    time?: number;
};
  
export type BatchStatus = {
    status: string;
    job_details: Array<{
      filename: string;
      status: string;
      progress: number;
      error?: string;
      video_url?: string;
      job_id: string;
    }>;
};
  
export interface BatchResponse {
    batch_id: string;
}

export interface FileUploaderProps {
    settingsContext?: "single" | "multi";
    useUniformSettings?: boolean;
    globalPrompt?: string;
    customPrompt?: string;
    outputFilename?: string; // Add this line
    settings?: {
        cfg: number;
        time: number;
        transitionTime?: number;
    };
}
