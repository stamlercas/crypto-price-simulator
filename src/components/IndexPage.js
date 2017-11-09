import React from 'react';
import Dropdown from './Dropdown';
import Analysis from './Analysis';
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
			timestamp: Number
		};
		this.ccxt = require('ccxt');

		this.handleSubmit = this.handleSubmit.bind(this);
		this.handleFormChange = this.handleFormChange.bind(this);
		this.getMarkets = this.getMarkets.bind(this);
	}

	componentDidMount() {
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
		}) ().then(res => self.setState({markets: res}));
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
		    	this.setState({candlestickChart: res});
		    	this.setState({timestamp: Date.now()});
		    });
		} else {
			alert('fetchOHLCV is not supported by ccxt at this time.');
		}
	}

  render() {
    return (
		<div>
	    	<div className="row">
		      <div className="col-md-6 offset-md-3">
		      	<form onSubmit={this.handleSubmit} className="form-inline">
				  <label className="mr-sm-2">Exchange</label>
				  <select name="exchange" onChange={this.getMarkets}
		      		className="custom-select mb-2 mr-sm-2 mb-sm-0"
		      		required>
		      		<option value="" disabled selected>Choose an Exchange...</option>
		      		{this.state.exchanges.map(item => {
			      		return <option value={item}>{item}</option>;
			      	})}
		  		  </select>
		  		  <select name="market" className="custom-select mb-2 mr-sm-2 mb-sm-0" onChange={this.handleFormChange} required>
		  		  	<option value="" disabled selected>{ (this.state.exchange === '') ? 'Choose an Exchange' : '...' }</option>
		      		{this.state.markets.map(item => {
			      		return <option value={item.symbol}>{item.symbol}</option>;
			      	})}
		  		  </select>
				  <button type="submit" className="btn btn-primary">Simulate</button>
				</form>
		      </div>
	      	</div>
	      	<div className="row">
	      		<div className="col-md-10 offset-md-1" id="analysis-container">
					<Analysis historicalData={this.state.candlestickChart} timestamp={this.state.timestamp}/>
				</div>
	      	</div>
      	</div>
    );
  }
}