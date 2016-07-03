import React, {Component, PropTypes} from 'react';
import { connect } from 'react-redux';
// import {actions as translateActions} from '../redux/translate';
import {actions as bossAnswerActions} from '../redux/bossAnswer';
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
import getParameterByName from '../common/getParam'

const mapStateToProps = ({bossAnswers, shifting, wxsdk}) => ({
  bossAnswers, shifting, wxsdk,
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
    shiftSpeed: PropTypes.func,
    // showTranslateAnswer: PropTypes.func,
    // translateInit: PropTypes.func,
    bossAnswers: PropTypes.object,
    // translate: PropTypes.object,
    shifting: PropTypes.object,
  };

  state = {
    recording: false,
    submitting: false,
  }

  constructor(props) {
    super();
    this.type = getParameterByName('type') || 'listen'
    props.fetchBossAnswersAsync(props.params.courseNo, props.params.lessonNo, this.type);
    props.fetchSignatureAsync();
    this.localIds = [];
  }

  submitWorks = () => {
    this.setState({submitting: true})
    this.props.submitWorksAsync(this.props.params.courseNo, this.props.params.lessonNo, this.type)
  }

  render() {

    const {bossAnswers, shifting, wxsdk} = this.props;
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
                  <div className="clearfix" onClick={() => this.props.toggleCollect(bossAnswer, type)}>
                    {
                      bossAnswer.collected ?
                      <button className="btn btn-sm btn-default pull-xs-right">已收藏</button> :
                      <button className="btn btn-sm btn-primary pull-xs-right">收藏</button>
                    }
                    { (bossAnswer.answer && bossAnswer.answer.audio) &&
                      <AudioPlayer audios={[bossAnswer.answer.audio]} key={bossAnswer.answer.audio}>
                        <div className="sentence-text">
                          <i className="icon-voice"></i>
                        </div>
                        <div className="sentence-text">
                          <i className="icon-voice-mute" />
                        </div>
                        <div className="sentence-text">
                          出错啦！
                        </div>
                      </AudioPlayer>
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

export default connect(mapStateToProps, Object.assign(bossAnswerActions, shiftingActions, wxsdkActions))(TranslateBossView);
