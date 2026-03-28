interface MarkerProps {
    color: string
    rank: number;
    size: number;
}

export default function MapMarker({color, rank, size}:MarkerProps){
    return(
        <>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" width={size} height={size} overflow="visible">
                <path
                    fill={color === "low" ? "#4145ab" : "#7a0403"}
                    stroke="black"
                    strokeWidth="0.5"
                    d="M10 0C6.13 0 3 2.98 3 6.67 3 10.35 10 20 10 20s7-9.65 7-13.33S13.86 0 10 0m0 10c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3"
                />
                <circle
                    cx="10"
                    cy="7"
                    r="4"
                    fill="white"
                />
                <text
                    x="10"
                    y="7.5"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="black"
                    fontSize="7"
                    fontWeight="bold"
                >
                    {rank}
                </text>
            </svg>
        </>
    )
}