import { useState, useContext, useMemo, useEffect } from 'react';
import { MapContext, type MapContextType } from './MapVariablesProvider.tsx';
import { useMap } from 'react-map-gl/maplibre';
/* ^ useEffect will load the data in the background after the initial render
so that the other stuff doesn't have to wait on it */
export default function Searchbar(){
    const [query, setQuery] = useState("");
    const [selectedParcel, setSelectedParcel] = useState(null);
    const [geoJsonData, setGeoJsonData] = useState(null);
    const [isFocused, setIsFocused] = useState(false);
    const { billingPeriod, setPopup } = useContext(MapContext) as MapContextType;
    const { map } = useMap();

    //load data ONCE
    useEffect(()=> {
        fetch("/OviedoWaterSearchbar.json")
            .then((res)=>res.json())
            .then((data)=>setGeoJsonData(data))
            .catch((err) => console.error("Search data failed to load", err))
    }, []) //empty dependency array means it should only need to load 1X

    const suggestions = useMemo(()=> {
        if (!geoJsonData || query.length < 2) return []; // don't bother for 1 letter; also don't run if geoJsonData isn't loaded yet!!
        const lowerQuery = query.toLowerCase();

        return geoJsonData.features
            .filter(feature =>
                feature.properties.Address?.toString().toLowerCase().includes(lowerQuery))
            .slice(0, 5) //don't want to show too many results

    }, [query]) // dependency array of only query says to only recalculate if query changes

    const handleSelection = (feature) => {
        setSelectedParcel(feature);
        setQuery(feature.properties.Address);
        map.flyTo({center: feature.geometry.coordinates, zoom: 18})

        map.once('moveend', () => {
            //returns array of parcels that match LocationCode, which will be exactly one parcel
            const parcel = map.querySourceFeatures('parcel-source',
                {
                    sourceLayer: 'parcels',
                    filter: ['==', 'LocationCode', feature.properties.LocationCode]
                })

            const consump_period = "Consump" + billingPeriod;
            const [lng, lat] = feature.geometry.coordinates

            setPopup({
                lngLat: {lng, lat}, //should update to center of property point later
                Address: parcel[0].properties.Address,
                LocationCode: parcel[0].properties.LocationCode,
                consump_period: parcel[0].properties[consump_period],
                PropertyCat: parcel[0].properties.PropertyCat,
                PropertyType: parcel[0].properties.PropertyType,
                Bill: billingPeriod
            });
        })
    }

    const showList = suggestions.length > 0 && isFocused;

    return(
        <div className = "fixed top-4 right-4 w-[30vw] min-w-[250px]">
            <img className = "absolute top-3 left-2"
                 src={'../assets/search.svg'}
                 alt="search"
                 width="20"
                 height="20"/>
            <input className="w-full uk-input bg-white pl-8"
                   type="text"
                   placeholder="Search by address..."
                   value = {query}
                   onFocus = {()=>{setIsFocused(true)}}
                   onMouseDown = {()=>{setQuery("")}}
                   onChange = {(e) => {setQuery(e.target.value);
                   setIsFocused(true)}}
                   onBlur = {()=>{setIsFocused(false)}}
            />

            {/*Render the suggestions list*/}
            {showList &&
                (
                    <ul className = "uk-card uk-card-default absolute mt-2 w-full overflow-hidden rounded-md border bg-white z-500">
                        {suggestions.map((feature, index)=> (
                            <div className = "my-2 mx-2">
                                <li
                                    key = {index}
                                    className="p-3 py-2 uk-list-item hover:bg-primary rounded-md cursor-pointer text-sm z-500"
                                    onMouseDown={()=>handleSelection(feature)}>
                                    <b>{feature.properties.Address}</b> | Location Code: {feature.properties.LocationCode}
                                </li>
                            </div>
                            )
                        )}
                    </ul>
                )
            }
        </div>
    )
}