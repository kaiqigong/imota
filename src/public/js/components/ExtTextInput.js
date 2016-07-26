import React, {Component, PropTypes} from 'react';

class ExtTextInput extends Component {

  componentDidMount() {
    // document listen keypress
    const self = this;
    this.handler = (e) => {
      if (e.keyCode === 27) {
        self.props.onEsc && self.props.onEsc(e);
      }
    }
    document.addEventListener('keydown', this.handler);
    if (self.props.focus) {
      console.dir(self.refs.input.select);
      setTimeout(() => {self.refs.input.focus();self.refs.input.select();}, 100);
    }
  }

  componentWillUnmount() {
    // unregister keypress events
    document.removeEventListener('keydown', this.handler);
  }

  render() {
    return (
      <input ref="input" {...this.props} />
    )
  }
}

export default ExtTextInput;
