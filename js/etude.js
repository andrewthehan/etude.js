"use strict";
class Accidental {
    constructor(symbol, offset) {
        this.symbol = symbol;
        this.offset = offset;
        ++Accidental.size;
        Accidental._values.push(this);
    }
    static fromOffset(offset) {
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
    }
    static fromString(accidentalString) {
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
    }
    static values() {
        return Accidental._values.slice();
    }
    toString() {
        return this.symbol;
    }
}
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
exports.Accidental = Accidental;
(function (Accidental) {
    (function (Policy) {
        Policy[Policy["MAINTAIN_LETTER"] = 0] = "MAINTAIN_LETTER";
        Policy[Policy["PRIORITIZE_NATURAL"] = 1] = "PRIORITIZE_NATURAL";
        Policy[Policy["PRIORITIZE_SHARP"] = 2] = "PRIORITIZE_SHARP";
        Policy[Policy["PRIORITIZE_FLAT"] = 3] = "PRIORITIZE_FLAT";
    })(Accidental.Policy || (Accidental.Policy = {}));
    var Policy = Accidental.Policy;
})(Accidental = exports.Accidental || (exports.Accidental = {}));
class Degree {
    constructor(value) {
        this.value = value;
        ++Degree.size;
        Degree._values.push(this);
    }
    static values(startingDegree = Degree.TONIC) {
        let degrees = Degree._values.slice();
        Util.rotate(degrees, startingDegree.value - 1);
        return degrees;
    }
    static fromValue(value) {
        if (value < 1 || value > Degree.size) {
            throw new Error("Invalid value " + value);
        }
        return Degree._values[value - 1];
    }
    toString() {
        return Object.keys(Degree).find(d => Degree[d] === this);
    }
}
Degree.size = 0;
Degree._values = [];
Degree.TONIC = new Degree(1);
Degree.SUPERTONIC = new Degree(2);
Degree.MEDIANT = new Degree(3);
Degree.SUBDOMINANT = new Degree(4);
Degree.DOMINANT = new Degree(5);
Degree.SUBMEDIANT = new Degree(6);
Degree.LEADING_TONE = new Degree(7);
exports.Degree = Degree;
class Inversion {
    constructor(value) {
        this.value = value;
    }
    toString() {
        return Object.keys(Inversion).find(i => Inversion[i] === this);
    }
}
Inversion.ROOT = new Inversion(0);
Inversion.FIRST = new Inversion(1);
Inversion.SECOND = new Inversion(2);
Inversion.THIRD = new Inversion(3);
exports.Inversion = Inversion;
class Key {
    constructor(letter, accidental = Accidental.NONE) {
        this.letter = letter;
        this.accidental = accidental;
        this.offset = letter.offset + accidental.offset;
    }
    apply(keySignature) {
        let key = keySignature.key;
        let offset = key.offset;
        offset += keySignature
            .mode
            .stepPattern
            .slice(0, Util.floorMod(this.letter.ordinal() - key.letter.ordinal(), Letter.size))
            .reduce(Util.add, 0);
        offset %= MusicConstants.KEYS_IN_OCTAVE;
        if (offset - this.letter.offset > Accidental.TRIPLE_SHARP.offset) {
            offset -= MusicConstants.KEYS_IN_OCTAVE;
        }
        else if (offset - this.letter.offset < Accidental.TRIPLE_FLAT.offset) {
            offset += MusicConstants.KEYS_IN_OCTAVE;
        }
        let accidental = Accidental.fromOffset(offset - this.letter.offset);
        return new Key(this.letter, accidental);
    }
    none() {
        return new Key(this.letter, Accidental.NONE);
    }
    natural() {
        return new Key(this.letter, Accidental.NATURAL);
    }
    sharp() {
        return new Key(this.letter, Accidental.SHARP);
    }
    doubleSharp() {
        return new Key(this.letter, Accidental.DOUBLE_SHARP);
    }
    tripleSharp() {
        return new Key(this.letter, Accidental.TRIPLE_SHARP);
    }
    flat() {
        return new Key(this.letter, Accidental.FLAT);
    }
    doubleFlat() {
        return new Key(this.letter, Accidental.DOUBLE_FLAT);
    }
    tripleFlat() {
        return new Key(this.letter, Accidental.TRIPLE_FLAT);
    }
    isNone() {
        return this.accidental === Accidental.NONE;
    }
    isNatural() {
        return this.accidental === Accidental.NATURAL;
    }
    isSharp() {
        return this.accidental === Accidental.SHARP;
    }
    isDoubleSharp() {
        return this.accidental === Accidental.DOUBLE_SHARP;
    }
    isTripleSharp() {
        return this.accidental === Accidental.TRIPLE_SHARP;
    }
    isFlat() {
        return this.accidental === Accidental.FLAT;
    }
    isDoubleFlat() {
        return this.accidental === Accidental.DOUBLE_FLAT;
    }
    isTripleFlat() {
        return this.accidental === Accidental.TRIPLE_FLAT;
    }
    static isEnharmonic(a, b) {
        return Util.floorMod(a.offset, MusicConstants.KEYS_IN_OCTAVE) === Util.floorMod(b.offset, MusicConstants.KEYS_IN_OCTAVE);
    }
    static fromOffset(offset, policy = Accidental.Policy.PRIORITIZE_NATURAL) {
        let letter;
        let accidental = Accidental.NONE;
        switch (policy) {
            case Accidental.Policy.MAINTAIN_LETTER: throw new Error("Letter cannot be maintained when creating a Key from an offset");
            case Accidental.Policy.PRIORITIZE_SHARP:
                // maintain order of cases for fall throughs to function correctly
                switch (offset) {
                    case 11:
                        letter = Letter.B;
                        break;
                    case 10:
                        accidental = Accidental.SHARP;
                    // fall through
                    case 9:
                        letter = Letter.A;
                        break;
                    case 8:
                        accidental = Accidental.SHARP;
                    // fall through
                    case 7:
                        letter = Letter.G;
                        break;
                    case 6:
                        accidental = Accidental.SHARP;
                    // fall through
                    case 5:
                        letter = Letter.F;
                        break;
                    case 4:
                        letter = Letter.E;
                        break;
                    case 3:
                        accidental = Accidental.SHARP;
                    // fall through
                    case 2:
                        letter = Letter.D;
                        break;
                    case 1:
                        accidental = Accidental.SHARP;
                    // fall through
                    case 0:
                        letter = Letter.C;
                        break;
                    default:
                        throw new Error("Invalid offset: " + offset);
                }
                break;
            /*
            * PRIORITIZE_NATURAL prioritizies flats because
            * sharps are more often added (harmonic minor scale)
            * and a natural is preferred over a double sharp
            * (flat + sharp = natural vs. sharp + sharp = double sharp)
            */
            case Accidental.Policy.PRIORITIZE_NATURAL:
            case Accidental.Policy.PRIORITIZE_FLAT:
                // maintain order of cases for fall throughs to function correctly
                switch (offset) {
                    case 0:
                        letter = Letter.C;
                        break;
                    case 1:
                        accidental = Accidental.FLAT;
                    // fall through
                    case 2:
                        letter = Letter.D;
                        break;
                    case 3:
                        accidental = Accidental.FLAT;
                    // fall through
                    case 4:
                        letter = Letter.E;
                        break;
                    case 5:
                        letter = Letter.F;
                        break;
                    case 6:
                        accidental = Accidental.FLAT;
                    // fall through
                    case 7:
                        letter = Letter.G;
                        break;
                    case 8:
                        accidental = Accidental.FLAT;
                    // fall through
                    case 9:
                        letter = Letter.A;
                        break;
                    case 10:
                        accidental = Accidental.FLAT;
                    // fall through
                    case 11:
                        letter = Letter.B;
                        break;
                    default:
                        throw new Error("Invalid offset: " + offset);
                }
                break;
        }
        return new Key(letter, accidental);
    }
    static fromString(keyString) {
        let letter = Letter.fromChar(keyString.charAt(0));
        let accidental = keyString.length === 1 ? Accidental.NONE : Accidental.fromString(keyString.substring(1));
        return new Key(letter, accidental);
    }
    toString() {
        return this.letter.toString() + this.accidental.toString();
    }
}
exports.Key = Key;
class KeySignature {
    constructor(key, mode) {
        this.key = key;
        this.mode = mode;
    }
    degreeOf(key) {
        let difference = Util.floorMod(key.letter.ordinal() - this.key.letter.ordinal(), Letter.size);
        return Degree.fromValue(difference + 1);
    }
    keyOf(degree) {
        let letters = Letter.values(this.key.letter);
        let key = new Key(letters[degree.value - 1]);
        return key.apply(this);
    }
    toString() {
        return this.key.toString() + this.mode.toString();
    }
}
exports.KeySignature = KeySignature;
class Letter {
    constructor(offset) {
        this.offset = offset;
        ++Letter.size;
        Letter._values.push(this);
    }
    static values(startingLetter = Letter.A) {
        let letters = Letter._values.slice();
        Util.rotate(letters, startingLetter.ordinal());
        return letters;
    }
    static isValid(letterChar) {
        let value = letterChar.charCodeAt(0);
        return (value >= 'A'.charCodeAt(0) && value <= 'G'.charCodeAt(0)) || (value >= 'a'.charCodeAt(0) && value <= 'g'.charCodeAt(0));
    }
    static fromChar(letterChar) {
        if (!Letter.isValid(letterChar)) {
            throw new Error("Invalid letter character: " + letterChar);
        }
        return Letter._values[letterChar.toUpperCase().charCodeAt(0) - "A".charCodeAt(0)];
    }
    ordinal() {
        return this.toString().charCodeAt(0) - "A".charCodeAt(0);
    }
    toString() {
        return Object.keys(Letter).find(l => Letter[l] === this);
    }
}
Letter.size = 0;
Letter._values = [];
Letter.A = new Letter(9);
Letter.B = new Letter(11);
Letter.C = new Letter(0);
Letter.D = new Letter(2);
Letter.E = new Letter(4);
Letter.F = new Letter(5);
Letter.G = new Letter(7);
exports.Letter = Letter;
class Mode {
    // static MELODIC_MINOR: new Mode([2, 1, 2, 2, 2, 2, 1]);
    constructor(_stepPattern) {
        this._stepPattern = _stepPattern;
    }
    get stepPattern() {
        return this._stepPattern.slice();
    }
    toString() {
        return Object.keys(Mode).filter(m => Mode[m] === this)[0];
    }
}
Mode.IONIAN = new Mode([2, 2, 1, 2, 2, 2, 1]);
Mode.DORIAN = new Mode([2, 1, 2, 2, 2, 1, 2]);
Mode.PHRYGIAN = new Mode([1, 2, 2, 2, 1, 2, 2]);
Mode.LYDIAN = new Mode([2, 2, 2, 1, 2, 2, 1]);
Mode.MIXOLYDIAN = new Mode([2, 2, 1, 2, 2, 1, 2]);
Mode.AEOLIAN = new Mode([2, 1, 2, 2, 1, 2, 2]);
Mode.LOCRIAN = new Mode([1, 2, 2, 1, 2, 2, 2]);
Mode.MAJOR = new Mode([2, 2, 1, 2, 2, 2, 1]);
Mode.NATURAL_MINOR = new Mode([2, 1, 2, 2, 1, 2, 2]);
Mode.HARMONIC_MINOR = new Mode([2, 1, 2, 2, 1, 3, 1]);
exports.Mode = Mode;
var MusicConstants;
(function (MusicConstants) {
    MusicConstants.KEYS_IN_OCTAVE = 12;
    MusicConstants.SMALLEST_PROGRAM_NUMBER = 0;
    MusicConstants.LARGEST_PROGRAM_NUMBER = 127;
})(MusicConstants = exports.MusicConstants || (exports.MusicConstants = {}));
class Pitch {
    constructor(key, octave) {
        this.key = key;
        this.octave = octave;
        this.programNumber = octave * MusicConstants.KEYS_IN_OCTAVE + key.offset;
    }
    apply(keySignature) {
        return new Pitch(this.key.apply(keySignature), this.octave);
    }
    step(amount, policy = Accidental.Policy.PRIORITIZE_NATURAL) {
        if (amount instanceof Interval) {
            if (arguments.length !== 1) {
                throw new Error("Invalid number of arguments for step.");
            }
            let letter = Letter.values(this.key.letter)[Util.floorMod(amount.distance - 1, Letter.size)];
            let accidental = new Key(letter).apply(new KeySignature(this.key, Mode.MAJOR)).accidental;
            // change accidental based on interval's quality
            switch (amount.quality) {
                case Interval.Quality.PERFECT:
                case Interval.Quality.MAJOR:
                    break;
                case Interval.Quality.MINOR:
                    accidental = Accidental.fromOffset(accidental.offset - 1);
                    break;
                case Interval.Quality.DIMINISHED:
                    accidental = Accidental.fromOffset(accidental.offset - (Interval.isPerfect(amount.distance) ? 1 : 2));
                    break;
                case Interval.Quality.DOUBLY_DIMINISHED:
                    accidental = Accidental.fromOffset(accidental.offset - (Interval.isPerfect(amount.distance) ? 2 : 3));
                    break;
                case Interval.Quality.AUGMENTED:
                    accidental = Accidental.fromOffset(accidental.offset + 1);
                    break;
                case Interval.Quality.DOUBLY_AUGMENTED:
                    accidental = Accidental.fromOffset(accidental.offset + 2);
                    break;
            }
            let octaveOffset = Math.trunc((amount.distance + this.key.letter.offset - letter.offset) / Letter.size);
            return new Pitch(new Key(letter, accidental), this.octave + octaveOffset);
        }
        else if (typeof amount === "number") {
            if (Accidental.Policy.MAINTAIN_LETTER === policy) {
                let offset = this.key.accidental.offset;
                if (offset + amount > Accidental.TRIPLE_SHARP.offset || offset + amount < Accidental.TRIPLE_FLAT.offset) {
                    throw new Error("Can't move pitch " + amount + " step(s) up while maintaining letter: " + this);
                }
                return new Pitch(new Key(this.key.letter, Accidental.fromOffset(this.key.accidental.offset + amount)), this.octave);
            }
            return Pitch.fromProgramNumber(this.programNumber + amount, policy);
        }
    }
    halfStepUp(policy = Accidental.Policy.PRIORITIZE_SHARP) {
        if (Accidental.Policy.MAINTAIN_LETTER === policy) {
            if (this.key.isTripleSharp()) {
                throw new Error("Can't move pitch half step up while maintaining letter: " + this);
            }
            return new Pitch(new Key(this.key.letter, Accidental.fromOffset(this.key.accidental.offset + 1)), this.octave);
        }
        return Pitch.fromProgramNumber(this.programNumber + 1, policy);
    }
    halfStepDown(policy = Accidental.Policy.PRIORITIZE_FLAT) {
        if (Accidental.Policy.MAINTAIN_LETTER === policy) {
            if (this.key.isTripleFlat()) {
                throw new Error("Can't move pitch half step up while maintaining letter: " + this);
            }
            return new Pitch(new Key(this.key.letter, Accidental.fromOffset(this.key.accidental.offset - 1)), this.octave);
        }
        return Pitch.fromProgramNumber(this.programNumber - 1, policy);
    }
    isHigherThan(pitch) {
        return this.programNumber > pitch.programNumber;
    }
    isLowerThan(pitch) {
        return this.programNumber < pitch.programNumber;
    }
    compareTo(pitch) {
        let a = this.programNumber;
        let b = pitch.programNumber;
        return ((a < b) ? -1
            : (a == b) ? 0
                : 1);
    }
    getHigherPitch(key) {
        let pitch = new Pitch(key, this.octave);
        if (!this.isLowerThan(pitch)) {
            pitch = new Pitch(key, this.octave + 1);
        }
        return pitch;
    }
    getLowerPitch(key) {
        let pitch = new Pitch(key, this.octave);
        if (!this.isHigherThan(pitch)) {
            pitch = new Pitch(key, this.octave - 1);
        }
        return pitch;
    }
    static isEnharmonic(a, b) {
        return a.programNumber === b.programNumber;
    }
    static fromProgramNumber(programNumber, policy = Accidental.Policy.PRIORITIZE_NATURAL) {
        if (programNumber < MusicConstants.SMALLEST_PROGRAM_NUMBER || programNumber > MusicConstants.LARGEST_PROGRAM_NUMBER) {
            throw new Error("Invalid program number: " + programNumber);
        }
        let key = Key.fromOffset(Util.floorMod(programNumber, MusicConstants.KEYS_IN_OCTAVE), policy);
        let octave = Math.trunc(programNumber / MusicConstants.KEYS_IN_OCTAVE);
        return new Pitch(key, octave);
    }
    /**
     * Any input in the form
     *   - ${key}${octave}
     *   - ${key}${octave}(${program number})
     * is accepted and converted into a Pitch.
     * ${program number} is intentionally not accepted because #fromProgramNumber
     * exists and should be used instead.
     */
    static fromString(pitchString) {
        // longest prefix that contains only letters or #
        let keyString = pitchString.match(/^[a-zA-Z#]*/g)[0];
        let key = Key.fromString(keyString);
        // first number of length greater than 0 thats followed by an open parentheses (if there is any)
        let octaveString = pitchString.match(/\d+(?![^(]*\))/g)[0];
        if (octaveString === null) {
            throw new Error("Invalid pitch string: " + pitchString + " (missing octave)");
        }
        let octave = parseInt(octaveString);
        let pitch = new Pitch(key, octave);
        let programNumber = null;
        // a number that has an open parentheses somewhere before it (this captures both the number and the open parentheses)
        let searchResults = pitchString.match(/\((\d+)/g);
        if (searchResults != null) {
            programNumber = searchResults[0].substring(1);
            if (programNumber !== null) {
                if (pitch.programNumber !== parseInt(programNumber)) {
                    throw new Error("Invalid pitch string: " + pitchString + " (program number doesn't match key and octave)");
                }
            }
        }
        let converted = pitch.toString();
        if (programNumber === null) {
            let convertedNoParentheses = converted.substring(0, converted.indexOf("("));
            if (convertedNoParentheses !== pitchString) {
                if (convertedNoParentheses.length > pitchString.length) {
                    throw new Error("Invalid pitch string: " + pitchString + " (missing information)");
                }
                else {
                    throw new Error("Invalid pitch string: " + pitchString + " (contains extra information)");
                }
            }
        }
        else {
            if (converted !== pitchString) {
                if (converted.length > pitchString.length) {
                    throw new Error("Invalid pitch string: " + pitchString + " (missing information)");
                }
                else {
                    throw new Error("Invalid pitch string: " + pitchString + " (contains extra information)");
                }
            }
        }
        return pitch;
    }
    toString() {
        return this.key.toString() + this.octave + "(" + this.programNumber + ")";
    }
}
exports.Pitch = Pitch;
class Scale {
    constructor(keySignature) {
        this.keySignature = keySignature;
        this._keys = Degree.values().map(d => keySignature.keyOf(d));
    }
    get keys() {
        return this._keys.slice();
    }
}
exports.Scale = Scale;
var Util;
(function (Util) {
    function add(a, b) {
        return a + b;
    }
    Util.add = add;
    function floorMod(a, b) {
        return ((a % b) + b) % b;
    }
    Util.floorMod = floorMod;
    function rotate(array, distance) {
        while (distance-- > 0) {
            array.push(array.shift());
        }
    }
    Util.rotate = rotate;
})(Util = exports.Util || (exports.Util = {}));
class Interval {
    constructor(quality, distance) {
        this.quality = quality;
        this.distance = distance;
        if (distance <= 0) {
            throw new Error("Invalid interval: " + quality + distance + " (distance must be a positive integer)");
        }
        switch (quality) {
            case Interval.Quality.PERFECT:
                if (!Interval.isPerfect(distance)) {
                    throw new Error("Invalid interval: " + quality + distance + " (distance cannot have a perfect quality)");
                }
                break;
            case Interval.Quality.MAJOR:
            case Interval.Quality.MINOR:
                if (Interval.isPerfect(distance)) {
                    throw new Error("Invalid interval: " + quality + distance + " (distance cannot have major or minor quality)");
                }
                break;
            case Interval.Quality.DIMINISHED:
            case Interval.Quality.DOUBLY_DIMINISHED:
            case Interval.Quality.AUGMENTED:
            case Interval.Quality.DOUBLY_AUGMENTED:
                break;
        }
        // initialize offset to take into account octave
        this.offset = Math.trunc((this.distance - 1) / Letter.size) * MusicConstants.KEYS_IN_OCTAVE;
        // take into account normalized number (within the range of an octave)
        this.offset += Mode.MAJOR
            .stepPattern
            .slice(0, this.distance - 1)
            .reduce(Util.add, 0);
        // take into account quality
        switch (this.quality) {
            case Interval.Quality.PERFECT:
            case Interval.Quality.MAJOR:
                break;
            case Interval.Quality.MINOR:
                --this.offset;
                break;
            case Interval.Quality.DIMINISHED:
                this.offset -= Interval.isPerfect(this.distance) ? 1 : 2;
                break;
            case Interval.Quality.DOUBLY_DIMINISHED:
                this.offset -= Interval.isPerfect(this.distance) ? 2 : 3;
                break;
            case Interval.Quality.AUGMENTED:
                ++this.offset;
                break;
            case Interval.Quality.DOUBLY_AUGMENTED:
                this.offset += 2;
                break;
        }
    }
    static fromString(intervalString) {
        let matches = intervalString.match(/\D+|\d+/g);
        if (matches.length < 2 || !matches[0].trim() || !matches[1].trim()) {
            throw new Error("Invalid interval string: " + intervalString + " (missing information)");
        }
        else if (matches.length > 2) {
            throw new Error("Invalid interval string: " + intervalString + " (contains extra information)");
        }
        let quality = Interval.Quality.fromString(matches[0]);
        let distance = parseInt(matches[1]);
        return new Interval(quality, distance);
    }
    toString() {
        return this.quality.toString() + this.distance;
    }
    static between(a, b) {
        let letterA = a.key.letter;
        let letterB = b.key.letter;
        if (a.isHigherThan(b) && a.octave === b.octave && letterA.offset > letterB.offset) {
            throw new Error("Cannot create interval with negative distance");
        }
        let distance = 1 + Util.floorMod(letterB.ordinal() - letterA.ordinal(), Letter.size);
        let offset = b.programNumber - a.programNumber;
        offset -= Mode.MAJOR
            .stepPattern
            .slice(0, distance - 1)
            .reduce(Util.add, 0);
        let quality;
        switch (offset) {
            case -3:
                if (Interval.isPerfect(distance)) {
                    throw new Error("Cannot create interval for pitches: " + a + " -> " + b);
                }
                quality = Interval.Quality.DOUBLY_DIMINISHED;
                break;
            case -2:
                quality = Interval.isPerfect(distance) ? Interval.Quality.DOUBLY_DIMINISHED : Interval.Quality.DIMINISHED;
                break;
            case -1:
                quality = Interval.isPerfect(distance) ? Interval.Quality.DIMINISHED : Interval.Quality.MINOR;
                break;
            case 0:
                quality = Interval.isPerfect(distance) ? Interval.Quality.PERFECT : Interval.Quality.MAJOR;
                break;
            case 1:
                quality = Interval.Quality.AUGMENTED;
                break;
            case 2:
                quality = Interval.Quality.DOUBLY_AUGMENTED;
                break;
            default:
                throw new Error("Cannot create interval for pitches: " + a + " -> " + b);
        }
        return new Interval(quality, distance);
    }
    static isPerfect(distance) {
        let normalized = distance % 7;
        return normalized === 1 || normalized === 4 || normalized === 5;
    }
}
exports.Interval = Interval;
(function (Interval) {
    class Quality {
        constructor(symbol) {
            this.symbol = symbol;
        }
        static fromString(qualityString) {
            switch (qualityString) {
                case "P": return Interval.Quality.PERFECT;
                case "M": return Interval.Quality.MAJOR;
                case "m": return Interval.Quality.MINOR;
                case "d": return Interval.Quality.DIMINISHED;
                case "dd": return Interval.Quality.DOUBLY_DIMINISHED;
                case "A": return Interval.Quality.AUGMENTED;
                case "AA": return Interval.Quality.DOUBLY_AUGMENTED;
                default: throw new Error("Invalid quality string: " + qualityString);
            }
        }
        toString() {
            return this.symbol;
        }
    }
    Quality.PERFECT = new Quality("P");
    Quality.MAJOR = new Quality("M");
    Quality.MINOR = new Quality("m");
    Quality.DIMINISHED = new Quality("d");
    Quality.DOUBLY_DIMINISHED = new Quality("dd");
    Quality.AUGMENTED = new Quality("A");
    Quality.DOUBLY_AUGMENTED = new Quality("AA");
    Interval.Quality = Quality;
})(Interval = exports.Interval || (exports.Interval = {}));
class Chord {
    constructor(pitches) {
        this.pitches = pitches;
    }
    static fromString(chordString) {
        if (!chordString.includes("{") || !chordString.includes("}")) {
            throw new Error("Invalid chord string: " + chordString + " (missing curly braces that enclose pitches)");
        }
        if (!chordString.startsWith("{") || !chordString.endsWith("}")) {
            throw new Error("Invalid chord string: " + chordString + " (contains extra information)");
        }
        let pitchesString = chordString.substring(1, chordString.length - 1);
        if (pitchesString.includes("{") || pitchesString.includes("}")) {
            throw new Error("Invalid chord string: " + chordString + " (contains extra curly braces)");
        }
        let pitches = pitchesString
            .split(",")
            .map(Pitch.fromString);
        return new Chord(pitches);
    }
    toString() {
        return "{" + this.pitches.join(",") + "}";
    }
    static builder() {
        return new Chord.Builder();
    }
}
exports.Chord = Chord;
(function (Chord) {
    class Quality {
        constructor(intervalPattern, symbol) {
            this.intervalPattern = intervalPattern;
            this.symbol = symbol;
        }
        toString() {
            return this.symbol;
        }
    }
    Quality.MAJOR = new Quality([
        new Interval(Interval.Quality.PERFECT, 1),
        new Interval(Interval.Quality.MAJOR, 3),
        new Interval(Interval.Quality.PERFECT, 5)
    ], "maj");
    Quality.MINOR = new Quality([
        new Interval(Interval.Quality.PERFECT, 1),
        new Interval(Interval.Quality.MINOR, 3),
        new Interval(Interval.Quality.PERFECT, 5)
    ], "min");
    Quality.DIMINISHED = new Quality([
        new Interval(Interval.Quality.PERFECT, 1),
        new Interval(Interval.Quality.MINOR, 3),
        new Interval(Interval.Quality.DIMINISHED, 5)
    ], "dim");
    Quality.AUGMENTED = new Quality([
        new Interval(Interval.Quality.PERFECT, 1),
        new Interval(Interval.Quality.MAJOR, 3),
        new Interval(Interval.Quality.AUGMENTED, 5)
    ], "aug");
    Quality.MAJOR_SEVENTH = new Quality([
        new Interval(Interval.Quality.PERFECT, 1),
        new Interval(Interval.Quality.MAJOR, 3),
        new Interval(Interval.Quality.PERFECT, 5),
        new Interval(Interval.Quality.MAJOR, 7)
    ], "maj7");
    Quality.MINOR_SEVENTH = new Quality([
        new Interval(Interval.Quality.PERFECT, 1),
        new Interval(Interval.Quality.MINOR, 3),
        new Interval(Interval.Quality.PERFECT, 5),
        new Interval(Interval.Quality.MINOR, 7)
    ], "min7");
    Quality.DOMINANT_SEVENTH = new Quality([
        new Interval(Interval.Quality.PERFECT, 1),
        new Interval(Interval.Quality.MAJOR, 3),
        new Interval(Interval.Quality.PERFECT, 5),
        new Interval(Interval.Quality.MINOR, 7)
    ], "7");
    Quality.DIMINISHED_SEVENTH = new Quality([
        new Interval(Interval.Quality.PERFECT, 1),
        new Interval(Interval.Quality.MINOR, 3),
        new Interval(Interval.Quality.DIMINISHED, 5),
        new Interval(Interval.Quality.DIMINISHED, 7)
    ], "dim7");
    Quality.HALF_DIMINISHED_SEVENTH = new Quality([
        new Interval(Interval.Quality.PERFECT, 1),
        new Interval(Interval.Quality.MINOR, 3),
        new Interval(Interval.Quality.DIMINISHED, 5),
        new Interval(Interval.Quality.MINOR, 7)
    ], "m7(b5)");
    Quality.MINOR_MAJOR_SEVENTH = new Quality([
        new Interval(Interval.Quality.PERFECT, 1),
        new Interval(Interval.Quality.MINOR, 3),
        new Interval(Interval.Quality.PERFECT, 5),
        new Interval(Interval.Quality.MAJOR, 7)
    ], "mMaj7");
    Quality.AUGMENTED_MAJOR_SEVENTH = new Quality([
        new Interval(Interval.Quality.PERFECT, 1),
        new Interval(Interval.Quality.MAJOR, 3),
        new Interval(Interval.Quality.AUGMENTED, 5),
        new Interval(Interval.Quality.MAJOR, 7)
    ], "maj7(#5)");
    Chord.Quality = Quality;
    class Builder {
        constructor() {
            this.pitches = new Set();
            this.bottomDegree = Degree.TONIC;
        }
        setRoot(root) {
            this.root = root;
            return this;
        }
        add(element) {
            if (element instanceof Interval) {
                this.pitches.add(this.root.step(element));
            }
            else if (element instanceof Quality) {
                element
                    .intervalPattern
                    .forEach(i => this.pitches.add(this.root.step(i)));
            }
            return this;
        }
        setInversion(inversion) {
            switch (inversion) {
                case Inversion.ROOT: return this.setBottomDegree(Degree.TONIC);
                case Inversion.FIRST: return this.setBottomDegree(Degree.MEDIANT);
                case Inversion.SECOND: return this.setBottomDegree(Degree.DOMINANT);
                case Inversion.THIRD: return this.setBottomDegree(Degree.LEADING_TONE);
                default: throw new Error();
            }
        }
        setBottomDegree(degree) {
            this.bottomDegree = degree;
            return this;
        }
        build() {
            let pitchesArray = [...this.pitches].sort((a, b) => a.compareTo(b));
            let keySignature = new KeySignature(this.root.key, Mode.MAJOR);
            let letter = keySignature.keyOf(this.bottomDegree).letter;
            let optional = pitchesArray.find(p => p.key.letter === letter);
            if (optional === undefined) {
                throw new Error("Unable to invert chord: missing " + this.bottomDegree + " pitch");
            }
            let lowestPitch = optional;
            while (lowestPitch !== pitchesArray[0]) {
                pitchesArray.push(lowestPitch.getHigherPitch(pitchesArray.shift().key));
            }
            return new Chord(pitchesArray);
        }
    }
    Chord.Builder = Builder;
})(Chord = exports.Chord || (exports.Chord = {}));
