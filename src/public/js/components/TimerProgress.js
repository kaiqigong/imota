import React, {Component, PropTypes} from 'react';
import Progress from 'react-progress';

class TimerProgress extends Component {
  static propTypes = {
    duration: PropTypes.number, //millisecond
    done: PropTypes.func,
  };

  constructor() {
    super();
    this.state = {
      elapsed: 0,
    }
  }

  componentDidMount() {
    const step = 100;
    this.timer = setInterval(()=> {
      const nextElapsed = this.state.elapsed + step
      console.log(nextElapsed);
      console.log(this.props.duration);
      if (nextElapsed >= this.props.duration) {
        clearInterval(this.timer)
        this.setState({elapsed: this.props.duration});
        return setTimeout(() => this.props.done(), 500);
      }
      this.setState({elapsed: nextElapsed})
    }, step);
  }

  componentWillUnmount() {
    if (this.timer) {
      clearInterval(this.timer)
      this.timer = null
    }
  }

  render() {
    const currentProgress = this.state.elapsed / this.props.duration * 100;
    return (
      <div className="progress-bar">
        <Progress percent={currentProgress}/>
      </div>
    )
  }
}

export default TimerProgress;
