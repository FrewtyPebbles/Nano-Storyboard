import { createId } from '../utils/createId';

export interface ProjectDetails {
  title: string;
  genre: string;
  premise: string;
  visual_tone: string;
}

export interface CharacterDraft {
  id: string;
  name: string;
  age: string;
  gender: string;
  physical_description: string;
  back_story: string;
}

export interface PanelDraft {
  id: string;
  camera_shot: string;
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
    physical_description: '',
    back_story: '',
  };
}

export function createEmptyPanel(): PanelDraft {
  return {
    id: createId(),
    camera_shot: '',
    location: '',
    time: '',
    action: '',
    dialogue: '',
    caption: '',
    characterIds: [],
  };
}
