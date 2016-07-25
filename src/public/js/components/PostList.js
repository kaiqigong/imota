import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import reactInfiniteScroll from 'react-infinite-scroll';
import {actions} from '../redux/posts';
import {actions as currentPostActions} from '../redux/currentPost';
import { ContextMenu, MenuItem, ContextMenuLayer } from "react-contextmenu";
import PostContextMenu from './PostContextMenu';
import { Link } from 'react-router';

const InfiniteScroll = reactInfiniteScroll(React);

const mapStateToProps = ({posts, currentPost, currentCategory}) => ({
  posts, currentPost, currentCategory,
});

//Component on which context-menu must be triggred
const PostItem = ContextMenuLayer("post_context_menu", (props) => {
  return {post: props.post};
})(({post, onClick}) =>
  <div onClick={onClick}>{ post.name }</div>
);

class PostList extends Component {

  constructor(props) {
    super();
    props.fetchPostsAsync();
  }

  render() {
    const {posts, currentCategory, currentPost} = this.props;
    const { docs, total } = posts;
    const hasMore = docs.length < total;
    return <div {...this.props}>
      <div>
        备忘录
      </div>
      <InfiniteScroll
        pageStart={1}
        loadMore={this.props.fetchMorePostsAsync}
        hasMore={hasMore}
        loader={<div className="loader">
          <i className="icon-loadingdots spin" />
        </div>}>
        {docs.map((post) => {
          return (
            <Link to={`/categories/${(currentCategory && currentCategory._id) || '-'}/posts/${post._id}`} onClick={() => this.props.setCurrentPost(post)} key={post._id}>
              <PostItem post={post} />
            </Link>
          );
        })}
      </InfiniteScroll>
      <PostContextMenu current={currentPost} />
      <div>
        <a onClick={this.props.createPostAsync}>
          新建备忘录
        </a>
      </div>
    </div>;
  }
}

export default connect(mapStateToProps, {...actions, ...currentPostActions})(PostList);
