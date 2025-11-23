export interface GeneratedResult {
  html: string;
  react: string;
  explanation: string;
}

export enum AppState {
  IDLE = 'IDLE',
  ANALYZING = 'ANALYZING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
  REFINING = 'REFINING', // New state for iterative updates
}

export interface UploadedImage {
  file: File;
  previewUrl: string;
  base64: string;
}
