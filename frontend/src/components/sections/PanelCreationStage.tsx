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
  panels: PanelDraft[];
  characters: CharacterDraft[];
  creationStates: PanelCreationState[];
  activePanelIndex: number;
  onActivePanelChange: (index: number) => void;
  onEditDraftChange: (panelId: string, value: string) => void;
  onApplyEdit: (panelId: string) => void;
  onRedo: (panelId: string) => void;
}

function PanelCreationStage({
  panels,
  characters,
  creationStates,
  activePanelIndex,
  onActivePanelChange,
  onEditDraftChange,
  onApplyEdit,
  onRedo,
}: PanelCreationStageProps) {
  const activePanel = panels[activePanelIndex];
  const activeState = creationStates.find((panel) => panel.panelId === activePanel.id);

  const characterNames = activePanel.characterIds
    .map((id) => characters.find((character) => character.id === id)?.name)
    .filter((name): name is string => Boolean(name && name.trim().length > 0));

  return (
    <SectionFrame
      title="Panel Creation"
      subtitle="Stage 2 - Creating. Previous preparation pages are locked. Use this edit section to iterate each panel."
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
            >
              Panel {index + 1}
            </button>
          );
        })}
      </div>

      <article className="space-y-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-6">
        <header className="space-y-2">
          <h2 className="text-2xl font-bold text-slate-900">Panel {activePanelIndex + 1}</h2>
          <p className="text-sm text-slate-600">
            Image area is reserved until backend generation is connected.
          </p>
        </header>

        <div className="flex min-h-72 items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-gradient-to-br from-slate-100 to-white p-6 text-center">
          <div className="space-y-3">
            <p className="text-base font-semibold text-slate-700">Generated Image Placeholder</p>
            <p className="text-sm text-slate-500">
              This top section will display the panel image once generation is implemented.
            </p>
          </div>
        </div>

        <div className="grid gap-2 rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600 sm:grid-cols-2">
          <p><span className="font-semibold text-slate-800">Camera Shot:</span> {activePanel.cameraShot || '—'}</p>
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
            />
          </FormField>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              className={primaryButtonClassName}
              disabled={(activeState?.editDraft.trim().length ?? 0) === 0}
              onClick={() => onApplyEdit(activePanel.id)}
            >
              Apply Edit
            </button>
            <button
              type="button"
              className={secondaryButtonClassName}
              onClick={() => onRedo(activePanel.id)}
            >
              Redo
            </button>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
            <p>Applied edits: {activeState?.editCount ?? 0}</p>
            <p>Redo uses: {activeState?.redoCount ?? 0}</p>
            <p>
              Last applied edit: {activeState?.lastAppliedEdit.trim() ? activeState.lastAppliedEdit : 'None yet'}
            </p>
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
            disabled={activePanelIndex === 0}
            onClick={() => onActivePanelChange(activePanelIndex - 1)}
          >
            Previous Panel
          </button>
          <button
            type="button"
            className={secondaryButtonClassName}
            disabled={activePanelIndex === panels.length - 1}
            onClick={() => onActivePanelChange(activePanelIndex + 1)}
          >
            Next Panel
          </button>
        </div>
      </footer>
    </SectionFrame>
  );
}

export default PanelCreationStage;
