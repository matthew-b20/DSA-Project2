import {useState} from 'react'

interface RequestButtonProps{
    num: number;
    billing_period: number;
    method: string;
    variable: string;
}

//THIS BUTTON MAKES A REQUEST TO THE CROW SERVER BASED ON THE BASSED IN PROPS
//THIS WILL NEED TO BE UPDATED LATER OFC
export default function RequestButton({num, method}: RequestButtonProps) {
    const [return_message, setReturnMessage] = useState("Please make a request"); //extract stuff from the JSON

    const makeRequest = async () => {
        const endpoint = `http://localhost:18080/${num}/${method}`; //Crow server url

        try{
            const server_response = await fetch(endpoint);
            const response_JSON = await server_response.json();
            const returned_string = response_JSON.placeholder;
            setReturnMessage(returned_string);
        }
        catch(error){
            setReturnMessage("There has been an error");
        }
    }

    return (
        <>
            <button className = "uk-btn uk-btn-default mb-4" onClick = {makeRequest}>Make Request</button>
            <p className = "mb-4">{return_message}</p>
        </>
    )
}