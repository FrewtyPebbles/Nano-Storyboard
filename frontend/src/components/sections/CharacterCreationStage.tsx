import { useState } from 'react';
import type { CharacterDraft } from '../../types/storyboard';
import SectionFrame from '../ui/SectionFrame';
import FormField from '../ui/FormField';
import {
  primaryButtonClassName,
  secondaryButtonClassName,
  textAreaClassName,
} from '../ui/styles';

interface CharacterCreationStageProps {
  projectId: number;
  characters: CharacterDraft[];
  onUpdateCharacter: (index: number, updated: CharacterDraft) => void;
  onNext: () => void;
}

function CharacterCreationStage({
  projectId,
  characters,
  onUpdateCharacter,
  onNext,
}: CharacterCreationStageProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [editDraft, setEditDraft] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [cacheBust, setCacheBust] = useState(Date.now());

  const activeCharacter = characters[activeIndex];

  const imageUrl = activeCharacter.image
    ? `http://localhost:8000/uploads/${activeCharacter.image.replace('uploads/', '')}?t=${cacheBust}`
    : null;

  async function handleRegenerate() {
    if (!activeCharacter.backendId) return;
    setIsGenerating(true);
    try {
      const response = await fetch(
        `http://localhost:8000/project/${projectId}/character/${activeCharacter.backendId}/regenerate`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ notes: editDraft }),
        }
      );
      if (!response.ok) throw new Error('Failed to regenerate');
      const data = await response.json();
      onUpdateCharacter(activeIndex, { ...activeCharacter, image: data.image ?? '' });
      setEditDraft('');
      setCacheBust(Date.now());
    } catch (error) {
      console.error(error);
      alert('Error regenerating character image.');
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <SectionFrame
      title="Character Creation"
      subtitle="Review each character's generated reference image. Add notes and regenerate if needed."
    >
      {/* Character tabs */}
      <div className="mb-6 flex flex-wrap items-center gap-2">
        {characters.map((char, index) => {
          const isActive = index === activeIndex;
          return (
            <button
              key={char.id}
              type="button"
              className={
                isActive
                  ? 'rounded-xl bg-cyan-700 px-3 py-2 text-sm font-semibold text-white'
                  : 'rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50'
              }
              onClick={() => { setActiveIndex(index); setEditDraft(''); }}
              disabled={isGenerating}
            >
              {char.name || `Character ${index + 1}`}
            </button>
          );
        })}
      </div>

      <article className="space-y-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-6">
        <header className="flex items-center justify-between gap-3">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-slate-900">
              {activeCharacter.name || `Character ${activeIndex + 1}`}
            </h2>
            <p className="text-sm text-slate-600">Review details and regenerate if needed.</p>
          </div>
        </header>

        {/* Image display */}
        <div className="relative flex min-h-[400px] w-full items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-slate-300 bg-white">
          {isGenerating ? (
            <div className="flex flex-col items-center gap-3">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-cyan-600 border-t-transparent" />
              <p className="font-medium text-slate-600">Regenerating character image...</p>
            </div>
          ) : imageUrl ? (
            <img
              src={imageUrl}
              alt={activeCharacter.name}
              className="h-full w-full object-contain"
              key={imageUrl}
            />
          ) : (
            <div className="text-center p-6">
              <p className="text-base font-semibold text-slate-700">No Image Yet</p>
              <p className="text-sm text-slate-500">Image will appear here after generation.</p>
            </div>
          )}
        </div>

        {/* Character details */}
        <div className="grid gap-2 rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600 sm:grid-cols-2">
          <p><span className="font-semibold text-slate-800">Age:</span> {activeCharacter.age}</p>
          <p><span className="font-semibold text-slate-800">Gender:</span> {activeCharacter.gender}</p>
          <p className="sm:col-span-2">
            <span className="font-semibold text-slate-800">Physical Description:</span>{' '}
            {activeCharacter.physical_description}
          </p>
          <p className="sm:col-span-2">
            <span className="font-semibold text-slate-800">Back Story:</span>{' '}
            {activeCharacter.back_story}
          </p>
        </div>

        {/* Regenerate with notes */}
        <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
          <FormField label="Adjustment Notes">
            <textarea
              className={textAreaClassName}
              rows={3}
              value={editDraft}
              onChange={(e) => setEditDraft(e.target.value)}
              placeholder="Describe what to adjust in this character's image"
              disabled={isGenerating}
            />
          </FormField>
          <button
            type="button"
            className={primaryButtonClassName}
            onClick={handleRegenerate}
            disabled={isGenerating}
          >
            {isGenerating ? 'Regenerating...' : 'Regenerate Image'}
          </button>
        </section>
      </article>

      <footer className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-6">
        <p className="text-sm text-slate-500">
          Character {activeIndex + 1} of {characters.length}
        </p>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            className={secondaryButtonClassName}
            disabled={activeIndex === 0 || isGenerating}
            onClick={() => { setActiveIndex(activeIndex - 1); setEditDraft(''); }}
          >
            Previous
          </button>
          <button
            type="button"
            className={secondaryButtonClassName}
            disabled={activeIndex === characters.length - 1 || isGenerating}
            onClick={() => { setActiveIndex(activeIndex + 1); setEditDraft(''); }}
          >
            Next
          </button>
          <button
            type="button"
            className={primaryButtonClassName}
            disabled={isGenerating}
            onClick={onNext}
          >
            Continue to Panel Descriptions
          </button>
        </div>
      </footer>
    </SectionFrame>
  );
}

export default CharacterCreationStage;
