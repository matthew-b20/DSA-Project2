import { MapContext, type MapContextType } from './MapVariablesProvider.tsx';
import { useContext } from 'react';

export default function LayersHandler() {
    const {parcelLayer, setParcelLayer, meterLayer, setMeterLayer,} = useContext(MapContext) as MapContextType;

    return (
        <fieldset className="flex flex-col gap-1">
            <legend><b>Layer visibility: </b></legend>
            <label>
                <input className="uk-checkbox" type="checkbox" checked={meterLayer} onChange={() => setMeterLayer(!meterLayer)} />
                <span> Water meters</span>
            </label>
            <label>
                <input className="uk-checkbox" type="checkbox" checked={parcelLayer} onChange={() => setParcelLayer(!parcelLayer)} />
                <span> Property parcels</span>
            </label>
        </fieldset>
    )
}