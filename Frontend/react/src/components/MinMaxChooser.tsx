import { useContext } from 'react';
import { MapContext, type MapContextType } from './MapVariablesProvider.tsx';

export default function MinMaxChooser(){
    const { method: searchType, setMethod: setSearchType } = useContext(MapContext) as MapContextType;

    return(
        <label className="block" htmlFor="Search Chooser">
            <div className="flex items-center gap-2">
                {/*
                <a href="#bill-info-modal" data-uk-toggle="target: #bill-info-modal">
                    <img src="../assets/info.png" alt="Number of properties info" width="16" height="16"/>
                </a>
                */}
                <b>User type: </b>
            </div>

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