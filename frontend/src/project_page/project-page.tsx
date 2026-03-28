import React from 'react';

const ProjectPage = () => {
    return (
        <form>
            <input type="text" name="title" placeholder='Title' />
            <br />
            <input type="text" name="genre" placeholder='Genre' />
            <br />
            <textarea name="premise" placeholder='Premise' />
            <br />
            <textarea name="visual_tone" placeholder='Visual Tone' />
        </form>
    );
}

export default ProjectPage;
