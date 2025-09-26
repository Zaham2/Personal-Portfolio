import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { adminClient } from '@/lib/adminClient';
import { useToast } from '@/hooks/use-toast';
import { Code, Plus, Edit, Trash2 } from 'lucide-react';

interface Skill {
  id?: string;
  name: string;
  category: string;
  proficiency_level: number;
  icon_name?: string;
}

const skillCategories = [
  'Frontend',
  'Backend', 
  'Database',
  'DevOps',
  'Mobile',
  'Design',
  'Tools',
  'Soft Skills',
  'Other'
];

export const SkillsManager = () => {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
  const [formData, setFormData] = useState<Skill>({
    name: '',
    category: '',
    proficiency_level: 50,
    icon_name: ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchSkills();
  }, []);

  const fetchSkills = async () => {
    setIsLoading(true);
    try {
      const result = await adminClient.select('skills', { 
        column: 'category', 
        ascending: true 
      });
      
      setSkills(result.data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load skills.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const openDialog = (skill?: Skill) => {
    if (skill) {
      setEditingSkill(skill);
      setFormData(skill);
    } else {
      setEditingSkill(null);
      setFormData({
        name: '',
        category: '',
        proficiency_level: 50,
        icon_name: ''
      });
    }
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.category) {
      toast({
        title: "Error",
        description: "Name and category are required.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const skillData = {
        ...formData,
        icon_name: formData.icon_name || null
      };

      if (editingSkill) {
        await adminClient.update('skills', editingSkill.id, skillData);
      } else {
        await adminClient.insert('skills', skillData);
      }

      toast({
        title: "Success",
        description: `Skill ${editingSkill ? 'updated' : 'created'} successfully.`,
      });

      setIsDialogOpen(false);
      fetchSkills();
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${editingSkill ? 'update' : 'create'} skill.`,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this skill?')) return;

    try {
      await adminClient.delete('skills', id);

      toast({
        title: "Success",
        description: "Skill deleted successfully.",
      });

      fetchSkills();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete skill.",
        variant: "destructive",
      });
    }
  };

  const getProficiencyLabel = (level: number) => {
    if (level >= 80) return 'Expert';
    if (level >= 60) return 'Advanced';
    if (level >= 40) return 'Intermediate';
    if (level >= 20) return 'Beginner';
    return 'Learning';
  };

  const groupedSkills = skills.reduce((acc, skill) => {
    const category = skill.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(skill);
    return acc;
  }, {} as Record<string, Skill[]>);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading skills...</div>
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
              <Code className="w-6 h-6" />
              <div>
                <CardTitle>Skills Manager</CardTitle>
                <CardDescription>
                  Manage your technical skills and proficiency levels
                </CardDescription>
              </div>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => openDialog()}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Skill
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>
                    {editingSkill ? 'Edit Skill' : 'Add New Skill'}
                  </DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Skill Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., React, TypeScript, etc."
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {skillCategories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="icon_name">Icon Name (optional)</Label>
                    <Input
                      id="icon_name"
                      value={formData.icon_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, icon_name: e.target.value }))}
                      placeholder="e.g., react, typescript (Lucide icon names)"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label>
                      Proficiency Level: {formData.proficiency_level}% 
                      <span className="ml-2 text-sm text-muted-foreground">
                        ({getProficiencyLabel(formData.proficiency_level)})
                      </span>
                    </Label>
                    <Slider
                      value={[formData.proficiency_level]}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, proficiency_level: value[0] }))}
                      max={100}
                      min={0}
                      step={5}
                      className="w-full"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-4">
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={isSaving}>
                      {isSaving ? 'Saving...' : editingSkill ? 'Update' : 'Create'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
      </Card>

      <div className="space-y-6">
        {Object.keys(groupedSkills).length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Code className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No skills yet</h3>
              <p className="text-muted-foreground">
                Start by adding your technical skills and expertise.
              </p>
            </CardContent>
          </Card>
        ) : (
          Object.entries(groupedSkills).map(([category, categorySkills]) => (
            <Card key={category}>
              <CardHeader>
                <CardTitle className="text-lg">{category}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3">
                  {categorySkills.map((skill) => (
                    <div key={skill.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h4 className="font-semibold">{skill.name}</h4>
                          <Badge variant="secondary" className="text-xs">
                            {getProficiencyLabel(skill.proficiency_level)}
                          </Badge>
                        </div>
                        <div className="mt-2">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-muted rounded-full h-2">
                              <div 
                                className="bg-primary rounded-full h-2 transition-all duration-300"
                                style={{ width: `${skill.proficiency_level}%` }}
                              />
                            </div>
                            <span className="text-sm text-muted-foreground min-w-[3rem]">
                              {skill.proficiency_level}%
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button variant="outline" size="sm" onClick={() => openDialog(skill)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDelete(skill.id!)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};