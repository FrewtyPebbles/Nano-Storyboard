import { useState } from 'react'; // Added useState
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
  projectId: number; // Added: You need the ID from the previous step
  characters: CharacterDraft[];
  onChange: (characters: CharacterDraft[]) => void;
  onBack: () => void;
  onNext: () => void;
}

function CharacterSection({
  projectId,
  characters,
  onChange,
  onBack,
  onNext,
}: CharacterSectionProps) {
  const [isSubmitting, setIsSubmitting] = useState(false); // Loading state

  const project_id = Number(localStorage.getItem("project_id"));

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
        character.physical_description.trim().length > 0 &&
        character.back_story.trim().length > 0
      );
    });

  const canContinue = hasAtLeastOneCharacter && allCharactersValid && !isSubmitting;

  // NEW: Submission handler
  async function handleContinue() {
    setIsSubmitting(true);

    try {
      // Create a list of fetch promises for each character
      const promises = characters.map((char) =>
        fetch(`http://localhost:8000/project/${project_id}/character`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: char.name,
            age: parseInt(char.age, 10), // Convert string input to number
            gender: char.gender,
            physical_description: char.physical_description,
            back_story: char.back_story,
          }),
        })
      );

      // Execute all requests in parallel
      const responses = await Promise.all(promises);

      // Check if all requests were successful
      const allSuccessful = responses.every((res) => res.ok);

      if (allSuccessful) {
        onNext();
      } else {
        const errorData = await responses.find(r => !r.ok)?.json();
        throw new Error(errorData?.detail || "Failed to save one or more characters.");
      }
    } catch (error) {
      console.error("Submission error:", error);
      alert(`Error saving characters: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  }

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
                disabled={isSubmitting}
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
                  disabled={isSubmitting}
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
                  disabled={isSubmitting}
                />
              </FormField>
            </div>

            <FormField label="Gender" required>
              <select
                className={textInputClassName}
                value={character.gender}
                onChange={(event) => updateCharacter(character.id, 'gender', event.target.value)}
                disabled={isSubmitting}
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </FormField>

            <FormField label="Physical Description" required>
              <textarea
                className={textAreaClassName}
                rows={3}
                value={character.physical_description}
                onChange={(event) =>
                  updateCharacter(character.id, 'physical_description', event.target.value)
                }
                placeholder="Distinctive visual details"
                disabled={isSubmitting}
              />
            </FormField>

            <FormField label="Back Story" required>
              <textarea
                className={textAreaClassName}
                rows={4}
                value={character.back_story}
                onChange={(event) => updateCharacter(character.id, 'back_story', event.target.value)}
                placeholder="Brief background and motivation"
                disabled={isSubmitting}
              />
            </FormField>
          </article>
        ))}
      </div>

      {!canContinue && !isSubmitting ? (
        <p className="mt-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          Add at least one complete character. Name, Age (integer), Gender, Physical Description, and Back Story are required.
        </p>
      ) : null}

      <div className="mt-6 flex flex-wrap gap-3">
        <button 
          type="button" 
          className={secondaryButtonClassName} 
          onClick={addCharacter}
          disabled={isSubmitting}
        >
          Add Character
        </button>
      </div>

      <footer className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-6">
        <p className="text-sm text-slate-500">Step 2 of 3 (Preparation)</p>
        <div className="flex flex-wrap gap-3">
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
            disabled={!canContinue}
            onClick={handleContinue} // Changed from onNext to handleContinue
          >
            {isSubmitting ? 'Saving Characters...' : 'Continue to Panels'}
          </button>
        </div>
      </footer>
    </SectionFrame>
  );
}

export default CharacterSection;