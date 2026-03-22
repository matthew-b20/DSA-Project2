import {useState} from "react";

export default function BarChartPopup(){
    //when parcel clicked on...
    //slide out from the right side of the screen
    //show: Address
    //Location Code
    //Usage per month
    //Hoverable bar chart
    const [isOpen, setIsOpen] = useState(false);

    return(
        <>
            <button className = "absolute uk-btn uk-btn-primary top-100 left-0 px-2 py-6 rounded-l-none z-1"
                    style={{ '--uk-btn-primary-hover-bg': 'hsl(var(--primary))' } as React.CSSProperties} //stops button from turning translucent on hover
                    type="button"
                    data-uk-toggle="target: #barchart-container"
                    onClick = {()=>{setIsOpen(!isOpen)}}
            />
            <div id = "barchart-container" className="uk-offcanvas !visible" data-uk-offcanvas="bg-close: false; mode: slide; flip: true">
                <div className = "uk-offcanvas-bar h-[302px] top-56 rounded-bl-xl rounded-tl-xl px-6 py-6 z-1 overscroll-none">
                </div>
            </div>
        </>
    )
}