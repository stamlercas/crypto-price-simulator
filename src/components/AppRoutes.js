import React from 'react';
import { Link, BrowserRouter } from 'react-router-dom';
import routes from '../routes';

export default class AppRoutes extends React.Component {
  render() {
    return (
	      	<BrowserRouter>
	      		<div>
		      		<header>
			          <Link to="/">
			            <img className="logo" src="/img/logo-judo-heroes.png"/>
			          </Link>
			        </header>
		      		{routes}
		      		<footer>
			          <p>
			            This is a demo app to showcase universal rendering and routing with <strong>React</strong> and <strong>Express</strong>.
			          </p>
		        	</footer>
	        	</div>
	      	</BrowserRouter>
    );
  }
}