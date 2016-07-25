import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import {actions} from '../redux/posts';
import { ContextMenu, MenuItem, ContextMenuLayer, connect as contextConnect } from "react-contextmenu";

class PostContextMenu extends Component {

  render() {
    return (
    <ContextMenu identifier="post_context_menu">
      <MenuItem data={{action: 'create'}} onClick={(e, data) => this.handleClick(e, data)}>
        新建备忘录
      </MenuItem>
      <MenuItem data={{action: 'rename'}} onClick={(e, data) => this.handleClick(e, data)}>
        给备忘录重命名
      </MenuItem>
      <MenuItem data={{action: 'delete'}} onClick={(e, data) => this.handleClick(e, data)}>
        删除备忘录
      </MenuItem>
    </ContextMenu>);
  }

  handleClick(e, data) {
    switch (true) {
    case data.action === 'delete':
      this.props.removePostAsync(data.post);
      break;
    case data.action === 'create':
      this.props.createPostAsync();
      break;
    case data.action === 'rename':
    default:
      break;
    }
  }

}

export default contextConnect(connect((state) => ({...state}), actions)(PostContextMenu));
