import React from 'react'
import { withScriptjs, withGoogleMap, GoogleMap, Polyline, Marker } from "react-google-maps"

export default Map = withScriptjs(withGoogleMap((props) => {
  
	// Pull out data and provide defaults
    const {
        selectedTrail,
        hoveredIndex
    } = props

	var polylines = []
	props.trails.forEach( (trail, index) => {
		
		//assemble coordiates in appropriate format for gmaps library
		let featureCollection = JSON.parse(trail.geoJson) 
		let coodinates = featureCollection.features[0].geometry.coordinates.map( coord =>{
			return {
				lat: coord[1],
				lng: coord[0]
			}
        });
        
        const setSelectedTrail = () => { props.setSelectedTrail(trail) }

        //set polyline style based on if it is the selectedTrail or not
        let polylineStyle = {};
        if (selectedTrail) {
        	//is the selected trail!
        	if (selectedTrail.name === trail.name) polylineStyle = { strokeColor: '#d38900', strokeOpacity: 1 };
        	//is not the selected trial!
        	else polylineStyle = { strokeColor: 'blue', strokeOpacity: .5 };
        //there is no selected trail
    	} else polylineStyle = { strokeColor: 'blue', strokeOpacity: 1 };

		polylines.push(
			<Polyline
            onClick={ setSelectedTrail }
            options={ polylineStyle } 
            key={'trail-' + index}
            path={ coodinates } />
		)
		
	});

	//resolve selected trail hover index Marker
	let selectedIndexMarker = null;
	if (hoveredIndex && typeof hoveredIndex !== 'undefined' && !!selectedTrail){
		let featureCollection = JSON.parse(selectedTrail.geoJson); 
		let coordinate = featureCollection.features[0].geometry.coordinates[ hoveredIndex ];
		if (coordinate && coordinate[0] && coordinate[1]) //quick & lazy error checking..
			selectedIndexMarker = <Marker position={{ lat: coordinate[1], lng: coordinate[0] }} />
	}

  return <GoogleMap
    defaultZoom={10}
    defaultCenter={{ lat: 38.4350512, lng: -78.870104 }}
  >
    { polylines }
    { selectedIndexMarker }
  </GoogleMap>
}))