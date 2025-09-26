import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { MapPin, Calendar, Check } from 'lucide-react';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';

interface WorkExperience {
  id: string;
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

export const WorkExperience = () => {
  const [experiences, setExperiences] = useState<WorkExperience[]>([]);
  const { ref, hasBeenVisible } = useIntersectionObserver({ threshold: 0.2 });

  useEffect(() => {
    const fetchExperiences = async () => {
      const { data } = await supabase
        .from('work_experience')
        .select('*')
        .order('start_date', { ascending: false });
      
      if (data) {
        setExperiences(data);
      }
    };

    fetchExperiences();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short' 
    });
  };

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Work Experience</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            My professional journey and the impact I've made
          </p>
        </div>

        <div ref={ref} className="max-w-4xl mx-auto">
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-primary transform -translate-x-1/2" />
            
            {experiences.map((experience, index) => (
              <div 
                key={experience.id} 
                className={`relative flex items-center mb-12 opacity-0 ${
                  hasBeenVisible ? 'animate-fade-in' : ''
                }`}
                style={{ animationDelay: `${index * 300}ms` }}
              >
                {/* Timeline dot */}
                <div className="absolute left-4 md:left-1/2 w-4 h-4 bg-primary rounded-full transform -translate-x-1/2 border-4 border-background z-10" />
                
                {/* Content card */}
                <div className={`w-full md:w-1/2 ${
                  index % 2 === 0 ? 'md:pr-8' : 'md:pl-8 md:ml-auto'
                } ml-12 md:ml-0`}>
                  <Card className="shadow-elegant hover:shadow-glow transition-all duration-300 bg-gradient-card border-border/50">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-xl font-bold text-primary">
                            {experience.position}
                          </CardTitle>
                          <CardDescription className="text-lg font-semibold text-foreground">
                            {experience.company}
                          </CardDescription>
                        </div>
                        {experience.is_current && (
                          <Badge className="bg-primary/10 text-primary border-primary/20">
                            Current
                          </Badge>
                        )}
                      </div>
                      
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
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      {experience.description && (
                        <p className="text-muted-foreground leading-relaxed">
                          {experience.description}
                        </p>
                      )}
                      
                      {experience.achievements.length > 0 && (
                        <div>
                          <h4 className="font-semibold mb-2 text-foreground">Key Achievements</h4>
                          <ul className="space-y-2">
                            {experience.achievements.map((achievement, i) => (
                              <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                                <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                                <span>{achievement}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      <div className="flex flex-wrap gap-2">
                        {experience.technologies_used.map((tech, i) => (
                          <Badge 
                            key={i} 
                            variant="secondary" 
                            className="text-xs bg-primary/10 text-primary border-primary/20"
                          >
                            {tech}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};