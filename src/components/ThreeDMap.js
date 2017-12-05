import React, { PureComponent } from 'react'
import ReactDOM from 'react-dom'
import { Scene, PerspectiveCamera, WebGLRenderer, LineBasicMaterial, Line, Geometry, Vector3 } from 'three'
import TrackballControls from '../lib/three/TrackballControls'
import { geoMercator } from 'd3-geo'
import bbox from '@turf/bbox'
import length from '@turf/length'
import center from '@turf/center'
import { lineString } from '@turf/helpers'
import Styled from 'styled-components'
import constants from '../constants'
// Localizing naming of variables
const { threeDChartHeight: height, modalWidth: width } = constants

// Chosen projection
const projection = geoMercator

// Scene field of view (fov)
const fov = 50

// Camera frustum near plane. (don't render things too close)
const near = 0.1

// Camera frustum far plane. (don't render things in the distance)
const far = 1000

// Feet in a mile
const feetInAMile = 5280

// Track line material
const trackMaterial = new LineBasicMaterial({
  color: 0xffffff,
  linewidth: 6
})

// Set up css for the canvas
const StyledRoot = Styled.div`
    & canvas {
      height: ${height}px;
      width: ${width}px;
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
    this.updateSceneWithNewTrail = this.updateSceneWithNewTrail.bind(this)
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
   * Update if new trail received
   * @param {object} nextProps Next props
   * @returns {void}
   */
  
  componentWillReceiveProps(nextProps) {
      if (this.props.selectedTrail !== nextProps.selectedTrail) this.updateSceneWithNewTrail()
  }

  updateSceneWithNewTrail = () => {
    const { selectedTrail } = this.props
    const geoJSON = JSON.parse(selectedTrail.geoJson)
    const featBBox = bbox(geoJSON)
    const [minX, minY, maxX, maxY] = featBBox
    const latLength = length(lineString([[minX, minY], [minX, maxY]]), { units: 'miles' })
    const longLength = length(lineString([[minX, minY], [maxX, minY]]), { units: 'miles' })
    const terrainSizeMiles = Math.max(latLength, longLength)
    // ToDo: compute how many pixels per foot
    const terrainSizeFt = terrainSizeMiles * feetInAMile
    const pixelsPerFt = width / terrainSizeFt
    console.log(height, width)
    this.projection = geoMercator()
      .translate([width / 2, height / 2])
      .center(center(geoJSON).geometry.coordinates)
      .scale(width * 106)

    // Center the camera
    this.camera.position.set(0, 0, height);

    // Create THREE geometries for features in geoJson
    for (let i = 0; i < geoJSON.features.length; i++) {
      const feature = geoJSON.features[i]
      if (feature.geometry.type === 'LineString') {
        const featGeom = new Geometry()
        feature.geometry.coordinates.forEach(point => {
          const [lon, lat, ele] = point
          const [projectedLon, projectedLat] = this.projection([lon, lat])
          const projectedEle = ele * pixelsPerFt
          featGeom.vertices.push(new Vector3(
            projectedLon - (width / 2),
            projectedEle,
            projectedLat - (height / 2)
          ))
        })
        // Create and add the line to the scene
        this.currentTrack = new Line(featGeom, trackMaterial)
        this.currentTrack.name = 'current_track'
        // Remove old tracks
        const trackObj = this.scene.getObjectByName(this.currentTrack.name)
        if (!!trackObj) this.scene.remove(trackObj)
        // Add new track
        this.scene.add(this.currentTrack)
      }
    }
  }
  

  /**
   * Sets up the scene for the 3d trail
   * @returns {void}
   */
  setupScene = () => {
      this.scene = new Scene()
      this.camera = new PerspectiveCamera(fov, width / height, near, far)
      this.renderer = new WebGLRenderer()
      this.renderer.setSize(width, height)

      this.sceneDOM = ReactDOM.findDOMNode(this.sceneDom)
      this.sceneDOM.appendChild(this.renderer.domElement)
      // Set up trackball controls
      this.controls = new TrackballControls(this.camera, this.renderer.domElement)

      // Setup trail
      this.updateSceneWithNewTrail()

      const render = () => {
          this.renderer.render(this.scene, this.camera)
          this.controls.update()
          requestAnimationFrame(render)
      }
      // Initial render
      render()
  }

  /**
   * React is not doing much here, just creating a DOM container and references for THREE to append into
   * @returns {object} ReactElement
   */ 
  render = () => <StyledRoot ref={ c => { this.sceneDom = c; } } />
}
