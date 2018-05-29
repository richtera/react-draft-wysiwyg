/* @flow */

import React from "react";
import {Component} from "react";
import PropTypes from "prop-types";
import classNames from "classnames";

import {stopPropagation} from "../../../utils/common";
import Option from "../../../components/Option";
import './styles.css';

class LayoutComponent extends Component<any, any> {
  static propTypes = {
    expanded: PropTypes.bool,
    doCollapse: PropTypes.func,
    onExpandEvent: PropTypes.func,
    config: PropTypes.object,
    onChange: PropTypes.func,
    currentState: PropTypes.object,
    translations: PropTypes.object,
  };

  state = {
    showModal: false,
    pubMedId: '',
  };

  constructor(props, context) {
    super(props, context);
  }

  componentWillReceiveProps(props) {
    if (this.props.expanded && !props.expanded) {
      this.setState({
        showModal: false,
        pubMedId: '',
      });
    }
  }

  addPubMedLink = (event): void => {
    event.preventDefault();
    const { onChange } = this.props;
    const { pubMedId } = this.state;
    fetch('/pubmed/search', {
      method: 'POST',
      body: JSON.stringify({ id: pubMedId }),
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((response) => {
        if (response.status !== 200) {
          return Promise.reject(new Error('Unable to get PubMed.'));
        }
        return response.json();
      })
      .then(onChange)
      .catch((error) => {
        alert(error.message);
      });
  }

  updateValue = (event: any): void => {
    this.setState({
      [`${event.target.name}`]: event.target.value,
    });
  }

  signalExpandShowModal = () => {
    const { onExpandEvent, currentState: { selectionText } } = this.props;
    onExpandEvent();
    this.setState({
      showModal: true,
      pubMedId: selectionText,
    });
  }

  renderAddPubMedLinkModal() {
    const { config: { popupClassName }, doCollapse, translations } = this.props;
    const { pubMedId } = this.state;
    return (
      <div
        className={classNames('rdw-link-modal', popupClassName)}
        onClick={stopPropagation}
      >
        <span className="rdw-link-modal-label">
          {translations['components.controls.pubmedlink.pubMedId']}
        </span>
        <input
          className="rdw-link-modal-input"
          onChange={this.updateValue}
          onBlur={this.updateValue}
          name="pubMedId"
          value={pubMedId}
        />
        <span className="rdw-link-modal-buttonsection">
          <button
            className="rdw-link-modal-btn"
            onClick={this.addPubMedLink}
            disabled={!pubMedId}
          >
            {translations['generic.add']}
          </button>
          <button
            className="rdw-link-modal-btn"
            onClick={doCollapse}
          >
            {translations['generic.cancel']}
          </button>
        </span>
      </div>
    );
  }

  render() {
    const {
      config: { icon, className, title },
      expanded,
      translations,
    } = this.props;
    const { showModal } = this.state;
    return (
      <div
        className="rdw-link-wrapper"
        aria-haspopup="true"
        aria-label="rdw-link-control"
        aria-expanded={showModal}
        title={title || translations['components.controls.pubmedlink.pubmedlink']}
      >
        <Option
          className={classNames(className)}
          value="unordered-list-item"
          onClick={this.signalExpandShowModal}
        >
          <img
            src={icon}
            alt=""
          />
        </Option>
        {expanded && showModal ? this.renderAddPubMedLinkModal() : undefined}
      </div>
    );
  }
}

export default LayoutComponent;
