import React from 'react';
import {Bar, Line} from 'react-chartjs-2';

export default class Analysis extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      historicalData: [],
      futureData: [],           // simulation over one year documenting the closing price of every day
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
      this.calculateFutureData();
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
            data: [],
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
            data: [],
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
    data.simulationsGraphData.datasets[0].data = normalDistributions;
    data.simulationsGraphData.datasets[1].data = this.state.histogram;
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
    summaryStatistics.dailyVolatility = this.standardDeviation(returns);

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
          (this.state.summaryStatistics.annualDrift - 0.5 * Math.pow(this.state.summaryStatistics.annualVolatility, 2)) + this.state.summaryStatistics.annualVolatility * this.normsInv(Math.random(), 0, 1)));
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

  standardDeviation(values){
    var avg = this.average(values);
    
    var squareDiffs = values.map(function(value) {
      var diff = value - avg;
      var sqrDiff = diff * diff;
      return sqrDiff;
    });
    
    var avgSquareDiff = this.average(squareDiffs);

    var stdDev = Math.sqrt(avgSquareDiff);
    return stdDev;
  }

  average(data){
    var sum = data.reduce(function(sum, value){
      return sum + value;
    }, 0);

    var avg = sum / data.length;
    return avg;
  }

  // https://gist.github.com/kmpm/1211922
  normsInv(p, mu, sigma)
  {
      if (p < 0 || p > 1)
      {
          throw "The probality p must be bigger than 0 and smaller than 1";
      }
      if (sigma < 0)
      {
          throw "The standard deviation sigma must be positive";
      }

      if (p == 0)
      {
          return -Infinity;
      }
      if (p == 1)
      {
          return Infinity;
      }
      if (sigma == 0)
      {
          return mu;
      }

      var q, r, val;

      q = p - 0.5;

      /*-- use AS 241 --- */
      /* double ppnd16_(double *p, long *ifault)*/
      /*      ALGORITHM AS241  APPL. STATIST. (1988) VOL. 37, NO. 3
              Produces the normal deviate Z corresponding to a given lower
              tail area of P; Z is accurate to about 1 part in 10**16.
      */
      if (Math.abs(q) <= .425)
      {/* 0.075 <= p <= 0.925 */
          r = .180625 - q * q;
          val =
                 q * (((((((r * 2509.0809287301226727 +
                            33430.575583588128105) * r + 67265.770927008700853) * r +
                          45921.953931549871457) * r + 13731.693765509461125) * r +
                        1971.5909503065514427) * r + 133.14166789178437745) * r +
                      3.387132872796366608)
                 / (((((((r * 5226.495278852854561 +
                          28729.085735721942674) * r + 39307.89580009271061) * r +
                        21213.794301586595867) * r + 5394.1960214247511077) * r +
                      687.1870074920579083) * r + 42.313330701600911252) * r + 1);
      }
      else
      { /* closer than 0.075 from {0,1} boundary */

          /* r = min(p, 1-p) < 0.075 */
          if (q > 0)
              r = 1 - p;
          else
              r = p;

          r = Math.sqrt(-Math.log(r));
          /* r = sqrt(-log(r))  <==>  min(p, 1-p) = exp( - r^2 ) */

          if (r <= 5)
          { /* <==> min(p,1-p) >= exp(-25) ~= 1.3888e-11 */
              r += -1.6;
              val = (((((((r * 7.7454501427834140764e-4 +
                         .0227238449892691845833) * r + .24178072517745061177) *
                       r + 1.27045825245236838258) * r +
                      3.64784832476320460504) * r + 5.7694972214606914055) *
                    r + 4.6303378461565452959) * r +
                   1.42343711074968357734)
                  / (((((((r *
                           1.05075007164441684324e-9 + 5.475938084995344946e-4) *
                          r + .0151986665636164571966) * r +
                         .14810397642748007459) * r + .68976733498510000455) *
                       r + 1.6763848301838038494) * r +
                      2.05319162663775882187) * r + 1);
          }
          else
          { /* very close to  0 or 1 */
              r += -5;
              val = (((((((r * 2.01033439929228813265e-7 +
                         2.71155556874348757815e-5) * r +
                        .0012426609473880784386) * r + .026532189526576123093) *
                      r + .29656057182850489123) * r +
                     1.7848265399172913358) * r + 5.4637849111641143699) *
                   r + 6.6579046435011037772)
                  / (((((((r *
                           2.04426310338993978564e-15 + 1.4215117583164458887e-7) *
                          r + 1.8463183175100546818e-5) * r +
                         7.868691311456132591e-4) * r + .0148753612908506148525)
                       * r + .13692988092273580531) * r +
                      .59983220655588793769) * r + 1);
          }

          if (q < 0.0)
          {
              val = -val;
          }
      }

      return mu + sigma * val;
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
    return (
      <div>
        <div className="row">
          <div className="col-md-8 offset-md-2">
            <Line data={data.futureData} />
          </div>
        </div>
        <br />
        <h3>{this.state.numberOfSimulations} Simulations</h3>
        <div className="row">
          <div className="col-md-8 offset-md-2">
            <Bar data={data.simulationsGraphData} options={options}/>
          </div>
        </div>
        <div className="row">
            <div className="col-sm-4 text-center alert-danger">
              3sd
              <br />
              <strong>{this.state.simulationAnalysis.percentiles.sd3.low}</strong>
            </div>
            <div className="col-sm-4 text-center alert-warning">
                2sd
                <br />
                <strong>{this.state.simulationAnalysis.percentiles.sd2.low}</strong>
            </div>
            <div className="col-sm-4 text-center alert-success">
                1sd
                <br />
                <strong>{this.state.simulationAnalysis.percentiles.sd1.low}</strong>
            </div>
          </div>
          <div className="row">
            <div className="offset-md-3 col-sm-6 text-center alert">
                Current
                <br />
                <strong>{this.state.simulationAnalysis.percentiles.cur}</strong>
            </div>
          </div>
          <div className="row">
            <div className=" col-sm-4 text-center alert-success">
                1sd
                <br />
                <strong>{this.state.simulationAnalysis.percentiles.sd1.high}</strong>
            </div>
            <div className="col-sm-4 text-center alert-warning">
                2sd
                <br />
                <strong>{this.state.simulationAnalysis.percentiles.sd2.high}</strong>
            </div>
            <div className="col-sm-4 text-center alert-danger">
                3sd
                <br />
                <strong>{this.state.simulationAnalysis.percentiles.sd3.high}</strong>
            </div>
          </div>
      </div>
    );
  }
}