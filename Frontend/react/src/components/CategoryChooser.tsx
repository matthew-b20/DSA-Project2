import { useContext } from 'react';
import { MapContext, type MapContextType } from './MapVariablesProvider.tsx';

export default function NumberChooser() {
    const { setPropertyCat } = useContext(MapContext) as MapContextType; //this line is unhappy without the "as MapContextType"

    return(
        <>
            <label htmlFor="method-select"><b>Property category:</b></label>
            <div className="uk-form-controls">
                <select
                    className="uk-select"
                    id="method-select"
                    onChange={(e)=>{setPropertyCat(e.target.value)}}
                >
                    <option value="All">
                        All Categories
                    </option>

                    <option value="Residential">
                        Residential
                    </option>

                    <option value="Commercial">
                        Commercial
                    </option>

                    <option value="Public">
                        Public
                    </option>

                    <option value="Shell">
                        Shell
                    </option>

                    <option value="Misc">
                        Miscellaneous
                    </option>

                </select>
            </div>
        </>
    )
}