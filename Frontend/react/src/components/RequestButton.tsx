import { useState } from 'react';
import UseAnimations from "react-useanimations";
import loading from 'react-useanimations/lib/loading';
import { useMap } from 'react-map-gl/maplibre';

interface RequestButtonProps{
    billing_period: number;
    num: number;
    variable: string;
    method: string;
}

interface User {
    Address: string;
    LocationCode: string;
    Consump: number;
    Coordinates: number[];
}
interface ReturnJSON{
    DataStructure: string;
    BillingPeriod: number;
    Number: number;
    VariableOfInterest: string;
    Method: string;
    Time: number;
    MinUsers?: User[];
    MaxUsers?: User[];
}

//THIS BUTTON MAKES A REQUEST TO THE CROW SERVER BASED ON THE BASSED IN PROPS
//THIS WILL NEED TO BE UPDATED LATER OFC
export default function RequestButton({billing_period, num, variable, method}: RequestButtonProps) {
    const Animation = (UseAnimations as any).default || UseAnimations;
    const loadingAnimationData = (loading as any).default || loading;

    const [returnJSON, setReturnJSON] = useState<ReturnJSON[] | null>(null);
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

            <hr className="uk-hr border-t-2 border-primary" />
            <br/>

            {/* TIME ELAPSED BADGES */}
            {returnJSON &&
                <>
                    <p><b>Min-Max Heap Time: </b><span className="uk-badge uk-badge-primary">{returnJSON[0].Time} ns</span></p>
                    <p><b>Deap Time: </b><span className="uk-badge uk-badge-primary">{returnJSON[1].Time} ns</span></p>
                </>
            }



            {/* LOWEST USERS LISTING */}
            {returnJSON && returnJSON[0].MinUsers && (method === "Min" || method === "Both") &&
                <>
                    <br/>
                    <h2><b>Lowest {num} Users</b></h2>
                    {returnJSON[0].MinUsers.map((user, index )=> (
                        <ul key = {index}
                            className = "uk-card uk-card-body my-2 mx-2 py-2 px-3"
                            onClick = {()=>{handleSelection(user.Coordinates)}}
                        >
                            <b>{index+1}. {user.Address}</b> | {user.Consump} kGal
                        </ul>
                    ))}
                </>
            }

            {/* HIGHEST USERS LISTING */}
            {returnJSON && returnJSON[0].MaxUsers && (method === "Max" || method === "Both") &&
                <>
                    <br/>
                    <h2><b>Highest {num} Users</b></h2>
                    {returnJSON[0].MaxUsers.map((user, index )=> (
                        <ul key = {index}
                            className = "uk-card uk-card-body my-2 mx-2 py-2 px-3"
                            onClick = {()=>{handleSelection(user.Coordinates)}}
                        >
                            <b>{index+1}. {user.Address}</b> | {user.Consump} kGal
                        </ul>
                    ))}
                </>
            }
        </>
    )
}