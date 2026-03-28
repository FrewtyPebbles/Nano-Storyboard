import { useRef } from 'react';
import type { page_types } from '../App';

interface Props {
    redirect:(to:page_types, project_id:number) => void;
}

const ProjectPage = ({redirect}:Props) => {
    const title_ref = useRef("");
    const genre_ref = useRef("");
    const premise_ref = useRef("");
    const visual_tone_ref = useRef("");
    async function post_project() {
        const response = await fetch(`http://localhost:8000/project`, {
            method:"POST",
            body:JSON.stringify({
                title:title_ref.current,
                genre:genre_ref.current,
                premise:premise_ref.current,
                visual_tone:visual_tone_ref.current,
            })
        });
        const project_id:number = await response.json();
        redirect("editor", project_id);
    }

    return (
        <form>
            <input type="text" name="title" placeholder='Title' onChange={(e) => {title_ref.current = e.target.value}} />
            <br />
            <input type="text" name="genre" placeholder='Genre' onChange={(e) => {genre_ref.current = e.target.value}} />
            <br />
            <textarea name="premise" placeholder='Premise' onChange={(e) => {premise_ref.current = e.target.value}} />
            <br />
            <textarea name="visual_tone" placeholder='Visual Tone' onChange={(e) => {visual_tone_ref.current = e.target.value}} />
            <br />
            <button onClick={post_project}>Submit</button>
        </form>
    );
}

export default ProjectPage;
