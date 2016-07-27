import React, {Component, PropTypes} from 'react';

class ExtTextInput extends Component {

  static propTypes = {
    onEsc: PropTypes.func, // 键盘按下esc触发事件
  };

  componentDidMount() {
    // document listen keypress
    const self = this;
    this.handler = (e) => {
      if (e.keyCode === 27 && self.props.onEsc) {
        self.props.onEsc(e);
      }
    };
    document.addEventListener('keydown', this.handler);
    if (self.props.focus) {
      setTimeout(() => {
        self.refs.input.focus();
        self.refs.input.select();
      }, 100);
    }
  }

  componentWillUnmount() {
    // unregister keypress events
    document.removeEventListener('keydown', this.handler);
  }

  render() {
    return (
      <input ref="input" {...this.props} />
    );
  }
}

export default ExtTextInput;
