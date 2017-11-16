import React from 'react';
import { Link } from 'react-router-dom';

export const Layout = props => (
  <div>
    <header>
      <nav className="navbar navbar-expand-lg">
        <Link className="navbar-brand" to="/">CryptoCurrency Simulator</Link>

        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          <ul className="navbar-nav mr-auto">
            <li className="nav-item active">
              <Link className="nav-link" to="/">Home</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/about">About</Link>
            </li>
          </ul>
        </div>
      </nav>
    </header>
    <div className="app-container container-fluid">{props.children}</div>
    <footer className="footer text-center text-white">
    <div className="container">
        <span>A risk analysis application that uses geometric Brownian motion to forecast future cryptocurrency prices.</span>
        <div>
          <Link to="/">Home</Link> | <Link to="/about">About</Link>
        </div>
      </div>
    </footer>
  </div>
);

export default Layout;