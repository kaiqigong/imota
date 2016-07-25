import React from 'react';
import Avatar from './Avatar2';
import Dropdown from './Dropdown';

export default (props) => {
  return <div {...props} >
    { props.auth && props.auth._id &&
      <Dropdown className="avatar-link" dropdownToggle={<Avatar className="avatar-img" image={props.auth.avatar || '/img/default_avatar.png'} />}>
        <a href="/account/me/">个人信息</a>
        <a href="/account/logout/">登出</a>
      </Dropdown>
    }
  </div>
};
