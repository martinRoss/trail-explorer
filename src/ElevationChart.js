import React, { Component } from 'react'
import Styled from 'styled-components'
import { scaleLinear } from 'd3';
import { line, curveNatural } from 'd3-shape';
import colors from './colors'
import strings from './strings'

// Width of the outer box
const width = 400;
// Box Padding
const padding = 14;
// Chart width
const chartWidth = width - (2 * padding)
// Height of the chart
const chartHeight = 80;

/**
 * Creates a styled component
 * @param {object} FloatingBox Common component
 * @returns {object} StyledElevationChart Dynamic component
 */
const StyledElevationChart = Styled.div`
    box-sizing: border-box;
    width: ${width}px;
    box-shadow: 0 3px 10px rgba(0,0,0,0.15);
    border-radius: 3px;
    background-color: ${colors.boxBackground};
    border: 1px solid ${colors.borderColor};
    text-align: left;
    padding: ${padding}px;
`

/**
 * Styles the box label
 * @returns {object} label Styled Label
 */
const Label = Styled.div`
    margin-bottom: 18px;
    font-size: 1rem;
`

/**
 * Pulls out elevation data.
 * @param {object} selectedTrail The currently selected trail
 * @returns {array} elevationWaypoints
 */
const pluckElevationData = selectedTrail =>
    JSON.parse(selectedTrail.geoJson).features[0].geometry.coordinates.map(coordinate => coordinate[2])

/**
 * Computes elevation domain
 * Uses the spread operator '...' to convert array to argument list
 * @param {array} elevations
 * @returns {array} elevationDomain Min and Max of elevations
 */
const computeElevationDomain = elevations =>
    [Math.min(...elevations), Math.max(...elevations)]

/**
 * Computes waypoint count domain. Returns count of waypoints in domain extent format
 * @param {array} waypoints
 * @returns {array} elevationRange Min and Max of elevations
 */
const computeCountDomain = elevations =>
    [1, elevations.length]

/**
 * X pixel range
 * @returns {array} xRange
 */
const xRange = [0, chartWidth]

/**
 * y pixel range
 * @returns {array} yRange
 */
const yRange = [0, chartHeight]

/**
 * Grab the x offset relative to the node from a hover event
 * @param {event} event Hover event
 * @returns {number} x pixel coordinate
 */
const grabRelativeXHover = event =>
    event.pageX - event.currentTarget.getBoundingClientRect().x

/**
 * Renders an interactive Elevation Chart
 * @extends Component
 */
export default class ElevationChart extends Component {
  render() {
    // Pull out data and provide defaults
    const {
        style,
        selectedTrail,
        onMouseMove
    } = this.props

    // If no trail is selected return nothing
    if (!selectedTrail) return null
    // Nothing below happens if no trail is selected -- do these checks early for peformance

    // Pluck elevation
    const elevations = pluckElevationData(selectedTrail)

    // Compute y scale
    const yScale = scaleLinear()
        .domain(computeElevationDomain(elevations))
        .range(yRange)

    // Compute x scale
    const xScale = scaleLinear()
        .domain(computeCountDomain(elevations))
        .range(xRange)

    // Create line function
    const elevationLineFunc = line()
        .x((d, index) => xScale(index + 1))
        .y(d => yScale(d))
        .curve(curveNatural)
    
    // Create line path
    const elevationLine = elevationLineFunc(elevations) 

    // Create function to reverse lookup x index from hover interaction
    const getIndexFromHover = x =>
        Math.ceil(xScale.invert(x))

    // Function to send index up to parent
    // Pluck the x hover, get the index and then send it up
    const sendSelectedTrailHoverIndex = event =>
        onMouseMove(getIndexFromHover(grabRelativeXHover(event)))


    return (
      <StyledElevationChart style={ style }>
          <Label>{ strings.ELEVATION_BOX_LABEL }</Label>
          <svg height={ chartHeight + 1 } width={ chartWidth }>
              <g>
                  <path d={ elevationLine } fill="none" stroke="black" />

                  <rect
                  height={ chartHeight }
                  width={ chartWidth }
                  onMouseMove={ sendSelectedTrailHoverIndex }
                  style={{ pointerEvents: 'all', fill: 'none', stroke: 'none' }} />

              </g>
          </svg>
      </StyledElevationChart>
    )
  }
}
