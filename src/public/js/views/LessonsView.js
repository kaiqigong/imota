import React, {Component, PropTypes} from 'react';
import { connect } from 'react-redux';
import LessonList from '../components/LessonList';
import {actions} from '../redux/lessons';
import {Link} from 'react-router';
import setTitle from '../common/setTitle';

const mapStateToProps = ({lessons}) => ({
  lessons,
});

class LessonsView extends Component {
  static propTypes = {
    lessons: PropTypes.object.isRequired,
    fetchLessonsAsync: PropTypes.func.isRequired,
    fetchMoreLessonsAsync: PropTypes.func.isRequired,
    lessonsInit: PropTypes.func.isRequired,
    params: PropTypes.object,
    location: PropTypes.object,
  };

  constructor(props) {
    super();
    props.lessonsInit();
    const {query} = props.location;
    const otherQuery = query.type === 'listen' ? {hasListen: true} : {hasTranslate: true};
    props.fetchLessonsAsync(props.params.courseNo, otherQuery);
  }

  componentWillUpdate(nextProps) {
    if (+nextProps.params.courseNo !== +this.props.params.courseNo) {
      const {query} = nextProps.location;
      const otherQuery = query.type === 'listen' ? {hasListen: true} : {hasTranslate: true};
      this.props.fetchLessonsAsync(nextProps.params.courseNo, otherQuery);
    }
  }

  render() {
    const {course, errors} = this.props.lessons;
    const {query} = this.props.location;
    const type = query.type;
    const otherQuery = type === 'listen' ? {hasListen: true} : {hasTranslate: true};
    if (course) {
      setTitle(course.chineseTitle + ' ' + (type === 'listen' ? '听力训练' : '口语训练'));
    }
    const courseNo = this.props.params.courseNo;
    return (
      <div>
        <nav className="navbar">
          <ul className="nav navbar-nav">
            <li className="nav-item">
              <Link className="nav-link" to={`/home/courses/?type=${type}`}>
                <i className="icon-left" />
              </Link>
            </li>
          </ul>
        </nav>
        {
          course && course._id ?
          <div>
            <h2 className="text-xs-center">{course.chineseTitle}</h2>
            <p className="text-xs-center subtitle">{course.englishTitle}</p>
            <LessonList lessons={this.props.lessons} type={type} loadMore={(page) => this.props.fetchMoreLessonsAsync(page, courseNo, otherQuery)} />
          </div>
          :
          errors ?
          <div className="text-danger text-xs-center">加载失败<i className="icon-cuowutishi text-bottom" /> <a onClick={()=>{location.reload()}}>重试</a></div>
          :
          <div className="text-muted text-xs-center">加载中，请稍候<i className="icon-loadingdots spin text-bottom" /></div>
        }
      </div>
    );
  }
}

export default connect(mapStateToProps, actions)(LessonsView);
