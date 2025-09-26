-- Create personal_info table
CREATE TABLE public.personal_info (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  title TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  location TEXT,
  linkedin_url TEXT,
  github_url TEXT,
  website_url TEXT,
  bio TEXT,
  hourly_rate INTEGER,
  availability TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create skills table
CREATE TABLE public.skills (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL,
  proficiency_level INTEGER NOT NULL CHECK (proficiency_level >= 1 AND proficiency_level <= 100),
  icon_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create work_experience table
CREATE TABLE public.work_experience (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company TEXT NOT NULL,
  position TEXT NOT NULL,
  location TEXT,
  start_date DATE NOT NULL,
  end_date DATE,
  is_current BOOLEAN DEFAULT false,
  description TEXT,
  achievements TEXT[],
  technologies_used TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create projects table
CREATE TABLE public.projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  detailed_description TEXT,
  technologies_used TEXT[],
  github_url TEXT,
  live_url TEXT,
  image_url TEXT,
  start_date DATE,
  end_date DATE,
  challenges TEXT,
  learnings TEXT,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create project_skills junction table
CREATE TABLE public.project_skills (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  skill_id UUID NOT NULL REFERENCES public.skills(id) ON DELETE CASCADE,
  skill_level INTEGER NOT NULL CHECK (skill_level >= 1 AND skill_level <= 100),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(project_id, skill_id)
);

-- Create contact_inquiries table
CREATE TABLE public.contact_inquiries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.personal_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_experience ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_inquiries ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access (no auth required)
CREATE POLICY "Personal info is viewable by everyone" ON public.personal_info FOR SELECT USING (true);
CREATE POLICY "Skills are viewable by everyone" ON public.skills FOR SELECT USING (true);
CREATE POLICY "Work experience is viewable by everyone" ON public.work_experience FOR SELECT USING (true);
CREATE POLICY "Projects are viewable by everyone" ON public.projects FOR SELECT USING (true);
CREATE POLICY "Project skills are viewable by everyone" ON public.project_skills FOR SELECT USING (true);

-- Create policy for contact form submissions
CREATE POLICY "Anyone can submit contact inquiries" ON public.contact_inquiries FOR INSERT WITH CHECK (true);

-- Insert personal info data
INSERT INTO public.personal_info (
  full_name, title, email, phone, location, linkedin_url, github_url, 
  bio, hourly_rate, availability
) VALUES (
  'Mohamad Elzahaby',
  'Full-Stack Developer',
  'mohamad.elzahaby@gmail.com',
  '+971502343031',
  'Dubai, UAE',
  'https://linkedin.com/in/mohamadelzahaby',
  'https://github.com/mohamadelzahaby',
  'Passionate full-stack developer with expertise in modern web technologies, specializing in scalable applications and user-centric solutions.',
  75,
  'Available for freelance projects'
);

-- Insert skills data
INSERT INTO public.skills (name, category, proficiency_level, icon_name) VALUES
('NestJS', 'Backend', 95, 'server'),
('React', 'Frontend', 92, 'code'),
('TypeScript', 'Programming Language', 90, 'code2'),
('Node.js', 'Backend', 88, 'server'),
('PostgreSQL', 'Database', 85, 'database'),
('MongoDB', 'Database', 82, 'database'),
('Docker', 'DevOps', 80, 'container'),
('AWS', 'Cloud', 78, 'cloud'),
('WebSockets', 'Technology', 85, 'wifi'),
('GraphQL', 'API', 75, 'share-2');

-- Insert work experience data
INSERT INTO public.work_experience (
  company, position, location, start_date, end_date, is_current, 
  description, achievements, technologies_used
) VALUES 
(
  'Freelance',
  'Full-Stack Developer',
  'Remote',
  '2023-01-01',
  NULL,
  true,
  'Developing custom web applications and APIs for various clients',
  ARRAY['Built 10+ scalable web applications', 'Increased client productivity by 40%', 'Mentored junior developers'],
  ARRAY['NestJS', 'React', 'TypeScript', 'PostgreSQL', 'Docker']
),
(
  'Tech Solutions Inc',
  'Senior Software Engineer',
  'Dubai, UAE',
  '2021-06-01',
  '2022-12-31',
  false,
  'Led development of enterprise-level applications and managed team of 5 developers',
  ARRAY['Led team of 5 developers', 'Reduced system downtime by 60%', 'Implemented CI/CD pipelines'],
  ARRAY['Node.js', 'React', 'MongoDB', 'AWS', 'Docker']
);

-- Insert projects data
INSERT INTO public.projects (
  title, description, detailed_description, technologies_used, 
  github_url, challenges, learnings, is_featured
) VALUES 
(
  'Smart Inventory Management System',
  'A comprehensive inventory management solution with real-time tracking and analytics.',
  'Built a full-featured inventory management system that handles product tracking, supplier management, and automated reordering with real-time dashboard analytics.',
  ARRAY['NestJS', 'React', 'PostgreSQL', 'TypeScript', 'Docker'],
  'https://github.com/mohamadelzahaby/inventory-system',
  'Implementing real-time synchronization between multiple microservices while maintaining data consistency and handling network failures gracefully.',
  'Gained deep understanding of distributed systems architecture, event-driven design patterns, and the importance of comprehensive error handling in production environments.',
  true
),
(
  'Real-time Trading Dashboard',
  'A high-performance trading dashboard with live market data and advanced charting.',
  'Developed a sophisticated trading dashboard that processes thousands of real-time market updates per second with interactive charts and portfolio management features.',
  ARRAY['React', 'Node.js', 'WebSockets', 'TypeScript', 'MongoDB'],
  'https://github.com/mohamadelzahaby/trading-dashboard',
  'Designing a scalable architecture that could handle high-frequency trading data while ensuring sub-millisecond response times for critical operations.',
  'Mastered advanced React optimization techniques, WebSocket management, and learned the importance of efficient state management in high-performance applications.',
  true
);

-- Insert project skills relationships
INSERT INTO public.project_skills (project_id, skill_id, skill_level) 
SELECT 
  p.id as project_id,
  s.id as skill_id,
  CASE 
    WHEN p.title = 'Smart Inventory Management System' AND s.name = 'NestJS' THEN 95
    WHEN p.title = 'Smart Inventory Management System' AND s.name = 'PostgreSQL' THEN 90
    WHEN p.title = 'Smart Inventory Management System' AND s.name = 'TypeScript' THEN 88
    WHEN p.title = 'Smart Inventory Management System' AND s.name = 'Docker' THEN 85
    WHEN p.title = 'Real-time Trading Dashboard' AND s.name = 'React' THEN 92
    WHEN p.title = 'Real-time Trading Dashboard' AND s.name = 'TypeScript' THEN 88
    WHEN p.title = 'Real-time Trading Dashboard' AND s.name = 'WebSockets' THEN 87
    WHEN p.title = 'Real-time Trading Dashboard' AND s.name = 'Node.js' THEN 85
    ELSE 80
  END as skill_level
FROM public.projects p
CROSS JOIN public.skills s
WHERE 
  (p.title = 'Smart Inventory Management System' AND s.name IN ('NestJS', 'PostgreSQL', 'TypeScript', 'Docker')) OR
  (p.title = 'Real-time Trading Dashboard' AND s.name IN ('React', 'TypeScript', 'WebSockets', 'Node.js'));

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_personal_info_updated_at
  BEFORE UPDATE ON public.personal_info
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();