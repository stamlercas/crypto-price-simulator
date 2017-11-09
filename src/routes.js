import React from 'react'
import { Route } from 'react-router-dom';
import IndexPage from './components/IndexPage';
import NotFoundPage from './components/NotFoundPage';

const routes = (
	<div>
  		<Route path="/" component={IndexPage}/>
  	</div>
);

export default routes;