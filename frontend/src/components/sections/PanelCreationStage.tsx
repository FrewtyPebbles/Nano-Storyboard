import { useState } from 'react'; // Added useState
import type {
  CharacterDraft,
  PanelCreationState,
  PanelDraft,
} from '../../types/storyboard';
import FormField from '../ui/FormField';
import SectionFrame from '../ui/SectionFrame';
import {
  primaryButtonClassName,
  secondaryButtonClassName,
  textAreaClassName,
} from '../ui/styles';

interface PanelCreationStageProps {
  projectId: number; // Added: Required for the API URL
  panels: PanelDraft[];
  characters: CharacterDraft[];
  creationStates: PanelCreationState[];
  activePanelIndex: number;
  onActivePanelChange: (index: number) => void;
  onEditDraftChange: (panelId: string, value: string) => void;
  onApplyEdit: (panelId: string) => void;
  onRedo: (panelId: string) => void;
  onUpdatePanel: (index: number, updatedPanel: PanelDraft) => void;
  onViewStoryboard: () => void;
}

function PanelCreationStage({
  projectId,
  panels,
  characters,
  creationStates,
  activePanelIndex,
  onActivePanelChange,
  onEditDraftChange,
  onApplyEdit,
  onRedo,
  onUpdatePanel,
  onViewStoryboard,
}: PanelCreationStageProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [imageCacheBust, setImageCacheBust] = useState(Date.now());
  const activePanel = panels[activePanelIndex];
  const activeState = creationStates.find((panel) => panel.panelId === activePanel.id);

  const characterNames = activePanel.characterIds
    .map((id) => characters.find((character) => character.id === id)?.name)
    .filter((name): name is string => Boolean(name && name.trim().length > 0));

  async function handleApplyEdit() {
    if (!activePanel.backendId || !activeState?.editDraft.trim()) return;
    setIsGenerating(true);
    try {
      const response = await fetch(
        `http://localhost:8000/project/${projectId}/panel/${activePanel.backendId}/regenerate`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ notes: activeState.editDraft }),
        }
      );
      if (!response.ok) throw new Error("Failed to apply edit");
      const updatedPanelData = await response.json();
      onUpdatePanel(activePanelIndex, { ...activePanel, image: updatedPanelData.image ?? '' });
      onEditDraftChange(activePanel.id, '');
      setImageCacheBust(Date.now());
    } catch (error) {
      console.error(error);
      alert("Error applying edit.");
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleGeneratePanel() {
    if (!activePanel.backendId) {
      alert("Panel not yet saved to backend.");
      return;
    }
    setIsGenerating(true);
    try {
      // Panel already exists — refresh generates a fresh image using existing DB data
      const response = await fetch(
        `http://localhost:8000/project/${projectId}/panel/${activePanel.backendId}/refresh`,
        { method: 'PATCH', headers: { 'Content-Type': 'application/json' } }
      );

      if (!response.ok) throw new Error("Failed to generate panel");

      const updatedPanelData = await response.json();
      onUpdatePanel(activePanelIndex, { ...activePanel, image: updatedPanelData.image ?? '' });
      setImageCacheBust(Date.now());
    } catch (error) {
      console.error(error);
      alert("Error generating panel image.");
    } finally {
      setIsGenerating(false);
    }
  }

  const imageUrl = activePanel.image
    ? `http://localhost:8000/uploads/${activePanel.image.replace('uploads/', '')}?t=${imageCacheBust}`
    : null;

  return (
    <SectionFrame
      title="Panel Creation"
      subtitle="Stage 2 - Creating. Generate and iterate each panel's visual representation."
    >
      <div className="mb-6 flex flex-wrap items-center gap-2">
        {panels.map((_, index) => {
          const isActive = index === activePanelIndex;
          const buttonClassName = isActive
            ? 'rounded-xl bg-cyan-700 px-3 py-2 text-sm font-semibold text-white'
            : 'rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50';

          return (
            <button
              key={panels[index].id}
              type="button"
              className={buttonClassName}
              onClick={() => onActivePanelChange(index)}
              disabled={isGenerating}
            >
              Panel {index + 1}
            </button>
          );
        })}
      </div>

      <article className="space-y-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-6">
        <header className="flex items-center justify-between gap-3">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-slate-900">Panel {activePanelIndex + 1}</h2>
            <p className="text-sm text-slate-600">Review details and generate visuals.</p>
          </div>
          <button
            onClick={handleGeneratePanel}
            disabled={isGenerating}
            className={primaryButtonClassName}
          >
            {isGenerating ? 'Generating...' : activePanel.image ? 'Regenerate' : 'Generate Image'}
          </button>
        </header>

        {/* --- IMAGE DISPLAY AREA --- */}
        <div className="relative flex min-h-[400px] w-full items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-slate-300 bg-white">
          {isGenerating ? (
            <div className="flex flex-col items-center gap-3">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-cyan-600 border-t-transparent"></div>
              <p className="font-medium text-slate-600">AI is drawing your panel...</p>
            </div>
          ) : imageUrl ? (
            <img 
              src={imageUrl} 
              alt={`Panel ${activePanelIndex + 1}`} 
              className="h-full w-full object-contain"
              key={imageUrl} // Forces refresh if URL changes
            />
          ) : (
            <div className="text-center p-6">
              <p className="text-base font-semibold text-slate-700">No Image Generated Yet</p>
              <p className="text-sm text-slate-500">Click the generate button to start.</p>
            </div>
          )}
        </div>

        <div className="grid gap-2 rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600 sm:grid-cols-2">
          <p><span className="font-semibold text-slate-800">Camera Shot:</span> {activePanel.camera_shot || '—'}</p>
          <p><span className="font-semibold text-slate-800">Location:</span> {activePanel.location || '—'}</p>
          <p><span className="font-semibold text-slate-800">Time:</span> {activePanel.time || '—'}</p>
          <p>
            <span className="font-semibold text-slate-800">Characters:</span>{' '}
            {characterNames.length > 0 ? characterNames.join(', ') : '—'}
          </p>
          <p className="sm:col-span-2"><span className="font-semibold text-slate-800">Action:</span> {activePanel.action || '—'}</p>
          <p className="sm:col-span-2"><span className="font-semibold text-slate-800">Dialogue:</span> {activePanel.dialogue || '—'}</p>
          <p className="sm:col-span-2"><span className="font-semibold text-slate-800">Caption:</span> {activePanel.caption || '—'}</p>
        </div>

        <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
          <FormField label="Edit Prompt">
            <textarea
              className={textAreaClassName}
              rows={4}
              value={activeState?.editDraft ?? ''}
              onChange={(event) => onEditDraftChange(activePanel.id, event.target.value)}
              placeholder="Describe what to adjust in this panel image"
              disabled={isGenerating}
            />
          </FormField>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              className={primaryButtonClassName}
              disabled={(activeState?.editDraft.trim().length ?? 0) === 0 || isGenerating}
              onClick={handleApplyEdit}
            >
              Apply Edit
            </button>
            <button
              type="button"
              className={secondaryButtonClassName}
              onClick={() => onRedo(activePanel.id)}
              disabled={isGenerating}
            >
              Redo
            </button>
          </div>
        </section>
      </article>

      <footer className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-6">
        <p className="text-sm text-slate-500">
          Panel {activePanelIndex + 1} of {panels.length}
        </p>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            className={secondaryButtonClassName}
            disabled={activePanelIndex === 0 || isGenerating}
            onClick={() => onActivePanelChange(activePanelIndex - 1)}
          >
            Previous Panel
          </button>
          <button
            type="button"
            className={secondaryButtonClassName}
            disabled={activePanelIndex === panels.length - 1 || isGenerating}
            onClick={() => onActivePanelChange(activePanelIndex + 1)}
          >
            Next Panel
          </button>
          <button
            type="button"
            className={primaryButtonClassName}
            disabled={isGenerating}
            onClick={onViewStoryboard}
          >
            View Storyboard
          </button>
        </div>
      </footer>
    </SectionFrame>
  );
}

export default PanelCreationStage;