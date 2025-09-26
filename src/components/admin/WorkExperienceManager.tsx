import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { adminClient } from '@/lib/adminClient';
import { useToast } from '@/hooks/use-toast';
import { Briefcase, Plus, Edit, Trash2, MapPin, Calendar } from 'lucide-react';

interface WorkExperience {
  id?: string;
  company: string;
  position: string;
  location?: string;
  start_date: string;
  end_date?: string;
  is_current: boolean;
  description?: string;
  achievements: string[];
  technologies_used: string[];
}

export const WorkExperienceManager = () => {
  const [experiences, setExperiences] = useState<WorkExperience[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingExperience, setEditingExperience] = useState<WorkExperience | null>(null);
  const [formData, setFormData] = useState<WorkExperience>({
    company: '',
    position: '',
    location: '',
    start_date: '',
    end_date: '',
    is_current: false,
    description: '',
    achievements: [],
    technologies_used: []
  });
  const [achievementInput, setAchievementInput] = useState('');
  const [techInput, setTechInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchExperiences();
  }, []);

  const fetchExperiences = async () => {
    setIsLoading(true);
    try {
      const result = await adminClient.select('work_experience', { 
        column: 'start_date', 
        ascending: false 
      });
      
      setExperiences(result.data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load work experiences.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const openDialog = (experience?: WorkExperience) => {
    if (experience) {
      setEditingExperience(experience);
      setFormData(experience);
    } else {
      setEditingExperience(null);
      setFormData({
        company: '',
        position: '',
        location: '',
        start_date: '',
        end_date: '',
        is_current: false,
        description: '',
        achievements: [],
        technologies_used: []
      });
    }
    setAchievementInput('');
    setTechInput('');
    setIsDialogOpen(true);
  };

  const addAchievement = () => {
    if (achievementInput.trim() && !formData.achievements.includes(achievementInput.trim())) {
      setFormData(prev => ({
        ...prev,
        achievements: [...prev.achievements, achievementInput.trim()]
      }));
      setAchievementInput('');
    }
  };

  const removeAchievement = (achievement: string) => {
    setFormData(prev => ({
      ...prev,
      achievements: prev.achievements.filter(a => a !== achievement)
    }));
  };

  const addTechnology = () => {
    if (techInput.trim() && !formData.technologies_used.includes(techInput.trim())) {
      setFormData(prev => ({
        ...prev,
        technologies_used: [...prev.technologies_used, techInput.trim()]
      }));
      setTechInput('');
    }
  };

  const removeTechnology = (tech: string) => {
    setFormData(prev => ({
      ...prev,
      technologies_used: prev.technologies_used.filter(t => t !== tech)
    }));
  };

  const handleSave = async () => {
    if (!formData.company || !formData.position || !formData.start_date) {
      toast({
        title: "Error",
        description: "Company, position, and start date are required.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const experienceData = {
        ...formData,
        end_date: formData.is_current ? null : (formData.end_date || null),
        location: formData.location || null,
        description: formData.description || null
      };

      if (editingExperience) {
        await adminClient.update('work_experience', editingExperience.id, experienceData);
      } else {
        await adminClient.insert('work_experience', experienceData);
      }

      toast({
        title: "Success",
        description: `Work experience ${editingExperience ? 'updated' : 'created'} successfully.`,
      });

      setIsDialogOpen(false);
      fetchExperiences();
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${editingExperience ? 'update' : 'create'} work experience.`,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this work experience?')) return;

    try {
      await adminClient.delete('work_experience', id);

      toast({
        title: "Success",
        description: "Work experience deleted successfully.",
      });

      fetchExperiences();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete work experience.",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short' 
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading work experiences...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Briefcase className="w-6 h-6" />
              <div>
                <CardTitle>Work Experience Manager</CardTitle>
                <CardDescription>
                  Add and manage your professional experience
                </CardDescription>
              </div>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => openDialog()}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Experience
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingExperience ? 'Edit Work Experience' : 'Add Work Experience'}
                  </DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="company">Company *</Label>
                      <Input
                        id="company"
                        value={formData.company}
                        onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="position">Position *</Label>
                      <Input
                        id="position"
                        value={formData.position}
                        onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value }))}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                      placeholder="City, Country"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="start_date">Start Date *</Label>
                      <Input
                        id="start_date"
                        type="date"
                        value={formData.start_date}
                        onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="end_date">End Date</Label>
                      <Input
                        id="end_date"
                        type="date"
                        value={formData.end_date}
                        onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                        disabled={formData.is_current}
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is_current"
                      checked={formData.is_current}
                      onCheckedChange={(checked) => setFormData(prev => ({ 
                        ...prev, 
                        is_current: checked,
                        end_date: checked ? '' : prev.end_date
                      }))}
                    />
                    <Label htmlFor="is_current">Currently working here</Label>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Job Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      className="min-h-[100px]"
                      placeholder="Describe your role and responsibilities..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Key Achievements</Label>
                    <div className="flex gap-2">
                      <Input
                        value={achievementInput}
                        onChange={(e) => setAchievementInput(e.target.value)}
                        placeholder="Add achievement..."
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAchievement())}
                      />
                      <Button type="button" onClick={addAchievement} variant="outline">
                        Add
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {formData.achievements.map((achievement, index) => (
                        <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded">
                          <span className="flex-1 text-sm">{achievement}</span>
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="sm"
                            onClick={() => removeAchievement(achievement)}
                          >
                            ×
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Technologies Used</Label>
                    <div className="flex gap-2">
                      <Input
                        value={techInput}
                        onChange={(e) => setTechInput(e.target.value)}
                        placeholder="Add technology..."
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTechnology())}
                      />
                      <Button type="button" onClick={addTechnology} variant="outline">
                        Add
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.technologies_used.map((tech, index) => (
                        <Badge key={index} variant="secondary" className="cursor-pointer" onClick={() => removeTechnology(tech)}>
                          {tech} ×
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={isSaving}>
                      {isSaving ? 'Saving...' : editingExperience ? 'Update' : 'Create'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
      </Card>

      <div className="grid gap-4">
        {experiences.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Briefcase className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No work experience yet</h3>
              <p className="text-muted-foreground">
                Start by adding your professional experience.
              </p>
            </CardContent>
          </Card>
        ) : (
          experiences.map((experience) => (
            <Card key={experience.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-xl">{experience.position}</CardTitle>
                      {experience.is_current && (
                        <Badge variant="secondary">Current</Badge>
                      )}
                    </div>
                    <CardDescription className="text-lg font-semibold">
                      {experience.company}
                    </CardDescription>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {formatDate(experience.start_date)} - {
                            experience.is_current 
                              ? 'Present' 
                              : experience.end_date 
                                ? formatDate(experience.end_date)
                                : 'Present'
                          }
                        </span>
                      </div>
                      {experience.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          <span>{experience.location}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {experience.technologies_used.map((tech, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => openDialog(experience)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDelete(experience.id!)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              {experience.description && (
                <CardContent>
                  <p className="text-sm text-muted-foreground">{experience.description}</p>
                </CardContent>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  );
};