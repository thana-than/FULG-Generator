
import React from 'react';
import { Start } from './appCore.js'
import TwitchAuth from './js/TwitchAuth.jsx'
import Twitch from './js/Twitch.jsx'
import ComfyJS from "comfy.js";

function App() {
    const [username, setUsername] = React.useState(null);
    const [token, setToken] = React.useState(GetToken());
    const [isConnected, setIsConnected] = React.useState(false);
    const ACCESS_KEY = 'access_token';
    const CLIENT_ID = "kv64ab553hk8l0iekzhg6cmg7140x4";

    function GetToken() {
        //* Check for token in url
        const url = new URL(window.location);
        const params = new URLSearchParams(url.search);
        const accessToken = params.get(ACCESS_KEY);

        if (accessToken) { //* Token existed in URL parameter
            localStorage.setItem(ACCESS_KEY, accessToken);
            //* Removes parameters from URL without reloading page
            return accessToken;
        } else {
            //* Check if one was saved locally
            const saved = localStorage.getItem(ACCESS_KEY);
            if (saved) {
                return saved;
            }
        }
        return undefined;
    }

    //* Fetch the username once we have the token
    React.useEffect(() => {
        if (token) {
            const fetchUsername = async () => {
                const response = await fetch('https://api.twitch.tv/helix/users', {
                    headers: {
                        'Client-ID': CLIENT_ID,
                        'Authorization': `Bearer ${token}`,
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.data && data.data.length > 0) {
                        setUsername(data.data[0].login);
                    }
                } else {
                    console.error("Failed to fetch username");
                }
            };

            fetchUsername();
        }
    }, [token]);

    React.useEffect(() => {
        if (username && token) {
            ComfyJS.Init(username, token);
            setIsConnected(true);

            SetupEventHandling();
        }

        return () => {
            if (isConnected) {
                ComfyJS.Disconnect();
                console.log("DISCONNECT");
            }
        };
    }, [token, username, isConnected]);

    React.useEffect(() => {
        if (token)
            return;

        const newToken = GetToken();
        if (newToken) {
            setToken(newToken);
        }
    }, []);

    const LogoutToken = () => {
        localStorage.removeItem(ACCESS_KEY);
        setToken(null);
    };

    const SetupEventHandling = () => {
        // Set up event handlers
        ComfyJS.onChat = (user, message, flags, self, extra) => {
            console.log(`${user}: ${message}`);

            if (message.includes("NEW"))
                window.refreshCard();
        };
    }



    if (!token || !username) {
        return <TwitchAuth client_id={CLIENT_ID} />;
    }

    return <Twitch />;
}


Start(App);