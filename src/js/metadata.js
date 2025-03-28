import * as JSON from '../.generated/partJSON.js';
import Part from './Part.js';

export const parts = {
    head: BuildPartList(JSON.head),
    torso: BuildPartList(JSON.torso),
};

function BuildPartList(typeImportObject) {
    const partList = [];
    for (const key in typeImportObject) {
        const jsonData = typeImportObject[key]; //* Already loaded
        const data = new Part(key, jsonData);

        data.getPNG();
        partList.push(data);
    }
    return partList;
}
