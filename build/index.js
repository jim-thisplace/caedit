(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var util = require('./util');

var interval;

function go() {
    var world;
    var newWorld;
    var rules;

    /**
     * @param {object}  options
     * @param {number}  options.w
     * @param {number}  options.h
     * @returns {Uint8Array[]}
     */
    function createWorld(options) {
        var w = [];
        for (var i = options.h; i-- > 0;) {
            var row = new Uint8Array(new ArrayBuffer(options.w));
            w.push(row);
        }

        return w;
    }

    var worldParams = { w : 64, h : 64 };

    world    = createWorld(worldParams);
    newWorld = createWorld(worldParams);

    /**
     * @param {object}          options
     * @param {number}          options.x
     * @param {number}          options.y
     * @param {number}          options.w
     * @param {number}          options.h
     * @param {Uint8Array[]}    options.fromWorld
     * @returns {Uint8Array}
     */
    function getWorldRect(options) {
        var x              = options.x;
        var y              = options.y;
        var w              = options.w;
        var h              = options.h;
        var fromWorld      = options.fromWorld;
        var flattenedArray = new Uint8Array(w * h);
        for (var i = 0; i < h; i++) {
            for (var j = 0; j < w; j++) {
                var value = 0;
                if (fromWorld[y + i]) {
                    value = fromWorld[y + i][x + j];
                }

                flattenedArray[j + i * w] = value;
            }
        }

        return flattenedArray;
    }

    function randomizeWorld(options) {
        var h = options.world.length;
        var w = options.world[0].length;

        for (var i = h; i-- > 0;) {
            for (var j = w; j-- > 0;) {
                options.world[i][j] = Math.random() > 0.5 | 0;
            }
        }
    }

    randomizeWorld({ world : world });

    var ctx;

    function initGraphics() {
        if (!ctx) {
            var h          = world.length;
            var w          = world[0].length;
            var c          = document.getElementById('c');
            c.width        = w;
            c.height       = h;
            c.style.width  = w;
            c.style.height = h;
            ctx            = c.getContext('2d');

            ctx['imageSmoothingEnabled'] = false;
        }
    }

    /**
     * @param {object}       options
     * @param {Uint8Array[]} options.world
     */
    function drawWorld(options) {
        initGraphics();

        var h         = options.world.length;
        var w         = options.world[0].length;
        var imageData = ctx.createImageData(w, h);
        for (var i = 0; i < h; i++) {
            for (var j = 0; j < w; j++) {
                if (options.world[i][j]) {
                    // set alpha on flattened array
                    var p                 = (i * w + j) * 4;
                    imageData.data[p + 3] = 255;
                }
            }
        }

        ctx.putImageData(imageData, 0, 0, 0, 0, w, h);
    }

    drawWorld({ world : world });

    function getRuleMatchResult() {
        return 1;
        //return (Math.random() > 0.4) | 0;
    }

    /**
     * @param {object} options
     * @param {number} options.x
     * @param {number} options.y
     * @param {number} options.flattenedArrayRule
     * @param {number} options.fromWorld
     * @param {number} options.toWorld
     */
    function applyRule(options) {
        var x = options.x;
        var y = options.y;

        var flattenedArrayRule  = options.flattenedArrayRule;
        var w                   = Math.sqrt(flattenedArrayRule.length);
        var flattenedArrayWorld = getWorldRect({
            fromWorld : options.fromWorld,
            x         : x - (w >> 1),
            y         : y - (w >> 1),
            w         : w,
            h         : w
        });
        var centroidIndex       = flattenedArrayRule.length >> 1;
        //var centroidResult      = flattenedArrayRule[centroidIndex];

        var isMatch = true;
        for (var i = 0; i < flattenedArrayRule.length; i++) {
            if (i !== centroidIndex) {
                if (flattenedArrayWorld[i] !== flattenedArrayRule[i]) {
                    isMatch = false;
                    break;
                }
            }
        }

        if (isMatch) {
            options.toWorld[y][x] = getRuleMatchResult(); //1; //centroidResult; //tweakable
        }
    }

    var TWEAKABLE_THRESHOLD_FOR_DARKEN = util.getRandomInt(2,8) / 10;

    function getRandom3x3Rule() {
        var rule = new Uint8Array(9);
        for (var i = 9; i-- > 0;) {
            rule[i] = (Math.random() > TWEAKABLE_THRESHOLD_FOR_DARKEN) | 0;
        }
        return rule;
    }

    /**
     * @param {object}          options
     * @param {Uint8Array[]}    options.fromWorld
     * @param {Uint8Array[]}    options.toWorld
     */
    function applyAllRules(options) {
        var h = options.fromWorld.length;
        var w = options.fromWorld[0].length;

        for (var i = 0; i < h; i++) {
            for (var j = 0; j < w; j++) {
                for (var r = 0; r < rules.length; r++) {
                    applyRule({
                        x                  : j,
                        y                  : i,
                        flattenedArrayRule : rules[r],
                        fromWorld          : world,
                        toWorld            : newWorld
                    })
                }
            }
        }
    }

    /**
     * Generate n random rules.
     * @param {number} n
     * @returns {Uint8Array[]}
     */
    function getRandomRules(n) {
        var ruleSet = [];
        for (; n-- > 0;) {
            ruleSet.push(getRandom3x3Rule());
        }

        return ruleSet;
    }

    var TWEAKABLE_RULE_COUNT = util.getRandomInt(8, 16);

    rules = getRandomRules(TWEAKABLE_RULE_COUNT);

    function stepWorld() {
        applyAllRules({
            fromWorld : world,
            toWorld   : newWorld
        });

        drawWorld({ world : newWorld });

        world    = newWorld;
        newWorld = createWorld(worldParams);
    }

    // Run automatically
    clearInterval(interval);
    interval = setInterval(stepWorld, 1);
}

window.onclick = go;
},{"./util":2}],2:[function(require,module,exports){
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
},{}]},{},[1]);
