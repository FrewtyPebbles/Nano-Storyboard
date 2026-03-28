import { useState } from 'react'

type Character = {
  id: number
  name: string
  age: string
  gender: string
  description: string
  backstory: string
}

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

  return (
    <>
      <header>
        <h1>Nano Storyboard</h1>
      </header>

      <main>
        <section>
          <h2>Nano Storyboard</h2>
          <label htmlFor="projectName">Project Name: </label>
          <input
            id="projectName"
            name="projectName"
            type="text"
            value={projectName}
            onChange={(event) => setProjectName(event.target.value)}
          />
        </section>

        <section>
          <h2>Characters</h2>

          {characters.map((character, index) => {
            const nameId = `character${character.id}Name`
            const ageId = `character${character.id}Age`
            const genderId = `character${character.id}Gender`
            const descriptionId = `character${character.id}Description`
            const backstoryId = `character${character.id}Backstory`

            return (
              <article key={character.id}>
                <h3>Character {index + 1}</h3>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                  {/* Name */}
                  <span>
                    <label htmlFor={nameId}>Name: </label>
                    <input
                      id={nameId}
                      name={nameId}
                      type="text"
                      value={character.name}
                      onChange={(event) => updateCharacter(character.id, 'name', event.target.value)}
                      placeholder="John"
                    />
                  </span>

                  {/* Age */}
                  <span>
                    <label htmlFor={ageId}>Age: </label>
                    <input
                      id={ageId}
                      name={ageId}
                      type="text"
                      value={character.age}
                      onChange={(event) => updateCharacter(character.id, 'age', event.target.value)}
                      placeholder="23"
                    />
                  </span>

                  {/* Gender */}
                  <span>
                    <label htmlFor={genderId}>Gender: </label>
                    <input
                      id={genderId}
                      name={genderId}
                      type="text"
                      value={character.gender}
                      onChange={(event) => updateCharacter(character.id, 'gender', event.target.value)}
                      placeholder="Male"
                    />
                  </span>

                  {/* Description */}
                  <span>
                    <label htmlFor={descriptionId}>Short Description: </label>
                    <textarea
                      id={descriptionId}
                      name={descriptionId}
                      value={character.description}
                      onChange={(event) => updateCharacter(character.id, 'description', event.target.value)}
                      placeholder="Tall Man that..."
                    />
                  </span>

                  {/* Backstory */}
                  <span>
                    <label htmlFor={backstoryId}>Backstory: </label>
                    <textarea
                      id={backstoryId}
                      name={backstoryId}
                      value={character.backstory}
                      onChange={(event) => updateCharacter(character.id, 'backstory', event.target.value)}
                      placeholder="He was from..."
                    />
                  </span>

                  <button type="button" onClick={() => deleteCharacter(character.id)}>
                    Delete Character
                  </button>
                </div>

              </article>
            )
          })}

          <button type="button" onClick={addCharacter}>
            Add Another Character
          </button>
        </section>
      </main>

      <footer>
        <h2>Bottom Section</h2>
      </footer>
    </>
  )
}

export default App