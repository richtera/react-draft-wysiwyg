/* @flow */

import React from "react";
import {Component} from "react";
import {PropTypes} from "prop-types";
import classNames from "classnames";
import './styles.css';

export class DropdownOption extends Component<any, any> {
  static propTypes = {
    children: PropTypes.any,
    value: PropTypes.any,
    onClick: PropTypes.func,
    onSelect: PropTypes.func,
    setHighlighted: PropTypes.func,
    index: PropTypes.number,
    disabled: PropTypes.bool,
    active: PropTypes.bool,
    highlighted: PropTypes.bool,
    className: PropTypes.string,
    activeClassName: PropTypes.string,
    disabledClassName: PropTypes.string,
    highlightedClassName: PropTypes.string,
    title: PropTypes.string,
  };

  constructor(props, context) {
    super(props, context);
  }

  onClick = (event): void => {
    const { onSelect, onClick, value, disabled } = this.props;
    if (!disabled) {
      if (onSelect) {
        onSelect(value);
      }
      if (onClick) {
        event.stopPropagation();
        onClick(value);
      }
    }
  }

  setHighlighted = (): void => {
    const { setHighlighted, index } = this.props;
    setHighlighted(index);
  }

  resetHighlighted = (): void => {
    const { setHighlighted } = this.props;
    setHighlighted(-1);
  }

  render() {
    const {
      children,
      active,
      disabled,
      highlighted,
      className,
      activeClassName,
      disabledClassName,
      highlightedClassName,
      title,
    } = this.props;
    return (
      <li
        className={classNames(
          'rdw-dropdownoption-default',
          className,
          { [`rdw-dropdownoption-active ${activeClassName}`]: active,
            [`rdw-dropdownoption-highlighted ${highlightedClassName}`]: highlighted,
            [`rdw-dropdownoption-disabled ${disabledClassName}`]: disabled,
          })
        }
        onMouseEnter={this.setHighlighted}
        onMouseLeave={this.resetHighlighted}
        onClick={this.onClick}
        title={title}
      >
        {children}
      </li>
    );
  }
}
export default DropdownOption;
// todo: review classname use above.
