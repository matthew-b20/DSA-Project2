import { useContext } from 'react';
import { MapContext, type MapContextType } from './MapVariablesProvider.tsx';

export default function MinMaxChooser(){
    const { method: searchType, setMethod: setSearchType } = useContext(MapContext) as MapContextType;

    return(
        <label className="block" htmlFor="Search Chooser"><b>User type:</b>

            <label className="block">
                <input className="uk-radio mr-2"
                       type="radio"
                       name="min max radio"
                       value="Min"
                       checked={searchType=="Min"}
                       onChange={(e) => setSearchType(e.target.value)}
                />
                Lowest
            </label>

            <label className="block">
                <input className="uk-radio mr-2"
                       type="radio"
                       name="min max radio"
                       value="Max"
                       checked={searchType=="Max"}
                       onChange={(e) => setSearchType(e.target.value)}
                />
                Highest
            </label>

            <label className="block">
                <input className="uk-radio mr-2"
                       type="radio"
                       name="min max radio"
                       value="Both"
                       checked={searchType=="Both"}
                       onChange={(e) => setSearchType(e.target.value)}
                />
                Both
            </label>
        </label>
    )
}