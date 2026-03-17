//This file will hold all the Sidebar components that filter & control the map, once those components are made

import RequestButton from  './RequestButton.tsx'

export default function Sidebar() {
    return(
        <>
            <button className = "absolute top-4 left-0 rounded-l-none uk-btn uk-btn-primary z-1"
                    type="button"
                    data-uk-toggle="target: #sidebar-container">
                Filter
            </button>
            <div id = "sidebar-container" className="uk-offcanvas !visible" data-uk-offcanvas="bg-close: false; mode: push">

                <div className = "uk-offcanvas-bar !overflow-visible px-6 py-6 z-1">
                    <h1 className = "uk-h1 text-primary mb-4">The Oviedo Water Atlas</h1>
                    <RequestButton
                        num={10}
                        billing_period={1}
                        method="max"
                        variable="potable usage"
                    />
                </div>
            </div>
        </>
    )
}