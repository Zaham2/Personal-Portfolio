import { Hero } from "@/components/Hero";
import { Projects } from "@/components/Projects";
import { WorkExperience } from "@/components/WorkExperience";
import { Contact } from "@/components/Contact";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Hero />
      <Projects />
      <WorkExperience />
      <Contact />
    </div>
  );
};

export default Index;
