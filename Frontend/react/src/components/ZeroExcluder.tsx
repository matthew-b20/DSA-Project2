import { MapContext, type MapContextType } from './MapVariablesProvider.tsx';
import { useContext } from 'react';

export default function ZeroExcluder() {
    const {excludeZeroes, setExcludeZeroes} = useContext(MapContext) as MapContextType;

    return (
        <label>
            <input
                className="uk-checkbox"
                type="checkbox"
                checked={excludeZeroes}
                onChange={() => setExcludeZeroes(!excludeZeroes)}
            />
            <span> Exclude properties with zero consumption?</span>
        </label>
    )
}