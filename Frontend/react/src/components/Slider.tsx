import { useContext } from 'react';
import { MapContext, type MapContextType } from './MapVariablesProvider.tsx';

export default function Slider() {
    const { billingPeriod, setBillingPeriod } = useContext(MapContext) as MapContextType;

    return(
        <label className="block" htmlFor="Billing period slider">
            <div className="flex items-center gap-1">
                {/*
                <a href="#bill-info-modal" data-uk-toggle="target: #bill-info-modal">
                    <img src="../assets/info.png" alt="Number of properties info" width="16" height="16"/>
                </a>
                */}
                <b>2025 Billing period: </b>
                <span className="uk-badge">{billingPeriod}</span>
            </div>

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

