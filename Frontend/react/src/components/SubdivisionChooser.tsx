import { useContext } from 'react';
import { MapContext, type MapContextType } from './MapVariablesProvider.tsx';
import subdivisionJSON from "./SubdivisionCodes.json";

const toTitleCase = (str) => {
    return str
        .toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
};

export default function SubdivisionChooser() {
    const { subdiv, setSubdiv } = useContext(MapContext) as MapContextType; //this line is unhappy without the "as MapContextType"

    return(
        <>
            <label htmlFor="method-select"><b>Subdivision:</b></label>
            <div className="uk-form-controls">
                <select
                    className="uk-select"
                    id="method-select"
                    onChange={(e)=>{setSubdiv(e.target.value)}}
                >
                    <option value="All">
                        All Categories
                    </option>
                    {
                        subdivisionJSON.map(({FullCode, Description } : { FullCode: string, Description: string }) => (
                            <option key={FullCode} value={FullCode}>
                                {toTitleCase(Description)}
                            </option>
                        ))
                    }
                </select>
            </div>
        </>
    )
}