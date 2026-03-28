import { useState } from 'react'; // Added useState for loading state
import type { ProjectDetails } from '../../types/storyboard';
import FormField from '../ui/FormField';
import SectionFrame from '../ui/SectionFrame';
import {
  primaryButtonClassName,
  textAreaClassName,
  textInputClassName,
} from '../ui/styles';

interface ProjectSectionProps {
  project: ProjectDetails;
  onChange: (project: ProjectDetails) => void;
  onNext: () => void;
}

function ProjectSection({ project, onChange, onNext }: ProjectSectionProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const canContinue = project.title.trim().length > 0 && !isSubmitting;

  function updateField<K extends keyof ProjectDetails>(key: K, value: ProjectDetails[K]) {
    onChange({ ...project, [key]: value });
  }

  // The new fetch handler
  async function handleContinue() {
    setIsSubmitting(true);

    try {
      const response = await fetch('http://localhost:8000/project', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // This sends all FormFields currently stored in the project state
        body: JSON.stringify(project),
      });

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }

      const project_id:number = await response.json();
      console.log('Project created successfully:', project_id);

      localStorage.setItem("project_id", project_id.toString())

      // Only advance to the next stage if the fetch was successful
      onNext();
    } catch (error) {
      console.error('Failed to save project:', error);
      alert('Failed to save project. Please check if the backend is running.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <SectionFrame
      title="Project Section"
      subtitle="Set the foundation of your storyboard project. Project Name is required."
    >
      <div className="space-y-5">
        <FormField label="Project Name" required>
          <input
            className={textInputClassName}
            value={project.title}
            onChange={(event) => updateField('title', event.target.value)}
            placeholder="Enter your project name"
          />
        </FormField>

        <FormField label="Genre">
          <input
            className={textInputClassName}
            value={project.genre}
            onChange={(event) => updateField('genre', event.target.value)}
            placeholder="Sci-fi, drama, thriller..."
          />
        </FormField>

        <FormField label="Premise">
          <textarea
            className={textAreaClassName}
            rows={4}
            value={project.premise}
            onChange={(event) => updateField('premise', event.target.value)}
            placeholder="What is the core idea of this story?"
          />
        </FormField>

        <FormField label="Visual Tone">
          <textarea
            className={textAreaClassName}
            rows={3}
            value={project.visual_tone}
            onChange={(event) => updateField('visual_tone', event.target.value)}
            placeholder="Moody noir, warm cinematic, comic-book style..."
          />
        </FormField>
      </div>

      <footer className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-6">
        <p className="text-sm text-slate-500">Step 1 of 3 (Preparation)</p>
        <button
          type="button"
          className={primaryButtonClassName}
          disabled={!canContinue}
          onClick={handleContinue} // Changed from onNext to handleContinue
        >
          {isSubmitting ? 'Saving...' : 'Continue to Characters'}
        </button>
      </footer>
    </SectionFrame>
  );
}

export default ProjectSection;