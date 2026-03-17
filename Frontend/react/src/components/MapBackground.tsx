import Map from 'react-map-gl/maplibre'
import 'maplibre-gl/dist/maplibre-gl.css'

export default function MapBackground() {
    return(
        <div className = "fixed top-0 left-0 w-screen h-screen fixed z-0">
            <Map
            initialViewState={{
                longitude: -81.2,
                latitude: 28.67,
                zoom: 12
            }}
            className="w-full h-full"
            mapStyle="https://tiles.openfreemap.org/styles/liberty"/>
        </div>
    )
}