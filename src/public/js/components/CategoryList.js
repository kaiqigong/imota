import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import reactInfiniteScroll from 'react-infinite-scroll';
import {actions} from '../redux/categories';
import {actions as currentCategoryActions} from '../redux/currentCategory';
import { ContextMenu, MenuItem, ContextMenuLayer } from "react-contextmenu";
import CategoryContextMenu from './CategoryContextMenu';
import { Link } from 'react-router';

const InfiniteScroll = reactInfiniteScroll(React);

const mapStateToProps = ({categories, currentCategory}) => ({
  categories, currentCategory
});

//Component on which context-menu must be triggred
const CategoryItem = ContextMenuLayer("category_context_menu", (props) => {
  return {category: props.category};
})(({category, onClick}) =>
  <div onClick={onClick}>{ category.name }</div>
);

class CategoryList extends Component {

  constructor(props) {
    super();
    props.fetchCategoriesAsync();
  }

  render() {
    const {categories} = this.props;
    const { docs, total } = categories;
    const hasMore = docs.length < total;
    return <div {...this.props}>
      <div>
        文件夹
      </div>
      <InfiniteScroll
        pageStart={1}
        loadMore={this.props.fetchMoreCategoriesAsync}
        hasMore={hasMore}
        loader={<div className="loader">
          <i className="icon-loadingdots spin" />
        </div>}>
        {docs.map((category) => {
          return (
            <Link to={`/categories/${category._id}`} onClick={() => this.props.setCurrentCategory(category)} key={category._id}>
              <CategoryItem category={category} />
            </Link>
          );
        })}
      </InfiniteScroll>
      <CategoryContextMenu current={this.props.currentCategory} />
      <div>
        <a onClick={this.props.createCategoryAsync}>
          新建文件夹
        </a>
      </div>
    </div>;
  }
}

export default connect(mapStateToProps, {...actions, ...currentCategoryActions})(CategoryList);
