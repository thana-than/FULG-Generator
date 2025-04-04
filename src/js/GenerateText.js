import tracery from 'tracery-grammar';

const grammar = tracery.createGrammar(require('../.generated/wordData.json'));

grammar.addModifiers(tracery.baseEngModifiers);

export function GenerateName() {
    var value = grammar.flatten("#nameRoot#");
    return value;
}

export function GenerateTrait() {
    var value = grammar.flatten("#traitRoot#");
    return value;
}

export function GenerateSlogan() {
    var value = grammar.flatten("#sloganRoot#");
    return value;
}