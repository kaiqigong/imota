import React, {Component, PropTypes} from 'react';
import ajax from '../common/ajax';

let audio;

class AudioPlayer extends Component {
  static propTypes = {
    audios: PropTypes.array.isRequired,
    autoplay: PropTypes.bool,
    children: PropTypes.array,
  };

  constructor(props) {
    super();
    this.state = {
      loading: true,
    };
    if (!audio) {
      audio = new Audio();
      window.theAudio = audio;
    }
    const mp3 = props.audios.filter((item) => {
      return item.indexOf('.mp3') > -1;
    });

    const src1 = document.createElement('SOURCE');
    src1.src = mp3[0];
    src1.type = 'audio/mpeg';

    if (mp3[0].indexOf('https://o3f47rda5.qnssl.com') > -1) {
      mp3[0] = mp3[0].replace('https://o3f47rda5.qnssl.com', 'http://cdn.holdqq.com');
    }
    const src2 = document.createElement('SOURCE');
    src2.src = mp3[0];
    src2.type = 'audio/mpeg';

    audio.innerHTML = '';
    audio.appendChild(src2);
    audio.appendChild(src1);
    audio.autoplay = props.autoplay;
  }

  componentDidMount() {
    audio.onplay = this::this._onPlay;
    audio.onpause = this::this._onPause;
    audio.onerror = this::this._onError;
    audio.onended = this::this._onEnded;
    audio.oncanplay = this::this._onLoaded;
    audio.oncancel = this::this._onEvent;
    this.initDate = new Date();
      audio.load();

  }

  componentWillUnmount() {
    audio.onplay = null;
    audio.onpause = null;
    audio.onerror = null;
    audio.onended = null;
    audio.oncanplay = null;
    audio.oncancel = null;
    audio.pause();
  }

  _onLoaded() {
    const loadingTime = (new Date() - this.initDate) / 1000;
    ajax.post('/api/behaviors/', {
      scope: 'audioLoadedTime',
      value: loadingTime});
    if (this.props.autoplay) {
      this.togglePlay();
    }
    this.state.loading = false;
    this.setState(this.state);
  }

  _onEnded() {
    this.state.playing = false;
    this.setState(this.state);
  }

  _onPause() {
    this.state.playing = false;
    this.setState(this.state);
  }

  _onPlay(e) {
    ajax.post('/api/behaviors/', {
      scope: 'audioPlayer',
      action: 'play',
      value: e.target.currentSrc});
    this.state.playing = true;
    this.setState(this.state);
  }

  _onError(e) {
    this.state.error = e;
    this.setState(this.state);
    ajax.post('/api/behaviors/', {
      scope: 'audioPlayer',
      action: 'fail',
      value: JSON.stringify({code: audio.error.code, src: e.target.currentSrc})});
    mixpanel.track('audioPlayer', {action: 'fail', src: e.target.currentSrc, code: audio.error.code});
  }

  _onEvent(e) {
    console.remote(e);
  }

  togglePlay() {
    const playing = !this.state.playing;
    if (playing) {
      audio.play();
    } else {
      audio.pause();
    }
  }

  render() {
    return (
      <div>
        {
          this.state.error ?
          <span>
            {
              this.props.children && this.props.children[2] ?
              this.props.children[2]
              :
              <div className="audio-btn">
                <i className="icon-cuowutishi" />
              </div>
            }
          </span>
          :
          this.state.playing ?
          <span onTouchStart={this::this.togglePlay}>
            {
              this.props.children && this.props.children[0] ?
              this.props.children[0]
              :
              <div className="audio-btn">
                <i className="icon-pause" />
              </div>
            }
          </span>
          :
          <span onTouchStart={this::this.togglePlay}>
            {
              this.props.children && this.props.children[1] ?
              this.props.children[1]
              :
              <div className="audio-btn">
                <i className="icon-play" />
              </div>
            }
          </span>
        }
      </div>
    );
  }

}

export default AudioPlayer;
