import React, { PureComponent } from 'react'
import ReactDOM from 'react-dom'
import { Scene, PerspectiveCamera, WebGLRenderer, BoxGeometry, MeshBasicMaterial, Mesh } from 'three'
import Styled from 'styled-components'
import constants from '../constants'

// Localizing naming of variables
const { threeDChartHeight: height, modalWidth: width } = constants

// Chosen projection
const projection = null

// Scene field of view (fov)
const fov = 75

// Camera frustum near plane. (don't render things too close)
const near = 0.1

// Camera frustum far plane. (don't render things in the distance)
const far = 1000

// Set up css for the canvas
const StyledRoot = Styled.div`
    & canvas {
      height: ${height}px;
      widht: ${width}px;
    }
`

/**
 * React container for THREE trail scene
 * @class
 * @extends PureComponent
 */
export default class ThreeDMap extends PureComponent {
  constructor(props) {
    super(props)
    this.setupScene = this.setupScene.bind(this)
  }

  /**
   * Let THREE do the updating, return false
   * @return {boolean} shouldComponentUpdate 
   */
  // Switch to Component vs. PureComponent...
  // shouldComponentUpdate = () => false

  /**
   * Kickoff scene creation on mount
   * @returns {void}
   */
  componentDidMount = () => this.setupScene()

  /**
   * Sets up the scene for the 3d trail
   * @returns {void}
   */
  setupScene = () => {
      this.scene = new Scene()
      this.camera = new PerspectiveCamera(fov, width / height, near, far)
      this.renderer = new WebGLRenderer()
      this.renderer.setSize(width, height)
      ReactDOM.findDOMNode(this.sceneDom).appendChild(this.renderer.domElement)
      // Just using sample code
      this.geometry = new BoxGeometry( 1, 1, 1 )
			this.material = new MeshBasicMaterial( { color: 0x00ff00 } )
			this.cube = new Mesh(this.geometry, this.material)
			this.scene.add(this.cube)
			this.camera.position.z = 5
			const animate = () => {
				requestAnimationFrame(animate)

				this.cube.rotation.x += 0.1
				this.cube.rotation.y += 0.1

				this.renderer.render(this.scene, this.camera)
			}

			animate()
  }

  /**
   * React is not doing much here, just creating a DOM container and references for THREE to append into
   * @returns {object} ReactElement
   */ 
  render = () => <StyledRoot ref={ c => { this.sceneDom = c; } } />
}
