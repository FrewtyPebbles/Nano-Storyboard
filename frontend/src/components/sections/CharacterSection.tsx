import type { CharacterDraft } from '../../types/storyboard';
import { createEmptyCharacter } from '../../types/storyboard';
import FormField from '../ui/FormField';
import SectionFrame from '../ui/SectionFrame';
import {
  dangerButtonClassName,
  primaryButtonClassName,
  secondaryButtonClassName,
  textAreaClassName,
  textInputClassName,
} from '../ui/styles';

interface CharacterSectionProps {
  characters: CharacterDraft[];
  onChange: (characters: CharacterDraft[]) => void;
  onBack: () => void;
  onNext: () => void;
}

function CharacterSection({
  characters,
  onChange,
  onBack,
  onNext,
}: CharacterSectionProps) {
  function updateCharacter(
    characterId: string,
    key: keyof Omit<CharacterDraft, 'id'>,
    value: string,
  ) {
    onChange(
      characters.map((character) =>
        character.id === characterId ? { ...character, [key]: value } : character,
      ),
    );
  }

  function addCharacter() {
    onChange([...characters, createEmptyCharacter()]);
  }

  function removeCharacter(characterId: string) {
    onChange(characters.filter((character) => character.id !== characterId));
  }

  const hasAtLeastOneCharacter = characters.length > 0;
  const allCharactersValid =
    hasAtLeastOneCharacter &&
    characters.every((character) => {
      const parsedAge = Number(character.age);

      return (
        character.name.trim().length > 0 &&
        character.gender.trim().length > 0 &&
        Number.isInteger(parsedAge) &&
        parsedAge >= 0 &&
        character.physicalDescription.trim().length > 0 &&
        character.backStory.trim().length > 0
      );
    });

  const canContinue = hasAtLeastOneCharacter && allCharactersValid;

  return (
    <SectionFrame
      title="Character Section"
      subtitle="Create one or more characters. You can add and remove characters before finalizing Stage 1."
    >
      <div className="space-y-4">
        {characters.map((character, index) => (
          <article
            key={character.id}
            className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-5"
          >
            <header className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-slate-800">Character {index + 1}</h2>
              <button
                type="button"
                className={dangerButtonClassName}
                onClick={() => removeCharacter(character.id)}
              >
                Delete
              </button>
            </header>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField label="Name" required>
                <input
                  className={textInputClassName}
                  value={character.name}
                  onChange={(event) => updateCharacter(character.id, 'name', event.target.value)}
                  placeholder="Character name"
                />
              </FormField>

              <FormField label="Age" required>
                <input
                  type="number"
                  min={0}
                  step={1}
                  className={textInputClassName}
                  value={character.age}
                  onChange={(event) => updateCharacter(character.id, 'age', event.target.value)}
                  placeholder="Age"
                />
              </FormField>
            </div>

            <FormField label="Gender" required>
              <input
                className={textInputClassName}
                value={character.gender}
                onChange={(event) => updateCharacter(character.id, 'gender', event.target.value)}
                placeholder="Gender"
              />
            </FormField>

            <FormField label="Physical Description" required>
              <textarea
                className={textAreaClassName}
                rows={3}
                value={character.physicalDescription}
                onChange={(event) =>
                  updateCharacter(character.id, 'physicalDescription', event.target.value)
                }
                placeholder="Distinctive visual details"
              />
            </FormField>

            <FormField label="Back Story" required>
              <textarea
                className={textAreaClassName}
                rows={4}
                value={character.backStory}
                onChange={(event) => updateCharacter(character.id, 'backStory', event.target.value)}
                placeholder="Brief background and motivation"
              />
            </FormField>
          </article>
        ))}
      </div>

      {!canContinue ? (
        <p className="mt-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          Add at least one complete character. Name, Age (integer), Gender, Physical Description, and Back Story are required.
        </p>
      ) : null}

      <div className="mt-6 flex flex-wrap gap-3">
        <button type="button" className={secondaryButtonClassName} onClick={addCharacter}>
          Add Character
        </button>
      </div>

      <footer className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-6">
        <p className="text-sm text-slate-500">Step 2 of 3 (Preparation)</p>
        <div className="flex flex-wrap gap-3">
          <button type="button" className={secondaryButtonClassName} onClick={onBack}>
            Back
          </button>
          <button
            type="button"
            className={primaryButtonClassName}
            disabled={!canContinue}
            onClick={onNext}
          >
            Continue to Panels
          </button>
        </div>
      </footer>
    </SectionFrame>
  );
}

export default CharacterSection;
