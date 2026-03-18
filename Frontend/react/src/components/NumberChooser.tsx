import { useState } from 'react';

export default function NumberChooser() {
    const [numParcels, setNumParcels] = useState(1);
    const validateNumParcels = () => {
        let validatedValue = Math.max(1, Math.min(30, numParcels));
        setNumParcels(Number(validatedValue));
    }

    return(
        <label className = "block" htmlFor="Number"><b>Number of properties (1–30):</b>
            <input className = "uk-input"
                   type="number"
                   name="Number"
                   id="quantity"
                   min="1"
                   max="30"
                   value={numParcels === 0 ? "" : numParcels} // prevent people from entering ugly leading 0's
                   step="1"
                   onChange={(e)=>setNumParcels(Number(parseInt(e.target.value, 10)))}
                   onBlur={validateNumParcels}
            />
        </label>
    )
}