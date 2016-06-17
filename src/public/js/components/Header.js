import React, {Component, PropTypes} from 'react';
import {Link} from 'react-router';
import Progress from 'react-progress';

class Header extends Component {
  static propTypes = {
    back: PropTypes.string.isRequired,
    children: PropTypes.array,
    currentProgress: PropTypes.number,
  };

  constructor() {
    super();
    this.state = {};
  }

  openSidebar() {
    this.state.open = true;
    this.setState(this.state);
  }

  closeSidebar() {
    this.state.open = false;
    this.setState(this.state);
  }

  render() {
    const open = this.state.open;
    return (
      <div className="header">
        <nav className="navbar">
          <ul className="nav navbar-nav">
            <li className="nav-item">
              <Link className="nav-link" to={this.props.back}>
                <i className="icon-lesson" />
              </Link>
            </li>
            { this.props.currentProgress &&
              <li className="nav-item nav-item-progress-bar">
                <div className="progress-bar">
                  <Progress percent={this.props.currentProgress}/>
                </div>
              </li>
            }
            {
              this.props.children && this.props.children.length &&
              <li className="nav-item pull-xs-right">
                <a className="nav-link" onClick={() => this.openSidebar()}>
                  <i className="icon-hamburger" />
                </a>
              </li>
            }
          </ul>
        </nav>
        {
          this.props.children && this.props.children.length ?
          <div className={'header-side-memu' + (open ? ' open' : '')}>
            <ul className="nav">
              <li className="nav-item clearfix">
                <a className="nav-link pull-xs-right" onClick={() => this.closeSidebar()}>
                  <i className="icon-times" />
                </a>
              </li>
              {
                this.props.children.map((child, index) => {
                  return (
                    <li key={index} className="nav-item" onClick={() => this.closeSidebar()}>
                      {child}
                    </li>
                  );
                })
              }
            </ul>
          </div>
          :
          ''
        }
        <div className={'header-overlay' + (open ? ' open' : '')} onClick={() => this.closeSidebar()}>
        </div>
      </div>
    );
  }
}

export default Header;
