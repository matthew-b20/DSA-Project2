//This file will hold all the Sidebar components that filter & control the map, once those components are made
import { useState, useContext } from 'react';
import { MapContext, type MapContextType } from './MapVariablesProvider.tsx';
import RequestButton from  './RequestButton.tsx';
import NumberChooser from  './NumberChooser.tsx';
import WaterChooser from  './WaterChooser.tsx';
import MinMaxChooser from  './MinMaxChooser.tsx';
import LayersHandler from './LayersHandler.tsx';
import ZeroExcluder from './ZeroExcluder.tsx';
import CategoryChooser from './CategoryChooser.tsx';
import ReturnedUsers from './ReturnedUsers.tsx';
import SubdivisionChooser from './SubdivisionChooser.tsx';
import Slider from './Slider.tsx';
import UseAnimations from "react-useanimations";
import menu2 from 'react-useanimations/lib/menu2';

export default function Sidebar() {
    const { billingPeriod, num, variable, method, propertyCat, excludeZeroes, subdiv} = useContext(MapContext) as MapContextType;

    //console.log() is showing that they're objects w/ a default property so it has to be extracted???
    const Animation = (UseAnimations as any).default || UseAnimations;
    const menuAnimationData = (menu2 as any).default || menu2;

    const [isOpen, setIsOpen] = useState(false);

    return(
        <>
            { /* the menu icon isn't animating -- IDK why */}
            <button className="absolute uk-btn uk-btn-primary top-4 left-0 px-2 py-6 rounded-l-none z-1"
                    style={{'--uk-btn-primary-hover-bg': 'hsl(var(--primary))'} as React.CSSProperties} //stops button from turning translucent on hover
                    type="button"
                    data-uk-toggle="target: #sidebar-container"
                    onClick={() => {
                        setIsOpen(!isOpen)
                    }}
            >
                <Animation animation={menuAnimationData}
                           reverse={isOpen}
                           size={32}
                           speed={1.5}
                />
            </button>

            <div id="sidebar-container" className="uk-offcanvas !visible"
                 data-uk-offcanvas="bg-close: false; mode: push">

                <div className="uk-offcanvas-bar px-6 py-6 z-1 overscroll-none">
                    {/*HEADER*/}
                    <h1 className="uk-h1 text-secondary mb-4"><b>The Oviedo Water Atlas</b></h1>

                    {/* TABS!! */}
                    <ul className="uk-tab" uk-tab="connect: #sidebar-tabs">
                        <li className="uk-active"><a href="#">Filters</a></li>
                        <li><a href="#">Results</a></li>
                    </ul>
                    <br/>

                    {/* TAB CONTENT */}
                    <ul id="sidebar-tabs" className="uk-switcher uk-margin">
                        <li>
                            <LayersHandler/>
                            <br/>

                            <NumberChooser/>
                            <br/>

                            <Slider/>
                            <br/>

                            <div className="px-0 py-0 grid grid-cols-2 gap-2">
                                <WaterChooser/>
                                <MinMaxChooser/>
                            </div>
                            <br/>

                            <CategoryChooser/>
                            <br/>

                            <SubdivisionChooser/>
                            <br/>

                            <ZeroExcluder/>
                            <br/>
                            <br/>

                            <RequestButton
                                billing_period={billingPeriod}
                                num={num}
                                variable={variable}
                                method={method}
                                category={propertyCat}
                                exclude={excludeZeroes}
                                subdiv={subdiv}
                            />
                        </li>

                        <li>
                            <ReturnedUsers/>
                        </li>
                    </ul>
                </div>
            </div>
        </>
    )
}