'use client';

// Note: Storage info will be implemented when backend provides the endpoint
// For now, we'll show a placeholder
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { User, Palette, HardDrive, Keyboard } from 'lucide-react';

export default function SettingsPage() {

  // Placeholder storage info - will be replaced with real API call
  const storageInfo = {
    usedBytes: 4.2e9, // 4.2 GB
    quotaBytes: 1.0e10, // 10 GB
  };
  const storagePercentage = Math.round((storageInfo.usedBytes / storageInfo.quotaBytes) * 100);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-semibold">Settings</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Manage your account and preferences
        </p>
      </div>

      {/* Settings Tabs */}
      <Tabs defaultValue="general" className="space-y-4 sm:space-y-6">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto">
          <TabsTrigger value="general" className="flex flex-col sm:flex-row items-center space-y-1 sm:space-y-0 sm:space-x-2 py-3 sm:py-2">
            <User className="w-4 h-4" />
            <span className="text-xs sm:text-sm">General</span>
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex flex-col sm:flex-row items-center space-y-1 sm:space-y-0 sm:space-x-2 py-3 sm:py-2">
            <Palette className="w-4 h-4" />
            <span className="text-xs sm:text-sm">Appearance</span>
          </TabsTrigger>
          <TabsTrigger value="storage" className="flex flex-col sm:flex-row items-center space-y-1 sm:space-y-0 sm:space-x-2 py-3 sm:py-2">
            <HardDrive className="w-4 h-4" />
            <span className="text-xs sm:text-sm">Storage</span>
          </TabsTrigger>
          <TabsTrigger value="shortcuts" className="flex flex-col sm:flex-row items-center space-y-1 sm:space-y-0 sm:space-x-2 py-3 sm:py-2">
            <Keyboard className="w-4 h-4" />
            <span className="text-xs sm:text-sm">Shortcuts</span>
          </TabsTrigger>
        </TabsList>

        {/* General Tab */}
        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>
                Manage your personal information and account settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="display-name">Display Name</Label>
                <Input
                  id="display-name"
                  type="text"
                  defaultValue="John Doe"
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  defaultValue="john.doe@example.com"
                  className="w-full"
                />
              </div>
              <Button className="w-full sm:w-auto">Save Changes</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance Tab */}
        <TabsContent value="appearance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Theme Settings</CardTitle>
              <CardDescription>
                Customize the appearance of your BRMH Drive
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Theme</Label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button variant="outline" size="sm" className="flex-1 sm:flex-none">Light</Button>
                  <Button variant="outline" size="sm" className="flex-1 sm:flex-none">Dark</Button>
                  <Button variant="outline" size="sm" className="flex-1 sm:flex-none">System</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Storage Tab */}
        <TabsContent value="storage" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Storage Usage</CardTitle>
              <CardDescription>
                Monitor your storage usage and upgrade if needed
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Storage Used</span>
                  <span className="text-sm text-muted-foreground">
                    {storagePercentage}% used
                  </span>
                </div>
                <Progress value={storagePercentage} className="h-2" />
                <div className="text-sm text-muted-foreground">
                  {formatBytes(storageInfo.usedBytes)} of {formatBytes(storageInfo.quotaBytes)} used
                </div>
              </div>
              <Button className="w-full sm:w-auto">Get more storage</Button>
            </CardContent>
          </Card>
        </TabsContent>


        {/* Shortcuts Tab */}
        <TabsContent value="shortcuts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Keyboard Shortcuts</CardTitle>
              <CardDescription>
                Learn the keyboard shortcuts to navigate faster
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <span className="text-sm">Focus search</span>
                  <kbd className="px-2 py-1 bg-muted rounded text-xs self-start sm:self-auto">/</kbd>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <span className="text-sm">Select all</span>
                  <kbd className="px-2 py-1 bg-muted rounded text-xs self-start sm:self-auto">Ctrl + A</kbd>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <span className="text-sm">New folder</span>
                  <kbd className="px-2 py-1 bg-muted rounded text-xs self-start sm:self-auto">Ctrl + Shift + N</kbd>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <span className="text-sm">Delete</span>
                  <kbd className="px-2 py-1 bg-muted rounded text-xs self-start sm:self-auto">Delete</kbd>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <span className="text-sm">Rename</span>
                  <kbd className="px-2 py-1 bg-muted rounded text-xs self-start sm:self-auto">F2</kbd>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <span className="text-sm">Go to Home</span>
                  <kbd className="px-2 py-1 bg-muted rounded text-xs self-start sm:self-auto">Ctrl + H</kbd>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
