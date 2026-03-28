import { useState } from 'react'
import ProjectPage from './project_page/project-page';
import EditorPage from './editor_page/editor-page';

type page_types = "create project" | "editor"

function App() {
  const [page, setPage] =  useState<page_types>("create project");

  switch (page) {
    case PageEnum.CREATE_PROJECT:
      return <ProjectPage/>

    case PageEnum.EDITOR:
      return <EditorPage/>
  }
}

export default App