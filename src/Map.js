import React from 'react'
import { withScriptjs, withGoogleMap, GoogleMap, Polyline } from "react-google-maps"

export default Map = withScriptjs(withGoogleMap((props) => {
  
	console.log( 'this is the render function' )

	var polylines = []
	props.trails.forEach( (trail, index) => {
		console.log( JSON.parse(trail.geoJson) );
		
		//assemble coordiates in appropriate format for gmaps library
		let featureCollection = JSON.parse(trail.geoJson) 
		var coodinates = featureCollection.features[0].geometry.coordinates.map( coord =>{
			return {
				lat: coord[1],
				lng: coord[0]
			}
		});

		polylines.push(
			<Polyline
				key={'trail-' + index}
				path={ coodinates } />
		)
		
	});

  return <GoogleMap
    defaultZoom={10}
    defaultCenter={{ lat: 38.4350512, lng: -78.870104 }}
  >
    { polylines }
  </GoogleMap>
}))