import React from "react";
import {Component} from "react";
import {PropTypes} from "prop-types";
import {EditorState} from "draft-js";
import classNames from "classnames";
import Option from "../../components/Option";
import './styles.css';
import ReactPlayer from "react-player";

export class ReactPlayerShowError extends Component<any, any> {
  constructor(props, context) {
    super(props, context);
    this.state = _.extend({}, props);
  }

  componentWillReceiveProps(props) {
    this.setState(props);
  }

  showError = (event) => {
    let error = new Error("Unable to play back file.");
    if (event.target && event.target.error) {
      error = event.target.error;
    } else if (event.currentTarget && event.currentTarget.error) {
      error = event.currentTarget.error;
    } else if (event.originalTarget && event.originalTarget.error) {
      error = event.originalTarget.error;
    }
    if (error) {
      this.setState({ error });
    }
  }

  render() {
    let { src, autoPlay, loop, width, height, error, mimeType } = this.state;
    if (mimeType === 'video/x-youtube') {
      src = `https://www.youtube.com/watch?v=${src}`;
    }
    // src = src.replace(/https:\/\/storage.googleapis.com\/[^\/]*\//, `https://storage.googleapis.com/${window.fb.storageBucket}/`);
    return (
      <span>
        {error && <div className="alert alert-danger" title={error.message}>
          File Format is invalid. Please use MP4 for best performance and stability.
        </div>}
        <ReactPlayer
          url={src}
          playing={autoPlay}
          loop={loop}
          width={width}
          height={height}
          controls={true}
          onError={this.showError}
          file={{
            attributes: {
              type: mimeType
            }
          }}/>
      </span>
    );
  }
}

const getMediaComponent = config => class Media extends Component<any, any> {
  static propTypes: Object = {
    block: PropTypes.object,
    contentState: PropTypes.object,
  };

  state: Object = {
    hovered: false,
  };

  setEntityAlignmentLeft: Function = (): void => {
    this.setEntityAlignment('left');
  };

  setEntityAlignmentRight: Function = (): void => {
    this.setEntityAlignment('right');
  };

  setEntityAlignmentCenter: Function = (): void => {
    this.setEntityAlignment('none');
  };

  setEntityAlignment: Function = (alignment): void => {
    const { block, contentState } = this.props;
    const entityKey = block.getEntityAt(0);
    contentState.mergeEntityData(
      entityKey,
      { alignment },
    );
    config.onChange(EditorState.push(config.getEditorState(), contentState, 'change-block-data'));
    this.setState({
      dummy: true,
    });
  };

  toggleHovered: Function = (): void => {
    const hovered = !this.state.hovered;
    this.setState({
      hovered,
    });
  };

  toogleLoop: Function = (): void => {
    const loop = !this.state.loop;
    const { block, contentState } = this.props;
    const entityKey = block.getEntityAt(0);
    contentState.mergeEntityData(
      entityKey,
      { loop },
    );
    config.onChange(EditorState.push(config.getEditorState(), contentState, 'change-block-data'));
    this.setState({
      dummy: true,
    });
  }

  toggleAutoPlay: Function = (): void => {
    const autoPlay = !this.state.autoPlay;
    const { block, contentState } = this.props;
    const entityKey = block.getEntityAt(0);
    contentState.mergeEntityData(
      entityKey,
      { autoPlay },
    );
    config.onChange(EditorState.push(config.getEditorState(), contentState, 'change-block-data'));
    this.setState({
      dummy: true,
    });
  }

  renderAlignmentOptions(alignment): Object {
    const { block, contentState } = this.props;
    const { hovered } = this.state;
    const { isReadOnly, isMediaAlignmentEnabled } = config;
    const entity = contentState.getEntity(block.getEntityAt(0));
    const data = entity.getData();
    const {loop = false, autoPlay = false, mimeType} = data;
    return (
      <div
        className={classNames(
          'rdw-media-alignment-options-popup',
          {
            'rdw-media-alignment-options-popup-right': alignment === 'right',
          },
        )}
      >
        <Option
          onClick={this.setEntityAlignmentLeft}
          className="rdw-media-alignment-option"
        >
          L
        </Option>
        <Option
          onClick={this.setEntityAlignmentCenter}
          className="rdw-media-alignment-option"
        >
          C
        </Option>
        <Option
          onClick={this.setEntityAlignmentRight}
          className="rdw-media-alignment-option"
        >
          R
        </Option>
        { /^(video|audio)\//.test(mimeType) && [
          <Option key={1}
            onClick={this.toggleAutoPlay}
            className="rdw-media-additional-option"
          >
            {autoPlay ? "Playing" : "Stopped"}
          </Option>,
          <Option key={2}
            onClick={this.toogleLoop}
            className="rdw-media-additional-option"
          >
            {loop ? "Looping" : "Once"}
          </Option>
        ]}
      </div>
    );
  }

  onError = (event) => {
    let error = new Error("Unable to play back file.");
    if (event.target && event.target.error) {
      error = event.target.error;
    } else if (event.currentTarget && event.currentTarget.error) {
      error = event.currentTarget.error;
    } else if (event.originalTarget && event.originalTarget.error) {
      error = event.originalTarget.error;
    }
    if (error) {
      this.setState({error});
    }
  }

  render(): Object {
    const { block, contentState } = this.props;
    const { hovered, error } = this.state;
    const { isReadOnly, isMediaAlignmentEnabled } = config;
    const entity = contentState.getEntity(block.getEntityAt(0));
    const { src, mimeType, alignment, height, width, autoPlay, loop } = entity.getData();

    return (
      <span
        onMouseEnter={this.toggleHovered}
        onMouseLeave={this.toggleHovered}
        className={classNames(
          'rdw-media-alignment',
          {
            'rdw-media-left': alignment === 'left',
            'rdw-media-right': alignment === 'right',
            'rdw-media-center': !alignment || alignment === 'none',
          },
        )}
      >
        <span className="rdw-media-mediawrapper">
          {error && <div className="alert alert-danger" title={error.message}>
            File Format is invalid. Please use MP4 for best performance and stability.
          </div>}
          { entity.type === 'VIDEO' && (
            <ReactPlayerShowError
              src={src}
              mimeType={mimeType}
              loop={loop}
              autoPlay={autoPlay}
              width={width}
              height={height}/>
          )}
          { entity.type === 'AUDIO' && (
            <audio
              loop={loop}
              controls>
              <source src={src} type={mimeType}/>
              Your browser does not support the audio tag.
            </audio>
          )}
          {
            !isReadOnly() && hovered && isMediaAlignmentEnabled() ?
              this.renderAlignmentOptions(alignment)
              :
              undefined
          }
        </span>
      </span>
    );
  }
};

export default getMediaComponent;