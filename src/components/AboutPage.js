import React from 'react';
import { Link } from 'react-router-dom';

export default class NotFoundPage extends React.Component {
  render() {
    return (
      <div className="container" style={{paddingTop: '30px'}}>
        <div>
          <h1>Running simulations can prepare us for the worst.</h1>
          <div>
            The process for running this simulation is: 
            <ul>
              <li>Specify a model (for here, we will use geometric Brownian motion)</li>
              <li>Get historical daily bitcoin prices</li>
              <li>Calculate daily returns</li>
              <li>Name the daily return range</li>
              <li>Summary statistics</li>
              <li>Simulate a year</li>
              <li>Simulate a year many times</li>
              <li>Multi-year summary statistics</li>
              <li>Quick analysis of results</li>
            </ul>
          </div>
        </div>
        <div>
          <h3>What is geometric brownian motion?</h3>
          <p>
            The geometric Brownian motion (GBM) is a <strong>statistical method that is used heavily in the forecasting of stock prices.</strong> The reason the process is so attractive for this is because of the following:
          </p>
          <ul className="list-unstyled">
            <li>The change in price over one period of time is unrelated to the change in price over a disjoint period of time.</li>
            <li>The change in log(price) over any period of time is normally distributed with a distribution depending only on the length of the period.</li>
            <li>Samples of the distribution are continuous, with probability 100%.</li>
          </ul>
          <p>The geometric Brownian motion is a random process whose future probabilities are determined by its most recent values, otherwise known as a <strong>Markov process.</strong> Past price 
            information is already incorporated and the next price movement is <strong>conditionally independent</strong> of past price movements.
          </p>
          <p>The formula for geometric Brownian Motion: </p>
          <div className="text-center">
            <img className="img-fluid" src={'https://cdn-images-1.medium.com/max/800/0*tUnBZ2kUiDtZoANe.png'} />
          </div>
        </div>
      </div>
    );
  }
}