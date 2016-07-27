import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import {actions} from '../redux/editor';
import {Editor, EditorState, ContentState} from 'draft-js';
import throttle from 'lodash/throttle';

const mapStateToProps = ({posts, currentPost, currentCategory, editor}) => ({
  posts, currentPost, currentCategory, editor,
});

class PostEditor extends Component {
  static propTypes = {
    params: PropTypes.object,
    fetchSinglePostAsync: PropTypes.func,
    editor: PropTypes.object,
    updatePostAsync: PropTypes.func,
  };

  constructor(props) {
    super();
    if (props.params && props.params.postId) {
      props.fetchSinglePostAsync(props.params.postId);
    }

    this.state = {editorState: EditorState.createEmpty()};
    const throttled = throttle(() => {
      this.props.updatePostAsync(this.props.editor.post._id, this.state.editorState.getCurrentContent().getPlainText());
    }, 3000);
    this.onChange = (editorState) => {
      this.setState({editorState});
      // throttle to call save
      throttled();
    };
  }

  componentWillUpdate(nextProps) {
    const currentPostId = this.props.params && this.props.params.postId;
    const nextPostId = nextProps.params && nextProps.params.postId;
    if (nextPostId && nextPostId !== currentPostId) {
      this.props.fetchSinglePostAsync(nextPostId);
    }
    if (nextProps.editor.post._id && (nextProps.editor.post._id !== this.props.editor.post._id)) {
      if (nextProps.editor.post.content) {
        this.setState({
          editorState: EditorState.createWithContent(ContentState.createFromText(nextProps.editor.post.content)),
        });
      } else {
        this.setState({
          editorState: EditorState.createEmpty(),
        });
      }
    }
  }

  render() {
    const { editor } = this.props;
    const { post } = editor;

    if (!post) {
      return (<div>
        请选择备忘录
      </div>);
    }
    return (<div {...this.props}>
      <Editor editorState={this.state.editorState} onChange={this.onChange} />
    </div>);
  }
}

export default connect(mapStateToProps, actions)(PostEditor);
