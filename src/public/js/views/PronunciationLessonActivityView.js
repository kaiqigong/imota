import React, {Component, PropTypes} from 'react';
import { connect } from 'react-redux';
import {actions} from '../redux/pronunciationLessonActivity';
import {actions as wxsdkActions} from '../redux/wxsdk';
import {Link} from 'react-router';
import Slider from 'react-slick';
import Instruction from '../components/Instruction';
import AudioPlayer from '../components/AudioPlayer';
import VideoPlayer from '../components/VideoPlayer';
import ErrorTip from '../components/ErrorTip';
import ScrollingView from '../components/ScrollingView';
import history from '../common/history';
import setTitle from '../common/setTitle';
import Header from '../components/Header';
import CollectionModal from '../components/CollectionModal';
import FeedbackModal from '../components/FeedbackModal';
import ReviewModal from '../components/ReviewModal';

const mapStateToProps = ({pronunciationLessonActivity, wxsdk}) => ({
  pronunciationLessonActivity, wxsdk,
});

class PronunciationLessonActivityView extends Component {

  static propTypes = {
    params: PropTypes.object,
    pronunciationLessonActivity: PropTypes.object.isRequired,
    wxsdk: PropTypes.object.isRequired,
    fetchPronunciationLessonsActivityAsync: PropTypes.func.isRequired,
    fetchSignatureAsync: PropTypes.func.isRequired,
    beginRecord: PropTypes.func.isRequired,
    endRecord: PropTypes.func.isRequired,
    endPronunciationHomeworkAsync: PropTypes.func.isRequired,
    submitRecordAsync: PropTypes.func.isRequired,
    pronunciationLessonActivityInit: PropTypes.func.isRequired,
    clearRecords: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);
    this.localIds = [];

    props.pronunciationLessonActivityInit();
    // the react-slick sucks!
    const {courseNo, lessonNo, activityIndex} = props.params;
    if (activityIndex) {
      history.pushState(null, `/home/pronunciation_courses/${courseNo}/lessons/${lessonNo}/0`);
      setTimeout(() => history.pushState(null, `/home/pronunciation_courses/${courseNo}/lessons/${lessonNo}/${activityIndex}`), 200);
    }
  }

  componentDidMount() {
    this.props.fetchPronunciationLessonsActivityAsync(this.props.params.courseNo, this.props.params.lessonNo);
    this.props.fetchSignatureAsync();
    this.forceUpdate();
  }

  startRecord() {
    wx.startRecord({
      success: () => {
        // 录音超过55s后自动开始新的录音
        this.timeoutId = setTimeout(() => {
          wx.stopRecord({
            success: (res) => {
              this.localIds.push(res.localId);
              clearTimeout(this.timeoutId);
              this.startRecord();
            },
            fail: (err) => {
              console.remote('views/PronunciationLessonActivityView 82-9', err);
              alert('录音失败！请联系老师');
            },
          });
        }, 55000);
      },
      fail: (err) => {
        console.remote('views/PronunciationLessonActivityView 82-1', err);
      },
    });
  }

  beginRecord() {
    this.props.beginRecord();

    this.startRecord();
  }

  endRecord() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }

    wx.stopRecord({
      success: (res) => {
        this.localIds.push(res.localId);
        // todo: end quiz
        this.props.endRecord(this.localIds);
        this.props.endPronunciationHomeworkAsync(this.localIds.slice());
      },
      fail: (err) => {
        console.remote('views/PronunciationLessonActivityView 82', err);
        alert('录音失败！请联系老师');
        this.props.endRecord(this.localIds);
        this.props.endPronunciationHomeworkAsync(this.localIds.slice());
      },
    });
  }

  rework() {
    this.localIds = [];
    this.props.clearRecords();
  }

  submit(data) {
    const nickname = this.refs.nickname.value;
    const payload = Object.assign(data, {nickname});
    this.props.submitRecordAsync(payload);
  }

  renderPrevArrow(courseNo, lessonNo, activityIndex) {
    if (activityIndex === 0) {
      return '';
    }
    return (
      <Link to={`/home/pronunciation_courses/${courseNo}/lessons/${lessonNo}/${activityIndex - 1}`} className="icon-left side-btn" />
    );
  }

  renderNextArrow(courseNo, lessonNo, activityIndex) {
    const {pronunciationLessonActivity} = this.props;
    // 最后一页以及最后第二页不显示
    if (activityIndex >= pronunciationLessonActivity.docs.length - 2) {
      return (
        <div className="slick-next"><a className="main-btn hidden"></a></div>
      );
    }
    return (
      <div className="slick-next">
        <Link to={`/home/pronunciation_courses/${courseNo}/lessons/${lessonNo}/${activityIndex + 1}`} className="main-btn" >
          下一步
        </Link>
      </div>
    );
  }

  render() {
    const {pronunciationLessonActivity, wxsdk, params} = this.props;
    const {docs, recording, localIds, lesson, errors, uploadingRecord, showCollectionModal, showReviewModal, showFeedbackModal} = pronunciationLessonActivity;
    let {activityIndex} = this.props.params;
    if (!activityIndex) {
      activityIndex = 0;
    } else {
      activityIndex = +activityIndex;
    }
    const {lessonNo, courseNo} = params;
    // Set the current progress
    const activitiesCount = docs.length;
    const currentProgress = ((activityIndex || 0) + 1) / activitiesCount * 100;
    const activityLessonActivity = docs[activityIndex || 0];
    const settings = {
      dots: false,
      swipe: false,
      infinite: false,
      arrows: false,
      afterChange: (index) => {
        history.pushState(null, `/home/pronunciation_courses/${courseNo}/lessons/${lessonNo}/${index}`);
        // why need this? the action does not fire render...
      },
      slickGoTo: activityIndex,
    };

    const scrollStyle = {
      overflowY: 'auto',
      height: (window.innerHeight - 19 * parseFloat(window.getComputedStyle(document.body, null).getPropertyValue('font-size'))) + 'px',
      'WebkitOverflowScrolling': 'touch',
    };
    if (lesson) {
      setTitle(`${(activityIndex || 0) + 1}/${activitiesCount} ${lesson.englishTitle}`);
    }
    return (
      <div className="pronunciation-activity-view clearfix">
        <Header back={`/home/pronunciation_courses/${courseNo}/lessons/`} currentProgress={currentProgress}>
          <a className="nav-link" onClick={() => this.props.toggleCollectionModal(true)} >存档</a>
          <a className="nav-link" onClick={() => this.props.toggleReviewModal(true)} >复习</a>
          <a className="nav-link" onClick={() => this.props.toggleFeedbackModal(true)} >纠错</a>
          <a className="nav-link" onClick={() => location.reload()}>刷新</a>
        </Header>
        <CollectionModal
          isOpen={showCollectionModal}
          onRequestClose={() => this.props.toggleCollectionModal(false)} />
        <ReviewModal
          isOpen={showReviewModal}
          onRequestClose={() => this.props.toggleReviewModal(false)} />
        <FeedbackModal
          isOpen={showFeedbackModal}
          onRequestClose={() => this.props.toggleFeedbackModal(false)} />
        {
          lesson ?
          <div>
            <div className="col-xs-12">
              <Slider {...settings}>
                {docs.map((lessonActivity, index) => {
                  const shouldShow = index >= activityIndex - 1 && index <= activityIndex + 1;
                  const active = index === activityIndex;
                  return (
                    <div key={lessonActivity.index}>
                      {
                        lessonActivity.type === '讲解' && shouldShow &&
                        <div className="activity-item">
                          <div className="clearfix">
                          <Instruction text="请听讲解" />
                          </div>
                          <ScrollingView className="course-content" style={scrollStyle}>
                            {
                              lessonActivity.video && active
                                ? <VideoPlayer videos={[lessonActivity.video]} autoplay key={lessonActivity.video} />
                                : ''
                            }
                            {
                              lessonActivity.audio && active ?
                              <div className="listen-explain">
                                <AudioPlayer audios={[lessonActivity.audio]} autoplay key={lessonActivity.audio}>
                                    <div className="sentence-text">
                                      <div dangerouslySetInnerHTML={{__html: lessonActivity.description}}></div>
                                      <i className="icon-voice"></i>
                                    </div>
                                    <div className="sentence-text">
                                      <div dangerouslySetInnerHTML={{__html: lessonActivity.description}}></div>
                                      <i className="icon-voice-mute" />
                                    </div>
                                    <div className="sentence-text">
                                      <div dangerouslySetInnerHTML={{__html: lessonActivity.description}}></div>
                                      <i className="icon-cuowutishi" />
                                    </div>
                                  </AudioPlayer>
                              </div>
                              :
                              !lessonActivity.audio ?
                              <div className="listen-explain">
                                <div dangerouslySetInnerHTML={{__html: lessonActivity.description}}></div>
                              </div>
                              :
                              ''
                            }
                          </ScrollingView>
                        </div>
                        }

                      {
                        lessonActivity.type === '朗读' && shouldShow &&
                        <div className="activity-item">
                          <div className="clearfix">
                          <Instruction text="请朗读" />
                          </div>
                          <ScrollingView className="course-content" style={scrollStyle}>
                            <div className="reading-pronunciation">
                              {
                                lessonActivity.audio && active
                                ? <AudioPlayer audios={[lessonActivity.audio]} autoplay key={lessonActivity.audio}>
                                    <div className="sentence-text">
                                      <div className="text-xs-center">
                                      {lessonActivity.readingText}
                                      </div>
                                      <div className="text-muted text-xs-center">
                                      {lessonActivity.readingNote}
                                      </div>
                                      <i className="icon-voice"></i>
                                    </div>
                                    <div className="sentence-text">
                                      <div className="text-xs-center">
                                      {lessonActivity.readingText}
                                      </div>
                                      <div className="text-muted text-xs-center">
                                      {lessonActivity.readingNote}
                                      </div>
                                      <i className="icon-voice-mute" />
                                    </div>
                                    <div className="sentence-text">
                                      <div className="text-xs-center">
                                      {lessonActivity.readingText}
                                      </div>
                                      <div className="text-muted text-xs-center">
                                      {lessonActivity.readingNote}
                                      </div>
                                      <i className="icon-cuowutishi" />
                                    </div>
                                  </AudioPlayer>
                                : ''
                              }
                            </div>
                          </ScrollingView>
                        </div>
                      }
                      {
                        lessonActivity.type === '打Boss' && shouldShow &&
                        <div className="activity-item">
                          <div className="clearfix">
                            {
                              localIds ?
                              <Instruction text="请提交录音" />
                              :
                              <Instruction text="请朗读整段文本" />
                            }
                          </div>
                          {
                            uploadingRecord ?
                            <div className="loading-mask">
                              <i className="icon-loadingdots spin"/>
                            </div>
                            :
                            localIds ?
                            <div className="col-xs-12">
                              <div className="form-group row">
                                <label htmlFor="nickname" className="col-xs-3 form-control-label">昵称</label>
                                <div className="col-xs-6">
                                  <input type="text" ref="nickname" className="form-control" id="nickname" placeholder="请输入英文名" />
                                </div>
                              </div>
                              <div className="row">
                                <div className="col-xs-6 col-xs-offset-3">
                                  <ErrorTip error={errors && errors.nickname} />
                                </div>
                              </div>
                              <ErrorTip error={errors && errors.server} />
                            </div>
                            :
                            <ScrollingView className="course-content" style={scrollStyle}>
                              <div className="reading-pronunciation">
                                <div dangerouslySetInnerHTML={{__html: lessonActivity.description}}></div>
                              </div>
                              {
                                lessonActivity.audio && active
                                ? <AudioPlayer audios={[lessonActivity.audio]} key={lessonActivity.audio}>
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
                                : ''
                              }
                            </ScrollingView>
                          }
                        </div>
                      }
                    </div>
                  );
                })}
              </Slider>
            </div>

            <div className="course-buttons">
              <div className="col-xs-4">
                {this.renderPrevArrow(courseNo, lessonNo, activityIndex)}
              </div>
              <div className="col-xs-4 text-xs-center no-padding-col">
                {
                  activityIndex + 1 === pronunciationLessonActivity.docs.length && activityLessonActivity.type === '打Boss' ?
                  <div>
                    {
                      localIds ?
                      <div>
                        <a className="action-button submit-button" onClick={e => this.submit({lessonActivityId:activityLessonActivity._id, localIds})}>
                          提交
                        </a>
                        <a className="action-button rework-button" onClick={e => this.rework(e)}>
                          重来
                        </a>
                      </div>
                      :
                      recording ?
                      <a className="action-button record-button recording" onClick={e => this.endRecord(e)}>
                        <i className="icon-mic" />
                      </a>
                      :
                      wxsdk.signature ?
                      <a className="action-button record-button" onClick={e => this.beginRecord(e)}>
                        <i className="icon-mic" />
                      </a>
                      :
                      wxsdk.errMsg ?
                      <div>
                        <p>
                          Boss没准备好，请重来一遍
                        </p>
                        <a className="bottom-nav-btn btn btn-primary-outline col-xs-12" onClick={this.props.fetchSignatureAsync}>
                          Boss快粗来
                        </a>
                      </div>
                      :
                      wxsdk.noWechat ?
                      <div className="small">
                        录音功能不支持在浏览器下使用, 请用微信
                      </div>
                      :
                      <div>
                        <h3>
                          <i className="icon-loadingdots spin"/>
                        </h3>
                        Boss正在准备中，请稍后
                      </div>
                    }
                  </div>
                  : ''
                }
                {this.renderNextArrow(courseNo, lessonNo, activityIndex)}
                <span className="submit-button hidden"></span>
                <span className="upload-button hidden"></span>
              </div>
              <div className="col-xs-4 text-xs-center">
                {
                  activityIndex + 2 === pronunciationLessonActivity.docs.length ?
                  <Link className="icon-boss side-btn pull-xs-right orange" to={`/home/pronunciation_courses/${courseNo}/lessons/${lessonNo}/${pronunciationLessonActivity.docs.length - 1}`} />
                  :
                  activityIndex === 0 ?
                  <Link className="icon-boss side-btn pull-xs-right" to={`/home/pronunciation_courses/${courseNo}/lessons/${lessonNo}/${pronunciationLessonActivity.docs.length - 1}`} />
                  :
                  ''
                }
              </div>
            </div>
          </div>
          :
          errors && errors.list ?
          <div className="text-danger text-xs-center">加载失败<i className="icon-cuowutishi text-bottom" /> <a onClick={()=>{location.reload()}}>重试</a></div>
          :
          <div className="text-muted text-xs-center">加载中，请稍候<i className="icon-loadingdots spin text-bottom" /></div>
        }

      </div>
    );
  }
}

export default connect(mapStateToProps, Object.assign(actions, wxsdkActions))(PronunciationLessonActivityView);
