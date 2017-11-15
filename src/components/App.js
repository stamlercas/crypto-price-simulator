import React from 'react'
import { Route, Switch } from 'react-router-dom';
import Layout from './Layout';
import IndexPage from './IndexPage';
import AboutPage from './AboutPage';
import NotFoundPage from './NotFoundPage';

export const App = () => (
  <Layout>
    <Switch>
      <Route exact path="/" component={IndexPage}/>
      <Route exact path="/about" component={AboutPage}/>
      <Route component={NotFoundPage}/>
    </Switch>
  </Layout>
);

export default App;