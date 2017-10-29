import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import { csv } from 'd3';

class App extends Component {
  
  constructor(props) {
    
    console.log( 'constructor' );

    super(props);

    this.state = {
      data: [],
      dataColumns: []
    };

    // async - load trail csv data and parse numeric values into ints/floats
    csv(`${process.env.PUBLIC_URL}/trails.csv`, data => {
      data.forEach( (row, rowNumner) =>{
        Object.keys(row).forEach( key => {
          try {
            if (!isNaN(row[key])) row[key] = parseFloat(row[key])
          } catch (e) { }
        });
      });

      this.setState({
        data: data,
        dataColumns: Object.keys(data[0])
      });

    });

  }

  componentDidMount() {
    
    console.log('componentDidMount()');

  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to React</h1>
        </header>
        <p className="App-intro">
          Woo To get started, edit <code>src/App.js</code> and save to reload.
        </p>
      </div>
    );
  }
}

export default App;
