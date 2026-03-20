import Map, {Source, Layer} from 'react-map-gl/maplibre';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import UseAnimations from "react-useanimations";
import toggle from 'react-useanimations/lib/toggle';
import { useEffect, useState } from 'react';
import * as pmtiles from 'pmtiles';

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

    useEffect(()=>{
        const protocol = new pmtiles.Protocol();
        maplibregl.addProtocol("pmtiles", protocol.tile);
        return () => {maplibregl.removeProtocol("pmtiles")} //optional (not really optional here) cleanup function so React doesn't get weird
    }, []); //empty dependency array

    const tiles_url = `TippecanoeParcelsTake3.pmtiles`;

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
                >
                    <Source
                        id="parcel-source"
                        type="vector"
                        url={`pmtiles://${tiles_url}`}
                    >
                        <Layer
                            id="parcel-fills"
                            type="fill"
                            source-layer="parcels" // This MUST match the --layer name from Tippecanoe
                            paint={{
                                'fill-color': '#FFA500',
                                'fill-opacity': 1
                            }}
                        />
                        <Layer
                            id="parcel-outlines"
                            type="line"
                            source-layer="parcels"
                            paint={{
                                'line-color': '#000000',
                                'line-width': 1
                            }}
                        />
                    </Source>
                </Map>
            </div>
        </>
    )
}