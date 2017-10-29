import React, { Component } from 'react'
import './App.css'
import { csv } from 'd3'
import ElevationChart from './ElevationChart'

class App extends Component {
  
  constructor(props) {
    
    console.log( 'constructor' )

    super(props)

    this.state = {
      data: [],
      dataColumns: [],
      selectedTrail: null,
    }

    // async - load trail csv data and parse numeric values into ints/floats
    csv(`${process.env.PUBLIC_URL}/trails.csv`, data => {
      data.forEach( (row, rowNumner) =>{
        Object.keys(row).forEach( key => {
          try {
            if (!isNaN(row[key])) row[key] = parseFloat(row[key])
          } catch (e) { }
        })
      })

      this.setState({
        data: data,
        dataColumns: Object.keys(data[0]),
        selectedTrail: data[1]
      })

    })

  }

  componentDidMount() {
    
    console.log('componentDidMount()')

  }

  render() {
    const { selectedTrail } = this.state
    return (
      <div className="App">

        <ElevationChart
        selectedTrail={ selectedTrail }
        style={{
          position: 'fixed',
          top: 30,
          right: 30
        }} />

      </div>
    );
  }
}

export default App;
