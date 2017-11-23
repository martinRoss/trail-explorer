import React from 'react'
import { withScriptjs, withGoogleMap, GoogleMap, Polyline, Marker } from "react-google-maps"

export default Map = withScriptjs(withGoogleMap((props) => {
  
	// Pull out data and provide defaults
    const {
        selectedTrail,
        hoveredIndex
    } = props

    //loop throught trails in props and create Google Maps Polyline for each
	const polylines = []
	props.trails.forEach( (trail, index) => {
		
        //parse trail GeoJSON into in memory JavaScript object
		let featureCollection = JSON.parse(trail.geoJson) 
		
        //loop through trail coordinates and convert into Google Maps friendly format
        let coodinates = featureCollection.features[0].geometry.coordinates.map( coord =>{
			return {
				lat: coord[1],
				lng: coord[0]
			}
        });
        
        //set Polyline styles based on if selected trail
        let polylineStyle = {};
        if (selectedTrail) {
        	if (selectedTrail.name === trail.name) polylineStyle = { strokeColor: '#d38900', strokeOpacity: 1 };
        	else polylineStyle = { strokeColor: 'blue', strokeOpacity: .5 };
    	} else polylineStyle = { strokeColor: 'blue', strokeOpacity: 1 };

        //add the Polyline to the polylines array
		polylines.push(
			<Polyline
                onClick={ () => { props.setSelectedTrail(trail) } }
                options={ polylineStyle } 
                key={'trail-' + index}
                path={ coodinates } />
		)
		
	});

	//if a hover index is supplied in props, look up the GPS coordiates at the index 
    //  and create a Google Maps Marker at that location
	let selectedIndexMarker = null;
	if (hoveredIndex && typeof hoveredIndex !== 'undefined' && !!selectedTrail){
		let featureCollection = JSON.parse(selectedTrail.geoJson); 
		let coordinate = featureCollection.features[0].geometry.coordinates[ hoveredIndex ];
		if (coordinate && coordinate[0] && coordinate[1]) //quick & lazy error checking..
			selectedIndexMarker = <Marker position={{ lat: coordinate[1], lng: coordinate[0] }} />
	}

    //return the React object that represents the Google Map, Polylines, and Marker to added
    //  rendered into the browser
    return <GoogleMap
        defaultZoom={10}
        defaultCenter={{ lat: 38.4350512, lng: -78.870104 }} >
        
        { polylines }
        { selectedIndexMarker }

    </GoogleMap>
}))