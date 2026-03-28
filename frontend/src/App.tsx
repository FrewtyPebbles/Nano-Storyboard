import { useState } from 'react'
// Step 1
type Character = {
  id: number
  name: string
  age: string
  gender: string
  description: string
  backstory: string
}

// Step 2
type Scene = {
  id: number
  cameraShot: string
  location: string
  time: string
  action: string
  dialogue: string
  caption: string
  characterIds: number[]
}

// Main
function App() {
  const [projectName, setProjectName] = useState('')
  const [characters, setCharacters] = useState<Character[]>([
    {
      id: 1,
      name: '',
      age: '',
      gender: '',
      description: '',
      backstory: '',
    },
  ])
  const [scenes, setScenes] = useState<Scene[]>([
    {
      id: 1,
      cameraShot: '',
      location: '',
      time: '',
      action: '',
      dialogue: '',
      caption: '',
      characterIds: [],
    },
  ])

  const addCharacter = () => {
    setCharacters((current) => {
      const nextId = current.length > 0 ? Math.max(...current.map((c) => c.id)) + 1 : 1

      return [
        ...current,
        {
          id: nextId,
          name: '',
          age: '',
          gender: '',
          description: '',
          backstory: '',
        },
      ]
    })
  }

  const deleteCharacter = (id: number) => {
    setCharacters((current) => current.filter((character) => character.id !== id))
    setScenes((current) =>
      current.map((scene) => ({
        ...scene,
        characterIds: scene.characterIds.filter((characterId) => characterId !== id),
      })),
    )
  }

  const updateCharacter = (id: number, field: keyof Omit<Character, 'id'>, value: string) => {
    setCharacters((current) =>
      current.map((character) => {
        if (character.id !== id) {
          return character
        }

        return {
          ...character,
          [field]: value,
        }
      }),
    )
  }

  const addScene = () => {
    setScenes((current) => {
      const nextId = current.length > 0 ? Math.max(...current.map((s) => s.id)) + 1 : 1

      return [
        ...current,
        {
          id: nextId,
          cameraShot: '',
          location: '',
          time: '',
          action: '',
          dialogue: '',
          caption: '',
          characterIds: [],
        },
      ]
    })
  }

  const deleteScene = (id: number) => {
    setScenes((current) => current.filter((scene) => scene.id !== id))
  }

  const updateScene = (id: number, field: keyof Omit<Scene, 'id' | 'characterIds'>, value: string) => {
    setScenes((current) =>
      current.map((scene) => {
        if (scene.id !== id) {
          return scene
        }

        return {
          ...scene,
          [field]: value,
        }
      }),
    )
  }

  const toggleSceneCharacter = (sceneId: number, characterId: number) => {
    setScenes((current) =>
      current.map((scene) => {
        if (scene.id !== sceneId) {
          return scene
        }

        const isSelected = scene.characterIds.includes(characterId)

        return {
          ...scene,
          characterIds: isSelected
            ? scene.characterIds.filter((id) => id !== characterId)
            : [...scene.characterIds, characterId],
        }
      }),
    )
  }

  return (
    <>
      <header className="mb-4">
        <h1 className="text-2xl font-bold">Nano Storyboard</h1>
      </header>

      <main className="space-y-6">
        <section className="space-y-2">
          <h2>Your Story</h2>
          <label htmlFor="projectName">Project Name: </label>
          <input
            id="projectName"
            name="projectName"
            type="text"
            value={projectName}
            onChange={(event) => setProjectName(event.target.value)}
          />
        </section>

        <section className="space-y-3">
          <h2>Characters</h2>

          {characters.map((character, index) => {
            const nameId = `character${character.id}Name`
            const ageId = `character${character.id}Age`
            const genderId = `character${character.id}Gender`
            const descriptionId = `character${character.id}Description`
            const backstoryId = `character${character.id}Backstory`

            return (
              <article key={character.id} className="space-y-2">
                <h3>Character {index + 1}</h3>

                {/* Name */}
                <label htmlFor={nameId}>Name: </label>
                <input
                  id={nameId}
                  name={nameId}
                  type="text"
                  value={character.name}
                  onChange={(event) => updateCharacter(character.id, 'name', event.target.value)}
                />


                {/* Age */}
                <label htmlFor={ageId}>Age: </label>
                <input
                  id={ageId}
                  name={ageId}
                  type="text"
                  value={character.age}
                  onChange={(event) => updateCharacter(character.id, 'age', event.target.value)}
                />


                {/* Gender */}
                <label htmlFor={genderId}>Gender: </label>
                <input
                  id={genderId}
                  name={genderId}
                  type="text"
                  value={character.gender}
                  onChange={(event) => updateCharacter(character.id, 'gender', event.target.value)}
                />


                {/* Description */}
                <label htmlFor={descriptionId}>Short Description: </label>
                <textarea
                  id={descriptionId}
                  name={descriptionId}
                  value={character.description}
                  onChange={(event) => updateCharacter(character.id, 'description', event.target.value)}
                />


                {/* Backstory */}
                <label htmlFor={backstoryId}>Backstory</label>
                <textarea
                  id={backstoryId}
                  name={backstoryId}
                  value={character.backstory}
                  onChange={(event) => updateCharacter(character.id, 'backstory', event.target.value)}
                />


                <button type="button" onClick={() => deleteCharacter(character.id)}>
                  Delete Character
                </button>

              </article>
            )
          })}

          <button type="button" onClick={addCharacter}>
            Add Another Character
          </button>
        </section>

        <section className="space-y-3">
          <h2>Scenes</h2>

          {scenes.map((scene, index) => {
            const cameraShotId = `scene${scene.id}CameraShot`
            const locationId = `scene${scene.id}Location`
            const timeId = `scene${scene.id}Time`
            const actionId = `scene${scene.id}Action`
            const dialogueId = `scene${scene.id}Dialogue`
            const captionId = `scene${scene.id}Caption`

            return (
              <article key={scene.id} className="space-y-2">
                <h3>Scene {index + 1}</h3>


                <label htmlFor={locationId}>Location: </label>
                <input
                  id={locationId}
                  name={locationId}
                  type="text"
                  value={scene.location}
                  onChange={(event) => updateScene(scene.id, 'location', event.target.value)}
                />

                <label htmlFor={timeId}>Time: </label>
                <input
                  id={timeId}
                  name={timeId}
                  type="text"
                  value={scene.time}
                  onChange={(event) => updateScene(scene.id, 'time', event.target.value)}
                />

                <label htmlFor={cameraShotId}>Camera Shot: </label>
                <input
                  id={cameraShotId}
                  name={cameraShotId}
                  type="text"
                  value={scene.cameraShot}
                  onChange={(event) => updateScene(scene.id, 'cameraShot', event.target.value)}
                />

                <label htmlFor={actionId}>Action: </label>
                <textarea
                  id={actionId}
                  name={actionId}
                  value={scene.action}
                  onChange={(event) => updateScene(scene.id, 'action', event.target.value)}
                />

                <label htmlFor={dialogueId}>Dialogue: </label>
                <textarea
                  id={dialogueId}
                  name={dialogueId}
                  value={scene.dialogue}
                  onChange={(event) => updateScene(scene.id, 'dialogue', event.target.value)}
                />

                <label htmlFor={captionId}>Caption: </label>
                <textarea
                  id={captionId}
                  name={captionId}
                  value={scene.caption}
                  onChange={(event) => updateScene(scene.id, 'caption', event.target.value)}
                />

                <fieldset>
                  <legend>Characters</legend>
                  {characters.length === 0 && <p>No characters yet.</p>}

                  {characters.map((character, characterIndex) => {
                    const sceneCharacterId = `scene${scene.id}Character${character.id}`
                    const fallbackCharacterName = `Character ${characterIndex + 1}`
                    const characterLabel = character.name.trim() === '' ? fallbackCharacterName : character.name

                    return (
                      <div key={character.id}>
                        <input
                          id={sceneCharacterId}
                          name={sceneCharacterId}
                          type="checkbox"
                          checked={scene.characterIds.includes(character.id)}
                          onChange={() => toggleSceneCharacter(scene.id, character.id)}
                        />
                        <label htmlFor={sceneCharacterId}>{characterLabel}</label>
                      </div>
                    )
                  })}
                </fieldset>

                <button type="button" onClick={() => deleteScene(scene.id)}>
                  Delete Scene
                </button>
              </article>
            )
          })}

          <button type="button" onClick={addScene}>
            Add Another Scene
          </button>
        </section>
      </main>

      <footer className="mt-6">
        <h2>Bottom Section</h2>
      </footer>
    </>
  )
}

export default App