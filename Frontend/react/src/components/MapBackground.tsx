import Map, {Source, Layer} from 'react-map-gl/maplibre';
import { MapContext, type MapContextType } from './MapVariablesProvider.tsx';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useContext, useEffect, useState } from 'react';
import * as pmtiles from 'pmtiles';

export default function MapBackground() {
    const { style, billingPeriod } = useContext(MapContext) as MapContextType;

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

    useEffect(()=>{
        const protocol = new pmtiles.Protocol();
        maplibregl.addProtocol("pmtiles", protocol.tile);
        return () => {maplibregl.removeProtocol("pmtiles")} //optional (not really optional here) cleanup function so React doesn't get weird
    }, []); //empty dependency array

    const tiles_url = `TippecanoeParcelsTake3.pmtiles`;
    const consump_period = "Consump" + billingPeriod;

    return(
        <>
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
                                'fill-color': [
                                    'interpolate',
                                    ['linear'],
                                    ['get', consump_period],
                                    0,    '#30123b',
                                    2,    '#4145ab',
                                    5,    '#39a2fc',
                                    10,   '#1bcfd4',
                                    20,   '#24efa2',
                                    35,   '#a2fc3c',
                                    50,   '#e1dc27',
                                    75,   '#f8910b',
                                    100,  '#e22f05',
                                    150,  '#7a0403',
                                ],
                                'fill-opacity': 0.2
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