import React from 'react';
import { Link } from 'react-router-dom';

export const Layout = props => (
  <div>
    <header>
      <nav className="navbar navbar-expand-lg navbar-light bg-light">
        <a className="navbar-brand" href="#">CryptoCurrency Simulator</a>
        <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          <ul className="navbar-nav mr-auto">
            <li className="nav-item active">
              <Link className="nav-link" to="#">Home</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="#">About</Link>
            </li>
          </ul>
        </div>
      </nav>
    </header>
    <div className="container-fluid">{props.children}</div>
    <footer className="footer text-center">
    <div className="container">
        <span className="text-muted">A risk analysis application that uses geometric Brownian motion to forecast future cryptocurrency prices.</span>
      </div>
    </footer>
  </div>
);

export default Layout;