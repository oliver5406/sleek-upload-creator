
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import NavBar from '@/components/NavBar';
import FileUploader from '@/components/FileUploader/index';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Download, Play, History, Settings, Plus, Image as ImageIcon, Images, Clock, ListFilter, SlidersHorizontal } from 'lucide-react';
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
import { 
  Collapsible, 
  CollapsibleContent,
  CollapsibleTrigger
} from "@/components/ui/collapsible";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

const DASHBOARD_TAB_KEY = 'dashboard_active_tab';

const imageSettingsSchema = z.object({
  context: z.enum(["single", "multi"]),
  time: z.number().min(1).max(60),
  prompt: z.string().min(1),
  cfg: z.number().min(0).max(1),
  useUniformSettings: z.boolean().default(true),
  transitionTime: z.number().min(0.1).max(10),
});

type ImageSettingsFormValues = z.infer<typeof imageSettingsSchema>;

const SAMPLE_PROMPTS = [
  "Modern luxury home interior",
  "Spacious open concept kitchen",
  "Cozy living room with fireplace",
  "Elegant master bedroom suite",
  "Beautiful garden landscape",
  "Swimming pool with patio area",
];

const Dashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem(DASHBOARD_TAB_KEY) || 'create';
  });

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
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

  useEffect(() => {
    localStorage.setItem(DASHBOARD_TAB_KEY, activeTab);
  }, [activeTab]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      
      <main className="flex-1 container py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-2">Welcome, {user.name}!</h2>
          <p className="text-muted-foreground">
            Create and manage your property videos. Upload images from your listings to generate engaging video tours.
          </p>
        </div>
        
        <Tabs 
          defaultValue={activeTab}
          onValueChange={(value) => setActiveTab(value)}
        >
          <TabsList className="mb-6">
            <TabsTrigger value="create">Create New Video</TabsTrigger>
            <TabsTrigger value="recent">Recent Videos</TabsTrigger>
          </TabsList>
          
          <TabsContent value="create" className="space-y-6">
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
              
              <div className="flex-1">
                <FileUploader 
                  settingsContext={currentContext} 
                  useUniformSettings={useUniformSettings} 
                />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="recent">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>123 Main Street</CardTitle>
                  <CardDescription>4 bed, 3 bath luxury home</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="aspect-video bg-muted rounded-md flex items-center justify-center">
                    <Play className="h-12 w-12 text-muted-foreground opacity-50" />
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" size="sm">
                    <History className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                  <Button size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                </CardFooter>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>456 Park Avenue</CardTitle>
                  <CardDescription>Modern 2 bed apartment</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="aspect-video bg-muted rounded-md flex items-center justify-center">
                    <Play className="h-12 w-12 text-muted-foreground opacity-50" />
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" size="sm">
                    <History className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                  <Button size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                </CardFooter>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>789 Ocean Drive</CardTitle>
                  <CardDescription>Beachfront 5 bed villa</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="aspect-video bg-muted rounded-md flex items-center justify-center">
                    <Play className="h-12 w-12 text-muted-foreground opacity-50" />
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" size="sm">
                    <History className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                  <Button size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
      
      <footer className="py-6 border-t border-muted">
        <div className="container text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Propify. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;
