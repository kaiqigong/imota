import React, {Component, PropTypes} from 'react';
import ajax from '../common/ajax';

// let audio;

class AudioPlayer extends Component {
  static propTypes = {
    audios: PropTypes.array.isRequired,
    autoplay: PropTypes.bool,
    children: PropTypes.array,
    onEnd: PropTypes.func,
  };

  constructor(props) {
    super();
    this.state = {
      loading: true,
    };

    this.audio = new Audio();
    // if (!audio) {
    //   audio = new Audio();
    //   window.theAudio = audio;
    // }
    this.audio.innerHTML = '';

    // TODO: 在点击play的时候动态设置src

    const mp3 = props.audios.filter((item) => {
      return item.indexOf('.mp3') > -1;
    });
    if (!mp3.length) {
      alert('没有音频');
      ajax.post('/api/behaviors/', {
        scope: 'audioPlayer2',
        action: 'nosrc',
        value: window.location.href});
      return;
    }
    const src1 = document.createElement('SOURCE');
    src1.src = mp3[0];
    src1.type = 'audio/mpeg';
    if (mp3[0] && mp3[0].indexOf('https://o3f47rda5.qnssl.com') > -1) {
      mp3[0] = mp3[0].replace('https://o3f47rda5.qnssl.com', 'http://media.learnwithwind.com');
    }
    const src2 = document.createElement('SOURCE');
    src2.src = mp3[0];
    src2.type = 'audio/mpeg';
    this.audio.appendChild(src2);
    this.audio.appendChild(src1);

    const len = this.audio.children.length;
    let index;
    this.errCount = 0;
    for (index = 0; index < len; index++) {
      this.audio.children[index].onerror = (e) => {
        ajax.post('/api/behaviors/', {
          scope: 'audioPlayer2',
          action: 'srcFail',
          value: JSON.stringify({src: e.target.src})});
        this.errCount++;
        if (this.errCount === len) {
          this.state.error = e;
          this.setState(this.state);
          ajax.post('/api/behaviors/', {
            scope: 'audioPlayer2',
            action: 'fail',
            value: JSON.stringify({src: e.target.src})});
        }
      }
    }

    this.audio.autoplay = props.autoplay;
  }

  componentDidMount() {
    this.audio.onplay = this::this._onPlay;
    this.audio.onpause = this::this._onPause;
    this.audio.onerror = this::this._onError;
    this.audio.onended = this::this._onEnded;
    this.audio.oncanplay = this::this._onLoaded;
    this.audio.oncancel = this::this._onEvent;
    this.initDate = new Date();
    this.audio.load();
  }

  componentWillUnmount() {
    this.audio.onplay = null;
    this.audio.onpause = null;
    this.audio.onerror = null;
    this.audio.onended = null;
    this.audio.oncanplay = null;
    this.audio.oncancel = null;
    this.audio.pause();
  }

  reload() {
    this.errCount = 0;
    this.state.error = null;
    this.setState(this.state);
    this.audio.load();
  }

  _onLoaded(e) {
    const loadingTime = (new Date() - this.initDate) / 1000;
    if (this.props.autoplay) {
      this.togglePlay();
    }
    this.state.loading = false;
    this.setState(this.state);
    ajax.post('/api/behaviors/', {
      scope: 'audioLoadedTime',
      value: loadingTime});
    _hmt.push(['_trackEvent', 'audio', 'load', e.target.currentSrc, loadingTime]);
  }

  _onEnded() {
    this.state.playing = false;
    this.props.onEnd && this.props.onEnd()
    this.setState(this.state);
  }

  _onPause() {
    this.state.playing = false;
    this.setState(this.state);
  }

  _onPlay(e) {
    ajax.post('/api/behaviors/', {
      scope: 'audioPlayer2',
      action: 'play',
      value: e.target.currentSrc});
    this.state.playing = true;
    this.setState(this.state);
  }

  _onError(e) {
    this.state.error = e;
    this.setState(this.state);
    ajax.post('/api/behaviors/', {
      scope: 'audioPlayer2',
      action: 'fail',
      value: JSON.stringify({code: this.audio.error.code, src: e.target.currentSrc})});
  }

  _onEvent(e) {
    console.remote(e);
  }

  togglePlay() {
    const playing = !this.state.playing;
    if (playing) {
      this.audio.play();
    } else {
      this.audio.pause();
    }
  }

  render() {
    return (
      <div>
        {
          this.state.error ?
          <span onClick={this::this.reload}>
            {
              this.props.children && this.props.children[2] ?
              this.props.children[2]
              :
              <div className="audio-btn">
                <i className="icon-cuowutishi" />
                加载失败, 点击刷新
              </div>
            }
          </span>
          :
          this.state.playing ?
          <span onClick={this::this.togglePlay}>
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
          <span onClick={this::this.togglePlay}>
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
