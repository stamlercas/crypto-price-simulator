import React from 'react';
import Analysis from './Analysis';
import {Line} from 'react-chartjs-2';

export default class IndexPage extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			exchanges: [],
			markets: [],
			exchange: '',
			market: '',
			candlestickChart: [],
			futureData: [],
			summaryStatistics: {
				close: Number,
				dailyVolatility: Number,
				annualVolatility: Number,
				dailyDrift: Number,
				annualDrift: Number,
				meanDrift: Number
			},
			timestamp: Number,
			interval: "1d",
			graphData: []
		};
		this.ccxt = require('ccxt');
		this.options = {
			maintainAspectRatio: false,
		      elements: {
		        line: {
		        	//fill: false
		        }
		      },
		      scales: {
		        xAxes: [
		          {
		          	display: false,
		            gridLines: {
		              display: false
		            }
		          }
		        ],
		        yAxes: [
		          {
		            display: false,
		            gridLines: {
		              display: false
		            }
		          }
		        ]
		      }
	    };

		this.handleSubmit = this.handleSubmit.bind(this);
		this.handleFormChange = this.handleFormChange.bind(this);
		this.getMarkets = this.getMarkets.bind(this);
	}

	componentDidMount() {
		this.getChartData();
		this.setState({exchanges: this.ccxt.exchanges});
	}

	getMarkets(e) {
		let exchange = new this.ccxt[e.target.value]();
		let self = this;
		this.setState({markets: []});
		(async () => {
		    let markets = await exchange.load_markets();
		    let data = [];
		    for (var key in markets) {
		    	if (markets.hasOwnProperty(key)) {
		    		data.push(markets[key]);
		    	}
		    }
		    return data;
		}) ().then(res => {
			self.setState({markets: res});
			self.setState({market: res[0]});
		});
		this.handleFormChange(e);
	}

	handleFormChange(e) {
			this.setState({[e.target.name]: e.target.value});
			console.log(e.target.value);
	}

	handleSubmit(e) {
		e.preventDefault();
		var exchange = new this.ccxt[this.state.exchange]();
		if (exchange.hasFetchOHLCV) {
			(async () => {
	            return await exchange.fetchOHLCV (this.state.market, '1d');
		    })().then(res => {
		    	if (this.state.exchange === 'poloniex') {	// poloniex's OHLCV data goes oldest to latest, so needs to be reversed
		    		res = res.reverse();
		    		res.splice(res.length - 1, 1);			// has funky data that is not correct...
		    	}
		    	this.setState({candlestickChart: res});
		    	this.setState({timestamp: Date.now()});
		    });
		} else {
			alert('fetchOHLCV is not supported by ccxt at this time.');
		}
	}

	getChartData() {
		var exchange = new this.ccxt['gdax']();
		var graphData = {};
		(async() => { 
			return await exchange.fetchOHLCV('BTC/USD', '1m');
		})().then(res => {
			// reverse the closing prices
			var data = [];
			for (var j = res.length - 1; j >= 0; j--) {
				data.push(res[j][4]);
			}
			console.log(data);
			this.setState({graphData: data});
	    });
	}

  render() {
  	const data = (canvas) => {
  		const ctx = canvas.getContext("2d");
  		const gradient = ctx.createLinearGradient(0, 0, 0, 100);
  		gradient.addColorStop(0, 'rgba(12, 206, 107, 0.8');
  		gradient.addColorStop(1, 'rgba(12, 206, 107, 0');
  		
  		var labels = [];
		for (var i = 0; i < this.state.graphData.length; i++)
			labels[i] = i;

		return {
	      labels: labels,
	      datasets: [
	        {
	          //label: "Future Data",
	          lineTension: 0.1,
	          borderCapStyle: 'butt',
	          borderDash: [],
	          borderDashOffset: 0.0,
	          borderJoinStyle: 'miter',
	          pointBorderWidth: 1,
	          pointHoverRadius: 1,
	          pointHoverBorderWidth: 2,
	          pointRadius: 1,
	          pointHitRadius: 2,
	          backgroundColor: gradient,
	          borderColor: '#0CCE6B',
	          pointBorderColor: '#0CCE6B',
	          pointBackgroundColor: '#0CCE6B',
	          pointHoverBackgroundColor: '#0CCE6B',
	          pointHoverBorderColor: '#0CCE6B',
	          data: this.state.graphData
	        }
	      ]
        };
  	}
    return (
		<div>
	    	<div className="container">
	    		<div className="header-chart-container">
		      			<Line data={data} options={this.options} legend={{display: false}} height={100} width={100}/>
				</div>
				<h1 className="header">CryptoCurrency Simulator</h1>
		      	<form onSubmit={this.handleSubmit} className="form-group">
		      		<div className="input-group">
						  <select name="exchange" onChange={this.getMarkets}
				      		className="form-control"
				      		required>
				      		<option value="" disabled selected>Choose an Exchange...</option>
				      		{this.state.exchanges.map(item => {
					      		return <option value={item}>{item}</option>;
					      	})}
				  		  </select>

				  		  <select name="market" className="form-control" onChange={this.handleFormChange} required>
				  		  	<option value="" disabled selected>{ (this.state.exchange === '') ? 'Markets' : '...' }</option>
				      		{this.state.markets.map(item => {
					      		return <option value={item.symbol}>{item.symbol}</option>;
					      	})}
				  		  </select>
				  		  <span className="input-group-btn">
						  	<button type="submit" className="btn btn-primary">Simulate</button>
						  </span>
				  	</div>
				</form>
	      	</div>
			<Analysis historicalData={this.state.candlestickChart} timestamp={this.state.timestamp}/>
      	</div>
    );
  }
}