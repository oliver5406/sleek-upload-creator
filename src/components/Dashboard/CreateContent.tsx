
import React, { useState, useEffect } from 'react';
import { Settings } from 'lucide-react';
import { Button } from "@/components/ui/button";
import FileUploader from '@/components/FileUploader/index';
import SettingsPanel, { ImageSettingsFormValues } from './SettingsPanel';
import { useAuth } from '@/context/AuthContext';

const CreateContent: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [settings, setSettings] = useState<ImageSettingsFormValues>({
    context: "single",
    time: 5,
    promptSource: "preset",
    prompt: "Modern luxury home interior",
    cfg: 0.6,
    useUniformSettings: true,
    transitionTime: 1,
  });

  // Clear local storage when component mounts or authentication changes
  useEffect(() => {
    if (isAuthenticated !== undefined) {
      localStorage.removeItem('fileUploader_state');
    }
  }, [isAuthenticated]);

  const handleSettingsChange = (newSettings: ImageSettingsFormValues) => {
    setSettings(newSettings);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row gap-6 relative">
        <Button 
          variant="outline" 
          size="sm" 
          className="lg:hidden mb-4 flex items-center"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <Settings className="mr-2 h-4 w-4" />
          {isMenuOpen ? 'Hide Settings' : 'Show Settings'}
        </Button>
        
        <div className={`
          ${isMenuOpen ? 'block' : 'hidden lg:block'}
          lg:sticky lg:top-6 lg:self-start
        `}>
          <SettingsPanel 
            isMenuOpen={isMenuOpen} 
            onSettingsChange={handleSettingsChange}
          />
        </div>
        
        <div className="flex-1">
          <FileUploader 
            settingsContext={settings.context}
            useUniformSettings={settings.useUniformSettings}
            globalPrompt={settings.promptSource === "preset" ? settings.prompt : ""}
            customPrompt={settings.promptSource === "custom" ? settings.prompt : ""}
            settings={{
              cfg: settings.cfg,
              time: settings.time,
              transitionTime: settings.transitionTime
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default CreateContent;
