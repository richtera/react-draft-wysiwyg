/* @flow */

import React from "react";
import {Component} from "react";
import {PropTypes} from "prop-types";
import {EditorState, Modifier} from "draft-js";

import LayoutComponent from "./Component";

export class emoji extends Component<any, any> {
  static propTypes: Object = {
    editorState: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired,
    modalHandler: PropTypes.object,
    config: PropTypes.object,
    translations: PropTypes.object,
  };

  state = {
    expanded: false,
  };
  signalExpanded: boolean;

  constructor(props, context) {
    super(props, context);
  }

  componentWillMount(): void {
    const { modalHandler } = this.props;
    modalHandler.registerCallBack(this.expandCollapse);
  }

  componentWillUnmount(): void {
    const { modalHandler } = this.props;
    modalHandler.deregisterCallBack(this.expandCollapse);
  }

  onExpandEvent = (): void => {
    this.signalExpanded = !this.state.expanded;
  };

  expandCollapse = (): void => {
    this.setState({
      expanded: this.signalExpanded,
    });
    this.signalExpanded = false;
  }

  doExpand = (): void => {
    this.setState({
      expanded: true,
    });
  };

  doCollapse = (): void => {
    this.setState({
      expanded: false,
    });
  };

  addEmoji: Function = (emoji: string): void => {
    const { editorState, onChange } = this.props;
    const contentState = Modifier.replaceText(
      editorState.getCurrentContent(),
      editorState.getSelection(),
      emoji,
      editorState.getCurrentInlineStyle(),
    );
    onChange(EditorState.push(editorState, contentState, 'insert-characters'));
    this.doCollapse();
  };

  render(): Object {
    const { config, translations } = this.props;
    const { expanded } = this.state;
    const EmojiComponent = config.component || LayoutComponent;
    return (
      <EmojiComponent
        config={config}
        translations={translations}
        onChange={this.addEmoji}
        expanded={expanded}
        onExpandEvent={this.onExpandEvent}
        doExpand={this.doExpand}
        doCollapse={this.doCollapse}
        onCollpase={this.closeModal}
      />
    );
  }
}

// todo: unit test cases
export default emoji;
