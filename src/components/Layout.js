import React from 'react';
import { Link } from 'react-router-dom';

export const Layout = props => (
  <div>
    <header>
    </header>
    <div>{props.children}</div>
    <footer className="footer text-center text-white">
    <div className="container">
        <span style={{fontSize: 'small'}}>A risk analysis application that uses geometric Brownian motion to forecast future cryptocurrency prices.</span>
        <div>
          <Link to="/">Home</Link> | <Link to="/about">About</Link>
        </div>
      </div>
    </footer>
  </div>
);

export default Layout;