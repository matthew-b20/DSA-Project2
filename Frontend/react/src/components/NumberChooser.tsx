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
        <label className = "block" htmlFor="Number"><b>Number of properties (1–30):</b>
            <input className = "uk-input"
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
    )
}