/* @flow */

import React from "react";
import {Component} from "react";
import {Editor} from "../../src";

import './styles.css';

class FocusBlurCallbacks extends Component<any, any> {

  state: any = {
    state: 'blurred',
  };

  onFocus: Function = () => {
    this.setState({
      state: 'focused',
    });
  };

  onBlur: Function = () => {
    this.setState({
      state: 'blurred',
    });
  };

  render() {
    const { state } = this.state;
    return (
      <div className="rdw-storybook-root">
        <h3>State right now <span style={{ color: 'blue' }}>{state}</span></h3>
        <Editor
          onBlur={this.onBlur}
          onFocus={this.onFocus}
          toolbarClassName="rdw-storybook-toolbar"
          wrapperClassName="rdw-storybook-wrapper"
          editorClassName="rdw-storybook-editor"
        />
      </div>
    );
  }
}

export default FocusBlurCallbacks;