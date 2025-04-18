import React from 'react';
import { Clock, ListFilter, SlidersHorizontal, Settings, ImageIcon, Images, FileText } from 'lucide-react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel
} from "@/components/ui/form";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { 
  Collapsible, 
  CollapsibleContent,
  CollapsibleTrigger
} from "@/components/ui/collapsible";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

// Schema for image settings form
const imageSettingsSchema = z.object({
  context: z.enum(["single", "multi"]),
  time: z.number().min(1).max(60),
  promptSource: z.enum(["preset", "custom"]).default("preset"),
  prompt: z.string().min(1),
  cfg: z.number().min(0).max(1),
  useUniformSettings: z.boolean().default(true),
  transitionTime: z.number().min(0.1).max(10),
  outputFilename: z.string().default("my_video"),
});

type ImageSettingsFormValues = z.infer<typeof imageSettingsSchema>;

// Sample generic property video generation prompts
const SAMPLE_PROMPTS = [
  "Gentle camera movement across the room",
  "Slow reveal of the property",
  "Smooth indoor-to-outdoor transition",
  "Gradual zoom highlighting key features",
  "Soft panning motion showing the space",
  "Subtle movement through the interior",
  "Flowing camera path around the exterior",
  "Natural lighting transition throughout the day",
];

interface SettingsPanelProps {
  isMenuOpen: boolean;
  onSettingsChange: (settings: ImageSettingsFormValues) => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ isMenuOpen, onSettingsChange }) => {
  const form = useForm<ImageSettingsFormValues>({
    resolver: zodResolver(imageSettingsSchema),
    defaultValues: {
      context: "single",
      time: 5,
      promptSource: "preset",
      prompt: "Generate a smooth, dynamic video with natural motion",
      cfg: 0.7,
      useUniformSettings: true,
      transitionTime: 1,
      outputFilename: "my_video", // Make sure this is included
    },
  });

  const currentContext = form.watch("context");
  const useUniformSettings = form.watch("useUniformSettings");
  const promptSource = form.watch("promptSource");

  React.useEffect(() => {
    const subscription = form.watch((value) => {
      onSettingsChange(value as ImageSettingsFormValues);
    });
    return () => subscription.unsubscribe();
  }, [form, onSettingsChange]);

  return (
    <div className={`
      md:w-80 bg-card rounded-lg border shadow-sm p-4
      ${isMenuOpen ? 'block' : 'hidden md:block'}
      md:sticky md:top-6 md:h-fit
    `}>
      <Form {...form}>
        <div className="space-y-6">
          {/* Existing context buttons */}
          <div className="flex items-center justify-center gap-2 mb-4">
            <Button
              type="button"
              variant={currentContext === "single" ? "default" : "outline"}
              size="sm"
              className="flex-1 gap-1"
              onClick={() => form.setValue("context", "single")}
            >
              <ImageIcon className="h-4 w-4" />
              Single Image
            </Button>
            <Button
              type="button"
              variant={currentContext === "multi" ? "default" : "outline"}
              size="sm"
              className="flex-1 gap-1"
              onClick={() => form.setValue("context", "multi")}
            >
              <Images className="h-4 w-4" />
              Multi Image
            </Button>
          </div>

          {/* Output filename field moved below the context buttons */}
          <FormField
            control={form.control}
            name="outputFilename"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <FileText className="h-4 w-4" /> Output Filename
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter output filename"
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <div className="space-y-4">
            {currentContext === "single" ? (
              <>
                <FormField
                  control={form.control}
                  name="time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Clock className="h-4 w-4" /> Time (seconds)
                      </FormLabel>
                      <div className="flex items-center justify-center gap-4">
                        <Button 
                          type="button" 
                          variant={field.value === 5 ? "default" : "outline"}
                          size="sm"
                          onClick={() => form.setValue("time", 5)}
                        >
                          5s
                        </Button>
                        <Button 
                          type="button" 
                          variant={field.value === 10 ? "default" : "outline"}
                          size="sm"
                          onClick={() => form.setValue("time", 10)}
                        >
                          10s
                        </Button>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="promptSource"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel className="flex items-center gap-2">
                        <ListFilter className="h-4 w-4" /> Prompt Source
                      </FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          value={field.value}
                          className="flex flex-col space-y-1"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="preset" id="preset" />
                            <label htmlFor="preset" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                              Use preset prompt
                            </label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="custom" id="custom" />
                            <label htmlFor="custom" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                              Custom prompt
                            </label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="prompt"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        {promptSource === "preset" ? (
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                            defaultValue={field.value}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select a prompt" />
                            </SelectTrigger>
                            <SelectContent>
                              {SAMPLE_PROMPTS.map((prompt) => (
                                <SelectItem key={prompt} value={prompt}>
                                  {prompt}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <Input
                            placeholder="Type your custom prompt..."
                            {...field}
                          />
                        )}
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="cfg"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <SlidersHorizontal className="h-4 w-4" /> CFG Scale ({field.value.toFixed(1)})
                      </FormLabel>
                      <FormControl>
                        <Slider
                          min={0}
                          max={1}
                          step={0.1}
                          value={[field.value]}
                          onValueChange={(value) => field.onChange(value[0])}
                          className="py-4"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </>
            ) : (
              <>
                <FormField
                  control={form.control}
                  name="transitionTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Clock className="h-4 w-4" /> Transition Time (seconds)
                      </FormLabel>
                      <FormControl>
                        <Slider
                          min={0.1}
                          max={10}
                          step={0.1}
                          value={[field.value]}
                          onValueChange={(value) => field.onChange(value[0])}
                          className="py-4"
                        />
                      </FormControl>
                      <p className="text-xs text-muted-foreground">{field.value.toFixed(1)}s</p>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="useUniformSettings"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel>Use same settings for all images</FormLabel>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {useUniformSettings && (
                  <Collapsible>
                    <CollapsibleTrigger asChild>
                      <Button variant="outline" size="sm" className="flex w-full justify-between">
                        <span>Global Settings</span>
                        <Settings className="h-4 w-4" />
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-4 mt-4">
                      <FormField
                        control={form.control}
                        name="time"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Duration (Seconds)</FormLabel>
                            <div className="flex items-center justify-center gap-4">
                              <Button 
                                type="button" 
                                variant={field.value === 5 ? "default" : "outline"}
                                size="sm"
                                onClick={() => form.setValue("time", 5)}
                              >
                                5s
                              </Button>
                              <Button 
                                type="button" 
                                variant={field.value === 10 ? "default" : "outline"}
                                size="sm"
                                onClick={() => form.setValue("time", 10)}
                              >
                                10s
                              </Button>
                            </div>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="promptSource"
                        render={({ field }) => (
                          <FormItem className="space-y-3">
                            <FormLabel>Prompt Source</FormLabel>
                            <FormControl>
                              <RadioGroup
                                onValueChange={field.onChange}
                                value={field.value}
                                className="flex flex-col space-y-1"
                              >
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="preset" id="global-preset" />
                                  <label htmlFor="global-preset" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                    Use preset prompt
                                  </label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="custom" id="global-custom" />
                                  <label htmlFor="global-custom" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                    Custom prompt
                                  </label>
                                </div>
                              </RadioGroup>
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="prompt"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              {promptSource === "preset" ? (
                                <Select
                                  onValueChange={field.onChange}
                                  value={field.value}
                                  defaultValue={field.value}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select a prompt" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {SAMPLE_PROMPTS.map((prompt) => (
                                      <SelectItem key={prompt} value={prompt}>
                                        {prompt}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              ) : (
                                <Input
                                  placeholder="Type your custom prompt..."
                                  {...field}
                                />
                              )}
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="cfg"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>CFG Scale ({field.value.toFixed(1)})</FormLabel>
                            <FormControl>
                              <Slider
                                min={0}
                                max={1}
                                step={0.1}
                                value={[field.value]}
                                onValueChange={(value) => field.onChange(value[0])}
                                className="py-4"
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </CollapsibleContent>
                  </Collapsible>
                )}
              </>
            )}
          </div>
        </div>
      </Form>
    </div>
  );
};

export default SettingsPanel;
export type { ImageSettingsFormValues };