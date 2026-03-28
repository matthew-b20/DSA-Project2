import { useState, useContext } from 'react';
import { MapContext, type MapContextType } from './MapVariablesProvider.tsx';

export default function NumberChooser() {
    const { num : numParcels, setNum : setNumParcels } = useContext(MapContext) as MapContextType; //this line is unhappy without the "as MapContextType"
    const [inputVal, setInputVal] = useState("5");

    const validateNumParcels = () => {
        const parsed = parseInt(inputVal, 10);
        const validatedValue = isNaN(parsed) ? 1 : Math.max(1, Math.min(30, parsed));
        setInputVal(String(validatedValue));
        setNumParcels(validatedValue);
    }

    return(
        <>
            <label className="block" htmlFor="Number">
                <div className="flex items-center gap-2">
                    {/*
                    <a href="#num-info-modal" data-uk-toggle="target: #num-info-modal">
                        <img src="../assets/info.png" alt="Number of properties info" width="16" height="16"/>
                    </a>
                    */}
                    <b>Number of Users (1–30):</b>
                </div>

                <input className="uk-input"
                       type="number"
                       name="Number"
                       id="quantity"
                       min="1"
                       max="30"
                       value={inputVal === "0" ? "" : inputVal} // prevent people from entering ugly leading 0's
                       step="1"
                       onChange={(e) => setInputVal(e.target.value)}
                       onBlur={validateNumParcels}
                />
            </label>

            <div id="num-info-modal" className="uk-flex-top" data-uk-modal>
                <div className="uk-modal-dialog uk-modal-body uk-margin-auto-vertical">
                    <p>
                        Specify the number of property parcels you would like to receive from your search.
                        If you are searching for both minimum and maximum users, you will receive this number each of
                        both minimum and maximum users.
                    </p>
                </div>
            </div>
        </>
    )
}