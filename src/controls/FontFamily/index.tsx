/* @flow */

import React from "react";
import {Component} from "react";
import PropTypes from "prop-types";
import {getSelectionCustomInlineStyle, toggleCustomInlineStyle} from "draftjs-utils";

import LayoutComponent from "./Component";

export class fontFamily extends Component<any, any> {
  static propTypes = {
    onChange: PropTypes.func.isRequired,
    editorState: PropTypes.object,
    modalHandler: PropTypes.object,
    config: PropTypes.object,
    translations: PropTypes.object,
  };

  state = {
    expanded: undefined,
    currentFontFamily: undefined,
  };
  signalExpanded: boolean;

  constructor(props, context) {
    super(props, context);
  }

  componentWillMount(): void {
    const { editorState, modalHandler } = this.props;
    if (editorState) {
      this.setState({
        currentFontFamily: getSelectionCustomInlineStyle(editorState, ['FONTFAMILY']).FONTFAMILY,
      });
    }
    modalHandler.registerCallBack(this.expandCollapse);
  }

  componentWillReceiveProps(properties: any): void {
    if (properties.editorState &&
      this.props.editorState !== properties.editorState) {
      this.setState({
        currentFontFamily:
          getSelectionCustomInlineStyle(properties.editorState, ['FONTFAMILY']).FONTFAMILY,
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

  toggleFontFamily = (fontFamily: string) => {
    const { editorState, onChange } = this.props;
    const newState = toggleCustomInlineStyle(
      editorState,
      'fontFamily',
      fontFamily,
    );
    if (newState) {
      onChange(newState);
    }
  }

  render() {
    const { config, translations } = this.props;
    const { expanded, currentFontFamily } = this.state;
    const FontFamilyComponent = config.component || LayoutComponent;
    const fontFamily = currentFontFamily && currentFontFamily.substring(11);
    return (
      <FontFamilyComponent
        translations={translations}
        config={config}
        currentState={{ fontFamily }}
        onChange={this.toggleFontFamily}
        expanded={expanded}
        onExpandEvent={this.onExpandEvent}
        doExpand={this.doExpand}
        doCollapse={this.doCollapse}
      />
    );
  }
}

export default fontFamily;
