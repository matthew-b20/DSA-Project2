import { useState, useContext } from 'react';
import { MapContext, type MapContextType } from './MapVariablesProvider.tsx';
import UseAnimations from "react-useanimations";
import loading from 'react-useanimations/lib/loading';
import MapMarker from './MapMarker.tsx';
import { useMap } from 'react-map-gl/maplibre';

interface RequestButtonProps{
    billing_period: number;
    num: number;
    variable: string;
    method: string;
}

//THIS BUTTON MAKES A REQUEST TO THE CROW SERVER BASED ON THE BASSED IN PROPS
//THIS WILL NEED TO BE UPDATED LATER OFC
export default function RequestButton({billing_period, num, variable, method}: RequestButtonProps) {
    const Animation = (UseAnimations as any).default || UseAnimations;
    const loadingAnimationData = (loading as any).default || loading;

    const { returnJSON, setReturnJSON } = useContext(MapContext) as MapContextType;
    const [isLoading, setLoading] = useState(false);

    const { map } = useMap();

    const handleSelection = (coordinates : number[]) => {
        map.flyTo({center: coordinates, zoom: 18})
    }

    const makeRequest = async () => {
        const min_max_endpoint = `/api/minmax/${billing_period}/${num}/${variable}/${method}`; //Crow server url
        const deap_endpoint = `/api/deap/${billing_period}/${num}/${variable}/${method}`;
        
        try{
            setLoading(true);

            //DO REQUESTS
            const [minmaxJSON, deapJSON] = await Promise.all([
                fetch(min_max_endpoint).then(r => r.json()),
                fetch(deap_endpoint).then(r => r.json())
            ]);

            setReturnJSON([minmaxJSON, deapJSON]);
        }
        catch(error){
            console.log(`Crow server request error: ${error}`);
        }
        finally{
            // add delay so you can actually see the loading animation (lol)
            // setTimeout() is built-in -- it executes the given function after the given (non-blocking) delay
            setTimeout(() => {
                setLoading(false);
            }, 1500);
        }
    }

    return (
        <>
            <button className = "uk-btn uk-btn-default mb-4" onClick = {makeRequest}>
                {isLoading ? <Animation animation={loadingAnimationData} size={20}/> :
                    <img src={'../assets/filter.svg'} alt="filter" width="20" height="20" />}
                <p>Apply Filters</p>
            </button>

            {/* TIME ELAPSED BADGES */}
            {returnJSON &&
                <>
                    <hr className="h-[2px] border-none" style={{ backgroundColor: "#00adb0" }}/>
                    <br/>

                    <h4 className = "uk-h4 text-primary mb-4">Performance</h4>
                    <p><b>Min-Max Heap: </b><span className="uk-badge uk-badge-primary pointer-events-none">{returnJSON[0].Time} ns</span></p>
                    <p><b>Deap: </b><span className="uk-badge uk-badge-primary pointer-events-none">{returnJSON[1].Time} ns</span></p>

                    <br/>
                    <hr className="h-[2px] border-none" style={{ backgroundColor: "#00adb0" }}/>
                    <br/>
                </>
            }



            {returnJSON &&
                <h4 className = "uk-h4 text-primary">Returned Users</h4>}

            {/* LOWEST USERS LISTING */}
            {returnJSON && returnJSON[0].MinUsers && (method === "Min" || method === "Both") &&
                <>
                    <br/>
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