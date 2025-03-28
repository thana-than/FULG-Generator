import * as PNG from '../.generated/partPNG.js';
import * as THREE from 'three';

export default class Part {
    #png = null;
    #pngUrl = null; //* Track the URL separately for cleanup
    #texture = null;

    constructor(key, json) {
        this.key = key;
        this.type = json['type'];
        this.vibes = json['vibes'];
        this.joints = json['joints'];
    }

    /**
    * @returns {Promise<THREE.Texture | null>}
    */
    async getTexture() {
        if (this.#texture) return this.#texture;

        try {
            const importFn = PNG[this.type][this.key];
            const module = await importFn();
            this.#pngUrl = module.default;
            this.#png = await this.#loadImage(this.#pngUrl);

            this.#texture = new THREE.Texture(this.#png);
            this.#texture.needsUpdate = true

            return this.#texture;
        } catch (error) {
            console.error(`Failed to load texture for ${this.key}:`, error);
            return null;
        }
    }

    /**
    * @returns {Promise<HTMLImageElement>}
    */
    #loadImage(url) {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.src = url;
        });
    }

    dispose() {
        if (this.#png) {
            this.#png.src = '';
            if (this.#png.parentNode) {
                this.#png.parentNode.removeChild(this.#png);
            }
        }

        if (this.#texture) {
            this.#texture.dispose();
        }

        this.#png = null;
        this.#pngUrl = null;
        this.#texture = null;
    }
}