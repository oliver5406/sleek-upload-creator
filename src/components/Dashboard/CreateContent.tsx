
import React, { useState, useEffect } from 'react';
import { Settings } from 'lucide-react';
import { Button } from "@/components/ui/button";
import FileUploader from '@/components/FileUploader/index';
import SettingsPanel, { ImageSettingsFormValues } from './SettingsPanel';
import { FileWithPreview } from '@/components/FileUploader/types';

const CreateContent: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [settings, setSettings] = useState<ImageSettingsFormValues>({
    context: "single",
    time: 5,
    promptSource: "preset",
    prompt: "Modern luxury home interior",
    cfg: 0.7,
    useUniformSettings: true,
    transitionTime: 1,
  });

  const handleSettingsChange = (newSettings: ImageSettingsFormValues) => {
    setSettings(newSettings);
    
    // Update file prompts when prompt changes in settings
    if (files.length > 0 && newSettings.prompt !== settings.prompt) {
      const updatedFiles = files.map(file => ({
        ...file,
        prompt: newSettings.prompt
      }));
      setFiles(updatedFiles);
    }
  };

  // Handle files updates from FileUploader
  const handleFilesUpdate = (updatedFiles: FileWithPreview[]) => {
    setFiles(updatedFiles);
  };

  // Get the current prompt from files (if they exist)
  const getCurrentPrompt = () => {
    if (files.length > 0 && files[0].prompt) {
      return files[0].prompt;
    }
    return settings.prompt;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-6 relative">
        <Button 
          variant="outline" 
          size="sm" 
          className="md:hidden mb-4 flex items-center"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <Settings className="mr-2 h-4 w-4" />
          {isMenuOpen ? 'Hide Settings' : 'Show Settings'}
        </Button>
        
        <SettingsPanel 
          isMenuOpen={isMenuOpen} 
          onSettingsChange={handleSettingsChange} 
          currentPrompt={getCurrentPrompt()}
        />
        
        <div className="flex-1">
          <FileUploader 
            settingsContext={settings.context}
            useUniformSettings={settings.useUniformSettings}
            onFilesChanged={handleFilesUpdate}
            globalPrompt={settings.prompt}
          />
        </div>
      </div>
    </div>
  );
};

export default CreateContent;
