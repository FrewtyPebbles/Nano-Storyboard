import type { PanelDraft } from '../../types/storyboard';
import { secondaryButtonClassName } from '../ui/styles';

interface StoryboardViewProps {
  panels: PanelDraft[];
  onBack: () => void;
}

function StoryboardView({ panels, onBack }: StoryboardViewProps) {
  return (
    <div className="w-full px-4 sm:px-6">
      {/* Header */}
      <div className="mx-auto mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Storyboard</h1>
          <p className="mt-1 text-sm text-slate-500">All panels in sequence.</p>
        </div>
        <button type="button" className={secondaryButtonClassName} onClick={onBack}>
          Back to Panel Creation
        </button>
      </div>

      {/* Grid — max 4 cols, 16:9 image ratio per cell */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {panels.map((panel, index) => {
          const imageUrl = panel.image
            ? `http://localhost:8000/uploads/${panel.image.replace('uploads/', '')}`
            : null;

          return (
            <div
              key={panel.id}
              className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
            >
              {/* 16:9 image container */}
              <div className="relative aspect-video w-full bg-slate-100">
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={`Panel ${index + 1}`}
                    className="absolute inset-0 h-full w-full object-contain"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <p className="text-sm text-slate-400">No image</p>
                  </div>
                )}
                {/* Panel number badge */}
                <span className="absolute left-2 top-2 rounded-md bg-black/50 px-2 py-0.5 text-xs font-semibold text-white">
                  {index + 1}
                </span>
              </div>

              {/* Caption */}
              <div className="p-3">
                <p className="text-sm leading-snug text-slate-700">
                  {panel.caption || panel.action || (
                    <span className="italic text-slate-400">No caption</span>
                  )}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default StoryboardView;
