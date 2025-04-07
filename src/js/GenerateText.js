import tracery from 'tracery-grammar';
import { Profanity } from '@2toad/profanity';

const wordData = require('../.generated/wordData.json');

const grammar = tracery.createGrammar(wordData);

grammar.addModifiers(tracery.baseEngModifiers);

const profanity = new Profanity();

//* Add our existing words to the profanity whitelist because we probably want to say them
const safewords = []
for (let key in wordData) {
    const column = wordData[key];
    for (let phrase in column) {
        const words = column[phrase].split(' ');
        safewords.push(...words);
    }
}
profanity.removeWords(safewords);

function get(root) {
    let str;
    do {
        str = grammar.flatten(root);
    }
    while (profanity.exists(str));
    return str;
}

export function GenerateName() {
    return get("#nameRoot#");
}

export function GenerateTrait() {
    return get("#traitRoot#");
}

export function GenerateSlogan() {
    return get("#sloganRoot#");
}