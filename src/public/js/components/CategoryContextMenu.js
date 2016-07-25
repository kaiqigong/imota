import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import {actions} from '../redux/categories';
import { ContextMenu, MenuItem, ContextMenuLayer, connect as contextConnect } from "react-contextmenu";

class CategoryContextMenu extends Component {

  render() {
    return (
    <ContextMenu identifier="category_context_menu">
      <MenuItem data={{action: 'create'}} onClick={(e, data) => this.handleClick(e, data)}>
        新建文件夹
      </MenuItem>
      <MenuItem data={{action: 'rename'}} onClick={(e, data) => this.handleClick(e, data)}>
        给文件夹重命名
      </MenuItem>
      <hr />
      <MenuItem data={{action: 'delete'}} onClick={(e, data) => this.handleClick(e, data)}>
        删除文件夹
      </MenuItem>
    </ContextMenu>);
  }

  handleClick(e, data) {
    switch (true) {
    case data.action === 'delete':
      this.props.removeCategoryAsync(data.category);
      break;
    case data.action === 'create':
      this.props.createCategoryAsync();
      break;
    case data.action === 'rename':
    default:
      break;
    }
  }

}

export default contextConnect(connect((state) => ({...state}), actions)(CategoryContextMenu));
