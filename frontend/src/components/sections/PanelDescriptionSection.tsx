import type { CharacterDraft, PanelDraft } from '../../types/storyboard';
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

interface PanelDescriptionSectionProps {
  panels: PanelDraft[];
  characters: CharacterDraft[];
  onChange: (panels: PanelDraft[]) => void;
  onBack: () => void;
  onFinalize: () => void;
}

function PanelDescriptionSection({
  panels,
  characters,
  onChange,
  onBack,
  onFinalize,
}: PanelDescriptionSectionProps) {
  function updatePanel(panelId: string, key: keyof Omit<PanelDraft, 'id'>, value: string | string[]) {
    onChange(
      panels.map((panel) =>
        panel.id === panelId ? { ...panel, [key]: value } : panel,
      ),
    );
  }

  function addPanel() {
    onChange([...panels, createEmptyPanel()]);
  }

  function removePanel(panelId: string) {
    onChange(panels.filter((panel) => panel.id !== panelId));
  }

  function toggleCharacter(panel: PanelDraft, characterId: string) {
    const hasCharacter = panel.characterIds.includes(characterId);
    const updatedCharacterIds = hasCharacter
      ? panel.characterIds.filter((id) => id !== characterId)
      : [...panel.characterIds, characterId];

    updatePanel(panel.id, 'characterIds', updatedCharacterIds);
  }

  const canFinalize = panels.length > 0;

  return (
    <SectionFrame
      title="Panel Description"
      subtitle="Stage 1 - Preparation. Create as many storyboard panel descriptions as you need, then finalize."
    >
      <div className="space-y-4">
        {panels.map((panel, index) => (
          <article
            key={panel.id}
            className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-5"
          >
            <header className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-slate-800">Panel Draft {index + 1}</h2>
              <button
                type="button"
                className={dangerButtonClassName}
                onClick={() => removePanel(panel.id)}
              >
                Delete
              </button>
            </header>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField label="Camera Shot">
                <input
                  className={textInputClassName}
                  value={panel.cameraShot}
                  onChange={(event) => updatePanel(panel.id, 'cameraShot', event.target.value)}
                  placeholder="Wide shot, close-up..."
                />
              </FormField>

              <FormField label="Location">
                <input
                  className={textInputClassName}
                  value={panel.location}
                  onChange={(event) => updatePanel(panel.id, 'location', event.target.value)}
                  placeholder="Beach, rooftop, station..."
                />
              </FormField>
            </div>

            <FormField label="Time">
              <input
                className={textInputClassName}
                value={panel.time}
                onChange={(event) => updatePanel(panel.id, 'time', event.target.value)}
                placeholder="Dawn, midnight, afternoon..."
              />
            </FormField>

            <FormField label="Action">
              <textarea
                className={textAreaClassName}
                rows={3}
                value={panel.action}
                onChange={(event) => updatePanel(panel.id, 'action', event.target.value)}
                placeholder="Describe what happens in this panel"
              />
            </FormField>

            <FormField label="Dialogue">
              <textarea
                className={textAreaClassName}
                rows={2}
                value={panel.dialogue}
                onChange={(event) => updatePanel(panel.id, 'dialogue', event.target.value)}
                placeholder="Optional spoken lines"
              />
            </FormField>

            <FormField label="Caption">
              <textarea
                className={textAreaClassName}
                rows={2}
                value={panel.caption}
                onChange={(event) => updatePanel(panel.id, 'caption', event.target.value)}
                placeholder="Optional narration text"
              />
            </FormField>

            <div className="space-y-3">
              <p className="text-sm font-semibold text-slate-800">Characters</p>
              {characters.length === 0 ? (
                <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700">
                  No characters available. Go back to Character Section to add them.
                </p>
              ) : (
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {characters.map((character) => (
                    <label
                      key={character.id}
                      className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
                    >
                      <input
                        type="checkbox"
                        checked={panel.characterIds.includes(character.id)}
                        onChange={() => toggleCharacter(panel, character.id)}
                      />
                      <span>{character.name || 'Unnamed Character'}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </article>
        ))}
      </div>

      {!canFinalize ? (
        <p className="mt-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          Add at least one panel description before finalizing.
        </p>
      ) : null}

      <div className="mt-6 flex flex-wrap gap-3">
        <button type="button" className={secondaryButtonClassName} onClick={addPanel}>
          Add Panel Description
        </button>
      </div>

      <footer className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-6">
        <p className="text-sm text-slate-500">Step 3 of 3 (Preparation)</p>
        <div className="flex flex-wrap gap-3">
          <button type="button" className={secondaryButtonClassName} onClick={onBack}>
            Back
          </button>
          <button
            type="button"
            className={primaryButtonClassName}
            disabled={!canFinalize}
            onClick={onFinalize}
          >
            Finalize and Start Creation
          </button>
        </div>
      </footer>
    </SectionFrame>
  );
}

export default PanelDescriptionSection;
