import React from "react";
import {Component} from "react";
import PropTypes from "prop-types";
import {EditorState, Modifier, RichUtils} from "draft-js";
import {getEntityRange, getSelectionEntity, getSelectionText} from "draftjs-utils";

import LayoutComponent from "./Component";

export class pubmedlink extends Component<any, any> {
  static propTypes = {
    editorState: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired,
    modalHandler: PropTypes.object,
    config: PropTypes.object,
    translations: PropTypes.object,
  };

  state = {
    expanded: false,
    selectionText: undefined,
    currentEntity: undefined,
  };
  signalExpanded: boolean;

  constructor(props, context) {
    super(props, context);
  }

  componentWillMount(): void {
    const { editorState, modalHandler } = this.props;
    if (editorState) {
      this.setState({
        currentEntity: getSelectionEntity(editorState),
      });
    }
    modalHandler.registerCallBack(this.expandCollapse);
  }

  componentWillReceiveProps(properties: any): void {
    const newState: any = {};
    if (properties.editorState &&
      this.props.editorState !== properties.editorState) {
      newState.currentEntity = getSelectionEntity(properties.editorState);
    }
    this.setState(newState);
  }

  componentWillUnmount(): void {
    const { modalHandler } = this.props;
    modalHandler.deregisterCallBack(this.expandCollapse);
  }

  onExpandEvent = (): void => {
    this.signalExpanded = !this.state.expanded;
  }

  onChange = (result) => {
    this.addPubMedLink(result);
  }

  getCurrentValues = () => {
    const { editorState } = this.props;
    const { currentEntity } = this.state;
    const contentState = editorState.getCurrentContent();
    const currentValues: any = {};
    if (currentEntity && (contentState.getEntity(currentEntity).get('type') === 'LINK')) {
      currentValues.link = {};
      const entityRange = currentEntity && getEntityRange(editorState, currentEntity);
      currentValues.link.target = currentEntity && contentState.getEntity(currentEntity).get('data').url;
      currentValues.link.targetOption = currentEntity && contentState.getEntity(currentEntity).get('data').target;
      currentValues.link.title = (entityRange && entityRange.text);
    }
    currentValues.selectionText = getSelectionText(editorState);
    return currentValues;
  }

  expandCollapse = (): void => {
    this.setState({
      expanded: this.signalExpanded,
    });
    this.signalExpanded = false;
  }

  doCollapse = (): void => {
    this.setState({
      expanded: false,
    });
  }

  addPubMedLink = (result): void => {
    const { id, authors, title, pubdate, url } = result;
    const { onChange, translations } = this.props;
    let { editorState } = this.props;
    let contentState = editorState.getCurrentContent();

    // authors
    contentState = Modifier.insertText(contentState, editorState.getSelection(), authors.join(', '));
    editorState = EditorState.push(editorState, contentState, 'insert-characters');
    contentState = Modifier.splitBlock(contentState, contentState.getSelectionAfter());

    // title
    contentState = Modifier.insertText(contentState, contentState.getSelectionAfter(), title);
    editorState = EditorState.push(editorState, contentState, 'insert-characters');
    contentState = Modifier.splitBlock(contentState, contentState.getSelectionAfter());

    // pubdate
    contentState = Modifier.insertText(contentState, contentState.getSelectionAfter(), pubdate);
    editorState = EditorState.push(editorState, contentState, 'insert-characters');
    contentState = Modifier.splitBlock(contentState, contentState.getSelectionAfter());

    // url
    const entityKey = contentState
      .createEntity('LINK', 'MUTABLE', { url, target: '_blank' })
      .getLastCreatedEntityKey();
    contentState = Modifier.replaceText(
      contentState,
      contentState.getSelectionAfter(),
      `[${translations['components.controls.pubmedlink.pubMedId']}: ${id}]`,
      editorState.getCurrentInlineStyle(),
      entityKey,
    );
    editorState = EditorState.push(editorState, contentState, 'insert-characters');

    onChange(editorState);
    this.doCollapse();
  }

  render() {
    const { config, translations } = this.props;
    const { expanded } = this.state;
    const { selectionText } = this.getCurrentValues();
    const PubMedLinkComponent = config.component || LayoutComponent;
    return (
      <PubMedLinkComponent
        config={config}
        translations={translations}
        expanded={expanded}
        onExpandEvent={this.onExpandEvent}
        doCollapse={this.doCollapse}
        currentState={{
          selectionText,
        }}
        onChange={this.onChange}
      />
    );
  }
}

export default pubmedlink;

// todo refct
// 1. better action names here
// 2. align update signatue
// 3. align current value signature
