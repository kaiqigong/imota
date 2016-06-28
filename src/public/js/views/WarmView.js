import React, {Component, PropTypes} from 'react';
import { connect } from 'react-redux';
import {actions as warmActions} from '../redux/warm';
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
import VideoPlayer from '../components/VideoPlayer';
import {RATES} from '../redux/shifting';

const mapStateToProps = ({warm, shifting, wxsdk}) => ({
  warm, shifting, wxsdk,
});

class WarmView extends Component {
  static propTypes = {
    params: PropTypes.object,
    fetchSingleLessonAsync: PropTypes.func,
    toggleCollectionModal: PropTypes.func,
    toggleSpeeds: PropTypes.func,
    toggleMethodModal: PropTypes.func,
    toggleFeedbackModal: PropTypes.func,
    toggleReviewModal: PropTypes.func,
    shiftSpeed: PropTypes.func,
    warmInit: PropTypes.func,
    warm: PropTypes.object,
    shifting: PropTypes.object,
    location: PropTypes.object,
  };

  constructor(props) {
    super();
    props.warmInit();
    props.fetchSingleLessonAsync(props.params.courseNo, props.params.lessonNo);
  }

  componentWillUpdate(nextProps) {
    if (nextProps.params.lessonNo !== this.props.params.lessonNo || nextProps.params.courseNo !== this.props.params.courseNo) {
      this.props.fetchSingleLessonAsync(nextProps.params.courseNo, nextProps.params.lessonNo);
      this.props.warmInit();
    }
  }

  render() {
    const {warm, shifting} = this.props;
    const {lesson, errors, showCollectionModal, showMethodModal, showReviewModal, showFeedbackModal} = warm;
    const {courseNo, lessonNo} = this.props.params;
    const {query} = this.props.location;
    const type = query.type || 'listen';
    if (errors && errors.list) {
      return <div className="text-danger text-xs-center">加载失败<i className="icon-cuowutishi text-bottom" /> <a onClick={()=>{location.reload()}}>重试</a></div>
    }
    if (!lesson) {
      return <div className="text-muted text-xs-center">加载中，请稍候<i className="icon-loadingdots spin text-bottom"/></div>;
    }
    if (lesson) {
      setTitle(`热身 ${lesson.englishTitle}`);
    }

    // videos
    let videos;
    /**
     * Get the rated audio source according to original src and rate.
     * @param {String} src: original src
     * @param {String} rate: the rate, '0.8', '1.0'
     */
    const getRatedVideoSrc = (src, rate) => {
      const suffix = '.mp4';
      const rateSrc = rate.toString().replace('.', '_');
      let result = src;
      result = result + '@' + rateSrc + suffix;
      const suffixes = ['.mp4'];
      return suffixes.map((x) => {
        return result.substr(0, result.length - suffix.length) + x;
      });
    };
    if (lesson && lesson.videoPath) {
      videos = getRatedVideoSrc(lesson.videoPath, shifting.speed);
    }

    return (
      <div className="translate">
        <Header back={`/home/courses/${courseNo}?type=${type}`} currentProgress={0.001}>
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
          <a className="nav-link" onClick={() => location.reload()}>刷新</a>
          <Link className="nav-link"
            to={`/home/courses/${courseNo}/lessons/${lessonNo}/quiz/?type=${type || 'listen'}`}>
            打Boss
          </Link>
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
          <Instruction text="请看视频" />
          <div className="col-xs-12 video-block">
            <VideoPlayer videos={videos} key={videos[0]} />
          </div>
          <ErrorTip error={errors.server} />
        </div>

        <div className="course-buttons">
          <div className="col-xs-4 col-xs-offset-4 text-xs-center">
            <div className="slick-next">
              <Link className='main-btn' to={`/home/courses/${lesson.courseNo}/lessons/${lesson.lessonNo}/${type || 'listen'}/1`} >
                开始训练
              </Link>
            </div>
          </div>
          <div className="col-xs-4 text-xs-center">
            <Link className="icon-boss side-btn pull-xs-right"
              to={`/home/courses/${courseNo}/lessons/${lessonNo}/boss/?type=${type || 'listen'}`} />
          </div>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps, Object.assign(warmActions, shiftingActions, wxsdkActions))(WarmView);
