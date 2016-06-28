import React, {Component, PropTypes} from 'react';
import { connect } from 'react-redux';
import {actions as pronunciationHomeworkActions} from '../redux/pronunciationHomework';
import {actions as wxsdkActions} from '../redux/wxsdk';
import ErrorTip from '../components/ErrorTip';
import Header from '../components/Header';
import setTitle from '../common/setTitle';
import AudioPlayer from '../components/AudioPlayer';

const mapStateToProps = ({pronunciationHomework, wxsdk}) => ({
  pronunciationHomework, wxsdk,
});

class PronunciationHomeworkView extends Component {
  static propTypes = {
    params: PropTypes.object,
    fetchSinglePronunciationHomeworkAsync: PropTypes.func,
    pronunciationHomeworkInit: PropTypes.func,
    pronunciationHomework: PropTypes.object,
    location: PropTypes.object,
    fetchSignatureAsync: PropTypes.func,
    wxsdk: PropTypes.object,
    togglePlay: PropTypes.func,
  };

  constructor(props) {
    super(props);
    this.localIdMap = {};
  }

  componentDidMount() {
    this.props.pronunciationHomeworkInit();
    this.props.fetchSinglePronunciationHomeworkAsync(this.props.params.pronunciationHomeworkId);
    setTimeout(() => this.props.fetchSignatureAsync(), 400);
  }

  play(serverId) {
    wx.downloadVoice({
      serverId: serverId, // 需要下载的音频的服务器端ID，由uploadVoice接口获得
      isShowProgressTips: 1, // 默认为1，显示进度提示
      success: (res) => {
        wx.playVoice({
          localId: res.localId, // 需要播放的音频的本地ID，由stopRecord接口获得
        });
        this.localIdMap[serverId] = res.localId;
        this.props.togglePlay({[serverId]: true});
        wx.onVoicePlayEnd({
          success: (res) => {
            this.props.togglePlay({[serverId]: false});
          },
          fail: (err) => {
            console.remote('views/PronunciationHomeworkView 51', err);
          },
        });
      },
      fail: (err) => {
        console.remote('views/PronunciationHomeworkView 56', err);
      },
    });
  }

  pause(serverId) {
    const localId = this.localIdMap[serverId];
    wx.pauseVoice({
      localId: localId, // 需要播放的音频的本地ID，由stopRecord接口获得
    });
    this.props.togglePlay({[serverId]: false});
  }

  render() {
    const {pronunciationHomework} = this.props;
    // const {errMsg} = wxsdk;
    // if (errMsg) {
    //   console.log('签名失败');
    // }
    const {serverIds, errors, courseNo, playing, created, homeworkName, audios, audio} = pronunciationHomework;
    if (!serverIds) {
      return <div className="text-muted text-xs-center">加载中，请稍候<i className="icon-loadingdots spin text-bottom"/></div>;
    }
    if (serverIds) {
      setTitle(homeworkName);
    }

    let expireDate = new Date(created).valueOf() + 72 * 3600 * 1000;
    expireDate = new Date(expireDate);
    expireDate = (expireDate.getMonth() + 1) + '月' + expireDate.getDate() + '日' + expireDate.getHours() + '点';

    return (
      <div className="pronunciationHomework">
        <div style={{'margin': '0 auto', 'width': '0px', 'height': '0px', 'overflow': 'hidden'}}>
          <img src={pronunciationHomework.course.shareImageUrl} width="700" />
        </div>
        <Header back={`/home/pronunciation_courses/${courseNo}/lessons/`} />
        <div className="container">
          <div className="col-xs-12 video-block text-xs-center">
            <h4>{homeworkName}</h4>
            {
              audio &&
              <AudioPlayer audios={[audio]} key={audio} />
            }
            {
              new Date(created).valueOf() + 72 * 3600 * 1000 > new Date().valueOf() &&
              <div>
                小播放按钮为微信原始音质, 比较清晰, 但是只能保留3天。本录音将于{expireDate}过期
                {
                  serverIds.map((serverId) => {
                    return (<div className="text-xs-center" key={serverId}>
                      {
                        playing[serverId] ?
                        <i className="icon-pause audio-btn-sm" onTouchStart={() => this.pause(serverId)} />
                        :
                        <i className="icon-play audio-btn-sm" onTouchStart={() => this.play(serverId)} />
                      }
                    </div>);
                  })
                }
              </div>
            }
            <p className="text-muted">
              一定要点击微信右上角菜单的分享，分享到微信群，老师才能看到你的作业
            </p>
          </div>
          <ErrorTip error={errors.server} />
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps, Object.assign(pronunciationHomeworkActions, wxsdkActions))(PronunciationHomeworkView);
