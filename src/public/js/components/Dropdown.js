import React, {Component, PropTypes} from 'react';
import {Link} from 'react-router';
import Progress from 'react-progress';

class Dropdown extends Component {
  static propTypes = {
    children: PropTypes.array,
    dropdownToggle: PropTypes.object,
  };

  constructor() {
    super();
    this.state = {};
  }

  openDropdown() {
    this.state.open = true;
    this.setState(this.state);
  }

  closeDropdown() {
    this.state.open = false;
    this.setState(this.state);
  }

  toggleDropdown() {
    this.state.open = !this.state.open;
    this.setState(this.state);
  }

  render() {
    const open = this.state.open;
    return (
      <div className={"dropdown" + (open ? ' open' : '') + (this.props.className ? (' ' + this.props.className) :'')}>
        <div className="dropdown-toggle" onClick={() => this.toggleDropdown()} >
          {this.props.dropdownToggle}
        </div>
        {
          this.props.children && this.props.children.length &&
          <ul className="dropdown-menu">
            {
              this.props.children.map((child, index) => {
                return (
                  <li key={index} onClick={() => this.closeDropdown()}>
                    {child}
                  </li>
                );
              })
            }
          </ul>
        }
        <div className={'dropdown-overlay' + (open ? ' open' : '')} onClick={() => this.closeDropdown()}>
        </div>
      </div>
    );
  }
}

export default Dropdown;
