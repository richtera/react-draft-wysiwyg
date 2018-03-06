/* @flow */

import React from "react";
import {Component} from "react";
import {convertToRaw, EditorState} from "draft-js";
import draftToHtml from "draftjs-to-html";
import {Editor} from "../../src";

class ConvertToRawDraftContent extends Component<any, any> {
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
        mention={{
          separator: ' ',
          trigger: '@',
          suggestions: [
            { text: 'APPLE', value: 'apple', url: 'apple' },
            { text: 'BANANA', value: 'banana', url: 'banana' },
            { text: 'CHERRY', value: 'cherry', url: 'cherry' },
            { text: 'DURIAN', value: 'durian', url: 'durian' },
            { text: 'EGGFRUIT', value: 'eggfruit', url: 'eggfruit' },
            { text: 'FIG', value: 'fig', url: 'fig' },
            { text: 'GRAPEFRUIT', value: 'grapefruit', url: 'grapefruit' },
            { text: 'HONEYDEW', value: 'honeydew', url: 'honeydew' },
          ],
        }}
        editorState={editorState}
        toolbarClassName="rdw-storybook-toolbar"
        wrapperClassName="rdw-storybook-wrapper"
        editorClassName="rdw-storybook-editor"
        onEditorStateChange={this.onEditorStateChange}
      />
      <textarea
        readOnly
        className="rdw-storybook-textarea"
        value={draftToHtml(convertToRaw(editorState.getCurrentContent()))}
      />
    </div>);
  }
}

export default ConvertToRawDraftContent;