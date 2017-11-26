import React, { Component } from 'react'
import './App.css'
import { csv } from 'd3'
import Map from './components/Map'
import ElevationChart from './components/ElevationChart'
import ThreeDMap from './components/ThreeDMap'

class App extends Component {
  
  /**
   * Standard App constructure responsible for setting the initial app state
   * values, binding statically declared functions to App object instances, and 
   * asychronously loaded in the CSV trail data from a CSV file.
   * @returns {void}
   */
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

      //save trail data into state , trigger rerender of this component
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

  /**
   * React render function incharge of rendering the component into the browser bt
   * creating DOM elements based on the values of the app state variables. Some variables
   * (known in the React work as props) are passed down to child components Map and Elevation
   * Chart.
   * @returns {void}
   */
  render() {
    const { selectedTrail, hoveredIndex } = this.state

    const googleMapsAPIKey = process.env.GOOGLE_MAPS_API_KEY ? `key={process.env.GOOGLE_MAP_API_KEY}` : ''

    return (
      <div className="App">

        <Map 
        setSelectedTrail={ this.setSelectedTrail }
        selectedTrail={ selectedTrail }
        hoveredIndex={ hoveredIndex }
        trails = {this.state.data}
        googleMapURL={ `https://maps.googleapis.com/maps/api/js?${googleMapsAPIKey}&v=3.exp&libraries=geometry` }
        loadingElement={<div style={{ height: `100%` }} />}
        containerElement={<div style={{ height: '100%', width: '100%',position: 'absolute' }} />}
        mapElement={<div style={{ height: `100%` }} /> } />

        {
            selectedTrail ? (
                <div
                style={{
                  position: 'fixed',
                  top: 30,
                  right: 30
                }}>
                    <ElevationChart
                    onMouseMove={ this.hoveredIndex }
                    setSelectedTrail={ this.setSelectedTrail }
                    selectedTrail={ selectedTrail }
                    hoveredIndex={ hoveredIndex }
                    />
                    <ThreeDMap
                    selectedTrail={ selectedTrail }
                    hoveredIndex={ hoveredIndex } />
                </div>
            ) : null
        }

      </div>
    );
  }
}

export default App;
