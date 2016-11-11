/**
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
function getRandomInt(min, max) {
    return Math.round(Math.random() * (max - min)) + min;
}

/**
 * Use via `util.SHADE_CHAR[0]`, `util.SHADE_CHAR[1]`
 * @type {string}
 */
var SHADE_CHAR = ' ░▒▓█';

module.exports = {
    getRandomInt : getRandomInt,
    SHADE_CHAR   : SHADE_CHAR
};