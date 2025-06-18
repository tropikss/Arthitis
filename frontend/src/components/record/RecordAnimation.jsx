import { useEffect, useState } from "react";

export default function RecordChrono({ paused }) {
    const [seconds, setSeconds] = useState(0);
    const [isGrey, setIsGrey] = useState(false);

    // Chrono logic
    useEffect(() => {
        if (paused) return;
        const timer = setInterval(() => setSeconds((s) => s + 1), 1000);
        return () => clearInterval(timer);
    }, [paused]);

    // Animation logic
    useEffect(() => {
        if (!paused) {
            setIsGrey(false);
            return;
        }
        const anim = setInterval(() => setIsGrey((g) => !g), 1000);
        return () => clearInterval(anim);
    }, [paused]);

    // Format seconds as mm:ss
    const minutes = String(Math.floor(seconds / 60)).padStart(2, "0");
    const secs = String(seconds % 60).padStart(2, "0");

    return (
        <span
            className={`ml-3 font-bold text-color1 transition-colors duration-500`}
            style={{
                color: paused && isGrey ? "#555" : "",
            }}
        >
            {minutes}:{secs}
        </span>
    );
}
