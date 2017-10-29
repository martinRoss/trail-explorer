import React, { Component } from 'react'
import Styled from 'styled-components'
import FloatingBox from './FloatingBox'

const StyledElevationChart = styled(FloatingBox)`
    display: ${props => props.selectedTrail !== null ? 'block' : 'none'}
`

export default class ElevationChart extends Component {
  render() {
    const { style, selectedTrail } = this.props
    return (
      <StyledElevationChart style={ style }>
        
      </StyledElevationChart>
    )
  }
}
