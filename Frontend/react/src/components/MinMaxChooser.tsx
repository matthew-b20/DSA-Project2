import { useState } from 'react';

export default function MinMaxChooser(){
    const [searchType, setSearchType] = useState("Min");

    return(
        <label className="block" htmlFor="Search Chooser"><b>Search type:</b>

            <label className="block">
                <input className="uk-radio mr-2"
                       type="radio"
                       name="min max radio"
                       value="Min"
                       checked={searchType=="Min"}
                       onChange={(e) => setSearchType(e.target.value)}
                />
                Lowest users
            </label>

            <label className="block">
                <input className="uk-radio mr-2"
                       type="radio"
                       name="min max radio"
                       value="Max"
                       checked={searchType=="Max"}
                       onChange={(e) => setSearchType(e.target.value)}
                />
                Highest users
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