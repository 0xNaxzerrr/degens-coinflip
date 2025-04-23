import type { SVGProps } from "react"

export function Wallet(props: SVGProps<SVGSVGElement>) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            {...props}
        >
            <path d="M2 6a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6z" />
            <path d="M18 12h4" />
            <circle cx="18" cy="12" r="2" />
        </svg>
    )
}

export function Coin(props: SVGProps<SVGSVGElement>) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            {...props}
        >
            <circle cx="12" cy="12" r="10" />
            <path d="M12 6v12" />
            <path d="M8 10h8" />
            <path d="M8 14h8" />
        </svg>
    )
}

export function Banana(props: SVGProps<SVGSVGElement>) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
            <path d="M21.45,10.89c-2.27.46-5.42,1-8.9,1.17a13.41,13.41,0,0,0,3.75,3.4,13.37,13.37,0,0,0-6.56-2.86,12.3,12.3,0,0,0-6.74.71c-.52.22-.52.52,0,.74a12.3,12.3,0,0,0,6.74.71,13.37,13.37,0,0,0,6.56-2.86,13.41,13.41,0,0,0-3.75,3.4c3.48.21,6.63.71,8.9,1.17a.5.5,0,0,0,.55-.45V11.34A.5.5,0,0,0,21.45,10.89Z" />
        </svg>
    )
}

export function Phantom(props: SVGProps<SVGSVGElement>) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" fill="currentColor" {...props}>
            <path d="M64 0C28.7 0 0 28.7 0 64c0 35.3 28.7 64 64 64 35.3 0 64-28.7 64-64C128 28.7 99.3 0 64 0zm0 101.8c-20.8 0-37.8-17-37.8-37.8S43.2 26.2 64 26.2c20.8 0 37.8 17 37.8 37.8S84.8 101.8 64 101.8z" />
        </svg>
    )
}

export function Solflare(props: SVGProps<SVGSVGElement>) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" fill="currentColor" {...props}>
            <path d="M64 0C28.7 0 0 28.7 0 64c0 35.3 28.7 64 64 64 35.3 0 64-28.7 64-64C128 28.7 99.3 0 64 0zm-9.4 86.3L36.2 64l18.4-22.3 18.4 22.3-18.4 22.3zm9.4-45.1L45.6 64l18.4 22.8L82.4 64 64 41.2z" />
        </svg>
    )
}

export function Backpack(props: SVGProps<SVGSVGElement>) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" fill="currentColor" {...props}>
            <path d="M96 32H32c-8.8 0-16 7.2-16 16v48c0 8.8 7.2 16 16 16h64c8.8 0 16-7.2 16-16V48c0-8.8-7.2-16-16-16zm-8 64H40c-4.4 0-8-3.6-8-8V56c0-4.4 3.6-8 8-8h48c4.4 0 8 3.6 8 8v32c0 4.4-3.6 8-8 8z" />
        </svg>
    )
}
