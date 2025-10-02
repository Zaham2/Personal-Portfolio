import { useEffect, useState } from 'react';
import { ProjectCard } from './ProjectCard';
import { SkillSlider } from './SkillSlider';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Github, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Project {
  id: string;
  title: string;
  description: string;
  detailed_description?: string;
  technologies_used: string[];
  github_url?: string;
  live_url?: string;
  challenges?: string;
  learnings?: string;
  is_featured: boolean;
}

interface ProjectSkill {
  skill: {
    name: string;
  };
  skill_level: number;
}

export const Projects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [projectSkills, setProjectSkills] = useState<ProjectSkill[]>([]);

  useEffect(() => {
    const fetchProjects = async () => {
      const { data } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (data) {
        setProjects(data);
        if (data.length > 0) {
          setSelectedProject(data[0]);
          fetchProjectSkills(data[0].id);
        }
      }
    };

    fetchProjects();
  }, []);

  const fetchProjectSkills = async (projectId: string) => {
    const { data } = await supabase
      .from('project_skills')
      .select(`
        skill_level,
        skill:skills(name)
      `)
      .eq('project_id', projectId)
      .order('skill_level', { ascending: false });
    
    if (data) {
      setProjectSkills(data as ProjectSkill[]);
    }
  };

  const handleProjectSelect = (project: Project) => {
    setSelectedProject(project);
    fetchProjectSkills(project.id);
  };

  const featuredProjects = projects.filter(p => p.is_featured);

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        {/* Featured Projects Grid */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Featured Projects</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            A showcase of my recent work and the technologies I've mastered
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
          {featuredProjects.map((project, index) => (
            <div 
              key={project.id}
              className="opacity-0 animate-fade-in"
              style={{ animationDelay: `${index * 200}ms` }}
            >
              <ProjectCard
                title={project.title}
                description={project.description}
                technologies={project.technologies_used}
                githubUrl={project.github_url}
                liveUrl={project.live_url}
                onClick={() => handleProjectSelect(project)}
              />
            </div>
          ))}
        </div>

        {/* Detailed Project View */}
        {selectedProject && (
          <div className="max-w-6xl mx-auto">
            <Card className="bg-gradient-card shadow-elegant border-border/50">
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <CardTitle className="text-2xl md:text-3xl font-bold mb-2">
                      {selectedProject.title}
                    </CardTitle>
                    <CardDescription className="text-lg">
                      {selectedProject.description}
                    </CardDescription>
                  </div>
                  <div className="flex gap-3">
                    {selectedProject.github_url && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={selectedProject.github_url} target="_blank" rel="noopener noreferrer">
                          <Github className="w-4 h-4 mr-2" />
                          Code
                        </a>
                      </Button>
                    )}
                    {selectedProject.live_url && (
                      <Button size="sm" asChild>
                        <a href={selectedProject.live_url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Live Demo
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-8">
                {selectedProject.detailed_description && (
                  <div>
                    <h4 className="text-lg font-semibold mb-3">Project Overview</h4>
                    <ul className="text-muted-foreground leading-relaxed space-y-2 ml-4">
                      {selectedProject.detailed_description.split('\n').filter(point => point.trim()).map((point, index) => (
                        <li key={index} className="relative pl-6 before:content-['•'] before:absolute before:left-0 before:text-primary before:font-bold">
                          {point.trim()}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  {selectedProject.technologies_used.map((tech, index) => (
                    <Badge 
                      key={index} 
                      variant="secondary" 
                      className="bg-primary/10 text-primary border-primary/20"
                    >
                      {tech}
                    </Badge>
                  ))}
                </div>

                {projectSkills.length > 0 && (
                  <div>
                    <h4 className="text-lg font-semibold mb-4">Skills Utilized</h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      {projectSkills.map((projectSkill, index) => (
                        <SkillSlider
                          key={projectSkill.skill.name}
                          skill={projectSkill.skill.name}
                          level={projectSkill.skill_level}
                          delay={index * 100}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {(selectedProject.challenges || selectedProject.learnings) && (
                  <>
                    <Separator />
                    <div className="grid md:grid-cols-2 gap-8">
                      {selectedProject.challenges && (
                        <div>
                          <h4 className="text-lg font-semibold mb-3 text-destructive">
                            Challenges Faced
                          </h4>
                          <p className="text-muted-foreground leading-relaxed">
                            {selectedProject.challenges}
                          </p>
                        </div>
                      )}
                      
                      {selectedProject.learnings && (
                        <div>
                          <h4 className="text-lg font-semibold mb-3 text-primary">
                            Key Learnings
                          </h4>
                          <p className="text-muted-foreground leading-relaxed">
                            {selectedProject.learnings}
                          </p>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </section>
  );
};