import { useEffect, useState } from 'react';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';

interface SkillSliderProps {
  skill: string;
  level: number;
  delay?: number;
}

export const SkillSlider = ({ skill, level, delay = 0 }: SkillSliderProps) => {
  const [animatedLevel, setAnimatedLevel] = useState(0);
  const { ref, hasBeenVisible } = useIntersectionObserver({ threshold: 0.3 });

  useEffect(() => {
    if (hasBeenVisible) {
      const timer = setTimeout(() => {
        setAnimatedLevel(level);
      }, delay);
      return () => clearTimeout(timer);
    }
  }, [hasBeenVisible, level, delay]);

  return (
    <div ref={ref} className="mb-4 opacity-0 animate-fade-in" 
         style={{ animationDelay: `${delay}ms` }}>
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-foreground">{skill}</span>
        <span className="text-sm text-muted-foreground">{level}%</span>
      </div>
      <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
        <div
          className="h-full bg-gradient-primary rounded-full transition-all duration-1500 ease-out"
          style={{
            width: hasBeenVisible ? `${animatedLevel}%` : '0%',
            transitionDelay: `${delay}ms`
          }}
        />
      </div>
    </div>
  );
};