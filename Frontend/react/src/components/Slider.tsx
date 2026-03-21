import { useContext } from 'react';
import { MapContext, type MapContextType } from './MapVariablesProvider.tsx';

export default function Slider() {
    const { billingPeriod, setBillingPeriod } = useContext(MapContext) as MapContextType;

    return(
        <label className="block" htmlFor="Billing period slider"><b>Billing period: </b>
            <span className="uk-badge">{billingPeriod}</span>
            <input
                id="Billing period slider"
                type="range"
                className="uk-range"
                min="1"
                max="8"
                step="1"
                value={billingPeriod}
                onChange={(e) => setBillingPeriod(Number(e.target.value))}
            />
        </label>
    )
}

