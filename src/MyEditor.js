import React, { useState, useEffect } from 'react';
import { Editor, EditorState, RichUtils, convertToRaw, convertFromRaw } from 'draft-js';
import 'draft-js/dist/Draft.css';

function MyEditor() {
    const [editorState, setEditorState] = useState(() => {
        const savedData = localStorage.getItem('draftEditorContent');
        if (savedData) {
            const contentState = convertFromRaw(JSON.parse(savedData));
            return EditorState.createWithContent(contentState);
        }
        return EditorState.createEmpty();
    });
    useEffect(() => {
        const contentState = editorState.getCurrentContent();
        const rawContentState = convertToRaw(contentState);
        localStorage.setItem('draftEditorContent', JSON.stringify(rawContentState));
    }, [editorState]);

    const handleChange = (newEditorState) => {
        setEditorState(newEditorState);
    };



    const handleBeforeInput = (chars, editorState) => {
        const selection = editorState.getSelection();
        const contentState = editorState.getCurrentContent();
        const block = contentState.getBlockForKey(selection.getStartKey());
        const startOffset = selection.getStartOffset();
        const text = block.getText();



        if (chars === ' ' && text[startOffset - 1] === '#') {
            const newEditorState = RichUtils.toggleBlockType(editorState, 'header-one');
            handleChange(newEditorState);
            return 'handled';
        }
        if (chars === ' ' && text[startOffset - 1] === '*' && block.text === "*") {
            const newEditorState = RichUtils.toggleInlineStyle(editorState, 'BOLD');
            handleChange(newEditorState);
            return 'handled';
        }

        if (chars === ' ' && block.text === "***") {
            handleChange(RichUtils.toggleInlineStyle(editorState, 'UNDERLINE'));
            return 'handled';
        }

        if (chars === ' ' && block.text === "**") {
            const currentStyle = editorState.getCurrentInlineStyle();
            const newStyle = currentStyle.has('RED_FONT_COLOR')
                ? currentStyle.remove('RED_FONT_COLOR')
                : currentStyle.add('RED_FONT_COLOR');
            const newEditorState = EditorState.setInlineStyleOverride(editorState, newStyle);
            setEditorState(newEditorState);
            return 'handled';
        }



        return 'not-handled';
    };

    const styleMap = {
        RED_FONT_COLOR: {
            color: 'red'
        }
    };
    return (
        <div>
            <Editor
                editorState={editorState}
                onChange={handleChange}
                handleBeforeInput={handleBeforeInput}
                customStyleMap={styleMap}
            />
        </div>
    );
}

export default MyEditor;

