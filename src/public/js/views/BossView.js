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
import AudioPlayer from '../components/AudioPlayer2';
import Progress from 'react-progress';
import history from '../common/history';
import TimerProgress from '../components/TimerProgress';
import Modal from 'react-modal';
import getParameterByName from '../common/getParam'

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
    // ticking: false,
  }

  constructor(props) {
    super();
    props.fetchBossesAsync(props.params.courseNo, props.params.lessonNo);
    props.fetchSignatureAsync();
    this.localIds = [];
    this.type = getParameterByName('type') || 'listen';
  }

  beginRecord = () => {
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

  endRecord = () => {
    this.setState({recording: false})
    wx.stopRecord({
      success: (res) => {
        this.localIds.push(res.localId);
        this.submit();
      },
      fail: (err) => {
        console.log(err);
        console.remote('views/BossView', err);
      },
    });
  }

  submit() {
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
    this.setState({started: true})
    if (this.type == 'translate') {
      this.beginRecord()
    }
  }

  timeoutCb = (bassAnswerAddr) => {
    this.endRecord()
    if (this.state.bossNo == this.props.bosses.docs.length) {
      setTimeout(() => history.pushState(null, bassAnswerAddr), 1000);
      return;
    }
    // TODO: add callback to endRecord, use it instead of setTimeout
    setTimeout(()=> {
      this.setState({bossNo: this.state.bossNo + 1});
      if (this.type == 'translate') {
        this.beginRecord();
      }
    }, 1000);
  }

  // audioPlayEnd = () => {
  //   this.beginRecord()
  // }

  render() {
    const {bosses, shifting, wxsdk} = this.props;
    const {errors, showCollectionModal, showMethodModal, showReviewModal, showFeedbackModal} = bosses;
    const {courseNo, lessonNo} = this.props.params;
    const {bossNo} = this.state;

    const boss = bosses.docs[bossNo-1];
    if (errors && errors.list) {
      return <div className="text-danger text-xs-center">加载失败<i className="icon-cuowutishi text-bottom" /> <a onClick={()=>{location.reload()}}>重试</a></div>;
    }
    if (!boss) {
      return <div className="text-muted text-xs-center">加载中，请稍候<i className="icon-loadingdots spin text-bottom" /></div>;
    }

    // TODO: course & lesson?
    setTitle(`打Boss`);

    const prevId = bossNo - 1;
    const currentProgress = (bossNo + 0.001) / bosses.docs.length * 100;

    // const {query} = this.props.location;
    const type = this.type || 'listen';

    const instructionMsg = type == 'listen'? '请跟读每个句子': '请翻译每个句子';

    const duration = Math.max(boss.duration || 3, 3) * 1000;
    const timeLimit = duration * (type === 'listen' ? 1.75 : 2);

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
              type=='translate' ?
              <p>口语练习的打boss形式为逐个翻译每个句子，并且有时间限制，你准备好了吗</p>
              :
              <p>每个句子需要手动点击播放按钮才能开始, 每个句子只能听一遍, 录音有时间限制</p>
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
            { this.state.started && !this.state.recording &&
              <AudioPlayer audios={[boss.audio]} key={boss.sentenceNo} onEnd={this.beginRecord}>
                <div className="audio-btn">
                  <i className="icon-pause" />
                </div>
                <div className="audio-btn">
                  <i className="icon-play" />
                </div>
              </AudioPlayer>
            }
            </div>
          }
          </div>
          <div className='clearfix'> </div>
          { this.state.recording ?
            <TimerProgress
              duration={timeLimit}
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
            <a className="action-button record-button recording" onClick={()=>this.timeoutCb(`/home/courses/${courseNo}/lessons/${lessonNo}/boss_answer?type=${type}`)}>
              <i className="icon-mic" />
            </a>
            :
            <a className="action-button record-button">
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
