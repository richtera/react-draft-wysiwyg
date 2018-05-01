/* @flow */

import React from "react";
import {Component} from "react";
import PropTypes from "prop-types";
import {AtomicBlockUtils, EditorState, Modifier} from "draft-js";

import LayoutComponent from "./Component";
import {getEntityRange} from "draftjs-utils";

export class media extends Component<any, any> {

  static propTypes = {
    editorState: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired,
    modalHandler: PropTypes.object,
    config: PropTypes.object,
    translations: PropTypes.object,
  };

  state: any = {
    expanded: false,
    matchMime: null,
  };
  signalExpanded: boolean;

  constructor(props, context) {
    super(props, context);
    const { config: { inputAccept }} = this.props;
    this.state.matchMime = new RegExp(`^(${inputAccept.split(',').filter((item) => !/^(video|audio|image)\/.*$/.test(item)).map((item) => `${item.replace('*', '.*')}`).join('|')})$`);
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
  }

  doExpand = (): void => {
    this.setState({
      expanded: true,
    });
  }

  doCollapse = (): void => {
    this.setState({
      expanded: false,
    });
  }

  expandCollapse = (): void => {
    this.setState({
      expanded: this.signalExpanded,
    });
    this.signalExpanded = false;
  }

  addMedia = (mimeType: string, src: string, height: string, width: string): void => {
    if (this.state.matchMime.test(mimeType)) {
      const { editorState, onChange } = this.props;
      let selection = editorState.getSelection();

      const entityKey = editorState
        .getCurrentContent()
        .createEntity('LINK', 'MUTABLE', { url: src, target: '_download' })
        .getLastCreatedEntityKey();
      let name: any = src.split('/');
      name = name[name.length - 1];
      let contentState = Modifier.replaceText(
        editorState.getCurrentContent(),
        selection,
        `${name}`,
        editorState.getCurrentInlineStyle(),
        entityKey,
      );
      let newEditorState = EditorState.push(editorState, contentState, 'insert-characters');

      // insert a blank space after link
      selection = newEditorState.getSelection().merge({
        anchorOffset: selection.get('anchorOffset') + name.length,
        focusOffset: selection.get('anchorOffset') + name.length,
      });
      newEditorState = EditorState.acceptSelection(newEditorState, selection);
      contentState = Modifier.insertText(
        newEditorState.getCurrentContent(),
        selection,
        ' ',
        newEditorState.getCurrentInlineStyle(),
        undefined,
      );
      onChange(EditorState.push(newEditorState, contentState, 'insert-characters'));
      this.doCollapse();
      return;
    }
    const { editorState, onChange } = this.props;
    const entityKey = editorState
      .getCurrentContent()
      .createEntity(mimeType.split('/')[0].toUpperCase(), 'MUTABLE', { src, height, width, mimeType })
      .getLastCreatedEntityKey();
    const newEditorState = AtomicBlockUtils.insertAtomicBlock(
      editorState,
      entityKey,
      ' ',
    );
    onChange(newEditorState);
    this.doCollapse();
  }

  render() {
    const { config, translations } = this.props;
    const { expanded } = this.state;
    const MediaComponent = config.component || LayoutComponent;
    return (
      <MediaComponent
        config={config}
        translations={translations}
        onChange={this.addMedia}
        expanded={expanded}
        onExpandEvent={this.onExpandEvent}
        doExpand={this.doExpand}
        doCollapse={this.doCollapse}
      />
    );
  }
}

export default media;
