/* @flow */

import React from "react";
import {Component} from "react";
import {PropTypes} from "prop-types";
const classNames = require('classnames');

import Option from "../../../components/Option";
import Spinner from "../../../components/Spinner";
import * as mime from "mime-types";
import * as _ from "lodash";
import ReactPlayer from "react-player";

require('./styles.css');

class LayoutComponent extends Component<any, any> {

  static propTypes: Object = {
    expanded: PropTypes.bool,
    onExpandEvent: PropTypes.func,
    doCollapse: PropTypes.func,
    onChange: PropTypes.func,
    config: PropTypes.object,
    translations: PropTypes.object,
  };

  state: Object = {
    mediaSrc: '',
    error: null,
    dragEnter: false,
    uploadHighlighted: this.props.config.uploadEnabled && !!this.props.config.uploadCallback,
    showMediaLoading: false,
    height: this.props.config.defaultSize.height,
    width: this.props.config.defaultSize.width,
  };

  constructor(props, context) {
    super(props, context);
  }

  componentWillReceiveProps(props: Object): void {
    if (this.props.expanded && !props.expanded) {
      this.setState({
        mediaSrc: '',
        dragEnter: false,
        uploadHighlighted: this.props.config.uploadEnabled && !!this.props.config.uploadCallback,
        showMediaLoading: false,
        height: this.props.config.defaultSize.height,
        width: this.props.config.defaultSize.width,
      });
    } else if (props.config.uploadCallback !== this.props.config.uploadCallback ||
      props.config.uploadEnabled !== this.props.config.uploadEnabled) {
      this.setState({
        uploadHighlighted: props.config.uploadEnabled && !!props.config.uploadCallback,
      });
    }
  }

  onDragEnter: Function = (event: Object): void => {
    this.stopPropagation(event);
    this.setState({
      dragEnter: true,
    });
  };

  onMediaDrop: Function = (event: Object): void => {
    event.preventDefault();
    event.stopPropagation();
    this.setState({
      dragEnter: false,
    });

    // Check if property name is files or items
    let data = event.dataTransfer.items;
    let dataIsItems = true;

    // IE uses 'files' instead of 'items'
    if (!data) {
      data = event.dataTransfer.files;
      dataIsItems = false;
    }

    for (let i = 0; i < data.length; i += 1) {
      if (data[i].kind === 'string' && data[i].type.match('^text/plain')) {
        // This item is the target node
        continue;
      } else if (data[i].kind === 'string' && data[i].type.match('^text/html')) {
        // Drag data item is HTML
        continue;
      } else if (data[i].kind === 'string' && data[i].type.match('^text/uri-list')) {
        // Drag data item is URI
        continue;
      } else if ((!dataIsItems || data[i].kind === 'file') && data[i].type.match('^(video|audio|image)/')) {
        // Drag data item is an media file
        const file = dataIsItems ? data[i].getAsFile() : data[i];
        this.uploadMedia(file);
      }
    }
  };

  showMediaUploadOption: Function = (): void => {
    this.setState({
      uploadHighlighted: true,
    });
  };

  addMediaFromState: Function = (): void => {
    let { mimeType, mediaSrc, height, width, videoId } = this.state;
    if (!ReactPlayer.canPlay(mediaSrc) && !/image\//.test(mimeType)) {
      this.setState({
        error: "Invalid media URL."
      });
      return;
    }
    this.setState({
      error: null
    }, () => {
      const { onChange } = this.props;
      if (!mimeType) {
        let lookupSrc = mediaSrc;
        if (mediaSrc.indexOf('?')) {
          lookupSrc = mediaSrc.split('?')[0];
        }
        mimeType = mimeType || mime.lookup(lookupSrc) || 'video/any';
      }
      onChange(mimeType, mediaSrc, height, width);
    });
  };

  addMediaFromSrcLink: Function = (mimeType: string, mediaSrc: string): void => {
    const { height, width } = this.state;
    const { onChange } = this.props;
    let lookupSrc = mediaSrc;
    if (mediaSrc.indexOf('?')) {
      lookupSrc = mediaSrc.split('?')[0];
    }
    const mimeType = mime.lookup(lookupSrc);
    if (lookupSrc === '' || !mimeType) {
      this.setState({
        error: "This URL cannot be recognized."
      });
      return;
    }
    if (!ReactPlayer.canPlay(mediaSrc) && !/^image\//.test(mimeType)) {
      this.setState({
        error: `This URL has type ${mimeType} and is not compatible.`
      });
      return;
    }
    this.setState({
      error: null
    }, () => {
      onChange(mimeType, mediaSrc, height, width);
    });
  };

  showMediaURLOption: Function = (): void => {
    this.setState({
      uploadHighlighted: false,
    });
  };

  toggleShowMediaLoading: Function = (): void => {
    const showMediaLoading = !this.state.showMediaLoading;
    this.setState({
      showMediaLoading,
    });
  };

  updateValue: Function = (event: Object): void => {
    let {mimeType} = this.state;
    const update = {
      [`${event.target.name}`]: event.target.value,
      error: null
    };
    if (event.target.name === 'mediaSrc') {
      let mediaSrc = event.target.value;
      if (mediaSrc.indexOf('?')) {
        mediaSrc = mediaSrc.split('?')[0];
      }
      const mimeType = mime.lookup(mediaSrc);
      if (mediaSrc === '' || !mimeType) {
        this.setState({
          error: "This URL cannot be recognized."
        });
        return;
      }
      if (!ReactPlayer.canPlay(event.target.value) && !/^image\//.test(mimeType)) {
        this.setState({
          error: `This URL has type ${mimeType} and is not compatible.`
        });
        return;
      }
      update.mimeType = mimeType;
    }
    this.setState(update);
  };

  selectMedia: Function = (event: Object): void => {
    if (event.target.files && event.target.files.length > 0) {
      this.uploadMedia(event.target.files[0]);
    }
  };

  uploadMedia: Function = (file: Object): void => {
    this.toggleShowMediaLoading();
    const { uploadCallback } = this.props.config;
    uploadCallback(file)
      .then(({ data }) => {
        this.setState({
          showMediaLoading: false,
          dragEnter: false,
        });
        this.addMediaFromSrcLink(data.contentType, data.link);
      }).catch(() => {
        this.setState({
          showMediaLoading: false,
          dragEnter: false,
        });
      });
  };

  fileUploadClick = (event) => {
    this.fileUpload = true;
    event.stopPropagation();
  }

  stopPropagation: Function = (event: Object): void => {
    if (!this.fileUpload) {
      event.preventDefault();
      event.stopPropagation();
    } else {
      this.fileUpload = false;
    }
  };

  renderAddMediaModal(): Object {
    const { mediaSrc, mimeType, uploadHighlighted, showMediaLoading, dragEnter, height, width, error } = this.state;
    const {
      config: { popupClassName, uploadCallback, uploadEnabled, urlEnabled, inputAccept },
      doCollapse,
      translations,
    } = this.props;
    return (
      <div
        className={classNames('rdw-media-modal', popupClassName)}
        onClick={this.stopPropagation}
      >
        <div className="rdw-media-modal-header">
          {uploadEnabled && uploadCallback &&
            <span
              onClick={this.showMediaUploadOption}
              className="rdw-media-modal-header-option"
            >
              {translations['components.controls.media.fileUpload']}
              <span
                className={classNames(
                  'rdw-media-modal-header-label',
                  { 'rdw-media-modal-header-label-highlighted': uploadHighlighted },
                )}
              />
            </span>}
          { urlEnabled &&
            <span
              onClick={this.showMediaURLOption}
              className="rdw-media-modal-header-option"
            >
              {translations['components.controls.media.byURL']}
              <span
                className={classNames(
                  'rdw-media-modal-header-label',
                  { 'rdw-media-modal-header-label-highlighted': !uploadHighlighted },
                )}
              />
            </span>}
        </div>
        {
          uploadHighlighted ?
            <div onClick={this.fileUploadClick}>
              <div
                onDragEnter={this.onDragEnter}
                onDragOver={this.stopPropagation}
                onDrop={this.onMediaDrop}
                className={classNames(
                'rdw-media-modal-upload-option',
                { 'rdw-media-modal-upload-option-highlighted': dragEnter })}
              >
                <label
                  htmlFor="file"
                  className="rdw-media-modal-upload-option-label"
                >
                  {translations['components.controls.media.dropFileText']}
                </label>
              </div>
              <input
                type="file"
                id="file"
                accept={inputAccept}
                onChange={this.selectMedia}
                className="rdw-media-modal-upload-option-input"
              />
            </div> :
            <div className="rdw-media-modal-url-section">
              <input
                className="rdw-media-modal-url-input"
                placeholder={translations['components.controls.media.enterlink']}
                name="mediaSrc"
                onChange={this.updateValue}
                onBlur={this.updateValue}
                value={mediaSrc}
              />
            </div>
        }
        <div className="rdw-embedded-modal-size">
          &#8597;&nbsp;
          <input
            onChange={this.updateValue}
            onBlur={this.updateValue}
            value={height}
            name="height"
            className="rdw-embedded-modal-size-input"
            placeholder="Height"
          />
          &nbsp;&#8596;&nbsp;
          <input
            onChange={this.updateValue}
            onBlur={this.updateValue}
            value={width}
            name="width"
            className="rdw-embedded-modal-size-input"
            placeholder="Width"
          />
        </div>
        <span className="rdw-media-modal-btn-section">
          <button
            className="rdw-media-modal-btn"
            onClick={this.addMediaFromState}
            disabled={!mediaSrc || !height || !width || !mimeType}
          >
            {translations['generic.add']}
          </button>
          <button
            className="rdw-media-modal-btn"
            onClick={doCollapse}
          >
            {translations['generic.cancel']}
          </button>
        </span>
        {error && (
          <div className="alert alert-danger">
            {error}
          </div>
        )}
        {showMediaLoading ?
          <div className="rdw-media-modal-spinner">
            <Spinner />
          </div> :
          undefined}
      </div>
    );
  }

  render(): Object {
    const { config: { icon, className, title }, expanded, onExpandEvent } = this.props;
    return (
      <div
        className="rdw-media-wrapper"
        aria-haspopup="true"
        aria-expanded={expanded}
        aria-label="rdw-media-control"
      >
        <Option
          className={classNames(className)}
          value="unordered-list-item"
          onClick={onExpandEvent}
          title={title}
        >
          <img
            src={icon}
            alt=""
          />
        </Option>
        {expanded ? this.renderAddMediaModal() : undefined}
      </div>
    );
  }
}

export default LayoutComponent;
