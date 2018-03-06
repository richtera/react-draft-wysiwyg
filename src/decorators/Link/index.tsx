import React from "react";
import {Component} from "react";
import {PropTypes} from "prop-types";
import openlink from "../../../images/openlink.svg";
import './styles.css';

function findLinkEntities(contentBlock, callback, contentState) {
  contentBlock.findEntityRanges(
    (character) => {
      const entityKey = character.getEntity();
      return (
        entityKey !== null &&
        contentState.getEntity(entityKey).getType() === 'LINK'
      );
    },
    callback,
  );
}

function getLinkComponent(config) {
  const showOpenOptionOnHover = config.showOpenOptionOnHover;
  return class Link extends Component<any, any> {
    static propTypes = {
      entityKey: PropTypes.string.isRequired,
      children: PropTypes.array,
      contentState: PropTypes.object,
    };

    state: Object = {
      showPopOver: false,
    };

    openLink: Function = () => {
      const { entityKey, contentState } = this.props;
      const { url } = contentState.getEntity(entityKey).getData();
      const linkTab = window.open(url, 'blank'); // eslint-disable-line no-undef
      linkTab.focus();
    };

    constructor(props, context) {
      super(props, context);
    }

    toggleShowPopOver: Function = () => {
      const showPopOver = !this.state.showPopOver;
      this.setState({
        showPopOver,
      });
    };

    render() {
      const { children, entityKey, contentState } = this.props;
      const { url, targetOption } = contentState.getEntity(entityKey).getData();
      const { showPopOver } = this.state;
      return (
        <span
          className="rdw-link-decorator-wrapper"
          onMouseEnter={this.toggleShowPopOver}
          onMouseLeave={this.toggleShowPopOver}
        >
          <a href={url} target={targetOption}>{children}</a>
          {showPopOver && showOpenOptionOnHover ?
            <img
              src={openlink}
              alt=""
              onClick={this.openLink}
              className="rdw-link-decorator-icon"
            />
            : undefined
          }
        </span>
      );
    }
  };
}

export default config => ({
  strategy: findLinkEntities,
  component: getLinkComponent(config),
});