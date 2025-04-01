import React from "react";

export default function Button({ label, onClick, className = 'button' }) {
    const [isTouching, setIsTouching] = React.useState(false);

    function handlePointerDown(e) {
        setIsTouching(true);
    }

    function handlePointerUp(e) {
        if (!isTouching)
            return;

        onClick();
        setIsTouching(false);
    }

    function handlePointerLeave(e) {
        setIsTouching(false);
    }

    return (
        <button className={className}
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerLeave} >
            {label}
        </button>
    )
}
