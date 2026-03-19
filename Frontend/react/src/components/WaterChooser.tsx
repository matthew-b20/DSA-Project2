import { useState } from 'react';

export default function WaterChooser(){
    const [waterType, setWaterType] = useState("Potable");

    return(
        <label className="block" htmlFor="Water Chooser"><b>Water type:</b>

            <label className="block">
                <input className="uk-radio mr-2"
                       type="radio"
                       name="water radio"
                       value="Potable"
                       checked={waterType =="Potable"}
                       onChange={(e) => setWaterType(e.target.value)}
                />
                Potable
            </label>

            <label className="block">
                <input className="uk-radio mr-2"
                       type="radio"
                       name="water radio"
                       value="Reclaimed"
                       checked={waterType =="Reclaimed"}
                       onChange={(e) => setWaterType(e.target.value)}
                />
                Reclaimed
            </label>

            <label className="block">
                <input className="uk-radio mr-2"
                       type="radio"
                       name="water radio"
                       value="Combined"
                       checked={waterType =="Combined"}
                       onChange={(e) => setWaterType(e.target.value)}
                />
                Combined
            </label>
        </label>
    )
}