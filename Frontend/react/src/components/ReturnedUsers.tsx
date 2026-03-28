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

    //For making addresses not all-caps:
    const toTitleCase = (str) => {
        return str
            .toLowerCase()
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    };

    return(
        <>

            {/* TIME ELAPSED BADGES */}
            {returnJSON &&
                <>
                    <p><b>Min-Max Heap: </b><span className="uk-badge uk-badge-primary pointer-events-none">{returnJSON[0].Time/1000} sec</span></p>
                    <p><b>Deap: </b><span className="uk-badge uk-badge-primary pointer-events-none">{returnJSON[1].Time/1000} sec</span></p>
                    <hr className="uk-hr my-8"/>
                </>
            }

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
                    <span className="text-s font-medium text-muted-foreground uppercase">
                        Bill {returnJSON[0].BillingPeriod}: {returnJSON[0].VariableOfInterest} Usage
                    </span>
                    {returnJSON[0].MinUsers.map((user, index )=> (
                        <div className="flex items-center gap-0">
                            <MapMarker color="low" rank={index+1} size={28}/>
                            <div key = {index}
                                 className = "w-full uk-card uk-card-body my-2 mx-2 py-2 px-3 border border-slate-200 border-l-4 border-l-[#4145AB] pl-4 hover:cursor-[url('/assets/marker-cursor.svg')_16_16,_auto]"
                                 onClick = {()=>{handleSelection(user.Coordinates)}}
                            >
                                <div className="flex flex-col gap-0.5">
                                    <p className="text-xl text-[#4145AB] font-bold tracking-tight">
                                        {user.Consump.toFixed(2)}
                                        <span className="text-xs font-medium ml-1 text-muted-foreground uppercase">kGal</span>
                                    </p>
                                    <p className="text-sm font-medium text-secondary-foreground/80">
                                        {toTitleCase(user.Address)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                    {
                        returnJSON[0].MinUsers.length === 0 ? (
                            <p>
                                Your query returned no matches. If you would like to try a different query,
                                please adjust your filters in the 'Filters' tab.
                            </p>
                        ) : null
                    }
                </>
            }

            {/* HIGHEST USERS LISTING */}
            {returnJSON && returnJSON[0].MaxUsers && (method === "Max" || method === "Both") &&
                <>
                    {returnJSON[0].MinUsers && <br/> /*conditional spacing*/}
                    <h2><b>Highest {returnJSON[0].Number} Users</b></h2>
                    <span className="text-s font-medium text-muted-foreground uppercase">
                        Bill {returnJSON[0].BillingPeriod}: {returnJSON[0].VariableOfInterest} Usage
                    </span>
                    {returnJSON[0].MaxUsers.map((user, index )=> (
                        <div className="flex items-center gap-0">
                            <MapMarker color="high" rank={index+1} size={28}/>
                            <div key = {index}
                                 className = "w-full uk-card uk-card-body my-2 mx-2 py-2 px-3 border border-slate-200 border-l-4 border-l-[#7A0403] pl-4 hover:cursor-[url('/assets/marker-cursor.svg')_16_16,_auto]"
                                 onClick = {()=>{handleSelection(user.Coordinates)}}
                            >
                                <div className="flex flex-col gap-0.5">
                                    <p className="text-xl text-[#7A0403] font-bold tracking-tight">
                                        {user.Consump.toFixed(2)}
                                        <span className="text-xs font-medium ml-1 text-muted-foreground uppercase">kGal</span>
                                    </p>
                                    <p className="text-sm font-medium text-secondary-foreground/80">
                                        {toTitleCase(user.Address)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                    {
                        returnJSON[0].MaxUsers.length === 0 ? (
                            <p>
                                Your query returned no matches. If you would like to try a different query,
                                please adjust your filters in the 'Filters' tab.
                            </p>
                        ) : null
                    }
                </>
            }
        </>
    )
}