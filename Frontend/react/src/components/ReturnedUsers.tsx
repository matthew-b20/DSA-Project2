import {useContext} from 'react';
import MapMarker from './MapMarker.tsx';
import { useMap } from 'react-map-gl/maplibre';
import { MapContext, type MapContextType } from './MapVariablesProvider.tsx';

export default function ReturnedUsers(){
    const {returnJSON, method } = useContext(MapContext) as MapContextType;
    const { map } = useMap();

    const handleSelection = (coordinates : number[]) => {
        map.flyTo({center: coordinates, zoom: 18})
    }

    return(
        <>

            {/* TIME ELAPSED BADGES */}
            {returnJSON &&
                <>
                    <h4 className = "uk-h4 text-primary mb-2">Performance</h4>
                    <p><b>Min-Max Heap: </b><span className="uk-badge uk-badge-primary pointer-events-none">{returnJSON[0].Time} sec</span></p>
                    <p><b>Deap: </b><span className="uk-badge uk-badge-primary pointer-events-none">{returnJSON[1].Time} sec</span></p>
                    <hr className="uk-hr my-8"/>
                </>
            }



            {returnJSON &&
                <h4 className = "uk-h4 text-primary mb-2">Returned Users</h4>}

            {/* PLACEHOLDER MESSAGE */}
            {!returnJSON &&
                <>
                    <div className="flex justify-center items-center py-4">
                        <div className="z-30 transform hover:-translate-y-1 transition-transform">
                            <MapMarker color="low" rank={1} size={48}/>
                        </div>
                        {/* Negative margins overlay the margins */}
                        <div className="z-20 -ml-6 transform hover:-translate-y-1 transition-transform">
                            <MapMarker color="high" rank={2} size={48}/>
                        </div>
                        <div className="z-10 -ml-6 transform hover:-translate-y-1 transition-transform">
                            <MapMarker color="low" rank={3} size={48}/>
                        </div>
                    </div>

                    <p className="text-center text-muted-foreground px-4">The results of your search will appear here. To adjust search filters, please go to the 'Filters' tab.</p>
                </>
            }

            {/* LOWEST USERS LISTING */}
            {returnJSON && returnJSON[0].MinUsers && (method === "Min" || method === "Both") &&
                <>
                    <h2><b>Lowest {returnJSON[0].Number} Users</b></h2>
                    {returnJSON[0].MinUsers.map((user, index )=> (
                        <div className="flex items-center gap-0">
                            <MapMarker color="low" rank={index+1} size={28}/>
                            <div key = {index}
                                 className = "w-full uk-card uk-card-body my-2 mx-2 py-2 px-3 hover:cursor-[url('/assets/marker-cursor.svg')_16_16,_auto]"
                                 onClick = {()=>{handleSelection(user.Coordinates)}}
                            >
                                <b>{user.Address}</b> | {user.Consump} kGal
                            </div>
                        </div>
                    ))}
                </>
            }

            {/* HIGHEST USERS LISTING */}
            {returnJSON && returnJSON[0].MaxUsers && (method === "Max" || method === "Both") &&
                <>
                    <br/>
                    <h2><b>Highest {returnJSON[0].Number} Users</b></h2>
                    {returnJSON[0].MaxUsers.map((user, index )=> (
                        <div className="flex items-center gap-0">
                            <MapMarker color="high" rank={index+1} size={28}/>
                            <div key = {index}
                                 className = "w-full uk-card uk-card-body my-2 mx-2 py-2 px-3 hover:cursor-[url('/assets/marker-cursor.svg')_16_16,_auto]"
                                 onClick = {()=>{handleSelection(user.Coordinates)}}
                            >
                                <b>{user.Address}</b> | {user.Consump} kGal
                            </div>
                        </div>
                    ))}
                </>
            }
        </>
    )
}