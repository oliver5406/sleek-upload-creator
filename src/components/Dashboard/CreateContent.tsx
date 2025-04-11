
import React, { useState } from 'react';
import { Settings } from 'lucide-react';
import { Button } from "@/components/ui/button";
import FileUploader from '@/components/FileUploader/index';
import SettingsPanel, { ImageSettingsFormValues } from './SettingsPanel';

const CreateContent: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [settings, setSettings] = useState<ImageSettingsFormValues>({
    context: "single",
    time: 5,
    prompt: "Modern luxury home interior",
    cfg: 0.7,
    useUniformSettings: true,
    transitionTime: 1,
  });

  const handleSettingsChange = (newSettings: ImageSettingsFormValues) => {
    setSettings(newSettings);
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
        />
        
        <div className="flex-1">
          <FileUploader 
            settingsContext={settings.context}
            useUniformSettings={settings.useUniformSettings}
          />
        </div>
      </div>
    </div>
  );
};

export default CreateContent;
