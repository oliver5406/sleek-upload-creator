
import React, { useState, useCallback, useRef } from 'react';
import { Cloud, X, Upload, Camera, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/components/ui/use-toast';
import FileItem from '@/components/FileItem';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

type FileWithPreview = {
  file: File;
  id: string;
  preview: string;
  type?: 'exterior' | 'interior' | 'feature';
};

const FileUploader = () => {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [propertyDetails, setPropertyDetails] = useState({
    address: '',
    bedrooms: '3',
    bathrooms: '2',
    price: '',
    sqft: '',
    duration: 30,
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const addFiles = useCallback((newFiles: FileList | null) => {
    if (!newFiles) return;

    const validImageTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp', 'image/gif'];
    
    const newFilesArray = Array.from(newFiles)
      .filter(file => validImageTypes.includes(file.type))
      .map(file => {
        const id = Math.random().toString(36).substring(2, 9);
        return {
          file,
          id,
          preview: URL.createObjectURL(file),
          type: 'exterior' as 'exterior' | 'interior' | 'feature'
        };
      });

    if (newFilesArray.length === 0) {
      toast({
        title: "Invalid files",
        description: "Please upload image files only (JPG, PNG, WebP, GIF).",
        variant: "destructive"
      });
      return;
    }

    setFiles(prev => [...prev, ...newFilesArray]);
  }, [toast]);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    addFiles(e.dataTransfer.files);
  }, [addFiles]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    addFiles(e.target.files);
    // Reset the input value so the same file can be uploaded again if removed
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [addFiles]);

  const handleBrowseFiles = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const removeFile = useCallback((id: string) => {
    setFiles(prev => {
      const updatedFiles = prev.filter(file => file.id !== id);
      return updatedFiles;
    });
  }, []);

  const updateFileType = useCallback((id: string, type: 'exterior' | 'interior' | 'feature') => {
    setFiles(prev => 
      prev.map(file => 
        file.id === id ? { ...file, type } : file
      )
    );
  }, []);

  const clearFiles = useCallback(() => {
    setFiles([]);
    setVideoUrl(null);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPropertyDetails(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setPropertyDetails(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSliderChange = (value: number[]) => {
    setPropertyDetails(prev => ({
      ...prev,
      duration: value[0]
    }));
  };

  const mockApiCall = useCallback(() => {
    if (files.length === 0) {
      toast({
        title: "No files selected",
        description: "Please add at least one property image to proceed.",
        variant: "destructive"
      });
      return;
    }

    if (!propertyDetails.address) {
      toast({
        title: "Missing information",
        description: "Please enter the property address.",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);
    setProgress(0);

    // Mock API call with progress updates
    let progressValue = 0;
    const interval = setInterval(() => {
      progressValue += Math.random() * 10;
      
      if (progressValue >= 100) {
        progressValue = 100;
        clearInterval(interval);
        
        // Simulate API response delay
        setTimeout(() => {
          setIsUploading(false);
          setVideoUrl('https://example.com/property-video.mp4');
          toast({
            title: "Property video created!",
            description: "Your property tour video is ready to download",
          });
        }, 500);
      }
      
      setProgress(progressValue);
    }, 500);
  }, [files, propertyDetails, toast]);

  const downloadVideo = useCallback(() => {
    // In a real app, this would trigger the actual file download
    toast({
      title: "Download started",
      description: "Your property video will be downloaded shortly",
    });
  }, [toast]);

  return (
    <div className="w-full max-w-3xl mx-auto space-y-8">
      {!videoUrl && (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="address">Property Address</Label>
              <Input 
                id="address" 
                name="address" 
                value={propertyDetails.address} 
                onChange={handleInputChange} 
                placeholder="123 Main St, City, State"
              />
            </div>
            <div>
              <Label htmlFor="price">Listing Price</Label>
              <Input 
                id="price" 
                name="price" 
                value={propertyDetails.price} 
                onChange={handleInputChange} 
                placeholder="$450,000"
              />
            </div>
          </div>
          
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <Label htmlFor="bedrooms">Bedrooms</Label>
              <Select 
                value={propertyDetails.bedrooms} 
                onValueChange={(value) => handleSelectChange('bedrooms', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1</SelectItem>
                  <SelectItem value="2">2</SelectItem>
                  <SelectItem value="3">3</SelectItem>
                  <SelectItem value="4">4</SelectItem>
                  <SelectItem value="5">5+</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="bathrooms">Bathrooms</Label>
              <Select 
                value={propertyDetails.bathrooms} 
                onValueChange={(value) => handleSelectChange('bathrooms', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1</SelectItem>
                  <SelectItem value="1.5">1.5</SelectItem>
                  <SelectItem value="2">2</SelectItem>
                  <SelectItem value="2.5">2.5</SelectItem>
                  <SelectItem value="3">3</SelectItem>
                  <SelectItem value="3.5">3.5+</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="sqft">Square Footage</Label>
              <Input 
                id="sqft" 
                name="sqft" 
                value={propertyDetails.sqft} 
                onChange={handleInputChange} 
                placeholder="2,200"
              />
            </div>
          </div>
          
          <div>
            <div className="flex justify-between mb-2">
              <Label>Video Duration (seconds)</Label>
              <span className="text-sm font-medium">{propertyDetails.duration}s</span>
            </div>
            <Slider 
              defaultValue={[30]} 
              max={60} 
              step={5} 
              min={15} 
              onValueChange={handleSliderChange}
            />
          </div>
        </div>
      )}

      <div
        className={`relative flex flex-col items-center justify-center w-full min-h-[300px] p-8 border-2 border-dashed rounded-xl transition-all ${
          isDragging ? 'border-primary bg-primary/5' : 'border-muted'
        }`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleFileChange}
          ref={fileInputRef}
        />

        <div className="flex flex-col items-center gap-4 text-center">
          <div className="p-4 rounded-full bg-muted/50">
            <Camera className="w-12 h-12 text-primary" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-semibold">Upload Property Images</h3>
            <p className="text-muted-foreground">Drag and drop your best property photos</p>
          </div>
          <Button
            variant="outline"
            onClick={handleBrowseFiles}
            className="mt-2"
            disabled={isUploading}
          >
            <Upload className="mr-2 h-4 w-4" />
            Browse Files
          </Button>
        </div>
      </div>

      {files.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">
              {files.length} {files.length === 1 ? 'Image' : 'Images'} Selected
            </h3>
            <Button
              variant="outline"
              size="sm"
              onClick={clearFiles}
              disabled={isUploading}
            >
              <X className="mr-2 h-4 w-4" />
              Clear All
            </Button>
          </div>

          <div className="grid gap-3 max-h-[300px] overflow-y-auto p-1">
            {files.map((file) => (
              <div key={file.id} className="flex items-center justify-between border rounded-lg p-2">
                <FileItem
                  file={file.file}
                  id={file.id}
                  preview={file.preview}
                  onRemove={removeFile}
                  disabled={isUploading}
                />
                <Select 
                  value={file.type} 
                  onValueChange={(value: 'exterior' | 'interior' | 'feature') => updateFileType(file.id, value)}
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Image type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="exterior">Exterior</SelectItem>
                    <SelectItem value="interior">Interior</SelectItem>
                    <SelectItem value="feature">Feature</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>

          {isUploading ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Creating property video...</span>
                <span className="text-sm font-medium">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          ) : videoUrl ? (
            <Button className="w-full" onClick={downloadVideo}>
              <Download className="mr-2 h-4 w-4" />
              Download Property Video
            </Button>
          ) : (
            <Button className="w-full" onClick={mockApiCall}>
              <Home className="mr-2 h-4 w-4" />
              Create Property Video
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default FileUploader;
