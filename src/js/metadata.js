import * as JSON from '../.generated/partJSON.js';
import Part from './Part.js';

export const parts = {};
for (let key in JSON) {
    parts[key] = BuildPartList(JSON[key])
}

function BuildPartList(typeImportObject) {
    const partList = [];
    for (const key in typeImportObject) {
        const jsonData = typeImportObject[key];
        const data = new Part(key, jsonData);
        partList.push(data);
    }
    return partList;
}
