import React from 'react';
import {defaults} from 'react-chartjs-2';
import Simulation from './Simulation';
import Simulations from './Simulations';
import StatisticalFunctions from '../lib/StatisticalFunctions';

export default class Analysis extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      summaryStatistics: {
        close: Number,
        dailyVolatility: Number,
        annualVolatility: Number,
        dailyDrift: Number,
        annualDrift: Number,
        meanDrift: Number
      }
    };
    this.utc = 0;
    this.open = 1;
    this.high = 2;
    this.low = 3;
    this.close = 4;
    this.volume = 5;

    this.jStat = require('jStat').jStat;
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.historicalData.length > 0 && this.props.timestamp !== nextProps.timestamp) {
      this.calculateSummaryStatistics();
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    return nextProps.historicalData.length > 0 && this.props.timestamp !== nextProps.timestamp;
  }

  calculateSummaryStatistics() {
    // return flat array
    const utc = 0;
    const open = 1;
    const high = 2;
    const low = 3;
    const close = 4;
    const volume = 5;

    var historicalData = JSON.parse(JSON.stringify(this.props.historicalData));
    console.log(historicalData);

    historicalData.forEach(function(candle) {
      // first push onto the array the returns, (close divided by open)
      candle.push( Math.log(candle[close] / candle[open]) );
    });
    //this.setState({candlestickChart: res});

    // next, calculate summary statistics
    // close is the most recent close
    var summaryStatistics = this.state.summaryStatistics;
    summaryStatistics.close = historicalData[0][this.close];

    // dailyVolatility is the standard deviation of all the returns
    var returns = [];
    for (var i = 0; i < historicalData.length; i++) {
      returns[i] = historicalData[i][6];
    }
    summaryStatistics.dailyVolatility = StatisticalFunctions.standardDeviation(returns);

    // annualVolatility is the dailyVolatility multiplied by the square root of 365 (since we're simulating a year)
    // TODO: make time of sim variable
    summaryStatistics.annualVolatility = summaryStatistics.dailyVolatility * Math.sqrt(365);

    // dailyDrift is the average of the returns divided by 2
    summaryStatistics.dailyDrift = (returns.reduce((sum, value) => sum + value, 1) / returns.length) / 2.0;

    // annualDrift is the daily drift multiplied by 365
    summaryStatistics.annualDrift = summaryStatistics.dailyDrift * 365;

    // meanDrift = dailyDrift - 0.5 * dailyVolatility ^ 2
    summaryStatistics.meanDrift = summaryStatistics.dailyDrift - 0.5 * Math.pow(summaryStatistics.dailyVolatility, 2);

    this.setState({summaryStatistics: summaryStatistics});
  }

  render() {
    if (this.props.historicalData.length === 0)
      return null;
    defaults.global.defaultFontColor="#cad6e6";
    console.log(this.props.historicalData);
    return (
      <section className="container graph-container">
        <div className="row market-info">
          <div className="col-6 col-sm-4 text-center">
            <h3>{this.props.market.symbol}</h3>
            Market
          </div>
          <div className="col-6 col-sm-4 text-center">
            <h3>{this.props.historicalData[0][this.close].toPrecision(8)} {this.props.market.quote}</h3>
            Current Price
          </div>
          <div className="col-6 col-sm-4 text-center">
            <h3>{this.props.historicalData.length}</h3>
            day{(this.props.historicalData.length === 1) ? '' : 's'} of data
          </div>
        </div>
        <Simulation historicalData={this.props.historicalData} summaryStatistics={this.state.summaryStatistics}/>
        <Simulations historicalData={this.props.historicalData} summaryStatistics={this.state.summaryStatistics} />
      </section>
    );
  }
}