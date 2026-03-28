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
  const canContinue = project.projectName.trim().length > 0;

  function updateField<K extends keyof ProjectDetails>(key: K, value: ProjectDetails[K]) {
    onChange({ ...project, [key]: value });
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
            value={project.projectName}
            onChange={(event) => updateField('projectName', event.target.value)}
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
            value={project.visualTone}
            onChange={(event) => updateField('visualTone', event.target.value)}
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
          onClick={onNext}
        >
          Continue to Characters
        </button>
      </footer>
    </SectionFrame>
  );
}

export default ProjectSection;
