function getRandInt(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function roll() {
    var diceARoll = getRandInt(1, 6);
    var diceBRoll = getRandInt(1, 6);

    var total = diceARoll + diceBRoll;
    return total;
}