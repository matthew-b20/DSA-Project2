//This file will hold all the Sidebar components that filter & control the map, once those components are made

import RequestButton from  './RequestButton.tsx'

export default function Sidebar() {
    return(
        <>
            <button className = "uk-btn uk-btn-primary"
                    type="button"
                    data-uk-toggle="target: #sidebar-container">
                Filter
            </button>

            <div id = "sidebar-container" className="uk-offcanvas" data-uk-offcanvas = "bg-close: false">
                <div className = "uk-offcanvas-bar px-4 py-4">
                    <h1 className = "uk-h1 text-primary mb-4">The Oviedo Water Atlas</h1>
                    <RequestButton
                        num={10}
                        billing_period={1}
                        method="max"
                        variable="potable usage"
                    />
                    <button className = "uk-btn uk-btn-primary"
                            type="button"
                            data-uk-toggle="target: #sidebar-container">
                        Close Filters
                    </button>
                </div>
            </div>
        </>
    )
}