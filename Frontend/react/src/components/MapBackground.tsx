import Map, { Source, Layer, Popup, Marker, useMap } from 'react-map-gl/maplibre';
import MapMarker from './MapMarker.tsx';
import { MapContext, type MapContextType } from './MapVariablesProvider.tsx';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useState, useContext, useEffect } from 'react';
import * as pmtiles from 'pmtiles';

const basicStyle = "https://tiles.openfreemap.org/styles/liberty";

const ParcelLayers = ({billingPeriod, variable}:{billingPeriod: number, variable: string}) =>{
    const tiles_url = `OviedoParcels.pmtiles`;

    const consump_period = variable + billingPeriod;

    const { parcelLayer } = useContext(MapContext) as MapContextType;


    return(
        <Source
            id="parcel-source"
            type="vector"
            url={`pmtiles://${tiles_url}`}
        >
            <Layer
                id="parcel-outlines"
                type="line"
                source-layer="parcels"
                source="parcel-source"
                layout={{ visibility: parcelLayer ? 'visible' : 'none' }}
                paint={{ //line width interpolation helps lines not look so thick at low zoom
                    'line-color': '#000000',
                    'line-width': ['interpolate', ['linear'], ['zoom'],
                        12, 0.3,
                        15, 0.8,
                        18, 1
                    ],
                    'line-opacity': 1
                }}
            />
            <Layer
                id="parcel-fills"
                type="fill"
                beforeId="parcel-outlines"
                source-layer="parcels" // This MUST match the --layer name from Tippecanoe
                layout={{ visibility: parcelLayer ? 'visible' : 'none' }}
                paint={{
                    'fill-color': [
                        'interpolate',
                        ['linear'],
                        ['get', consump_period],
                        0, '#30123b',
                        2, '#4145ab',
                        5, '#39a2fc',
                        10, '#1bcfd4',
                        20, '#24efa2',
                        35, '#a2fc3c',
                        50, '#e1dc27',
                        75, '#f8910b',
                        100, '#e22f05',
                        150, '#7a0403',
                    ],
                    'fill-opacity': 0.6,
                }}
            />
        </Source>
    );
}

//debouncing function to prevent too many map renders from the billing period slider:
function useDebounce(value: number, zoom: number) {
    const [debouncedValue, setDebouncedValue] = useState(value);

    //making the delay adaptive based on the zoom level
    //b/c zoom level impacts how many parcels need to be rendered
    //& therefore how laggy parcel re-renders are:
    const delay = 7000/(zoom**2); //somewhat randomly chosen, but seems to work

    useEffect(() => {
        // set timer to update the debounced value after the delay
        const handler = setTimeout(() => {
            setDebouncedValue(value); //function argument (callback)
        }, delay); //delay argument

        // clean up function runs before the useEffect() function runs again
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]); // do the Effect again if the value changes

    return debouncedValue;
}

export default function MapBackground() {
    const [zoom, setZoom] = useState(13);
    const { map } = useMap();
    const { style, billingPeriod, variable, popup, setPopup, returnJSON, method, meterLayer } = useContext(MapContext) as MapContextType;
    const consump_period = variable + billingPeriod;

    useEffect(()=>{
        const protocol = new pmtiles.Protocol();
        maplibregl.addProtocol("pmtiles", protocol.tile);
        return () => {maplibregl.removeProtocol("pmtiles")} //optional (not really optional here) cleanup function so React doesn't get weird
    }, []); //empty dependency array

    const handleParcelOrPointClick = (e) => {
        const feature = e.features && e.features[0]; // In react-map-gl, e.features property is an array of data features located at the mouse pointer's position when the event happens
        if (feature) {
            //Set Popup state
            if (feature.layer.id === 'parcel-fills') {
                const parcel = feature;
                setPopup({
                    type: 'parcel', // Flag as parcel
                    lngLat: e.lngLat, // should update to center of property point later
                    Address: parcel.properties.Address,
                    LocationCode: parcel.properties.LocationCode,
                    properties: parcel.properties,
                    PropertyCat: parcel.properties.PropertyCat,
                    PropertyType: parcel.properties.PropertyType,
                    Bill: billingPeriod
                });
            } else if (feature.layer.id === 'meter-points-layer') {
                const point = feature;
                setPopup({
                    type: 'point', // Flag as parcel
                    lngLat: e.lngLat, //should update to center of property point later
                    Address: point.properties.Address,
                    LocationCode: point.properties.LocationCode,
                    properties: point.properties,
                    PropertyCat: point.properties.PropertyCat,
                    PropertyType: point.properties.PropertyType,
                    Bill: billingPeriod
                });
            } else {
                // don't do anything if just randomly clicking
                setPopup(null);
            }
        }
    }

    const handleSelection = (coordinates : number[]) => {
        map.flyTo({center: coordinates, zoom: 18});
    }

    const points_url = `MeterPoints.pmtiles`;

    return(
        <>
            <div className = "fixed top-0 left-0 w-screen h-screen fixed z-0">
                <Map
                id="map"
                attributionControl={false}
                interactiveLayerIds={['parcel-fills', 'meter-points-layer']}
                onClick={handleParcelOrPointClick}
                initialViewState={{
                    longitude: -81.1814,
                    latitude: 28.66,
                    zoom: 13,
                }}
                onMove={(e) => setZoom(e.viewState.zoom)}
                className="w-full h-full"
                mapStyle={basicStyle}
                maxZoom={19} // do not make smaller -- will result in grey squares if map is zoomed beyond available resolution
                >
                    {/* Conditionally render satellite imagery, giving appearance of changing basemap w/o rerendering whole map */}
                    {style &&
                        <Source id="esri-sat" type="raster" tiles={["https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"]} tileSize={256}>
                            <Layer id="esri-sat-layer" type="raster" beforeId="parcel-fills" />
                        </Source>
                    }

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
                                    <p className="uk-h4 text-secondary">{popup.properties[variable+billingPeriod].toFixed(2)} KGal</p>
                                </div>
                                <p className="text-primary leading-tight mt-1"><b>{popup.Address}</b></p>
                                <p className = "mb-1"><b>{variable} • Bill {billingPeriod}</b></p>
                                { popup.PropertyType && popup.PropertyCat && <p className = "leading-tight">{popup.PropertyType} • {popup.PropertyCat}</p> }
                                {popup.type === "point" ? <p>Location Code: {popup.LocationCode}</p> : null}
                                <span className="uk-badge uk-badge-primary !text-[8px] !min-h-0 px-1.5 py-0 leading-none font-bold uppercase pointer-events-none">
                                    {popup.type === "point" ? "Individual meter" : "Parcel aggregate"}
                                </span>
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
                                    anchor="bottom" //this isn't working
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
                                    anchor="bottom" //this isn't working
                                    onClick = {()=>{handleSelection(user.Coordinates)}}
                                >
                                    <MapMarker color="high" rank={index+1} size={48}/>
                                </Marker>
                            ))}
                        </>
                    }

                    <ParcelLayers billingPeriod={useDebounce(billingPeriod, zoom)} variable={variable}/>

                    <Source
                        id="meter-points"
                        type="vector"
                        url={`pmtiles://${points_url}`}
                    >
                        <Layer
                            id="meter-points-layer"
                            type="circle"
                            source="meter-points"
                            source-layer="OviedoWaterWide"
                            layout={{ visibility: meterLayer ? 'visible' : 'none' }}
                            paint={{
                                'circle-color': [
                                    'interpolate',
                                    ['linear'],
                                    ['get', consump_period],
                                    0, '#30123b',
                                    2, '#4145ab',
                                    5, '#39a2fc',
                                    10, '#1bcfd4',
                                    20, '#24efa2',
                                    35, '#a2fc3c',
                                    50, '#e1dc27',
                                    75, '#f8910b',
                                    100, '#e22f05',
                                    150, '#7a0403',
                                ],
                                'circle-radius': [
                                    'interpolate', ['linear'], ['zoom'],
                                    10, 0.5, // at zoom 10 do radius 2
                                    14, 2,
                                    18, 6
                                ],
                                'circle-stroke-width': 0.5,
                                'circle-stroke-color': '#000000',
                                'circle-opacity': 0.7,
                            }}
                        />
                    </Source>

                </Map>
            </div>
        </>
    )
}