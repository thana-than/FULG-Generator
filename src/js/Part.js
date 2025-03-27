import * as PNG from '../.generated/partPNG.js';

export default class Part {
    #png = null;
    #pngUrl = null; //* Track the URL separately for cleanup

    constructor(key, json) {
        this.key = key;
        this.type = json['type'];
        this.vibes = json['vibes'];
        this.joints = json['joints'];
    }

    /**
    * @returns {Promise<HTMLImageElement | null>}
    */
    async getPNG() {
        if (this.#png) return this.#png;

        try {
            const importFn = PNG[this.type][this.key];
            const module = await importFn();
            this.#pngUrl = module.default;
            this.#png = await this.#loadImage(this.#pngUrl);

            return this.#png;
        } catch (error) {
            console.error(`Failed to load PNG for ${this.key}:`, error);
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

    disposePNG() {
        if (this.#png) {
            this.#png.src = '';
            if (this.#png.parentNode) {
                this.#png.parentNode.removeChild(this.#png);
            }
        }
        this.#png = null;
        this.#pngUrl = null;
    }
}