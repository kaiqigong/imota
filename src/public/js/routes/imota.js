import React from 'react';
import { Route, IndexRoute, Redirect } from 'react-router';
import CoreLayout from '../views/CoreLayout';
import ImotaView from '../views/ImotaView';

export default (
  <Route path="/" component={CoreLayout}>
    <IndexRoute component={ImotaView} />
    <Route path="categories/:categoryId" component={ImotaView} />
    <Route path="categories/:categoryId/posts/:postId" component={ImotaView} />
    <Redirect from="*" to="/" />
  </Route>
);
