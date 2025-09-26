import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { adminClient } from '@/lib/adminClient';
import { useToast } from '@/hooks/use-toast';
import { Save, User } from 'lucide-react';

interface PersonalInfo {
  id?: string;
  full_name: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  linkedin_url: string;
  github_url: string;
  website_url: string;
  bio: string;
  hourly_rate: number | null;
  availability: string;
}

export const PersonalInfoEditor = () => {
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
    full_name: '',
    title: '',
    email: '',
    phone: '',
    location: '',
    linkedin_url: '',
    github_url: '',
    website_url: '',
    bio: '',
    hourly_rate: null,
    availability: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchPersonalInfo();
  }, []);

  const fetchPersonalInfo = async () => {
    setIsLoading(true);
    try {
      const result = await adminClient.select('personal_info');
      
      if (result.data && result.data.length > 0) {
        setPersonalInfo(result.data[0]);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load personal information.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const dataToSave = {
        ...personalInfo,
        hourly_rate: personalInfo.hourly_rate || null
      };

      const result = await adminClient.upsert('personal_info', dataToSave);
      
      if (result.data) {
        setPersonalInfo(result.data);
      }

      toast({
        title: "Success",
        description: "Personal information saved successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save personal information.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (field: keyof PersonalInfo, value: string | number) => {
    setPersonalInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <User className="w-6 h-6" />
          <div>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>
              Update your personal details and contact information
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="full_name">Full Name *</Label>
            <Input
              id="full_name"
              value={personalInfo.full_name}
              onChange={(e) => handleChange('full_name', e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="title">Professional Title *</Label>
            <Input
              id="title"
              value={personalInfo.title}
              onChange={(e) => handleChange('title', e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={personalInfo.email}
              onChange={(e) => handleChange('email', e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              value={personalInfo.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={personalInfo.location}
              onChange={(e) => handleChange('location', e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="availability">Availability</Label>
            <Input
              id="availability"
              value={personalInfo.availability}
              onChange={(e) => handleChange('availability', e.target.value)}
              placeholder="e.g., Available for hire"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="hourly_rate">Hourly Rate ($)</Label>
            <Input
              id="hourly_rate"
              type="number"
              value={personalInfo.hourly_rate || ''}
              onChange={(e) => handleChange('hourly_rate', parseInt(e.target.value) || null)}
            />
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={personalInfo.bio}
              onChange={(e) => handleChange('bio', e.target.value)}
              className="min-h-[100px]"
              placeholder="Tell people about yourself..."
            />
          </div>
          
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="linkedin_url">LinkedIn URL</Label>
              <Input
                id="linkedin_url"
                type="url"
                value={personalInfo.linkedin_url}
                onChange={(e) => handleChange('linkedin_url', e.target.value)}
                placeholder="https://linkedin.com/in/username"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="github_url">GitHub URL</Label>
              <Input
                id="github_url"
                type="url"
                value={personalInfo.github_url}
                onChange={(e) => handleChange('github_url', e.target.value)}
                placeholder="https://github.com/username"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="website_url">Website URL</Label>
              <Input
                id="website_url"
                type="url"
                value={personalInfo.website_url}
                onChange={(e) => handleChange('website_url', e.target.value)}
                placeholder="https://yoursite.com"
              />
            </div>
          </div>
        </div>
        
        <div className="flex justify-end pt-4">
          <Button 
            onClick={handleSave} 
            disabled={isSaving}
            className="bg-gradient-primary hover:shadow-glow transition-all duration-300"
          >
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};