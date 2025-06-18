import React, { useEffect, useState } from "react";

function DBConnectedBadge() {
    const [isUp, setIsUp] = useState(null);

    useEffect(() => {
        fetch("http://localhost:3000/up")
            .then((res) => setIsUp(res.ok))
            .catch(() => setIsUp(false));
    }, []);

    return (
        <p>{isUp ? 
            <span className="rounded-full bg-green-700 px-3 py-1 text-sm font-medium text-white">Connected</span>
            :<span className="rounded-full bg-red-800 px-3 py-1 text-sm font-medium text-white">Disconnected</span>}</p>
    );
}

export default DBConnectedBadge;