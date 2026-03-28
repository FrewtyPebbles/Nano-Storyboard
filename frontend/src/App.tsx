import { useMemo, useState } from 'react';
import CharacterSection from './components/sections/CharacterSection';
import PanelCreationStage from './components/sections/PanelCreationStage';
import PanelDescriptionSection from './components/sections/PanelDescriptionSection';
import ProjectSection from './components/sections/ProjectSection';
import {
  type PanelCreationState,
  createEmptyCharacter,
  createEmptyPanel,
  type CharacterDraft,
  type PanelDraft,
  type ProjectDetails,
} from './types/storyboard';

export type page_types = 'create project' | 'editor';

type AppStage = 'project' | 'characters' | 'descriptions' | 'creation';

type PreparationStep = 'project' | 'characters' | 'descriptions';

const preparationLabels: Record<PreparationStep, string> = {
  project: 'Project',
  characters: 'Characters',
  descriptions: 'Panel Descriptions',
};

const defaultProject: ProjectDetails = {
  projectName: '',
  genre: '',
  premise: '',
  visualTone: '',
};

function createPanelCreationState(panels: PanelDraft[]): PanelCreationState[] {
  return panels.map((panel) => ({
    panelId: panel.id,
    editDraft: '',
    lastAppliedEdit: '',
    editCount: 0,
    redoCount: 0,
  }));
}

function App() {
  const [stage, setStage] = useState<AppStage>('project');
  const [project, setProject] = useState<ProjectDetails>(defaultProject);
  const [characters, setCharacters] = useState<CharacterDraft[]>([createEmptyCharacter()]);
  const [panels, setPanels] = useState<PanelDraft[]>([createEmptyPanel()]);
  const [creationStates, setCreationStates] = useState<PanelCreationState[]>([]);
  const [activePanelIndex, setActivePanelIndex] = useState(0);

  const activePreparationStep = useMemo<PreparationStep>(() => {
    if (stage === 'characters') {
      return 'characters';
    }

    if (stage === 'descriptions' || stage === 'creation') {
      return 'descriptions';
    }

    return 'project';
  }, [stage]);

  function finalizePreparation() {
    if (panels.length === 0) {
      return;
    }

    setCreationStates(createPanelCreationState(panels));
    setActivePanelIndex(0);
    setStage('creation');
  }

  function updateEditDraft(panelId: string, value: string) {
    setCreationStates((previous) =>
      previous.map((panelState) =>
        panelState.panelId === panelId
          ? { ...panelState, editDraft: value }
          : panelState,
      ),
    );
  }

  function applyEdit(panelId: string) {
    setCreationStates((previous) =>
      previous.map((panelState) => {
        if (panelState.panelId !== panelId) {
          return panelState;
        }

        const nextInstruction = panelState.editDraft.trim();
        if (nextInstruction.length === 0) {
          return panelState;
        }

        return {
          ...panelState,
          lastAppliedEdit: nextInstruction,
          editCount: panelState.editCount + 1,
        };
      }),
    );
  }

  function redoPanel(panelId: string) {
    setCreationStates((previous) =>
      previous.map((panelState) =>
        panelState.panelId === panelId
          ? { ...panelState, redoCount: panelState.redoCount + 1 }
          : panelState,
      ),
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#e2f2ff_0%,_#f8fbff_40%,_#f3f4f6_100%)] px-4 py-8 sm:px-6">
      <div className="mx-auto mb-4 flex w-full max-w-5xl flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-white/85 p-4 shadow-sm">
        {Object.entries(preparationLabels).map(([step, label]) => {
          const typedStep = step as PreparationStep;
          const isActive = activePreparationStep === typedStep;
          const isComplete =
            typedStep === 'project'
              ? stage !== 'project'
              : typedStep === 'characters'
                ? stage === 'descriptions' || stage === 'creation'
                : stage === 'creation';

          const statusClassName = isActive
            ? 'bg-cyan-600 text-white'
            : isComplete
              ? 'bg-emerald-100 text-emerald-700'
              : 'bg-slate-100 text-slate-500';

          return (
            <div
              key={typedStep}
              className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${statusClassName}`}
            >
              {label}
            </div>
          );
        })}
        {stage === 'creation' ? (
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">
            Stage 1 locked after finalize
          </p>
        ) : null}
      </div>

      {stage === 'project' ? (
        <ProjectSection
          project={project}
          onChange={setProject}
          onNext={() => setStage('characters')}
        />
      ) : null}

      {stage === 'characters' ? (
        <CharacterSection
          characters={characters}
          onChange={setCharacters}
          onBack={() => setStage('project')}
          onNext={() => setStage('descriptions')}
        />
      ) : null}

      {stage === 'descriptions' ? (
        <PanelDescriptionSection
          panels={panels}
          characters={characters}
          onChange={setPanels}
          onBack={() => setStage('characters')}
          onFinalize={finalizePreparation}
        />
      ) : null}

      {stage === 'creation' ? (
        <PanelCreationStage
          panels={panels}
          characters={characters}
          creationStates={creationStates}
          activePanelIndex={activePanelIndex}
          onActivePanelChange={setActivePanelIndex}
          onEditDraftChange={updateEditDraft}
          onApplyEdit={applyEdit}
          onRedo={redoPanel}
        />
      ) : null}
    </div>
  );
}

export default App;
