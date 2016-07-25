import React, {Component} from 'react';
import {Link} from 'react-router';
import setTitle from '../common/setTitle';
import PronunciationModal from '../components/PronunciationModal';
import { connect } from 'react-redux';
import {actions as authActions} from '../redux/auth';
import Avatar from '../components/Avatar2';
import Dropdown from '../components/Dropdown';

const mapStateToProps = ({auth}) => ({
  auth,
});

class SkillsView extends Component {
  static propTypes = {
  };

  constructor(props) {
    super();
    props.fetchMeAsync();
  }

  render() {
    setTitle('Imota');
    const auth = this.props.auth;
    return (
      <div className="skill-list">
        {
          auth && auth.nickname &&
          <Dropdown className="avatar-link" dropdownToggle={<Avatar className="avatar-img" image={auth.avatar || '/img/default_avatar.png'} />}>
            <a href="/account/me/">个人信息</a>
            <Link to="/home/learning_histories/">学习轨迹</Link>
          </Dropdown>
        }
        <h2 className="text-xs-center slogan">Imota</h2>
        <Link className="text-xs-center skill-link pronunciation-item" to="/home/pronunciation_courses/">
          <img src="/img/skill_1.png" alt="发音语调训练" />
        </Link>
        <Link className="text-xs-center skill-link listen-item" to="/home/courses/?type=listen">
          <img src="/img/skill_2.png" alt="听力训练" />
        </Link>
        <Link className="text-xs-center skill-link translate-item" to="/home/courses/?type=translate">
          <img src="/img/skill_3.png" alt="口语训练" />
        </Link>
      </div>
    );
  }
}

export default connect(mapStateToProps, authActions)(SkillsView);
