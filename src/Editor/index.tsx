
import React from "react";
import {Component} from "react";
import {PropTypes} from "prop-types";
import {
  CompositeDecorator,
  convertFromRaw,
  convertToRaw,
  DefaultDraftBlockRenderMap,
  Editor as BaseEditor,
  EditorState,
  RichUtils
} from "draft-js";
import {
  blockRenderMap,
  changeDepth,
  extractInlineStyle,
  getCustomStyleMap,
  getSelectedBlocksType,
  handleNewLine,
} from "draftjs-utils";
import classNames from "classnames";
import ModalHandler from "../event-handler/modals";
import FocusHandler from "../event-handler/focus";
import KeyDownHandler from "../event-handler/keyDown";
import SuggestionHandler from "../event-handler/suggestions";
import blockStyleFn from "../utils/BlockStyle";
import {mergeRecursive} from "../utils/toolbar";
import {filter, hasProperty} from "../utils/common";
import {handlePastedText} from "../utils/handlePaste";
import * as Controls from "../controls";
import getLinkDecorator from "../decorators/Link";
import getMentionDecorators from "../decorators/Mention";
import getHashtagDecorator from "../decorators/HashTag";
import getBlockRenderFunc from "../renderer";
import defaultToolbar from "../config/defaultToolbar";
import * as localeTranslations from "../i18n";
import './styles.css';
import '../../css/Draft.css';

export class Editor extends Component<any, any> {

  static propTypes = {
    onChange: PropTypes.func,
    onEditorStateChange: PropTypes.func,
    onContentStateChange: PropTypes.func,
    onFocusEditor: PropTypes.func,
    // initialContentState is deprecated
    initialContentState: PropTypes.object,
    defaultContentState: PropTypes.object,
    contentState: PropTypes.object,
    editorState: PropTypes.object,
    defaultEditorState: PropTypes.object,
    toolbarOnFocus: PropTypes.bool,
    spellCheck: PropTypes.bool, // eslint-disable-line react/no-unused-prop-types
    stripPastedStyles: PropTypes.bool, // eslint-disable-line react/no-unused-prop-types
    toolbar: PropTypes.object,
    toolbarCustomButtons: PropTypes.array,
    toolbarClassName: PropTypes.string,
    toolbarHidden: PropTypes.bool,
    locale: PropTypes.string,
    localization: PropTypes.object,
    editorClassName: PropTypes.string,
    wrapperClassName: PropTypes.string,
    toolbarStyle: PropTypes.object,
    editorStyle: PropTypes.object,
    wrapperStyle: PropTypes.object,
    uploadCallback: PropTypes.func,
    onFocus: PropTypes.func,
    onBlur: PropTypes.func,
    onTab: PropTypes.func,
    mention: PropTypes.object,
    hashtag: PropTypes.object,
    textAlignment: PropTypes.string, // eslint-disable-line react/no-unused-prop-types
    readOnly: PropTypes.bool,
    tabIndex: PropTypes.number, // eslint-disable-line react/no-unused-prop-types
    placeholder: PropTypes.string, // eslint-disable-line react/no-unused-prop-types
    ariaLabel: PropTypes.string,
    ariaOwneeID: PropTypes.string, // eslint-disable-line react/no-unused-prop-types
    ariaActiveDescendantID: PropTypes.string, // eslint-disable-line react/no-unused-prop-types
    ariaAutoComplete: PropTypes.string, // eslint-disable-line react/no-unused-prop-types
    ariaDescribedBy: PropTypes.string, // eslint-disable-line react/no-unused-prop-types
    ariaExpanded: PropTypes.string, // eslint-disable-line react/no-unused-prop-types
    ariaHasPopup: PropTypes.string, // eslint-disable-line react/no-unused-prop-types
    customBlockRenderFunc: PropTypes.func,
    wrapperId: PropTypes.number,
    customDecorators: PropTypes.array,
    customBlockRenderMap: PropTypes.object
  };
  wrapperId: string;
  editor: any;
  wrapper: any;
  modalHandler: ModalHandler;
  focusHandler: FocusHandler;
  blockRendererFn: any;
  editorProps: any;
  customStyleMap: any;
  blockRenderMap: any;
  compositeDecorator: CompositeDecorator;

  static defaultProps = {
    toolbarOnFocus: false,
    toolbarHidden: false,
    stripPastedStyles: false,
    localization: { locale: 'en', translations: {} },
    customDecorators: [],
  }

  constructor(props) {
    super(props);
    const toolbar = mergeRecursive(defaultToolbar, props.toolbar);
    this.state = {
      editorState: undefined,
      editorFocused: false,
      toolbar,
    };
    const wrapperId = props.wrapperId ? props.wrapperId : Math.floor(Math.random() * 10000);
    this.wrapperId = `rdw-wrapper-${wrapperId}`;
    this.modalHandler = new ModalHandler();
    this.focusHandler = new FocusHandler();
    this.blockRendererFn = getBlockRenderFunc({
      isReadOnly: this.isReadOnly,
      isImageAlignmentEnabled: this.isImageAlignmentEnabled,
      isMediaAlignmentEnabled: this.isMediaAlignmentEnabled,
      getEditorState: this.getEditorState,
      onChange: this.onChange.bind(this, true),
    }, props.customBlockRenderFunc);
    this.editorProps = this.filterEditorProps(props);
    this.customStyleMap = getCustomStyleMap();
    this.blockRenderMap = DefaultDraftBlockRenderMap.merge(props.customBlockRenderMap);
  }

  componentWillMount(): void {
    this.compositeDecorator = this.getCompositeDecorator();
    const editorState = this.createEditorState(this.compositeDecorator);
    extractInlineStyle(editorState);
    this.setState({
      editorState,
    });
  }

  componentDidMount(): void {
    this.modalHandler.init(this.wrapperId);
  }
  // todo: change decorators depending on properties recceived in componentWillReceiveProps.

  componentWillReceiveProps(props) {
    const newState: any = {};
    if (this.props.toolbar !== props.toolbar) {
      const toolbar = mergeRecursive(defaultToolbar, props.toolbar);
      newState.toolbar = toolbar;
    }
    if (hasProperty(props, 'editorState') && this.props.editorState !== props.editorState) {
      if (props.editorState) {
        newState.editorState = EditorState.set(
          props.editorState,
          { decorator: this.compositeDecorator },
        );
      } else {
        newState.editorState = EditorState.createEmpty(this.compositeDecorator);
      }
    } else if (hasProperty(props, 'contentState') && this.props.contentState !== props.contentState) {
      if (props.contentState) {
        const newEditorState = this.changeEditorState(props.contentState);
        if (newEditorState) {
          newState.editorState = newEditorState;
        }
      } else {
        newState.editorState = EditorState.createEmpty(this.compositeDecorator);
      }
    }
    if (newState.editorState &&
      (this.props.editorState && this.props.editorState.getCurrentContent().getBlockMap().size) !==
      (newState.editorState && newState.editorState.getCurrentContent().getBlockMap().size)) {
      extractInlineStyle(newState.editorState);
    }
    this.setState(newState);
    this.editorProps = this.filterEditorProps(props);
    this.customStyleMap = getCustomStyleMap();
  }

  onEditorBlur = (): void => {
    this.setState({
      editorFocused: false,
    });
  };

  onEditorFocus = (event: any): void => {
    const { onFocus } = this.props;
    this.setState({
      editorFocused: true,
    });
    if (onFocus && this.focusHandler.isEditorFocused()) {
      onFocus(event);
    }
  };

  onEditorMouseDown = (): void => {
    this.focusHandler.onEditorMouseDown();
  }

  onTab = (event): boolean => {
    const { onTab } = this.props;
    if (!onTab || !onTab(event)) {
      const editorState = changeDepth(this.state.editorState, event.shiftKey ? -1 : 1, 4);
      if (editorState && editorState !== this.state.editorState) {
        this.onChange(false, editorState);
        event.preventDefault();
      }
    }
    return false;
  };

  onUpDownArrow = (event): boolean => {
    if (SuggestionHandler.isOpen()) {
      event.preventDefault();
    }
    return false;
  };

  onToolbarFocus = (event: any): void => {
    const { onFocus } = this.props;
    if (onFocus && this.focusHandler.isToolbarFocused()) {
      onFocus(event);
    }
  };

  onWrapperBlur = (event: any) => {
    const { onBlur } = this.props;
    if (onBlur && this.focusHandler.isEditorBlur(event)) {
      onBlur(event);
    }
  };

  onChange = (force: boolean, editorState: any): void => {
    const { readOnly, onEditorStateChange } = this.props;
    const isAtomic = getSelectedBlocksType(editorState) === 'atomic';
    const isCollapsed = editorState.getSelection().isCollapsed();
    if (!readOnly && (!(isAtomic && isCollapsed) || force)) {
      if (onEditorStateChange) {
        onEditorStateChange(editorState, this.props.wrapperId);
      }
      if (!hasProperty(this.props, 'editorState')) {
        this.setState({ editorState }, () => {
          this.afterChange(editorState);
        });
      } else {
        this.afterChange(editorState);
      }
    }
  };

  setWrapperReference = (ref: Object): void => {
    this.wrapper = ref;
  };

  setEditorReference = (ref: Object): void => {
    this.editor = ref;
  };

  getCompositeDecorator = (): CompositeDecorator => {
    const decorators = [...this.props.customDecorators, getLinkDecorator({
      showOpenOptionOnHover: this.state.toolbar.link.showOpenOptionOnHover,
    })];
    if (this.props.mention) {
      decorators.push(...getMentionDecorators({
        ...this.props.mention,
        onChange: this.onChange.bind(this, true),
        getEditorState: this.getEditorState,
        getSuggestions: this.getSuggestions,
        getWrapperRef: this.getWrapperRef,
        modalHandler: this.modalHandler,
      }));
    }
    if (this.props.hashtag) {
      decorators.push(getHashtagDecorator(this.props.hashtag));
    }
    return new CompositeDecorator(decorators);
  }

  getWrapperRef = () => this.wrapper;

  getEditorState = () => this.state.editorState;

  getSuggestions = () => this.props.mention && this.props.mention.suggestions;

  afterChange = (editorState): void => {
    setTimeout(() => {
      const { onChange, onContentStateChange } = this.props;
      if (onChange) {
        onChange(convertToRaw(editorState.getCurrentContent()));
      }
      if (onContentStateChange) {
        onContentStateChange(convertToRaw(editorState.getCurrentContent()));
      }
    }, 0);
  };

  isReadOnly = () => this.props.readOnly;

  isImageAlignmentEnabled = () => this.state.toolbar.image.alignmentEnabled;
  isMediaAlignmentEnabled = () => this.state.toolbar.media.alignmentEnabled;

  createEditorState = (compositeDecorator: CompositeDecorator) => {
    let editorState;
    if (hasProperty(this.props, 'editorState')) {
      if (this.props.editorState) {
        editorState = EditorState.set(this.props.editorState, { decorator: compositeDecorator });
      }
    } else if (hasProperty(this.props, 'defaultEditorState')) {
      if (this.props.defaultEditorState) {
        editorState = EditorState.set(
          this.props.defaultEditorState,
          { decorator: compositeDecorator },
        );
      }
    } else if (hasProperty(this.props, 'contentState')) {
      if (this.props.contentState) {
        const contentState = convertFromRaw(this.props.contentState);
        editorState = EditorState.createWithContent(contentState, compositeDecorator);
        editorState = EditorState.moveSelectionToEnd(editorState);
      }
    } else if (hasProperty(this.props, 'defaultContentState')
      || hasProperty(this.props, 'initialContentState')) {
      let contentState = this.props.defaultContentState || this.props.initialContentState;
      if (contentState) {
        contentState = convertFromRaw(contentState);
        editorState = EditorState.createWithContent(contentState, compositeDecorator);
        editorState = EditorState.moveSelectionToEnd(editorState);
      }
    }
    if (!editorState) {
      editorState = EditorState.createEmpty(compositeDecorator);
    }
    return editorState;
  }

  filterEditorProps = props => filter(props, [
    'onChange', 'onEditorStateChange', 'onContentStateChange', 'initialContentState',
    'defaultContentState', 'contentState', 'editorState', 'defaultEditorState', 'locale',
    'localization', 'toolbarOnFocus', 'toolbar', 'toolbarCustomButtons', 'toolbarClassName',
    'editorClassName', 'toolbarHidden', 'wrapperClassName', 'toolbarStyle', 'editorStyle',
    'wrapperStyle', 'uploadCallback', 'onFocus', 'onBlur', 'onTab', 'mention', 'hashtag',
    'ariaLabel', 'customBlockRenderFunc', 'customDecorators', 'blockRenderMap'
  ]);

  changeEditorState = (contentState) => {
    const newContentState = convertFromRaw(contentState);
    let { editorState } = this.state;
    editorState = EditorState.push(editorState, newContentState, 'insert-characters');
    editorState = EditorState.moveSelectionToEnd(editorState);
    return editorState;
  };

  focusEditor = (event: any): any => {
    if (this.props.onFocusEditor) {
      if (!this.props.onFocusEditor(event)) {
        return;
      }
    }
    switch ((event as any).target.tagName) {
      case 'INPUT':
      case 'TEXTAREA':
      case 'BUTTON':
      case 'CHECKBOX':
      case 'SELECT':
        return;
    }
    setTimeout(() => {
      this.editor.focus();
    }, 0);
  };

  handleKeyCommand = (command: any): boolean => {
    const { editorState } = this.state;
    const newState = RichUtils.handleKeyCommand(editorState, command);
    if (newState) {
      this.onChange(false, newState);
      return true;
    }
    return false;
  };

  handleReturn = (event: Object): boolean => {
    if (SuggestionHandler.isOpen()) {
      return true;
    }
    const editorState = handleNewLine(this.state.editorState, event);
    if (editorState) {
      this.onChange(false, editorState);
      return true;
    }
    return false;
  };

  handlePastedText = (text, html) => {
    const { editorState } = this.state;
    return handlePastedText(text, html, editorState, this.onChange.bind(this, true));
  }

  preventDefault = (event: any) => {
    if (event.target.tagName === 'INPUT') {
      this.focusHandler.onInputMouseDown();
    } else {
      event.preventDefault();
    }
  };

  render() {
    const {
      editorState,
      editorFocused,
      toolbar,
    } = this.state;
    const {
      locale,
      localization: { locale: newLocale, translations },
      toolbarCustomButtons,
      toolbarOnFocus,
      toolbarClassName,
      toolbarHidden,
      editorClassName,
      wrapperClassName,
      toolbarStyle,
      editorStyle,
      wrapperStyle,
      uploadCallback,
      ariaLabel,
    } = this.props;

    const controlProps = {
      modalHandler: this.modalHandler,
      editorState,
      onChange: this.onChange.bind(this, true),
      translations: { ...localeTranslations[locale || newLocale], ...translations },
    };
    const toolbarShow = !toolbarHidden &&
      (editorFocused || this.focusHandler.isInputFocused() || !toolbarOnFocus);
    return (
      <div
        id={this.wrapperId}
        className={classNames(wrapperClassName, 'rdw-editor-wrapper')}
        style={wrapperStyle}
        onClick={this.modalHandler.onEditorClick}
        onBlur={this.onWrapperBlur}
        aria-label="rdw-wrapper"
      >
        {
          !toolbarHidden &&
          (editorFocused || this.focusHandler.isInputFocused() || !toolbarOnFocus) &&
          <div
            className={classNames('rdw-editor-toolbar', toolbarClassName)}
            style={toolbarStyle}
            onMouseDown={this.preventDefault}
            aria-label="rdw-toolbar"
            aria-hidden={(!editorFocused && toolbarOnFocus).toString()}
            onFocus={this.onToolbarFocus}
          >
            {toolbar.options.map((opt, index) => {
              const Control = Controls[opt];
              const config = toolbar[opt];
              if ((opt === 'image' || opt === 'media') && uploadCallback) {
                config.uploadCallback = uploadCallback;
              }
              return <Control key={index} {...controlProps} config={config} />;
            })}
            {toolbarCustomButtons && toolbarCustomButtons.map((button, index) =>
              React.cloneElement(button, { key: index, ...controlProps }))}
          </div>
        }
        <div
          ref={this.setWrapperReference}
          className={classNames(editorClassName, 'rdw-editor-main')}
          style={editorStyle}
          onClick={this.focusEditor}
          onFocus={this.onEditorFocus}
          onBlur={this.onEditorBlur}
          onKeyDown={KeyDownHandler.onKeyDown}
          onMouseDown={this.onEditorMouseDown}
        >
          <BaseEditor
            ref={this.setEditorReference}
            onTab={this.onTab}
            onUpArrow={this.onUpDownArrow}
            onDownArrow={this.onUpDownArrow}
            editorState={editorState}
            onChange={this.onChange.bind(this, false)}
            blockStyleFn={blockStyleFn}
            customStyleMap={getCustomStyleMap()}
            handleReturn={this.handleReturn}
            // handlePastedText={this.handlePastedText}
            blockRendererFn={this.blockRendererFn}
            blockRenderMap={this.blockRenderMap}
            handleKeyCommand={this.handleKeyCommand}
            ariaLabel={ariaLabel || 'rdw-editor'}
            {...this.editorProps}
          />
        </div>
      </div>
    );
  }
}

export default Editor;

// todo: evaluate draftjs-utils to move some methods here
// todo: move color near font-family
