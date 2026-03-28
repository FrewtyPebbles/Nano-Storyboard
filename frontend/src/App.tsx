import { useState } from 'react'
import ProjectPage from './project_page/project-page';
import EditorPage from './editor_page/editor-page';

export type page_types = "create project" | "editor"

function App() {
  const [page, set_page] =  useState<page_types>("create project");
  const [project_id_state, set_project_id_state] = useState(() => {
    const saved = localStorage.getItem('project_id');
    return Number(saved) || null;
  });

  function set_project_id(project_id:number) {
    localStorage.setItem('project_id', project_id.toString());
    set_project_id_state(project_id);
  }

  const EDITOR = <EditorPage/>;

  const CREATE_PROJECT_PAGE  = <ProjectPage redirect={(to, project_id) => {
    set_page(to);
    set_project_id(project_id);
  }}/>

  if (project_id_state != null) {
    return EDITOR
  }

  switch (page) {
    case "create project":
      return CREATE_PROJECT_PAGE

    case "editor":
      return EDITOR
  }
}

export default App