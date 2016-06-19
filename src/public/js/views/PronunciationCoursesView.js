import React, {Component, PropTypes} from 'react';
import { connect } from 'react-redux';
import PronunciationCourseList from '../components/PronunciationCourseList';
import {actions} from '../redux/pronunciationCourses';
import {Link} from 'react-router';
import setTitle from '../common/setTitle';

const mapStateToProps = ({pronunciationCourses}) => ({
  pronunciationCourses,
});

class PronunciationCoursesView extends Component {

  static propTypes = {
    pronunciationCourses: PropTypes.object.isRequired,
    fetchPronunciationCoursesAsync: PropTypes.func.isRequired,
    location: PropTypes.object,
    fetchMorePronunciationCoursesAsync: PropTypes.func,
  };

  constructor(props) {
    super();
    props.fetchPronunciationCoursesAsync();
  }

  render() {
    setTitle( '发音训练-Wind教口语');
    return (
      <div>
        <nav className="navbar">
          <ul className="nav navbar-nav">
            <li className="nav-item">
              <Link className="nav-link" to={`/`}>
                <i className="icon-left" />
              </Link>
            </li>
          </ul>
        </nav>
        <h2 className="text-xs-center">发音语调训练</h2>
        <p className="text-xs-center subtitle">Pronunciation and Intonation</p>
        {
          this.props.pronunciationCourses.total ?
          <PronunciationCourseList
            loadMore={(page) => this.props.fetchMorePronunciationCoursesAsync(page)}
            courses={this.props.pronunciationCourses} />
          :
          this.props.pronunciationCourses.errors ?
          <div className="text-danger text-xs-center">加载失败<i className="icon-cuowutishi text-bottom" /> <a onClick={()=>{location.reload()}}>重试</a></div>
          :
          <div className="text-muted text-xs-center">加载中，请稍候<i className="icon-loadingdots spin text-bottom"/></div>
        }
      </div>
    );
  }
}

export default connect(mapStateToProps, actions)(PronunciationCoursesView);
