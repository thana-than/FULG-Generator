
import React from 'react';
import { Start } from './appCore.js'
import TwitchAuth from './js/TwitchAuth.jsx'
import Twitch from './js/Twitch.jsx'
import ComfyJS from "comfy.js";

function App() {
    const [username, setUsername] = React.useState(null);
    const [token, setToken] = React.useState(GetToken());
    const [isConnected, setIsConnected] = React.useState(false);
    const [rewardName, setRewardName] = React.useState("FULG REWARD");
    const cardQueue = React.useRef(0);
    const cardIndex = React.useRef(0);
    const ACCESS_KEY = 'access_token';
    const REWARD_NAME_KEY = 'reward_name';
    const CLIENT_ID = "kv64ab553hk8l0iekzhg6cmg7140x4";
    const VISIBLE_SECONDS = 10;
    const MESSAGE_DELAY = 5;

    const isProcessingRef = React.useRef(false);
    const queuedIDs = React.useRef(new Map());

    const enqueueCard = (user) => {
        cardQueue.current++;
        if (user) {
            const userIndex = cardQueue.current;
            console.log(userIndex + " | " + user);
            queuedIDs.current.set(userIndex, user);
        }

        const processQueue = async () => {
            //* If a card is already being processed, don't start another one
            if (isProcessingRef.current) {
                return;
            }

            isProcessingRef.current = true;

            while (cardQueue.current > cardIndex.current) {

                cardIndex.current++;

                window.refreshCard(cardIndex.current); //* Update the card

                console.log("NEW CARD " + cardIndex.current + " of " + cardQueue.current);

                await new Promise(resolve => setTimeout(resolve, VISIBLE_SECONDS * 1000));
            }

            isProcessingRef.current = false;
        };

        processQueue();
    }

    const newCardEvent = async (params) => {
        const requestedUser = queuedIDs.current.get(params.cardID)
        console.log("CARD ID " + params.cardID);
        if (!requestedUser)
            return;

        queuedIDs.current.delete(params.cardID);

        await new Promise(resolve => setTimeout(resolve, MESSAGE_DELAY * 1000));
        const str = `‼️ ${requestedUser} pulled a new Fucked Up Little Guy! ‼️   🃏 ${params.characterName.toUpperCase()} 🃏   ⚪️ ${params.traitTitle}: ${params.traitContent} ⚪️`
        ComfyJS.Say(str);
    }


    React.useEffect(() => {
        if (!isConnected)
            return;

        ComfyJS.onReward = (user, reward, cost, message, extra) => {
            if (reward.includes(rewardName)) {
                enqueueCard(user);
            }
        };
    }, [rewardName, isConnected]);


    React.useEffect(() => {
        const savedRewardName = localStorage.getItem(REWARD_NAME_KEY);
        console.log("SAVED REWARD NAME: " + savedRewardName);
        if (savedRewardName)
            setRewardName(savedRewardName);
    }, []);

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
        if (username && token && !isConnected) {
            ComfyJS.Init(username, token);
            setIsConnected(true);
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

    if (!token || !username) {
        return <TwitchAuth client_id={CLIENT_ID} />;
    }

    const handleRewardNameChange = (e) => {
        setRewardName(e.target.value); // Update state with the new input value
    };

    const handleFieldKeyDown = (e) => {
        if (e.key === "Enter") {
            e.target.blur(); // Remove focus from the input field
            localStorage.setItem(REWARD_NAME_KEY, rewardName);
        }
    };

    return <>
        <Twitch visibleSeconds={VISIBLE_SECONDS} onNewCard={newCardEvent} />
        <div className={'electron'}></div>
        <div className={'electronTopBar'}>
            <>FUCKED UP LITTLE GUY</>
            <button onClick={enqueueCard}>DRAW</button>
            <label>
                Reward Name: <input name="rewardName" value={rewardName} onChange={handleRewardNameChange} onKeyDown={handleFieldKeyDown} />
            </label>
        </div>
    </>;
}


Start(App);