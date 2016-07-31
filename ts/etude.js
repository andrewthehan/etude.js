"use strict";
var Etude;
(function (Etude) {
    var Accidental = (function () {
        function Accidental(symbol, offset) {
            this.symbol = symbol;
            this.offset = offset;
            if (Accidental.size === 8 || Accidental._values.length === 8) {
                throw new Error("Accidental should not be instantiated.");
            }
            ++Accidental.size;
            Accidental._values.push(this);
        }
        Accidental.fromOffset = function (offset) {
            switch (offset) {
                case -3: return Accidental.TRIPLE_FLAT;
                case -2: return Accidental.DOUBLE_FLAT;
                case -1: return Accidental.FLAT;
                case 0: return Accidental.NATURAL;
                case 1: return Accidental.SHARP;
                case 2: return Accidental.DOUBLE_SHARP;
                case 3: return Accidental.TRIPLE_SHARP;
                default: throw new Error("Invalid accidental offset: " + offset);
            }
        };
        Accidental.fromString = function (accidentalString) {
            switch (accidentalString) {
                case "bbb": return Accidental.TRIPLE_FLAT;
                case "bb": return Accidental.DOUBLE_FLAT;
                case "b": return Accidental.FLAT;
                case "": return Accidental.NONE;
                case "n": return Accidental.NATURAL;
                case "#": return Accidental.SHARP;
                case "x": return Accidental.DOUBLE_SHARP;
                case "#x": return Accidental.TRIPLE_SHARP;
                default: throw new Error("Invalid accidental string: " + accidentalString);
            }
        };
        Accidental.values = function () {
            return Accidental._values.slice();
        };
        Accidental.prototype.toString = function () {
            return this.symbol;
        };
        Accidental.size = 0;
        Accidental._values = [];
        Accidental.TRIPLE_FLAT = new Accidental("bbb", -3);
        Accidental.DOUBLE_FLAT = new Accidental("bb", -2);
        Accidental.FLAT = new Accidental("b", -1);
        Accidental.NONE = new Accidental("", 0);
        Accidental.NATURAL = new Accidental("n", 0);
        Accidental.SHARP = new Accidental("#", 1);
        Accidental.DOUBLE_SHARP = new Accidental("x", 2);
        Accidental.TRIPLE_SHARP = new Accidental("#x", 3);
        return Accidental;
    }());
    Etude.Accidental = Accidental;
    var Key = (function () {
        function Key() {
        }
        return Key;
    }());
    Etude.Key = Key;
    var Letter = (function () {
        function Letter(name, offset) {
            this.name = name;
            this.offset = offset;
            if (Letter.size === 7 || Letter._values.length === 7) {
                throw new Error("Letter should not be instantiated.");
            }
            ++Letter.size;
            Letter._values.push(this);
        }
        Letter.values = function (startingLetter) {
            if (startingLetter === void 0) { startingLetter = Letter.A; }
            var letters = Letter._values.slice();
            Util.rotate(letters, startingLetter.ordinal());
            return letters;
        };
        Letter.prototype.ordinal = function () {
            return this.name.charCodeAt(0) - "A".charCodeAt(0);
        };
        Letter.prototype.toString = function () {
            return this.name;
        };
        Letter.size = 0;
        Letter._values = [];
        Letter.A = new Letter("A", 9);
        Letter.B = new Letter("B", 11);
        Letter.C = new Letter("C", 0);
        Letter.D = new Letter("D", 2);
        Letter.E = new Letter("E", 4);
        Letter.F = new Letter("F", 5);
        Letter.G = new Letter("G", 7);
        return Letter;
    }());
    Etude.Letter = Letter;
    var Util;
    (function (Util) {
        function rotate(array, distance) {
            while (distance-- > 0) {
                array.push(array.shift());
            }
        }
        Util.rotate = rotate;
    })(Util = Etude.Util || (Etude.Util = {}));
})(Etude = exports.Etude || (exports.Etude = {}));
