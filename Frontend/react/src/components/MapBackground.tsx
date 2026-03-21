import Map, { Source, Layer, Popup, Marker, useMap } from 'react-map-gl/maplibre';
import MapMarker from './MapMarker.tsx';
import { MapContext, type MapContextType } from './MapVariablesProvider.tsx';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useContext, useEffect, memo } from 'react';
import * as pmtiles from 'pmtiles';

interface popupInfo {
    lngLat: maplibregl.LngLat;
    Address: string
    LocationCode: string
    consump_period: string
}

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

const ParcelLayers = memo(({billingPeriod}:{billingPeriod: number}) =>{
    const tiles_url = `TippecanoeParcelsTake3.pmtiles`;
    const consump_period = "Consump" + billingPeriod;

    return(
        <>
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
        </>
    );
});

export default function MapBackground() {
    const { map } = useMap();
    const { style, billingPeriod, popup, setPopup, returnJSON, method } = useContext(MapContext) as MapContextType;

    useEffect(()=>{
        const protocol = new pmtiles.Protocol();
        maplibregl.addProtocol("pmtiles", protocol.tile);
        return () => {maplibregl.removeProtocol("pmtiles")} //optional (not really optional here) cleanup function so React doesn't get weird
    }, []); //empty dependency array

    const consump_period = "Consump" + billingPeriod;

    const handleParcelClick = (e) => {
        const parcel = e.features && e.features[0]; // In react-map-gl, e.features property is an array of data features located at the mouse pointer's position when the event happens
        if(parcel){
            //Set Popup state
            setPopup({
                lngLat: e.lngLat, //should update to center of property point later
                Address: parcel.properties.Address,
                LocationCode: parcel.properties.LocationCode,
                consump_period: parcel.properties[consump_period]
            });
        } else {
            // don't do anything
            setPopup(null);
        }
    }

    const handleSelection = (coordinates : number[]) => {
        map.flyTo({center: coordinates, zoom: 18});
    }

    return(
        <>
            <div className = "fixed top-0 left-0 w-screen h-screen fixed z-0">
                <Map
                id="map"
                attributionControl={false}
                interactiveLayerIds={['parcel-fills']}
                onClick={handleParcelClick}
                initialViewState={{
                    longitude: -81.2,
                    latitude: 28.67,
                    zoom: 12,
                }}
                className="w-full h-full"
                mapStyle={style ? satelliteStyle : basicStyle}
                maxZoom={19} // do not make smaller -- will result in grey squares if map is zoomed beyond available resolution
                >
                    {popup && (
                        <Popup
                            className="[&_.maplibregl-popup-close-button]:px-1 [&_.maplibregl-popup-close-button]:hover:!bg-transparent [&_.maplibregl-popup-close-button]:text-base [&_.maplibregl-popup-close-button]:hover:!text-[hsl(var(--primary))]"
                            longitude={popup.lngLat.lng}
                            latitude={popup.lngLat.lat}
                            onClose={() => setPopup(null)}
                            closeOnClick={false} // Prevents the popup from closing if you click within it
                        >
                            <div>
                                <div className="flex items-center gap-1 pr-2">
                                    <img src={'../assets/water-icon.svg'} alt="water icon" width="16" height="16" />
                                    <p className="uk-h4">{popup.consump_period} KGal</p>
                                </div>
                                <hr className="uk-hr my-1 border-t-2 border-primary" />
                                <p><b>{popup.Address}</b></p>
                                <p className="uk-badge uk-badge-primary pointer-events-none text-xs">Location: {popup.LocationCode}</p>
                            </div>
                        </Popup>
                    )}

                    {/* LOWEST USER MARKERS */}
                    {returnJSON && returnJSON[0].MinUsers && (method === "Min" || method === "Both") &&
                        <>
                            {returnJSON[0].MinUsers.map((user, index )=> (
                                <Marker
                                    key={index}
                                    longitude={user.Coordinates[0]}
                                    latitude={user.Coordinates[1]}
                                    onClick = {()=>{handleSelection(user.Coordinates)}}
                                >
                                    <MapMarker color="low" rank={index+1} size={48}/>
                                </Marker>
                            ))}
                        </>
                    }

                    {/* HIGHEST USER MARKERS */}
                    {returnJSON && returnJSON[0].MaxUsers && (method === "Max" || method === "Both") &&
                        <>
                            {returnJSON[0].MaxUsers.map((user, index )=> (
                                <Marker
                                    key={index}
                                    longitude={user.Coordinates[0]}
                                    latitude={user.Coordinates[1]}
                                    onClick = {()=>{handleSelection(user.Coordinates)}}
                                >
                                    <MapMarker color="high" rank={index+1} size={48}/>
                                </Marker>
                            ))}
                        </>
                    }

                    <ParcelLayers billingPeriod={billingPeriod} />

                </Map>
            </div>
        </>
    )
}