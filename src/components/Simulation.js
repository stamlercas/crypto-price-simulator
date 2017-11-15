import React from 'react';
import {Bar, Line} from 'react-chartjs-2';
import StatisticalFunctions from '../lib/StatisticalFunctions';

// produces a single simulation over a set amount of time (ex: one year)
export default class Simulation extends React.Component {
  constructor(props) {
    super(props);
    this.utc = 0;
    this.open = 1;
    this.high = 2;
    this.low = 3;
    this.close = 4;
    this.volume = 5;
  }

  simulate() {
    var futureData = [];
    for (var i = 0; i < 365; i++) {
      if (i === 0)
        futureData[i] = this.props.historicalData[0][this.close];
      else {
        let normdist = StatisticalFunctions.normsInv(Math.random(), 0, 1);
        let logReturn = this.props.summaryStatistics.meanDrift + this.props.summaryStatistics.dailyVolatility * normdist;
        futureData[i] = futureData[i - 1] * (Math.exp(logReturn));
      }
    }
    return futureData;
  }

  getChartData() {
    var labels = [];
    for (var i = 0; i < 365; i++) {
      labels[i] = i;
    }
    var data = {
      labels: labels,
      datasets: [
        {
          label: "Future Data",
          fill: false,
          lineTension: 0.1,
          borderCapStyle: 'butt',
          borderDash: [],
          borderDashOffset: 0.0,
          borderJoinStyle: 'miter',
          pointBorderWidth: 1,
          pointHoverRadius: 5,
          pointHoverBorderWidth: 2,
          pointRadius: 1,
          pointHitRadius: 10,
          borderColor: '#00A7E1',
          backgroundColor: '#00A7E1',
          pointBorderColor: '#00A7E1',
          pointBackgroundColor: '#00A7E1',
          pointHoverBackgroundColor: '#00A7E1',
          pointHoverBorderColor: '#00A7E1',
          data: []
        }
      ]
    };
    data.datasets[0].data = this.simulate();
    //data.simulationsGraphData.datasets[0].data = normalDistributions;
    //data.simulationsGraphData.datasets[1].data = this.state.histogram;
    return data;
  }

  render() {
    var data = this.getChartData();
    return (
      <div>
        <Line data={data} />
      </div>
    );
  }
}