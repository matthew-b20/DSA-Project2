import Map from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import UseAnimations from "react-useanimations";
import toggle from 'react-useanimations/lib/toggle';
import { useState } from 'react';
export default function MapBackground() {
    const [ style, setStyle ] = useState(true);

    const basicStyle = "https://tiles.openfreemap.org/styles/liberty";
    const satelliteStyle = {
        version: 8,
        sources: {
            esri: {
                type: "raster",
                tiles: [
                    "https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                ],
                tileSize: 256
            }
        },
        layers: [
            {
                id: "esri-sat",
                type: "raster",
                source: "esri"
            }
        ]
    };

    const Animation = (UseAnimations as any).default || UseAnimations;
    const toggleAnimationData = (toggle as any).default || toggle;


    return(
        <>
            <button className = "absolute px-1 py-2 top-20 left-1 uk-btn uk-btn-default rounded-full flex items-center justify-center z-1"
                onClick={()=>{setStyle(!style)}}>
                <Animation animation={toggleAnimationData} reverse={style} size={32}/>
            </button>
            <div className = "fixed top-0 left-0 w-screen h-screen fixed z-0">
                <Map
                id="map"
                attributionControl={false}
                initialViewState={{
                    longitude: -81.2,
                    latitude: 28.67,
                    zoom: 12,
                }}
                className="w-full h-full"
                mapStyle={style ? satelliteStyle : basicStyle}
                maxZoom={19} // do not make smaller -- will result in grey squares if map is zoomed beyond available resolution
            />
            </div>
        </>
    )
}