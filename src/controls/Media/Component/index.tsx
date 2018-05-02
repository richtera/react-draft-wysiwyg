/* @flow */

import React from "react";
import {Component} from "react";
import PropTypes from "prop-types";
const classNames = require('classnames');

import Option from "../../../components/Option";
import Spinner from "../../../components/Spinner";
import * as mime from "mime-types";
import ReactPlayer from "react-player";

require('./styles.css');

class LayoutComponent extends Component<any, any> {

  static propTypes = {
    expanded: PropTypes.bool,
    onExpandEvent: PropTypes.func,
    doCollapse: PropTypes.func,
    onChange: PropTypes.func,
    config: PropTypes.object,
    translations: PropTypes.object,
  };

  state = {
    mediaSrc: '',
    mimeType: '',
    videoId: '',
    error: null,
    dragEnter: false,
    uploadHighlighted: this.props.config.uploadEnabled && !!this.props.config.uploadCallback,
    showMediaLoading: false,
    height: this.props.config.defaultSize.height,
    width: this.props.config.defaultSize.width,
    matchMime: null,
  };
  mounted: boolean = false;
  fileUpload: boolean = false;

  constructor(props, context) {
    super(props, context);
    const { config: { inputAccept }} = this.props;
    this.state.matchMime = new RegExp(`^(${inputAccept.split(',').filter((item) => !/^(video|audio|image)\/.*$/.test(item)).map((item) => `${item.replace('*', '.*')}`).join('|')})$`);
  }

  componentWillMount() {
    this.mounted = true;
  }
  componentWillUnmount() {
    this.mounted = false;
  }

  componentWillReceiveProps(props: any): void {
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

  onDragEnter = (event: any): void => {
    this.stopPropagation(event);
    this.setState({
      dragEnter: true,
    });
  }

  onMediaDrop = (event: any): void => {
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

    for (const i in data.length) {
      if (data[i].kind === 'string' && data[i].type.match('^text/plain')) {
        // This item is the target node
        continue;
      } else if (data[i].kind === 'string' && data[i].type.match('^text/html')) {
        // Drag data item is HTML
        continue;
      } else if (data[i].kind === 'string' && data[i].type.match('^text/uri-list')) {
        // Drag data item is URI
        continue;
      } else if ((!dataIsItems || data[i].kind === 'file') && this.state.matchMime.test(data[i].type)) {
        // Drag data item is an media file
        const file = dataIsItems ? data[i].getAsFile() : data[i];
        this.uploadMedia(file);
      }
    }
  }

  showMediaUploadOption = (): void => {
    this.setState({
      uploadHighlighted: true,
    });
  }

  addMediaFromState = (): void => {
    const { mediaSrc, videoId } = this.state;
    let { mimeType, height, width } = this.state;
    const { onChange } = this.props;
    if (!ReactPlayer.canPlay(mediaSrc) && !/image\//.test(mimeType)) {
      if (this.state.matchMime.test(mimeType)) {
        this.setState({
          error: null,
        }, () => {
          onChange(mimeType, mediaSrc, 0, 0);
        });
        return;
      }
      this.setState({
        error: "Invalid media URL.",
      });
      return;
    }
    this.setState({
      error: null,
    }, () => {
      const { onChange } = this.props;
      if (!mimeType) {
        let lookupSrc = mediaSrc;
        if (mediaSrc.indexOf('?')) {
          lookupSrc = mediaSrc.split('?')[0];
        }
        mimeType = mimeType || mime.lookup(lookupSrc) || 'video/any';
      }
      if (/^image\/svg/.test(mimeType) && !height && !width) {
        height = '100px';
      }

      if (/^[0-9]*$/.test(width)) {
        width = `${width}px`;
      }
      if (/^[0-9]*$/.test(height)) {
        height = `${height}px`;
      }
      onChange(mimeType, mediaSrc, height, width);
    });
  }

  addMediaFromSrcLink = (mimeType: string, mediaSrc: string): void => {
    let { height, width } = this.state;
    const { onChange } = this.props;
    let lookupSrc = mediaSrc;
    if (mediaSrc.indexOf('?')) {
      lookupSrc = mediaSrc.split('?')[0];
    }
    mimeType = mimeType || mime.lookup(lookupSrc);
    if (/^image\/svg/.test(mimeType) && (!height || height === 'auto') && (!width || width === 'auto')) {
      height = '100px';
    }
    if (lookupSrc === '') {
      this.setState({
        error: "This URL cannot be recognized.",
      });
      return;
    }
    if (!ReactPlayer.canPlay(mediaSrc) && !/^image\//.test(mimeType)) {
      if (this.state.matchMime.test(mimeType)) {
        if (this.mounted) {
          this.setState({
            error: null,
          }, () => {
            onChange(mimeType, mediaSrc, 0, 0);
          });
          return;
        }
      }
      this.setState({
        error: `This URL has type ${mimeType} and is not compatible.`,
      });
      return;
    }
    if (/^[0-9]*$/.test(width)) {
      width = `${width}px`;
    }
    if (/^[0-9]*$/.test(height)) {
      height = `${height}px`;
    }
    if (this.mounted) {
      this.setState({
        error: null,
      }, () => {
        onChange(mimeType, mediaSrc, height, width);
      });
    } else {
      onChange(mimeType, mediaSrc, height, width);
    }
  }

  showMediaURLOption = (): void => {
    this.setState({
      uploadHighlighted: false,
    });
  }

  toggleShowMediaLoading = (): void => {
    const showMediaLoading = !this.state.showMediaLoading;
    this.setState({
      showMediaLoading,
    });
  }

  updateValue = (event: any): void => {
    const {mimeType} = this.state;
    const update = {
      [`${event.target.name}`]: event.target.value,
      error: null,
    };
    if (event.target.name === 'mediaSrc') {
      let mediaSrc = event.target.value;
      if (mediaSrc.indexOf('?')) {
        mediaSrc = mediaSrc.split('?')[0];
      }
      const mimeType = mime.lookup(mediaSrc);
      if (mediaSrc === '') {
        this.setState({
          error: "This URL cannot be recognized.",
        });
        return;
      }
      if (!ReactPlayer.canPlay(event.target.value) && !/^image\//.test(mimeType)) {
        this.setState({
          error: `This URL has type ${mimeType} and is not compatible.`,
        });
        return;
      }
      update.mimeType = mimeType;
    }
    this.setState(update);
  }

  selectMedia = (event: any): void => {
    if (event.target.files && event.target.files.length > 0) {
      this.uploadMedia(event.target.files[0]);
    }
  }

  uploadMedia = (file: any): void => {
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
  }

  fileUploadClick = (event) => {
    this.fileUpload = true;
    event.stopPropagation();
  }

  stopPropagation = (event: any): void => {
    if (!this.fileUpload) {
      event.preventDefault();
      event.stopPropagation();
    } else {
      this.fileUpload = false;
    }
  }

  renderAddMediaModal() {
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
            disabled={!mediaSrc || !height || !width}
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

  render() {
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
