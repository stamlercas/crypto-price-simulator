import React from 'react';
import { Link } from 'react-router-dom';

export default class NotFoundPage extends React.Component {
  render() {
    return (
      <div>
        <div className="container">
          <h1>How Does It Work?</h1>
        </div>
        <p>
          <Link to="/">Go back to the main page</Link>
        </p>
      </div>
    );
  }
}