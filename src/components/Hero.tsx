import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Github, Linkedin, Mail, MapPin, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface PersonalInfo {
  full_name: string;
  title: string;
  email: string;
  phone?: string;
  location?: string;
  linkedin_url?: string;
  github_url?: string;
  bio?: string;
  hourly_rate?: number;
  availability?: string;
}

interface Skill {
  name: string;
  category: string;
  proficiency_level: number;
}

export const Hero = () => {
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo | null>(null);
  const [skills, setSkills] = useState<Skill[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const [personalResult, skillsResult] = await Promise.all([
        supabase.from('personal_info').select('*').single(),
        supabase.from('skills').select('*').order('proficiency_level', { ascending: false })
      ]);

      if (personalResult.data) {
        setPersonalInfo(personalResult.data);
      }
      if (skillsResult.data) {
        setSkills(skillsResult.data);
      }
    };

    fetchData();
  }, []);

  const topSkills = skills.slice(0, 6);

  if (!personalInfo) return null;

  return (
    <section className="min-h-screen flex items-center justify-center bg-gradient-hero text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px]" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center space-y-8 animate-fade-in">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight">
              {personalInfo.full_name}
            </h1>
            <p className="text-xl md:text-2xl text-white/90 font-medium">
              {personalInfo.title}
            </p>
            <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto leading-relaxed">
              {personalInfo.bio}
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-4 text-sm text-white/80">
            {personalInfo.location && (
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>{personalInfo.location}</span>
              </div>
            )}
            {personalInfo.availability && (
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{personalInfo.availability}</span>
              </div>
            )}
            {personalInfo.hourly_rate && (
              <div className="flex items-center gap-2">
                <span className="font-semibold">${personalInfo.hourly_rate}/hour</span>
              </div>
            )}
          </div>

          <div className="flex flex-wrap justify-center gap-3 max-w-2xl mx-auto">
            {topSkills.map((skill, index) => (
              <Badge 
                key={skill.name}
                variant="secondary" 
                className="bg-white/10 text-white border-white/20 hover:bg-white/20 transition-all duration-300 animate-scale-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {skill.name}
              </Badge>
            ))}
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            <Button 
              size="lg" 
              className="bg-white text-black hover:bg-white/90 font-semibold"
              onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
            >
              <Mail className="w-4 h-4 mr-2" />
              Get In Touch
            </Button>
            
            <div className="flex gap-3">
              {personalInfo.github_url && (
                <Button 
                  size="lg" 
                  variant="social"
                  asChild
                >
                  <a href={personalInfo.github_url} target="_blank" rel="noopener noreferrer">
                    <Github className="w-4 h-4" />
                  </a>
                </Button>
              )}
              {personalInfo.linkedin_url && (
                <Button 
                  size="lg" 
                  variant="social"
                  asChild
                >
                  <a href={personalInfo.linkedin_url} target="_blank" rel="noopener noreferrer">
                    <Linkedin className="w-4 h-4" />
                  </a>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};