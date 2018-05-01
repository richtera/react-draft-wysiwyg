/* @flow */

import React from "react";
import {Component} from "react";
import PropTypes from "prop-types";
import {getSelectionCustomInlineStyle, toggleCustomInlineStyle} from "draftjs-utils";

import LayoutComponent from "./Component";

export class fontSize extends Component<any, any> {
  static propTypes = {
    onChange: PropTypes.func.isRequired,
    editorState: PropTypes.object,
    modalHandler: PropTypes.object,
    config: PropTypes.object,
    translations: PropTypes.object,
  };
  signalExpanded: boolean;
  state = {
    expanded: undefined,
    currentFontSize: undefined,
  };

  constructor(props, context) {
    super(props, context);
  }

  componentWillMount(): void {
    const { editorState, modalHandler } = this.props;
    if (editorState) {
      this.setState({
        currentFontSize:
          getSelectionCustomInlineStyle(editorState, ['FONTSIZE']).FONTSIZE,
      });
    }
    modalHandler.registerCallBack(this.expandCollapse);
  }

  componentWillReceiveProps(properties: any): void {
    if (properties.editorState &&
      this.props.editorState !== properties.editorState) {
      this.setState({
        currentFontSize:
          getSelectionCustomInlineStyle(properties.editorState, ['FONTSIZE']).FONTSIZE,
      });
    }
  }

  componentWillUnmount(): void {
    const { modalHandler } = this.props;
    modalHandler.deregisterCallBack(this.expandCollapse);
  }

  onExpandEvent = (): void => {
    this.signalExpanded = !this.state.expanded;
  }

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
  }

  doCollapse = (): void => {
    this.setState({
      expanded: false,
    });
  }

  toggleFontSize = (fontSize: number) => {
    const { editorState, onChange } = this.props;
    const newState = toggleCustomInlineStyle(
      editorState,
      'fontSize',
      fontSize,
    );
    if (newState) {
      onChange(newState);
    }
  }

  render() {
    const { config, translations } = this.props;
    const { expanded, currentFontSize } = this.state;
    const FontSizeComponent = config.component || LayoutComponent;
    const fontSize = currentFontSize && Number(currentFontSize.substring(9));
    return (
      <FontSizeComponent
        config={config}
        translations={translations}
        currentState={{ fontSize }}
        onChange={this.toggleFontSize}
        expanded={expanded}
        onExpandEvent={this.onExpandEvent}
        doExpand={this.doExpand}
        doCollapse={this.doCollapse}
      />
    );
  }
}

export default fontSize;
