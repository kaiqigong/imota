import React, {Component, PropTypes} from 'react';
import { connect } from 'react-redux';
import {actions as bossActions} from '../redux/boss';
import {actions as shiftingActions} from '../redux/shifting';
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
import {RATES} from '../redux/shifting';
import AudioPlayer from '../components/AudioPlayer';
import Progress from 'react-progress';
import history from '../common/history';
import TimerProgress from '../components/TimerProgress';
import Modal from 'react-modal';

const mapStateToProps = ({bosses, shifting, wxsdk}) => ({
  bosses, shifting, wxsdk,
});

class BossView extends Component {
  static propTypes = {
    params: PropTypes.object,
    fetchBossesAsync: PropTypes.func,
    fetchSignatureAsync: PropTypes.func,
    toggleCollectionModal: PropTypes.func,
    toggleSpeeds: PropTypes.func,
    toggleMethodModal: PropTypes.func,
    toggleFeedbackModal: PropTypes.func,
    toggleReviewModal: PropTypes.func,
    shiftSpeed: PropTypes.func,
    bosses: PropTypes.object,
    shifting: PropTypes.object,
  };

  state = {
    recording: false,
    progress: 0,
    bossNo: 1,
    started: false,
    ticking: false,
  }

  constructor(props) {
    super();
    props.fetchBossesAsync(props.params.courseNo, props.params.lessonNo);
    props.fetchSignatureAsync();
    this.localIds = [];
    console.log('timer!');
    this.timer = null;
  }

  componentWillUnmount() {
    console.log('unmount');
    if (this.timer) {
      clearTimeout(this.timer)
    }
  }

  beginRecord() {
    this.setState({recording: true})
    wx.startRecord();
    wx.onVoiceRecordEnd({
    // 录音时间超过一分钟没有停止的时候会执行 complete 回调
      complete: (res) => {
        this.localIds.push(res.localId);
        // todo: start another record
        setTimeout(function() {
          wx.startRecord();
        }, 100);
      },
      fail: (err) => {
        console.error('views/DoingHomeworkView 100', err.toString());
      },
    });
  }

  endRecord() {
    this.setState({recording: false})
    wx.stopRecord({
      success: (res) => {
        this.localIds.push(res.localId);
        this.submit()
      },
      fail: (err) => {
        console.log(err);
        console.remote('views/BossView', err);
      },
    });
  }

  submit() {
    console.log('submit!');
    const {courseNo, lessonNo} = this.props.params;
    const {bossNo} = this.state;
    const {query} = this.props.location;
    const type = query.type || 'listen';
    const payload = Object.assign({courseNo, lessonNo, bossNo, type}, {localIds: this.localIds.slice()});
    this.props.submitRecordAsync(payload);
    this.localIds = []
  }

  start = (backUrl) => {
    if (!this.props.wxsdk.signature && !this.props.wxsdk.nowechat) {
      return history.pushState(null, backUrl);
    }
    this.setState({ticking: true, started: true})
    this.beginRecord()
  }

  timeoutCb = (bassAnswerAddr) => {
    this.endRecord()
    if (this.state.bossNo == this.props.bosses.docs.length) {
      return history.pushState(null, bassAnswerAddr);
    }
    setTimeout(()=> {
      this.setState({bossNo: this.state.bossNo+1})
      this.beginRecord()
    }, 2000)
  }

  setBossTimeout(timeLimit, bassAnswerAddr) {
    if (this.timer) {
      return
    }

    this.beginRecord()

    const step = 100;
    this.timer = setInterval(() => {
      if (this.state.progress >= timeLimit) {
        clearInterval(this.timer)

        this.endRecord()
        setTimeout(()=> {
          // history.pushState(null);
          this.timer = null
          this.state.progress = 0;
          console.log(this.state.bossNo);
          console.log(this.props.bosses.docs.length);
          if (this.state.bossNo == this.props.bosses.docs.length) {
            return history.pushState(null, bassAnswerAddr);
          }
          this.setState({bossNo: this.state.bossNo+1})

        }, 1000)
      }
      this.setState({progress: this.state.progress + step})
    }, step)
  }

  render() {

    const {bosses, shifting, wxsdk} = this.props;
    const {showCollectionModal, showMethodModal, showReviewModal, showFeedbackModal} = bosses;
    const {courseNo, lessonNo} = this.props.params;
    const {bossNo} = this.state;

    const boss = bosses.docs[bossNo-1];
    if (!boss) {
      return <div>Loading...</div>;
    }

    // TODO: course & lesson?
    setTitle(`打Boss`);

    const prevId = bossNo - 1;
    const currentProgress = (bossNo + 0.001) / bosses.docs.length * 100

    const {query} = this.props.location;
    const type = query.type || 'listen';

    const instructionMsg = type == 'listen'? '请跟读每个句子': '请翻译每个句子';

    const duration = (boss.duration || 4) * 1000;
    const timeLimit = duration * 1.2;
    const timerProgress = this.state.progress / timeLimit * 100;

    const customStyles = {
      overlay: {
        zIndex: '1031',
        background: 'rgba(0, 0, 0, 0.6)',
      },
      content: {
        top: '13rem',
        left: '3rem',
        right: '3rem',
        bottom: 'auto',
        padding: '0',
      },
    };

    const backUrl = `/home/courses/${courseNo}?type=${type}`

    return (
      <div>
        <Header back={backUrl} currentProgress={currentProgress}>
          <a className="nav-link" onClick={() => this.props.toggleMethodModal(true)} >方法</a>
          <a className="nav-link" onClick={e => {
            e.stopPropagation();
            this.props.toggleSpeeds();
          }}>难度</a>
          {
            shifting.showSpeeds ?
            <div>
              {
                RATES.map((rate) => {
                  return (
                    <a className={'nav-link col-xs-12' + (shifting.speed === rate ? ' selected' : '')} key={rate} onClick={() => {
                      this.props.shiftSpeed(rate);
                    }}>
                      {rate}
                      {
                        shifting.speed === rate ?
                        <i className="icon-tick pull-xs-right" />
                        :
                        ''
                      }
                    </a>
                  );
                })
              }
            </div>
            :
            ''
          }
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

        <Modal
          isOpen={!this.state.started}
          style={customStyles}
          >
          <div className="modal-body">
          { wxsdk.signature ?
              <p>口语练习的打boss形式为逐个翻译每个句子，并且有时间限制，你准备好了吗</p>
            :
              wxsdk.noWechat ?
              <div className="small">
                录音功能不支持在浏览器下使用, 请用微信
              </div>
              :
              <i className="icon-loadingdots spin"/>
          }
          </div>
          <button onClick={() => this.start(backUrl)} enable={wxsdk.signature}
            className='btn btn-secondary btn-block'>
            {wxsdk.noWechat? 'OK': 'Go!'}
          </button>
        </Modal>

        <div className="container">
          <Instruction text={instructionMsg} />

          <div className="col-xs-12 answer-block">
          { type == 'translate'?
            <div className="sentence-chinese">
              {boss.chinese}
            </div>
            :
            <div className="text-xs-center">
              <AudioPlayer audios={[boss.audio]} autoplay key={boss.audio}>
                <div className="audio-btn">
                  <i className="icon-pause" />
                </div>
                <div className="audio-btn">
                  <i className="icon-play" />
                </div>
              </AudioPlayer>
            </div>
          }
          </div>
          <div className='clearfix'> </div>
          { this.state.ticking ?
            <TimerProgress
              duration={duration}
              done={()=>this.timeoutCb(`/home/courses/${courseNo}/lessons/${lessonNo}/boss_answer?type=${type}`)}
              key={bossNo}
            />
            :
            <Progress percent={0}/>
          }
          {/*<ErrorTip error={errors.server} />*/}
        </div>
        <div className="course-buttons">
          <div className="col-xs-offset-4 col-xs-4 text-xs-center no-padding-col">
          {
            this.state.recording ?
            <a className="action-button record-button recording" onClick={e => this.endRecord(e)}>
              <i className="icon-mic" />
            </a>
            :
            <a className="action-button record-button" onClick={e => this.beginRecord(e)}>
              <i className="icon-mic" />
            </a>
          }
          </div>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps, Object.assign(bossActions, shiftingActions, wxsdkActions))(BossView);
