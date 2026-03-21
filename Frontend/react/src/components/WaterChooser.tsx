import { useContext } from 'react';
import { MapContext, type MapContextType } from './MapVariablesProvider.tsx';

export default function WaterChooser(){
    const { variable: waterType, setVariable: setWaterType } = useContext(MapContext) as MapContextType;

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