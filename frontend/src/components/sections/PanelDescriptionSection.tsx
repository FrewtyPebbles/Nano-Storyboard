import { useState } from 'react'; // Added useState
import type { PanelDraft, CharacterDraft } from '../../types/storyboard';
import { createEmptyPanel } from '../../types/storyboard';
import FormField from '../ui/FormField';
import SectionFrame from '../ui/SectionFrame';
import {
  dangerButtonClassName,
  primaryButtonClassName,
  secondaryButtonClassName,
  textAreaClassName,
  textInputClassName,
} from '../ui/styles';

const CAMERA_SHOT_OPTIONS = [
  { value: 'wide', label: 'Wide' },
  { value: 'medium', label: 'Medium' },
  { value: 'close_up', label: 'Close Up' },
  { value: 'over_the_shoulder', label: 'Over the Shoulder' },
  { value: 'birdseye', label: "Bird's Eye" },
  { value: 'low_angle', label: 'Low Angle' },
  { value: 'high_angle', label: 'High Angle' },
  { value: 'first_person_point_of_view', label: 'FPOV (First Person)' },
];

interface PanelDescriptionSectionProps {
  projectId: number; // Added: Required for the API URL
  panels: PanelDraft[];
  characters: CharacterDraft[];
  onChange: (panels: PanelDraft[]) => void;
  onBack: () => void;
  onFinalize: () => void;
}

function PanelDescriptionSection({
  projectId,
  panels,
  characters,
  onChange,
  onBack,
  onFinalize,
}: PanelDescriptionSectionProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updatePanel<K extends keyof Omit<PanelDraft, 'id'>>(
    panelId: string,
    key: K,
    value: PanelDraft[K],
  ) {
    onChange(
      panels.map((p) => (p.id === panelId ? { ...p, [key]: value } : p))
    );
  }

  function toggleCharacter(panelId: string, characterId: string) {
    const panel = panels.find((p) => p.id === panelId);
    if (!panel) return;

    const currentIds = panel.characterIds;
    const newIds = currentIds.includes(characterId)
      ? currentIds.filter((id) => id !== characterId)
      : [...currentIds, characterId];

    updatePanel(panelId, 'characterIds', newIds);
  }

  function addPanel() {
    onChange([...panels, createEmptyPanel()]);
  }

  function removePanel(panelId: string) {
    if (panels.length <= 1) return;
    onChange(panels.filter((p) => p.id !== panelId));
  }

  // NEW: Submission handler for all panels
  async function handleFinalize() {
    setIsSubmitting(true);
    try {
      const updatedPanels: typeof panels = [];
      for (const panel of panels) {
        const res = await fetch(`http://localhost:8000/project/${projectId}/panel`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            camera_shot: panel.camera_shot,
            character_ids: panel.characterIds
              .map((localId) => characters.find((c) => c.id === localId)?.backendId)
              .filter((id): id is number => id !== undefined),
            location: panel.location,
            time: panel.time,
            action: panel.action,
            dialogue: panel.dialogue,
            caption: panel.caption,
          }),
        });

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData?.detail || `Failed to save panel ${updatedPanels.length + 1}.`);
        }

        const data = await res.json();
        updatedPanels.push({ ...panel, backendId: data.id, image: data.image ?? '' });
      }

      onChange(updatedPanels);
      onFinalize();
    } catch (error) {
      console.error(error);
      alert("Error saving panels. Please check your connection.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const isInvalid = panels.some(p => p.action.trim().length === 0) || isSubmitting;

  return (
    <SectionFrame
      title="Panel Descriptions"
      subtitle="Define the shots, characters, and actions for each panel in your storyboard."
    >
      <div className="space-y-8">
        {panels.map((panel, index) => (
          <article
            key={panel.id}
            className={`space-y-6 rounded-2xl border border-slate-200 bg-slate-50 p-5 shadow-sm transition-opacity ${isSubmitting ? 'opacity-50 pointer-events-none' : ''}`}
          >
            <header className="flex items-center justify-between border-b border-slate-200 pb-4">
              <h2 className="text-xl font-bold text-slate-800">Panel {index + 1}</h2>
              <button
                type="button"
                className={dangerButtonClassName}
                onClick={() => removePanel(panel.id)}
                disabled={panels.length === 1 || isSubmitting}
              >
                Remove
              </button>
            </header>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <FormField label="Camera Shot" required>
                <select
                  className={`${textInputClassName} bg-white`}
                  value={panel.camera_shot}
                  onChange={(e) => updatePanel(panel.id, 'camera_shot', e.target.value)}
                  disabled={isSubmitting}
                >
                  <option value="">Select a shot...</option>
                  {CAMERA_SHOT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </FormField>

              <FormField label="Location">
                <input
                  className={textInputClassName}
                  value={panel.location}
                  onChange={(e) => updatePanel(panel.id, 'location', e.target.value)}
                  placeholder="e.g. Interior Spaceship"
                  disabled={isSubmitting}
                />
              </FormField>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <FormField label="Time of Day">
                <input
                  className={textInputClassName}
                  value={panel.time}
                  onChange={(e) => updatePanel(panel.id, 'time', e.target.value)}
                  placeholder="e.g. Golden Hour"
                  disabled={isSubmitting}
                />
              </FormField>

              <FormField label="Characters in Shot">
                <div className="flex flex-wrap gap-3 rounded-xl border border-slate-200 bg-white p-3">
                  {characters.map((char) => (
                    <label key={char.id} className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500"
                        checked={panel.characterIds.includes(char.id)}
                        onChange={() => toggleCharacter(panel.id, char.id)}
                        disabled={isSubmitting}
                      />
                      <span className="text-sm font-medium text-slate-700">{char.name}</span>
                    </label>
                  ))}
                </div>
              </FormField>
            </div>

            <FormField label="Action / Visual Description" required>
              <textarea
                className={textAreaClassName}
                rows={3}
                value={panel.action}
                onChange={(e) => updatePanel(panel.id, 'action', e.target.value)}
                placeholder="What is happening in this shot?"
                disabled={isSubmitting}
              />
            </FormField>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <FormField label="Dialogue">
                <textarea
                  className={textAreaClassName}
                  rows={2}
                  value={panel.dialogue}
                  onChange={(e) => updatePanel(panel.id, 'dialogue', e.target.value)}
                  disabled={isSubmitting}
                />
              </FormField>
              <FormField label="Caption / Notes">
                <textarea
                  className={textAreaClassName}
                  rows={2}
                  value={panel.caption}
                  onChange={(e) => updatePanel(panel.id, 'caption', e.target.value)}
                  disabled={isSubmitting}
                />
              </FormField>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-8 flex justify-center">
        <button
          type="button"
          className={secondaryButtonClassName}
          onClick={addPanel}
          disabled={isSubmitting}
        >
          + Add New Panel
        </button>
      </div>

      <footer className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-6">
        <p className="text-sm text-slate-500">Step 3 of 3 (Preparation)</p>
        <div className="flex gap-3">
          <button 
            type="button" 
            className={secondaryButtonClassName} 
            onClick={onBack}
            disabled={isSubmitting}
          >
            Back
          </button>
          <button
            type="button"
            className={primaryButtonClassName}
            onClick={handleFinalize}
            disabled={isInvalid}
          >
            {isSubmitting ? 'Saving Panels...' : 'Finalize & Begin Creation'}
          </button>
        </div>
      </footer>
    </SectionFrame>
  );
}

export default PanelDescriptionSection;