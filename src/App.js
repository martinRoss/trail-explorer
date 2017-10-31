import React, { Component } from 'react'
import './App.css'
import { csv } from 'd3'
import Map from './Map'
import ElevationChart from './ElevationChart'

class App extends Component {
  
  constructor(props) {
    super(props)

    // Set initial state
    this.state = {
      data: [],
      dataColumns: [],
      selectedTrail: null,
      hoveredIndex: null,
    }

    // Bind this to instance functions
    this.setSelectedTrail = this.setSelectedTrail.bind(this)
    this.hoveredIndex = this.hoveredIndex.bind(this)

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
      })

    })

  }

  /**
   * Returns the index of the waypoint that corresponds to the
   * location the mouse is hovering over on the elevation chart
   * Only update if index changed for performance
   * @param {number} hoveredIndex Index of waypoint in currently selected track
   */
  hoveredIndex(hoveredIndex) {
    if (this.state.hoveredIndex !== hoveredIndex) this.setState({ hoveredIndex })
  }

  /**
   * Sets root application state.selectedTrail
   * @param {object} selectedTrail Trail to set as selected
   * @returns {void}
   */
  setSelectedTrail(selectedTrail) {
    this.setState({ selectedTrail })
  }

  render() {
    const { selectedTrail, hoveredIndex } = this.state
    return (
      <div className="App">

        <Map 
        setSelectedTrail={ this.setSelectedTrail }
        selectedTrail={ selectedTrail }
        trails = {this.state.data}
        mapTypeId = 'TERRAIN'
        googleMapURL="https://maps.googleapis.com/maps/api/js?v=3.exp&libraries=geometry"
        loadingElement={<div style={{ height: `100%` }} />}
        containerElement={<div style={{ height: '100%', width: '100%' ,position: 'absolute' }} />}
        mapElement={<div style={{ height: `100%` }} /> } />

        <ElevationChart
        onMouseMove={ this.hoveredIndex }
        selectedTrail={ selectedTrail }
        hoveredIndex={ hoveredIndex }
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
