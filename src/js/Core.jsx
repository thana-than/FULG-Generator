import React from 'react';
import Button from './Button.jsx'
import ImageExport from './ImageExport.jsx';
import Render from './renderer.jsx';

const creditLink = 'https://bsky.app/profile/than.pocketmoon.games';
const creditCopy = 'Made by Than';

export default function Core() {
    const [isCardReady, setIsCardReady] = React.useState(false);

    const [gl, setGL] = React.useState(null);
    const [scene, setScene] = React.useState(null);

    const refreshCard = () => {
        window.refreshCard();
    };

    function CopyLine() {
        return (<a href={creditLink} target={'_blank'} className={'copy'}>{creditCopy}</a>);
    }

    function SetCanvas(canvas) {
        setGL(canvas.gl)
        setScene(canvas.scene)
    }

    return (
        <div className={'main standardBackground'} >
            <Render onCardReadyStateChanged={setIsCardReady} onCanvasDataChanged={SetCanvas} />

            <>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'column',
                    gap: '.5em',
                    bottom: '1em',
                    width: '100%',
                    position: 'absolute',
                }}>
                    <Button label={"DRAW CARD"} onClick={refreshCard} />
                    <ImageExport isCardReady={isCardReady} gl={gl} scene={scene} />
                </div>

                <div style={{
                    textAlign: 'right',
                    top: '.5em',
                    marginLeft: '1em',
                    marginRight: '1em',
                    width: 'calc(100% - 2em)',
                    position: 'absolute',
                    paddingRight: '50em',
                }}>
                    <CopyLine />
                </div>
            </>
        </div>
    );
};