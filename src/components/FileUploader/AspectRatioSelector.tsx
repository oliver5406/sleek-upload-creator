// src/components/FileUploader/AspectRatioSelector.tsx
import React from 'react';
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuItem 
} from "@/components/ui/dropdown-menu";

interface AspectRatioSelectorProps {
  aspectRatio: string;
  setAspectRatio: (ratio: string) => void;
  disabled?: boolean;
}

const AspectRatioSelector: React.FC<AspectRatioSelectorProps> = ({ 
  aspectRatio, 
  setAspectRatio, 
  disabled = false 
}) => {
  return (
    <div className="flex items-center space-x-4">
      <label htmlFor="aspect-ratio">Aspect Ratio:</label>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="rounded-md border p-2" disabled={disabled}>
            {aspectRatio}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onSelect={() => setAspectRatio("16:9")}>
            16:9 (Widescreen)
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setAspectRatio("4:3")}>
            4:3 (Standard)
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setAspectRatio("1:1")}>
            1:1 (Square)
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setAspectRatio("9:16")}>
            9:16 (Vertical)
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default AspectRatioSelector;