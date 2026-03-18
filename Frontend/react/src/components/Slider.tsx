import { useState } from 'react';

export default function Slider() {
    const [billingPeriod, setBillingPeriod] = useState(1);

    return(
        <label className="block" htmlFor="Billing period slider"><b>Billing period: </b>
            <span className="uk-badge">{billingPeriod}</span>
            <input
                id="Billing period slider"
                type="range"
                className="uk-range"
                label={true}
                min="1"
                max="10"
                step="1"
                value={billingPeriod}
                onChange={(e) => setBillingPeriod(Number(e.target.value))}
            />
        </label>
    )
}

