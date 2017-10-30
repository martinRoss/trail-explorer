import React, { Component } from 'react'
import './App.css'
import { csv } from 'd3'
import Map from './Map'
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

        <Map 
          mapTypeId = 'terrain'
          googleMapURL="https://maps.googleapis.com/maps/api/js?v=3.exp&libraries=geometry"
          loadingElement={<div style={{ height: `100%` }} />}
          containerElement={<div style={{ height: '100%', width: '100%' ,position: 'absolute' }} />}
          mapElement={<div style={{ height: `100%` }} /> } />

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
