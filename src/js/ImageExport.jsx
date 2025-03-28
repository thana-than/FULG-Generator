import React from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { CARD_RES_X, CARD_RES_Y, CARD_SCALE_WIDTH, CARD_SCALE_HEIGHT } from './Card.jsx';

export default function ImageExport() {
    const EXPORT_WIDTH = CARD_RES_X;
    const EXPORT_HEIGHT = CARD_RES_Y;

    const { gl, scene } = useThree();

    const cardName = () => { return `card-export-${Date.now()}`; }

    // TODO only allow export once the card has fully animated in
    // TODO return a button that the user can click to export the image

    //* Enter key is assigned to export image
    React.useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Enter') {
                exportImage();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    });



    //* Export function
    const exportImage = () => {
        //* Create a render target with desired resolution
        const renderTarget = new THREE.WebGLRenderTarget(
            EXPORT_WIDTH,
            EXPORT_HEIGHT,
            {
                minFilter: THREE.LinearFilter,
                magFilter: THREE.LinearFilter,
                stencilBuffer: true,
                format: THREE.RGBAFormat,
                antialias: true
            }
        );

        //* Create export camera
        const camera = new THREE.OrthographicCamera(
            -CARD_SCALE_WIDTH / 2, CARD_SCALE_WIDTH / 2,
            CARD_SCALE_HEIGHT / 2, -CARD_SCALE_HEIGHT / 2,
            0.1, 10
        );
        camera.position.set(0, 0, 1);
        camera.lookAt(0, 0, 0);

        //* Render to target
        gl.setRenderTarget(renderTarget);
        gl.render(scene, camera);
        gl.setRenderTarget(null);

        //* Convert to image
        const canvas = document.createElement('canvas');
        canvas.width = EXPORT_WIDTH;
        canvas.height = EXPORT_HEIGHT;
        const ctx = canvas.getContext('2d');

        //* Read pixels from render target
        const pixels = new Uint8Array(EXPORT_WIDTH * EXPORT_HEIGHT * 4);
        gl.readRenderTargetPixels(
            renderTarget,
            0, 0,
            EXPORT_WIDTH, EXPORT_HEIGHT,
            pixels
        );

        //* Create image data
        const imageData = ctx.createImageData(EXPORT_WIDTH, EXPORT_HEIGHT);
        //? imageData.data.set(pixels); //Doesn't work, we have to flip the data through this loop here
        for (let i = 0; i < imageData.data.length; i += 4) {
            const row = Math.floor((i / 4) / EXPORT_WIDTH);
            const flippedRow = EXPORT_HEIGHT - 1 - row;
            const flippedIndex = (flippedRow * EXPORT_WIDTH + ((i / 4) % EXPORT_WIDTH)) * 4;

            imageData.data[i] = pixels[flippedIndex];           // R
            imageData.data[i + 1] = pixels[flippedIndex + 1];   // G
            imageData.data[i + 2] = pixels[flippedIndex + 2];   // B
            imageData.data[i + 3] = pixels[flippedIndex + 3];   // A
        }
        ctx.putImageData(imageData, 0, 0);

        //* Download
        const url = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = url;
        link.download = `${cardName()}.png`;
        document.body.appendChild(link);
        link.click();

        //* Clean up
        renderTarget.dispose();
        setTimeout(() => {  //* Cleanup DOM element
            URL.revokeObjectURL(url);
            document.body.removeChild(link);
        }, 100);
    };
}