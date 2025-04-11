
import React from 'react';
import { Clock, ListFilter, SlidersHorizontal, Settings, ImageIcon, Images } from 'lucide-react';
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

// Schema for image settings form
const imageSettingsSchema = z.object({
  context: z.enum(["single", "multi"]),
  time: z.number().min(1).max(60),
  prompt: z.string().min(1),
  cfg: z.number().min(0).max(1),
  useUniformSettings: z.boolean().default(true),
  transitionTime: z.number().min(0.1).max(10),
});

type ImageSettingsFormValues = z.infer<typeof imageSettingsSchema>;

// Sample prompts
const SAMPLE_PROMPTS = [
  "Modern luxury home interior",
  "Spacious open concept kitchen",
  "Cozy living room with fireplace",
  "Elegant master bedroom suite",
  "Beautiful garden landscape",
  "Swimming pool with patio area",
];

interface SettingsPanelProps {
  isMenuOpen: boolean;
  onSettingsChange: (settings: ImageSettingsFormValues) => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ isMenuOpen }) => {
  const form = useForm<ImageSettingsFormValues>({
    resolver: zodResolver(imageSettingsSchema),
    defaultValues: {
      context: "single",
      time: 5,
      prompt: "Modern luxury home interior",
      cfg: 0.7,
      useUniformSettings: true,
      transitionTime: 1,
    },
  });

  const currentContext = form.watch("context");
  const useUniformSettings = form.watch("useUniformSettings");

  return (
    <div className={`
      md:w-80 bg-card rounded-lg border shadow-sm p-4
      ${isMenuOpen ? 'block' : 'hidden md:block'}
      md:sticky md:top-6 md:h-fit
    `}>
      <Form {...form}>
        <div className="space-y-6">
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
                      <div className="flex items-center gap-3">
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="sm"
                          onClick={() => form.setValue("time", 5)}
                          className={field.value === 5 ? "bg-primary text-primary-foreground" : ""}
                        >
                          5s
                        </Button>
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="sm"
                          onClick={() => form.setValue("time", 10)}
                          className={field.value === 10 ? "bg-primary text-primary-foreground" : ""}
                        >
                          10s
                        </Button>
                        <FormControl>
                          <Input 
                            type="number" 
                            {...field} 
                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                            min={1}
                            max={60}
                            className="w-20"
                          />
                        </FormControl>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="prompt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <ListFilter className="h-4 w-4" /> Prompt
                      </FormLabel>
                      <FormControl>
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
                      </FormControl>
                      <FormControl>
                        <Input
                          placeholder="Or type your own prompt..."
                          {...field}
                          className="mt-2"
                        />
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
                            <FormLabel>Time per Image (seconds)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                {...field} 
                                onChange={(e) => field.onChange(parseInt(e.target.value))}
                                min={1}
                                max={60}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="prompt"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Global Prompt</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter prompt for all images..."
                                {...field}
                              />
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
