import { useEffect, useState } from 'react';
import { primaryButtonClassName } from '../ui/styles';

interface ApiCharacter {
  id: number;
  name: string;
  age: number;
  gender: string;
  physical_description: string;
  back_story: string | null;
  image: string | null;
}

interface ApiPanel {
  id: number;
  sequence: number | null;
  camera_shot: string | null;
  location: string | null;
  time: string | null;
  action: string | null;
  dialogue: string | null;
  caption: string | null;
  image: string | null;
  character_ids: number[];
}

export interface ApiProject {
  id: number;
  title: string;
  genre: string | null;
  premise: string | null;
  visual_tone: string | null;
  characters: ApiCharacter[];
  panels: ApiPanel[];
}

interface ProjectsListViewProps {
  onSelectProject: (project: ApiProject) => void;
  onNewProject: () => void;
}

function ProjectsListView({ onSelectProject, onNewProject }: ProjectsListViewProps) {
  const [projects, setProjects] = useState<ApiProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('http://localhost:8000/project')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load projects');
        return res.json();
      })
      .then((data) => setProjects(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#e2f2ff_0%,_#f8fbff_40%,_#f3f4f6_100%)] px-4 py-8 sm:px-6">
      <div className="mx-auto w-full max-w-5xl">
        {/* Header */}
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-slate-900">Projects</h1>
            <p className="mt-1 text-sm text-slate-500">Select a project to continue, or start a new one.</p>
          </div>
          <button type="button" className={primaryButtonClassName} onClick={onNewProject}>
            + New Project
          </button>
        </div>

        {/* States */}
        {loading && (
          <div className="flex items-center justify-center py-24">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-cyan-600 border-t-transparent" />
          </div>
        )}

        {error && (
          <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        )}

        {!loading && !error && projects.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-4 py-24 text-slate-400">
            <p className="text-lg font-medium">No projects yet.</p>
            <button type="button" className={primaryButtonClassName} onClick={onNewProject}>
              Create your first project
            </button>
          </div>
        )}

        {/* Project grid */}
        {!loading && !error && projects.length > 0 && (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {projects.map((project) => {
              const firstPanel = project.panels
                .slice()
                .sort((a, b) => (a.sequence ?? 0) - (b.sequence ?? 0))[0];

              const thumbUrl = firstPanel?.image
                ? `http://localhost:8000/uploads/${firstPanel.image.replace('uploads/', '')}`
                : null;

              return (
                <button
                  key={project.id}
                  type="button"
                  onClick={() => onSelectProject(project)}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white text-left shadow-sm transition-shadow hover:shadow-md"
                >
                  {/* Thumbnail */}
                  <div className="relative aspect-video w-full bg-slate-100">
                    {thumbUrl ? (
                      <img
                        src={thumbUrl}
                        alt={project.title}
                        className="absolute inset-0 h-full w-full object-cover transition-opacity group-hover:opacity-90"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <p className="text-xs text-slate-400">No panels yet</p>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex flex-col gap-0.5 p-3">
                    <p className="truncate text-sm font-semibold text-slate-900">{project.title}</p>
                    {project.genre && (
                      <p className="truncate text-xs text-slate-500">{project.genre}</p>
                    )}
                    <p className="mt-1 text-xs text-slate-400">
                      {project.panels.length} panel{project.panels.length !== 1 ? 's' : ''} · {project.characters.length} character{project.characters.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default ProjectsListView;
