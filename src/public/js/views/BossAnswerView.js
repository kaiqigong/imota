import React, {Component, PropTypes} from 'react';
import { connect } from 'react-redux';
import {actions as bossAnswerActions} from '../redux/bossAnswer';
import {actions as wxsdkActions} from '../redux/wxsdk';
import {Link} from 'react-router';
import ErrorTip from '../components/ErrorTip';
import Instruction from '../components/Instruction';
import Header from '../components/Header';
import setTitle from '../common/setTitle';
import CollectionModal from '../components/CollectionModal';
import MethodModal from '../components/MethodModal';
import FeedbackModal from '../components/FeedbackModal';
import ReviewModal from '../components/ReviewModal';
import AudioPlayer from '../components/AudioPlayer2';
import getParameterByName from '../common/getParam'

const mapStateToProps = ({bossAnswers, wxsdk}) => ({
  bossAnswers, wxsdk,
});

class TranslateBossView extends Component {
  static propTypes = {
    params: PropTypes.object,
    fetchBossAnswersAsync: PropTypes.func,
    submitWorksAsync: PropTypes.func,
    fetchSignatureAsync: PropTypes.func,
    toggleCollectionModal: PropTypes.func,
    toggleSpeeds: PropTypes.func,
    toggleMethodModal: PropTypes.func,
    toggleFeedbackModal: PropTypes.func,
    toggleReviewModal: PropTypes.func,
    bossAnswers: PropTypes.object,
    wxsdk: PropTypes.object,
  };

  state = {
    recording: false,
    submitting: false,
    playingId: null,
  }

  constructor(props) {
    super();
    this.type = getParameterByName('type') || 'listen'
    props.fetchBossAnswersAsync(props.params.courseNo, props.params.lessonNo, this.type);
    props.fetchSignatureAsync();
    this.localIdMap = {};
  }

  submitWorks = () => {
    this.setState({submitting: true})
    this.props.submitWorksAsync(this.props.params.courseNo, this.props.params.lessonNo, this.type)
  }

  play(serverId) {
    if (this.localIdMap[serverId]) {
      wx.playVoice({
          localId: this.localIdMap[serverId], // 需要播放的音频的本地ID，由stopRecord接口获得
        });
        setTimeout(() => {
          this.setState({playingId: serverId});
        }, 300);
        wx.onVoicePlayEnd({
          success: (res) => {
            this.setState({playingId: null});
          },
          fail: (err) => {
            this.setState({playingId: null});
            console.remote('views/PronunciationHomeworkView 51', err);
          },
        });
    } else {
      wx.downloadVoice({
        serverId: serverId, // 需要下载的音频的服务器端ID，由uploadVoice接口获得
        isShowProgressTips: 1, // 默认为1，显示进度提示
        success: (res) => {
          wx.playVoice({
            localId: res.localId, // 需要播放的音频的本地ID，由stopRecord接口获得
          });
          this.localIdMap[serverId] = res.localId;
          setTimeout(() => {
            this.setState({playingId: serverId});
          }, 300);
          wx.onVoicePlayEnd({
            success: (res) => {
              this.setState({playingId: null});
            },
            fail: (err) => {
              this.setState({playingId: null});
              console.remote('views/PronunciationHomeworkView 51', err);
            },
          });
        },
        fail: (err) => {
          this.setState({playingId: null});
          console.remote('views/PronunciationHomeworkView 56', err);
        },
      });
    }
  }

  pause(serverId) {
    const localId = this.localIdMap[serverId];
    wx.pauseVoice({
      localId: localId, // 需要播放的音频的本地ID，由stopRecord接口获得
    });
    this.setState({playingId: null});
  }

  render() {

    const {bossAnswers, wxsdk} = this.props;
    const {showCollectionModal, showMethodModal, showReviewModal, showFeedbackModal} = bossAnswers;
    const {courseNo, lessonNo, bossNo} = this.props.params;
    const prevId = bossAnswers.docs.length; //TODO:
    const {query} = this.props.location;
    const type = query.type || 'listen';

    setTitle('打Boss')

    return (
      <div className="translate">
        {/*<Header back={`/home/courses/${courseNo}?type=translate`} currentProgress={100}>*/}
        <Header back={`/home/courses/${courseNo}?type=${type}`} currentProgress={100}>
          <a className="nav-link" onClick={() => this.props.toggleMethodModal(true)} >方法</a>
          <a className="nav-link" onClick={() => this.props.toggleCollectionModal(true)} >存档</a>
          <a className="nav-link" onClick={() => this.props.toggleReviewModal(true)} >复习</a>
          <a className="nav-link" onClick={() => this.props.toggleFeedbackModal(true)} >纠错</a>
        </Header>


        <CollectionModal
          isOpen={showCollectionModal}
          onRequestClose={() => this.props.toggleCollectionModal(false)} />
        <MethodModal
          isOpen={showMethodModal}
          onRequestClose={() => this.props.toggleMethodModal(false)} />
        <ReviewModal
          isOpen={showReviewModal}
          onRequestClose={() => this.props.toggleReviewModal(false)} />
        <FeedbackModal
          isOpen={showFeedbackModal}
          onRequestClose={() => this.props.toggleFeedbackModal(false)} />
        <div className="container">
          <Instruction text="请对照答案" />
          <div className="col-xs-12 boss-answer-block">
          {
            bossAnswers.docs.map((bossAnswer, idx) => {
              return (
                <div className='boss-answer-item' key={idx}>
                  <div>
                    {bossAnswer.chinese}
                  </div>
                  <div>
                    {bossAnswer.english}
                  </div>
                  <div className="clearfix">
                    {
                      bossAnswer.collected ?
                      <button onClick={() => this.props.toggleCollect(bossAnswer, type)} className="btn btn-sm btn-default pull-xs-right">已收藏</button> :
                      <button onClick={() => this.props.toggleCollect(bossAnswer, type)} className="btn btn-sm btn-primary pull-xs-right">收藏</button>
                    }
                    { (bossAnswer.answer && bossAnswer.answer.serverIds) &&
                      bossAnswer.answer.serverIds.map((serverId) => {
                        return (<div className="sentence-text" key={serverId}>
                          {
                            this.state.playingId === serverId ?
                            <i className="icon-voice" onTouchStart={() => this.pause(serverId)} />
                            :
                            <i className="icon-voice-mute" onTouchStart={() => this.play(serverId)} />
                          }
                        </div>);
                      })
                    }
                  </div>
                </div>
              )
            })
          }
          </div>

        </div>
        <div className="course-buttons">
          <div className="col-xs-offset-4 col-xs-4 text-xs-center">
          { this.state.submitting? // TODO: add submmtting style
            <a className='action-button'>
              正在提交
            </a>
            :
            <a className='action-button' onClick={this.submitWorks}>
              提交
            </a>
          }
          </div>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps, Object.assign(bossAnswerActions, wxsdkActions))(TranslateBossView);
