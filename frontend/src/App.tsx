import { useState } from 'react';
import CharacterSection from './components/sections/CharacterSection';
import CharacterCreationStage from './components/sections/CharacterCreationStage';
import PanelCreationStage from './components/sections/PanelCreationStage';
import PanelDescriptionSection from './components/sections/PanelDescriptionSection';
import ProjectSection from './components/sections/ProjectSection';
import ProjectsListView, { type ApiProject } from './components/sections/ProjectsListView';
import StoryboardView from './components/sections/StoryboardView';
import { createId } from './utils/createId';
import {
  type PanelCreationState,
  createEmptyCharacter,
  createEmptyPanel,
  type CharacterDraft,
  type PanelDraft,
  type ProjectDetails,
} from './types/storyboard';

export type page_types = 'create project' | 'editor';

type AppStage = 'project' | 'characters' | 'character-creation' | 'descriptions' | 'creation' | 'storyboard';

const STAGE_ORDER: AppStage[] = ['project', 'characters', 'character-creation', 'descriptions', 'creation', 'storyboard'];

const NAV_LABELS: Record<AppStage, string> = {
  project: 'Project',
  characters: 'Characters',
  'character-creation': 'Character Review',
  descriptions: 'Panel Descriptions',
  creation: 'Panel Creation',
  storyboard: 'Storyboard',
};

const defaultProject: ProjectDetails = { title: '', genre: '', premise: '', visual_tone: '' };

function createPanelCreationState(panels: PanelDraft[]): PanelCreationState[] {
  return panels.map((panel) => ({
    panelId: panel.id,
    editDraft: '',
    lastAppliedEdit: '',
    editCount: 0,
    redoCount: 0,
  }));
}

type RootView = 'projects' | 'workflow';

function App() {
  const [rootView, setRootView] = useState<RootView>('projects');
  const [stage, setStage] = useState<AppStage>('project');
  const [furthestStageIndex, setFurthestStageIndex] = useState(0);
  const [project, setProject] = useState<ProjectDetails>(defaultProject);
  const [projectId, setProjectId] = useState<number>(0);
  const [characters, setCharacters] = useState<CharacterDraft[]>([createEmptyCharacter()]);
  const [panels, setPanels] = useState<PanelDraft[]>([createEmptyPanel()]);
  const [creationStates, setCreationStates] = useState<PanelCreationState[]>([]);
  const [activePanelIndex, setActivePanelIndex] = useState(0);

  function goToStage(s: AppStage) {
    const idx = STAGE_ORDER.indexOf(s);
    setStage(s);
    if (idx > furthestStageIndex) setFurthestStageIndex(idx);
  }

  function loadProject(apiProject: ApiProject) {
    // Build CharacterDrafts from API data, giving each a fresh local id
    const chars: CharacterDraft[] = apiProject.characters.map((c) => ({
      id: createId(),
      backendId: c.id,
      image: c.image ?? `uploads/projects/${apiProject.id}/characters/${c.id}/1.png`,
      name: c.name,
      age: String(c.age),
      gender: c.gender,
      physical_description: c.physical_description,
      back_story: c.back_story ?? '',
    }));

    // Build PanelDrafts, remapping backend character IDs → local UUIDs
    const loadedPanels: PanelDraft[] = apiProject.panels
      .slice()
      .sort((a, b) => (a.sequence ?? 0) - (b.sequence ?? 0))
      .map((p) => ({
        id: createId(),
        backendId: p.id,
        image: p.image ?? `uploads/projects/${apiProject.id}/panels/${p.sequence}.png`,
        camera_shot: p.camera_shot ?? '',
        location: p.location ?? '',
        time: p.time ?? '',
        action: p.action ?? '',
        dialogue: p.dialogue ?? '',
        caption: p.caption ?? '',
        characterIds: (p.character_ids ?? [])
          .map((cid) => chars.find((c) => c.backendId === cid)?.id ?? '')
          .filter(Boolean),
      }));

    localStorage.setItem('project_id', String(apiProject.id));
    setProjectId(apiProject.id);
    setProject({
      title: apiProject.title,
      genre: apiProject.genre ?? '',
      premise: apiProject.premise ?? '',
      visual_tone: apiProject.visual_tone ?? '',
    });
    setCharacters(chars.length > 0 ? chars : [createEmptyCharacter()]);
    setPanels(loadedPanels.length > 0 ? loadedPanels : [createEmptyPanel()]);
    setCreationStates(createPanelCreationState(loadedPanels));
    setActivePanelIndex(0);
    setFurthestStageIndex(STAGE_ORDER.indexOf('creation'));
    setStage('creation');
    setRootView('workflow');
  }

  function finalizePreparation() {
    if (panels.length === 0) return;
    setCreationStates(createPanelCreationState(panels));
    setActivePanelIndex(0);
    goToStage('creation');
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
        if (panelState.panelId !== panelId) return panelState;
        const nextInstruction = panelState.editDraft.trim();
        if (nextInstruction.length === 0) return panelState;
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

  if (rootView === 'projects') {
    return (
      <ProjectsListView
        onSelectProject={loadProject}
        onNewProject={() => {
          setStage('project');
          setFurthestStageIndex(0);
          setCharacters([createEmptyCharacter()]);
          setPanels([createEmptyPanel()]);
          setRootView('workflow');
        }}
      />
    );
  }

  return (
    <div className={`min-h-screen bg-[radial-gradient(circle_at_top,_#e2f2ff_0%,_#f8fbff_40%,_#f3f4f6_100%)] ${stage === 'storyboard' ? 'px-2 py-6' : 'px-4 py-8 sm:px-6'}`}>
      {/* Nav bar — always visible */}
      <div className="mx-auto mb-4 flex w-full max-w-5xl flex-wrap items-center gap-2 rounded-2xl border border-slate-200 bg-white/85 p-3 shadow-sm">
        <button
          type="button"
          onClick={() => setRootView('projects')}
          className="rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide bg-slate-800 text-white hover:bg-slate-700 transition-colors"
        >
          ← Projects
        </button>
        <div className="h-4 w-px bg-slate-200" />
        {STAGE_ORDER.map((s) => {
          const idx = STAGE_ORDER.indexOf(s);
          const isActive = stage === s;
          const isReachable = idx <= furthestStageIndex;

          const className = [
            'rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide transition-colors',
            isActive
              ? 'bg-cyan-600 text-white'
              : isReachable
                ? 'bg-emerald-100 text-emerald-700 cursor-pointer hover:bg-emerald-200'
                : 'bg-slate-100 text-slate-400 cursor-default',
          ].join(' ');

          return (
            <button
              key={s}
              type="button"
              className={className}
              onClick={() => isReachable && goToStage(s)}
              disabled={!isReachable}
            >
              {NAV_LABELS[s]}
            </button>
          );
        })}
      </div>

      {stage === 'project' && (
        <ProjectSection
          project={project}
          onChange={setProject}
          onNext={() => {
            setProjectId(Number(localStorage.getItem("project_id")));
            goToStage('characters');
          }}
        />
      )}

      {stage === 'characters' && (
        <CharacterSection
          projectId={projectId}
          characters={characters}
          onChange={setCharacters}
          onBack={() => goToStage('project')}
          onNext={() => goToStage('character-creation')}
        />
      )}

      {stage === 'character-creation' && (
        <CharacterCreationStage
          projectId={projectId}
          characters={characters}
          onUpdateCharacter={(index, updated) =>
            setCharacters((prev) => prev.map((c, i) => (i === index ? updated : c)))
          }
          onNext={() => goToStage('descriptions')}
        />
      )}

      {stage === 'descriptions' && (
        <PanelDescriptionSection
          projectId={projectId}
          panels={panels}
          characters={characters}
          onChange={setPanels}
          onBack={() => goToStage('characters')}
          onFinalize={finalizePreparation}
        />
      )}

      {stage === 'creation' && (
        <PanelCreationStage
          projectId={projectId}
          panels={panels}
          characters={characters}
          creationStates={creationStates}
          activePanelIndex={activePanelIndex}
          onActivePanelChange={setActivePanelIndex}
          onEditDraftChange={updateEditDraft}
          onApplyEdit={applyEdit}
          onRedo={redoPanel}
          onUpdatePanel={(index, updatedPanel) =>
            setPanels((prev) => prev.map((p, i) => (i === index ? updatedPanel : p)))
          }
          onViewStoryboard={() => goToStage('storyboard')}
        />
      )}

      {stage === 'storyboard' && (
        <StoryboardView
          panels={panels}
          onBack={() => goToStage('creation')}
        />
      )}
    </div>
  );
}

export default App;