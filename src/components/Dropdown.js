import React from 'react';

export default class Dropdown extends React.Component {
  render() {
  	if (this.props.identifier !== undefined) console.log(this.props.identifier);
    return (
      <select name={this.props.name} onChange={this.props.callback}
      		className="custom-select mb-2 mr-sm-2 mb-sm-0"
      		>
      	{this.props.options.map(item => {
      		let value = (this.props.identifier === undefined) ? item : item[this.props.identifier];
      		return <option value={value}>{value}</option>;
      	})}
      </select>
    );
  }
}