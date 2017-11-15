import React from 'react';
import {Bar, Line} from 'react-chartjs-2';
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
      },
      simulations: [],          // n simulations documenting the closing price at the end of that simulation
      numberOfSimulations: 1000,
      simulationsData: [
        {
          bin: Number,
          normdist: Number,
          normalDistribution: Number
        }
      ],
      simulationAnalysis: {
        mean: Number,
        median: Number,
        stdev: Number,
        min: Number,
        max: Number,
        range: Number,
        percentiles: {
          cur: Number,
          sd1: {
            low: Number,
            high: Number
          },
          sd2: {
            low: Number,
            high: Number
          },
          sd3: {
            low: Number,
            high: Number
          },
        }
      },
      histogram: []
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
      //this.calculateFutureData();
      this.simulate(this.state.numberOfSimulations);
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    return nextProps.historicalData.length > 0 && this.props.timestamp !== nextProps.timestamp;
  }

  getChartData() {
    var futureDataLabels = [];
    for (var i = 0; i < 365; i++) {
      futureDataLabels[i] = i;
    }
    var histogramLabels = [];
    var normalDistributions = [];
    // cut the graph in half
    for (var j = 0; j < this.state.simulationsData.length / 2; j++) {
      if (!isNaN(this.state.simulationsData[j].bin))
        histogramLabels.push(this.state.simulationsData[j].bin.toFixed(3));
      else
        histogramLabels.push(this.state.simulationsData[j].bin);
      normalDistributions.push(this.state.simulationsData[j].normalDistribution);
    }
    var data = {
      futureData: {
        labels: futureDataLabels,
        datasets: [
          {
            label: "Future Data",
            fill: false,
            lineTension: 0.1,
            borderCapStyle: 'butt',
            borderDash: [],
            borderDashOffset: 0.0,
            borderJoinStyle: 'miter',
            pointBackgroundColor: '#fff',
            pointBorderWidth: 1,
            pointHoverRadius: 5,
            pointHoverBorderWidth: 2,
            pointRadius: 1,
            pointHitRadius: 10,
            data: []
          }
        ]
      },
      simulationsGraphData: {
        labels: histogramLabels,
        datasets: [
          {
            label: 'Normal Distribution',
            type:'line',
            data: normalDistributions,
            fill: false,
            borderColor: '#EC932F',
            backgroundColor: '#EC932F',
            pointBorderColor: '#EC932F',
            pointBackgroundColor: '#EC932F',
            pointHoverBackgroundColor: '#EC932F',
            pointHoverBorderColor: '#EC932F',
            pointBorderWidth: 1,
            pointHoverRadius: 5,
            pointHoverBorderWidth: 2,
            pointRadius: 1,
            pointHitRadius: 10,
          },
          {
            type: 'bar',
            label: 'Histogram',
            data: this.state.histogram,
            fill: false,
            backgroundColor: '#71B37C',
            borderColor: '#71B37C',
            hoverBackgroundColor: '#71B37C',
            hoverBorderColor: '#71B37C'
          }
        ]
      },
      test: {
        labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
        datasets: [
          {
            label: 'My First dataset',
            backgroundColor: 'rgba(255,99,132,0.2)',
            borderColor: 'rgba(255,99,132,1)',
            borderWidth: 1,
            hoverBackgroundColor: 'rgba(255,99,132,0.4)',
            hoverBorderColor: 'rgba(255,99,132,1)',
            data: [65, 59, 80, 81, 56, 55, 40]
          }
        ]
      }
    };
    data.futureData.datasets[0].data = this.state.futureData;
    //data.simulationsGraphData.datasets[0].data = normalDistributions;
    //data.simulationsGraphData.datasets[1].data = this.state.histogram;
    return data;
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

  calculateFutureData() {
    var futureData = [];
    for (var i = 0; i < 365; i++) {
      if (i === 0)
        futureData[i] = this.props.historicalData[0][this.close];
      else {
        let normdist = this.normsInv(Math.random(), 0, 1);
        let logReturn = this.state.summaryStatistics.meanDrift + this.state.summaryStatistics.dailyVolatility * normdist;
        futureData[i] = futureData[i - 1] * (Math.exp(logReturn));
      }
    }
    this.setState({futureData: futureData});
  }

  simulate(numSimulations) {
    let simulations = [];
    // using the formula to simulate a year
    // Close*EXP((annualDrift-0.5*annualVolatility^2)+annualVolatility*norminv(rand(),0,1))
    for (var i = 0; i < numSimulations; i++) {
      simulations.push( this.props.historicalData[0][this.close] * 
        Math.exp(
          (this.state.summaryStatistics.annualDrift - 0.5 * Math.pow(this.state.summaryStatistics.annualVolatility, 2)) + this.state.summaryStatistics.annualVolatility * StatisticalFunctions.normsInv(Math.random(), 0, 1)));
    }
    this.setState({simulations: simulations});
    console.log(simulations);
    var simulationAnalysis = this.state.simulationAnalysis;

    simulationAnalysis.mean = this.jStat.mean(simulations);
    simulationAnalysis.median = this.jStat.median(simulations);
    simulationAnalysis.stdev = this.jStat.stdev(simulations);
    simulationAnalysis.min = this.jStat.min(simulations);
    simulationAnalysis.max = this.jStat.max(simulations);
    simulationAnalysis.range = this.jStat.range(simulations);

    simulationAnalysis.percentiles.cur = this.jStat.percentile(simulations, 0.5);
    simulationAnalysis.percentiles.sd1.low = this.jStat.percentile(simulations, 0.159);
    simulationAnalysis.percentiles.sd1.high = this.jStat.percentile(simulations, 0.841);
    simulationAnalysis.percentiles.sd2.low = this.jStat.percentile(simulations, 0.05);
    simulationAnalysis.percentiles.sd2.high = this.jStat.percentile(simulations, 0.95);
    simulationAnalysis.percentiles.sd3.low = this.jStat.percentile(simulations, 0.01);
    simulationAnalysis.percentiles.sd3.high = this.jStat.percentile(simulations, 0.99);

    //this.setState({simulationsLogNormDist: this.jStat.lognormal()})
    var numBins = 200;
    var simulationsData = this.state.simulationsData;
    for (var j = 0; j < numBins; j++) {
      let bin = (j == 0) ? Math.floor(simulationAnalysis.min) : simulationsData[j - 1].bin + (simulationAnalysis.range / numBins);
      let normdist = this.jStat.normal.pdf(bin, simulationAnalysis.mean, simulationAnalysis.stdev)
      simulationsData[j] = {
        bin: bin,
        normdist: normdist,
        normalDistribution: (numSimulations * (simulationAnalysis.range / numBins)) * normdist
      };
    }

    // calculate histogram
    this.setState({histogram: this.jStat.histogram(this.state.simulations, numBins)});

    console.log(this.state.simulationAnalysis);

  }

  render() {
    if (this.props.historicalData.length === 0)
      return null;
    const data = this.getChartData();
    const options = {
      responsive: true,
      tooltips: {
        mode: 'label'
      },
      elements: {
        line: {
          fill: false
        }
      },
      scales: {
        xAxes: [
          {
            display: true,
            gridLines: {
              display: false
            }
          }
        ],
        yAxes: [
          {
            type: 'linear',
            display: true,
            position: 'left',
            gridLines: {
              display: false
            }
          },
          {
            type: 'linear',
            display: true,
            position: 'right',
            gridLines: {
              display: false
            }
          }
        ]
      }
    };
    console.log(this.props.historicalData);
    return (
      <div>
        <div className="row">
          <div className="col-md-4 offset-md-1">
            <h3>One Year Simulation</h3>
          </div>
          <div className="col-md-6">
            <Simulation historicalData={this.props.historicalData} summaryStatistics={this.state.summaryStatistics}/>
          </div>
        </div>
        <Simulations historicalData={this.props.historicalData} summaryStatistics={this.state.summaryStatistics} />
      </div>
    );
  }
}