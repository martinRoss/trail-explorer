import React, { PureComponent } from 'react'
import ReactDOM from 'react-dom'
import {
  Scene,
  PerspectiveCamera,
  WebGLRenderer,
  LineBasicMaterial,
  Line,
  Geometry,
  Vector3,
  GridHelper,
  AmbientLight,
  DirectionalLight
} from 'three'
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
// const projection = geoMercator

// Scene field of view (fov)
const fov = 50

// Camera frustum near plane. (don't render things too close)
const near = 0.1

// Camera frustum far plane. (don't render things in the distance)
const far = 10000

// Feet in a mile
const feetInAMile = 5280

// Track line material
const trackMaterial = new LineBasicMaterial({
  color: 0xffffff,
  linewidth: 6
})

// Name of current track
const TRACK_NAME = 'current_track'

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
    let geoJSON
    try {
        geoJSON = JSON.parse(selectedTrail.geoJson)
    } catch (e) {
        console.log("Error parsing selected trail geoJSON")
        return
    }
    const featBBox = bbox(geoJSON)
    const [minX, minY, maxX, maxY] = featBBox
    const latLength = length(lineString([[minX, minY], [minX, maxY]]), { units: 'miles' })
    const longLength = length(lineString([[minX, minY], [maxX, minY]]), { units: 'miles' })
    const terrainSizeMiles = Math.max(latLength, longLength)
    const terrainSizeFt = terrainSizeMiles * feetInAMile
    const pixelsPerFt = width / terrainSizeFt
    this.projection = geoMercator()
      .translate([width / 2, height / 2])
      .center(center(geoJSON).geometry.coordinates)
      .scale(width * 106)

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
        const track = new Line(featGeom, trackMaterial)
        track.name = TRACK_NAME
        // Add new track
        this.scene.add(track)
        if (typeof this.currentTrack !== 'undefined') {
          this.currentTrack.geometry.dispose()
          this.currentTrack.material.dispose()
          this.scene.remove(this.scene.getObjectByName(TRACK_NAME))
        }
        // Not updating properly
        this.currentTrack = track
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
      this.camera.position.set(-150, 110, 150);
      this.renderer = new WebGLRenderer()
      this.renderer.setSize(width, height)

      // Set up a reference grid
      const helper = new GridHelper(width, 20)
      this.scene.add(helper)

      // Add lights
      const ambientLight = new AmbientLight(0xffffff, 0.2)
      this.scene.add(ambientLight)
      const directionalLight = new DirectionalLight(0xffffff, 0.8)
      directionalLight.position.set(1, 1, - 1)
      this.scene.add(directionalLight)

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
