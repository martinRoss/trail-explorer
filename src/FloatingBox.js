import React, { Component } from 'react'
import styled from 'styled-components'
import colors from './colors'

const Box = styled.div`
    box-shadow: 0 3px 10px rgba(0,0,0,0.15);
    border-radius: 3px;
    background-color: ${colors.boxBackground}
`

export default Class FloatingBox extends Component {
    render() {
        const { children } = this.pros
        return (
            <Box>{ children }</Box>
        )
    }
}