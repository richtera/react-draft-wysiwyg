/* @flow */

import * as React from 'react';
import {Component} from 'react';
import {convertToRaw, EditorState} from 'draft-js';
import draftToMarkdown from 'draftjs-to-markdown';
import {Editor} from '../../src';

class ConvertToRawDraftContentEditor extends Component {
  state = {
    editorState: EditorState.createEmpty(),
  }

  onEditorStateChange: Function = (editorState) => {
    this.setState({
      editorState,
    });
  };

  render() {
    const { editorState } = this.state;
    return (<div className="rdw-storybook-root">
      <Editor
        editorState={editorState}
        toolbarClassName="rdw-storybook-toolbar"
        wrapperClassName="rdw-storybook-wrapper"
        editorClassName="rdw-storybook-editor"
        onEditorStateChange={this.onEditorStateChange}
      />
      <textarea
        readOnly
        className="rdw-storybook-textarea"
        value={draftToMarkdown(convertToRaw(editorState.getCurrentContent()))}
      />
    </div>);
  }
}

export default ConvertToRawDraftContentEditor;
