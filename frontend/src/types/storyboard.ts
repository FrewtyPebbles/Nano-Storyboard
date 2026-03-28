import { createId } from '../utils/createId';

export interface ProjectDetails {
  projectName: string;
  genre: string;
  premise: string;
  visualTone: string;
}

export interface CharacterDraft {
  id: string;
  name: string;
  age: string;
  gender: string;
  physicalDescription: string;
  backStory: string;
}

export interface PanelDraft {
  id: string;
  cameraShot: string;
  location: string;
  time: string;
  action: string;
  dialogue: string;
  caption: string;
  characterIds: string[];
}

export interface PanelCreationState {
  panelId: string;
  editDraft: string;
  lastAppliedEdit: string;
  editCount: number;
  redoCount: number;
}

export function createEmptyCharacter(): CharacterDraft {
  return {
    id: createId(),
    name: '',
    age: '',
    gender: '',
    physicalDescription: '',
    backStory: '',
  };
}

export function createEmptyPanel(): PanelDraft {
  return {
    id: createId(),
    cameraShot: '',
    location: '',
    time: '',
    action: '',
    dialogue: '',
    caption: '',
    characterIds: [],
  };
}
