import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { EditorState } from 'draft-js';
import classNames from 'classnames';
import Option from '../../components/Option';
import './styles.css';

const getMediaComponent = config => class Media extends Component {
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
    const loop = !this.state.autoPlay;
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
          <Option
            onClick={this.toggleAutoPlay}
            className="rdw-media-additional-option"
          >
            {autoPlay ? "Playing" : "Stopped"}
          </Option>,
          <Option
            onClick={this.toogleLoop}
            className="rdw-media-additional-option"
          >
            {loop ? "Looping" : "Once"}
          </Option>
        ]}
      </div>
    );
  }

  render(): Object {
    const { block, contentState } = this.props;
    const { hovered } = this.state;
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
          { entity.type === 'VIDEO' && (
            <video
              width="100%"
              controls
              loop={loop}
              style={{
                height,
                width,
              }}>
              <source src={src} type={mimeType}/>
              Your browser does not support the video tag.
            </video>
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
