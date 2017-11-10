import React from 'react';
import { Link, BrowserRouter } from 'react-router-dom';
import routes from '../routes';

export default class AppRoutes extends React.Component {
  render() {
    return (
	      	<BrowserRouter>
	      		<div className="container-fluid">
		      		<header>
			          <Link to="/">
			            <img className="logo" src="/img/logo-judo-heroes.png"/>
			          </Link>
			        </header>
		      		{routes}
		      		<footer>
			          <p>
			            This is a risk analysis application that uses geometric Brownian motion to forecast future cryptocurrency prices.
			          </p>
		        	</footer>
	        	</div>
	      	</BrowserRouter>
    );
  }
}