import React, { PureComponent } from 'react'
import Styled from 'styled-components'
import { scaleLinear } from 'd3'
import { line, curveNatural } from 'd3-shape'
import colors from '../colors'
import strings from '../strings'
import constants from '../constants'
import { throttle } from '../utilities'
import { geoAlbers } from 'd3/node_modules/d3-geo';

// Pull out and locally name constants
const {
    elevationChartHeight: chartHeight,
    modalWidth: width,
    elevationChartPadding: padding,
} = constants

// Chart width
const chartWidth = width - (2 * padding)

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
    position: relative;
`

/**
 * Style for the trail length
 * @returns {object} label Styled Label
 */
const TrailLength = Styled.div`
    font-size: 0.8rem;
    position: aboslute;
    bottom: 0;
    right: 0;
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
    JSON.parse(selectedTrail.geoJson)
        .features[0]
        .geometry
        .coordinates
        .map(coordinate => coordinate[2])

/**
 * Grab elevation at index
 * @param {object} selectedTrail The currently selected trail
 * @param {number} index Index of waypoint
 * @returns {number} elevation at wapoint
 */
const getElevationAtIndex = (selectedTrail, index) =>
    pluckElevationData(selectedTrail)[index]

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
const grabRelativeXHover = event => {
    return event.pageX - event.currentTarget.getBoundingClientRect().left
}

/**
 * Renders an interactive Elevation Chart
 * @extends Component
 */
export default class ElevationChart extends PureComponent {
/**
 * Set up interal reference to limit updates
 * @param {object} props Props passed from the parent component
 * @returns {void}
 */
  constructor(props) {
      super(props)
      this.hoveredX = -1
  }

  /**
   * Render the elevation chart
   * @returns {object} react element
   */
  render() {
    // Pull out data and provide defaults
    const {
        style,
        setSelectedTrail,
        selectedTrail,
        onMouseMove,
        hoveredIndex
    } = this.props

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
        .y(d => chartHeight - yScale(d))
        .curve(curveNatural)
    
    // Create line path
    const elevationLine = elevationLineFunc(elevations) 

    // Create function to reverse lookup x index from hover interaction
    const getIndexFromHover = x =>
        Math.ceil(xScale.invert(x))

    // Send new hovered index if there is significant change
    const sendSelectedTrailHoverIndex = event => {
        const nextHoveredX = grabRelativeXHover(event)
        const pixelBuffer = 1
        // Only update if moved more than buffer
        if (Math.abs(nextHoveredX - this.hoveredX) > pixelBuffer) {
            // Not using state to avoid render cycle
            this.hoveredX = nextHoveredX
            onMouseMove(getIndexFromHover(this.hoveredX))
        }
    }

    const sendSelectedTrailHoverIndexThrottled = event => throttle(sendSelectedTrailHoverIndex(event), 50)


    // Elevation at hovered index
    const hoveredElevation = hoveredIndex ? Math.floor(getElevationAtIndex(selectedTrail, hoveredIndex)) : null

    // Build circle for current elevation if there is one
    let hoverG = null
    if (hoveredElevation) {
        const transX = xScale(hoveredIndex)
        const transY = chartHeight - yScale(hoveredElevation)
        const radius = 5
        const circleStrokeWidth = 1
        const hoverCircle =
            <circle
            cx={ 0 }
            cy={ 0 }
            transform={ `translate(0, ${transY})`}
            r={ radius }
            strokeWidth={ circleStrokeWidth }
            fill={ colors.boxBackground }
            stroke={ colors.elevationHighlight } />
        const hoverLine =
            <line
            x1={ 0 }
            x2={ 0 }
            y1={ 0 }
            y2={ chartHeight }
            stroke={ colors.borderColor } />
        hoverG =
            <g transform={ `translate(${transX})`}>
               { hoverCircle }
               { hoverLine }
            </g>
    }

    return (
      <StyledElevationChart style={ style }>
          <Label>
              { strings.ELEVATION_BOX_LABEL }
              { hoveredElevation ? ` - ${hoveredElevation}ft` : null }
          </Label>
          <svg height={ chartHeight + 1 } width={ chartWidth }>
              <g>
                  <path d={ elevationLine } fill="none" stroke="black" />

                  { hoverG }
                  
                  <rect
                  height={ chartHeight }
                  width={ chartWidth }
                  onMouseMove={ sendSelectedTrailHoverIndexThrottled }
                  style={{ pointerEvents: 'all', fill: 'none', stroke: 'none' }} />

              </g>
          </svg>
          <TrailLength>{ `${selectedTrail.total_real_distance} miles` }</TrailLength>
          <div id='closeButton' onClick={ () => { setSelectedTrail() } }>close</div>
      </StyledElevationChart>
    )
  }
}
