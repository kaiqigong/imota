import React, {Component} from 'react';
import {Link} from 'react-router';
import setTitle from '../common/setTitle';
import { connect } from 'react-redux';
import {actions as authActions} from '../redux/auth';
import TopBar from '../components/TopBar';
import CategoryList from '../components/CategoryList';
import PostList from '../components/PostList';

const mapStateToProps = (state) => ({
  ...state,
});

class ImotaView extends Component {
  static propTypes = {
  };

  constructor(props) {
    super();
    props.fetchMeAsync();
    setTitle('Imota');
  }

  render() {
    const { auth, categories } = this.props;
    return (
      <div>
        <TopBar auth={auth} className="top-bar" />
        <CategoryList />
        <PostList params={this.props.params} />
      </div>
    );
  }
}

export default connect(mapStateToProps, authActions)(ImotaView);
