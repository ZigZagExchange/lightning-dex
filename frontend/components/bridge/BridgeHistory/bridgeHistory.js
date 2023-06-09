import { useState, useEffect } from 'react';

function BridgeHistory() {
    const [responseData, setResponseData] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('/api/history', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ address: '0x8cBd3259c95239f571456bfce2326E121f11d6a6' }),
                });

                if (response.ok) {
                    const data = await response.json();
                    setResponseData(data);
                } else {
                    // Handle non-successful response
                    console.error('Request failed with status:', response.status);
                }
            } catch (error) {
                // Handle fetch error
                console.error('Request failed:', error);
            }
        };

        fetchData();
    }, []);

    return (
        <div>
            {/* Render the response data */}
            {responseData ? (
                <pre>{JSON.stringify(responseData, null, 2)}</pre>
            ) : (
                <p>Loading...</p>
            )}
        </div>
    );
}

export default BridgeHistory;