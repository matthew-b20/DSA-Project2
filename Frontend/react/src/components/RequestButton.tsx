import {useState} from 'react'
import UseAnimations from "react-useanimations";
import loading from 'react-useanimations/lib/loading';

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

    const [return_message, setReturnMessage] = useState("Please make a request"); //extract stuff from the JSON
    const [isLoading, setLoading] = useState(false);

    const makeRequest = async () => {
        const endpoint = `/api/minmax/${billing_period}/${num}/${variable}/${method}`; //Crow server url

        try{
            setLoading(true);
            const server_response = await fetch(endpoint);
            const response_JSON = await server_response.json();
            const returned_string = response_JSON.Method; //placeholder for now
            setReturnMessage(returned_string);
        }
        catch(error){
            setReturnMessage("There has been an error");
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
            <p className = "mb-4">{return_message}</p>
        </>
    )
}