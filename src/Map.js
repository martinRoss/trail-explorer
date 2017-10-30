import React from 'react'
import { withScriptjs, withGoogleMap, GoogleMap } from "react-google-maps"

export default Map = withScriptjs(withGoogleMap((props) => {
  
	console.log( 'this is the render function' )

  return <GoogleMap
    defaultZoom={11}
    defaultCenter={{ lat: 38.4350512, lng: -78.870104 }}
  >
    
  </GoogleMap>
}))