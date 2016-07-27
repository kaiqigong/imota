import React, { Component, PropTypes } from 'react';
import setTitle from '../common/setTitle';
import { connect } from 'react-redux';
import {actions as authActions} from '../redux/auth';
import TopBar from '../components/TopBar';
import CategoryList from '../components/CategoryList';
import PostList from '../components/PostList';
import PostEditor from '../components/PostEditor';

const mapStateToProps = (state) => ({
  ...state,
});

class ImotaView extends Component {
  static propTypes = {
    fetchMeAsync: PropTypes.func,
    auth: PropTypes.object,
    params: PropTypes.object,
  };

  constructor(props) {
    super();
    props.fetchMeAsync();
    setTitle('Imota');
  }

  render() {
    const { auth } = this.props;
    return (
      <div>
        <TopBar auth={auth} className="top-bar" />
        <CategoryList className="category-list" />
        <PostList params={this.props.params} className="post-list" />
        <PostEditor params={this.props.params} className="post-editor" />
      </div>
    );
  }
}

export default connect(mapStateToProps, authActions)(ImotaView);
