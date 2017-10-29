import React, { Component } from 'react'
import Styled from 'styled-components'
import FloatingBox from './FloatingBox'

// Size of the chart
const width = 450;
const height = 200;

/**
 * Creates a styled component that only renders if there is a selected trail
 * @param {object} FloatingBox Common component
 * @returns {object} StyledElevationChart Dynamic component
 */
const StyledElevationChart = styled(FloatingBox)`
    display: ${props => props.selectedTrail !== null ? 'block' : 'none'}
    box-sizing: border-box;
    height: ${height}px;
    width: ${width}px;
`

/**
 * Pulls out elevation data
 * @param {object} selectedTrail The currently selected trail
 * @returns {array} elevationWaypoints
 */
const pluckElevationData = selectedTrail => selectedTrail.elevation

/**
 * Computes elevation range
 * @param {array} elevations
 * @returns {array} elevationRange Min and Max of elevations
 */
const computeElevationRange = elevations => [Math.min(elevations), Math.max(elevations)]

/**
 * Computes waypoint count range. Returns count of waypoints in range form
 * @param {array} waypoints
 * @returns {array} elevationRange Min and Max of elevations
 */
const computeCountRange = elevations => [1, elevations.length]


/**
 * Renders an interactive Elevation Chart
 * @extends Component
 */
export default class ElevationChart extends Component {
  render() {
    const { style, selectedTrail } = this.props
    return (
      <StyledElevationChart style={ style }>
        
      </StyledElevationChart>
    )
  }
}
