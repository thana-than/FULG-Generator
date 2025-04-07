import React, { useEffect, useState } from "react";

const REDIRECT_URI = "http://localhost/oauth";
const SCOPES = ["channel:manage:redemptions", "channel:read:redemptions", "user:read:email", "chat:edit", "chat:read"];

const TwitchAuth = ({ client_id }) => {
    const [token, setToken] = useState(null);

    useEffect(() => {
        const hash = window.location.hash.substring(1);
        const params = new URLSearchParams(hash);
        const accessToken = params.get("access_token");

        if (accessToken) {
            setToken(accessToken);
        }
    }, []);

    const handleLogin = () => {
        const authUrl = new URL("https://id.twitch.tv/oauth2/authorize");
        authUrl.searchParams.set("client_id", client_id);
        authUrl.searchParams.set("redirect_uri", REDIRECT_URI);
        authUrl.searchParams.set("response_type", "token");
        authUrl.searchParams.set("scope", SCOPES.join(" "));

        window.location.href = authUrl.toString();
    };

    return (
        <div style={{ padding: "1rem" }}>
            {token ? (
                <div>
                    <p><strong>Access Token:</strong></p>
                    <code style={{ wordWrap: "break-word", display: "block" }}>{token}</code>
                </div>
            ) : (
                <button onClick={handleLogin} style={buttonStyle}>
                    Login with Twitch
                </button>
            )}
        </div>
    );
};

const buttonStyle = {
    padding: "1rem 2rem",
    fontSize: "1.1rem",
    backgroundColor: "#9147ff",
    border: "none",
    color: "white",
    borderRadius: "8px",
    cursor: "pointer",
};

export default TwitchAuth;