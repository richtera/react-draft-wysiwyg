/* @flow */

import React from "react";
import {Component} from "react";
import {Editor} from "../../src";

class BasicContentState extends Component<any, any> {
  state = {
    contentState: JSON.parse('{"entityMap":{},"blocks":[{"key":"1ljs","text":"Initializing from content state","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}}]}'),
  }

  render() {
    const { contentState } = this.state;
    return (<div className="rdw-storybook-root">
      <span>Content state is JSON
        <pre>
          {'{"entityMap":{},"blocks":[{"key":"1ljs","text":"Initializing from content state","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}}]}'}
        </pre>
      </span>
      <Editor
        defaultContentState={contentState}
        toolbarClassName="rdw-storybook-toolbar"
        wrapperClassName="rdw-storybook-wrapper"
        editorClassName="rdw-storybook-editor"
      />
    </div>);
  }
}

export default BasicContentState;
