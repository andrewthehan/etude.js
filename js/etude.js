"use strict";
var error;
(function (error) {
    class AssertionError extends Error {
        constructor(message) {
            super("You should have never seen this. Please submit a bug report with the relevant code and the following message: \"" + message + "\"");
        }
    }
    error.AssertionError = AssertionError;
    class EtudeError extends Error {
        constructor(message) {
            super(message);
        }
    }
    error.EtudeError = EtudeError;
})(error = exports.error || (exports.error = {}));
var util;
(function (util) {
    var MathUtil;
    (function (MathUtil) {
        function add(a, b) {
            return a + b;
        }
        MathUtil.add = add;
        function compare(a, b) {
            return ((a < b) ? -1 :
                (a == b) ? 0 :
                    1);
        }
        MathUtil.compare = compare;
        function floorMod(a, b) {
            return ((a % b) + b) % b;
        }
        MathUtil.floorMod = floorMod;
        function rotate(array, distance) {
            while (distance-- > 0) {
                array.push(array.shift());
            }
        }
        MathUtil.rotate = rotate;
    })(MathUtil = util.MathUtil || (util.MathUtil = {}));
    class CircularIterator {
        constructor(values) {
            this.values = values;
            this.i = 0;
        }
        static of(values) {
            return new CircularIterator(values);
        }
        [Symbol.iterator]() {
            return this;
        }
        getValues() {
            return this.values;
        }
        getCurrentValue() {
            return this.getValues()[this.i];
        }
        increment() {
            this.i = (this.i + 1) % this.getCycleLength();
        }
        getCycleLength() {
            return this.values.length;
        }
        next() {
            let e = this.getCurrentValue();
            this.increment();
            return { value: e, done: false };
        }
    }
    util.CircularIterator = CircularIterator;
    class CircularStream {
        constructor(values) {
            this.values = values;
            this.it = CircularIterator.of(values);
        }
        static of(values) {
            return new CircularStream(values);
        }
        filter(filter) {
            this.it = CircularIterator.of(this.it.getValues().filter(filter));
            return this;
        }
        map(map) {
            return CircularStream.of(this.it.getValues().map(map));
        }
        limit(size) {
            let values = [];
            while (size-- > 0) {
                values.push(this.it.next().value);
            }
            return values;
        }
        skip(amount) {
            while (amount-- > 0) {
                this.it.next();
            }
            return this;
        }
    }
    util.CircularStream = CircularStream;
    class ImmutablePrioritySet extends Set {
        constructor(_values) {
            super(_values);
            this._values = _values;
        }
        static of(values) {
            return new ImmutablePrioritySet(values);
        }
        compare(a, b) {
            if (!this.has(a) || !this.has(b)) {
                throw new Error("No such element");
            }
            return util.MathUtil.compare(this._values.indexOf(a), this._values.indexOf(b));
        }
        iterator() {
            return this[Symbol.iterator]();
        }
    }
    util.ImmutablePrioritySet = ImmutablePrioritySet;
    class InfiniteIterator {
        constructor(initial, func) {
            this.initial = initial;
            this.func = func;
            this.current = null;
        }
        static of(initial, func) {
            return new InfiniteIterator(initial, func);
        }
        [Symbol.iterator]() {
            return this;
        }
        getCurrentValue() {
            if (this.current === null) {
                return this.initial;
            }
            return this.current;
        }
        reset() {
            this.current = null;
        }
        next() {
            if (this.current === null) {
                this.current = this.initial;
            }
            else {
                this.current = this.func(this.current);
            }
            return { value: this.current, done: false };
        }
    }
    util.InfiniteIterator = InfiniteIterator;
    class InfiniteStream {
        constructor(initial, func) {
            this.initial = initial;
            this.func = func;
            this.it = InfiniteIterator.of(initial, func);
        }
        static of(initial, func) {
            return new InfiniteStream(initial, func);
        }
        filter(filter) {
            let it = this.it;
            let initial;
            do {
                initial = it.next().value;
            } while (!filter(initial));
            return InfiniteStream.of(initial, previous => {
                let e;
                do {
                    e = it.next().value;
                } while (!filter(e));
                return e;
            });
        }
        map(map) {
            let it = this.it;
            return InfiniteStream.of(map(it.next().value), previous => map(it.next().value));
        }
        limit(size) {
            let values = [];
            while (size-- > 0) {
                values.push(this.it.next().value);
            }
            return values;
        }
        skip(amount) {
            while (amount-- > 0) {
                this.it.next();
            }
            return this;
        }
    }
    util.InfiniteStream = InfiniteStream;
})(util = exports.util || (exports.util = {}));
var theory;
(function (theory) {
    class Accidental {
        constructor(symbol, offset) {
            this.symbol = symbol;
            this.offset = offset;
            ++Accidental.size;
            Accidental._values.push(this);
        }
        static values() {
            return Accidental._values.slice();
        }
        ordinal() {
            return Accidental._values.indexOf(this);
        }
        static valueOf(accidentalString) {
            let accidental = Accidental[accidentalString];
            if (accidental instanceof Accidental) {
                return accidental;
            }
            throw new error.EtudeError("Invalid accidental string: " + accidentalString);
        }
        static fromOffset(offset) {
            let accidental = Object
                .keys(Accidental)
                .map(a => Accidental[a])
                .filter(a => a instanceof Accidental)
                .find(a => a.getOffset() === offset);
            if (accidental === undefined) {
                throw new error.EtudeError("Invalid accidental offset: " + offset);
            }
            return accidental;
        }
        getOffset() {
            return this.offset;
        }
        static fromString(accidentalString) {
            let accidental = Object
                .keys(Accidental)
                .map(a => Accidental[a])
                .filter(a => a instanceof Accidental)
                .find(a => a.toString() === accidentalString);
            if (accidental === undefined) {
                throw new error.EtudeError("Invalid accidental string: " + accidentalString);
            }
            return accidental;
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
    theory.Accidental = Accidental;
    class Degree {
        constructor() {
            ++Degree.size;
            Degree._values.push(this);
        }
        static values(startingDegree = Degree.TONIC) {
            let degrees = Degree._values.slice();
            util.MathUtil.rotate(degrees, startingDegree.getValue() - 1);
            return degrees;
        }
        ordinal() {
            return Degree._values.indexOf(this);
        }
        static valueOf(degreeString) {
            let degree = Degree[degreeString];
            if (degree instanceof Degree) {
                return degree;
            }
            throw new error.EtudeError("Invalid degree string: " + degreeString);
        }
        static fromValue(value) {
            if (value < 1 || value > Degree.size) {
                throw new error.EtudeError("Invalid value " + value);
            }
            return Degree._values[value - 1];
        }
        getValue() {
            return this.ordinal() + 1;
        }
        toString() {
            return Object.keys(Degree).find(d => Degree[d] === this);
        }
    }
    Degree.size = 0;
    Degree._values = [];
    Degree.TONIC = new Degree();
    Degree.SUPERTONIC = new Degree();
    Degree.MEDIANT = new Degree();
    Degree.SUBDOMINANT = new Degree();
    Degree.DOMINANT = new Degree();
    Degree.SUBMEDIANT = new Degree();
    Degree.LEADING_TONE = new Degree();
    theory.Degree = Degree;
    class Direction {
        toString() {
            return Object.keys(Direction).find(d => Direction[d] === this);
        }
    }
    Direction.ASCENDING = new Direction();
    Direction.DESCENDING = new Direction();
    Direction.DEFAULT = Direction.ASCENDING;
    theory.Direction = Direction;
    class Dynamic {
        constructor(symbol) {
            this.symbol = symbol;
            ++Dynamic.size;
            Dynamic._values.push(this);
        }
        static values() {
            return Dynamic._values.slice();
        }
        ordinal() {
            return Dynamic._values.indexOf(this);
        }
        static valueOf(dynamicString) {
            let dynamic = Dynamic[dynamicString];
            if (dynamic instanceof Dynamic) {
                return dynamic;
            }
            throw new error.EtudeError("Invalid dynamic string: " + dynamicString);
        }
        crescendo() {
            let index = this.ordinal() + 1;
            if (index >= Dynamic.size) {
                throw new error.EtudeError("Unable to apply crescendo on " + this);
            }
            return Dynamic._values[index];
        }
        diminuendo() {
            let index = this.ordinal() - 1;
            if (index < 0) {
                throw new error.EtudeError("Unable to apply diminuendo on " + this);
            }
            return Dynamic._values[index];
        }
        static fromString(dynamicString) {
            let dynamic = Object
                .keys(Dynamic)
                .map(d => Dynamic[d])
                .filter(d => d instanceof Dynamic)
                .find(d => d.toString() === dynamicString);
            if (dynamic === undefined) {
                throw new error.EtudeError("Invalid dynamic string: " + dynamicString);
            }
            return dynamic;
        }
        toString() {
            return this.symbol;
        }
    }
    Dynamic.size = 0;
    Dynamic._values = [];
    Dynamic.PIANISSISSIMO = new Dynamic("ppp");
    Dynamic.PIANISSIMO = new Dynamic("pp");
    Dynamic.PIANO = new Dynamic("p");
    Dynamic.MEZZO_PIANO = new Dynamic("mp");
    Dynamic.MEZZO_FORTE = new Dynamic("mf");
    Dynamic.FORTE = new Dynamic("f");
    Dynamic.FORTISSIMO = new Dynamic("ff");
    Dynamic.FORTISSISSIMO = new Dynamic("fff");
    theory.Dynamic = Dynamic;
    class Inversion {
        constructor() {
            ++Inversion.size;
            Inversion._values.push(this);
        }
        static values() {
            return Inversion._values.slice();
        }
        ordinal() {
            return Inversion._values.indexOf(this);
        }
        static valueOf(inversionString) {
            let inversion = Inversion[inversionString];
            if (inversion instanceof Inversion) {
                return inversion;
            }
            throw new error.EtudeError("Invalid inversion string: " + inversionString);
        }
        getValue() {
            return this.ordinal();
        }
        toString() {
            return Object.keys(Inversion).find(i => Inversion[i] === this);
        }
    }
    Inversion.size = 0;
    Inversion._values = [];
    Inversion.ROOT = new Inversion();
    Inversion.FIRST = new Inversion();
    Inversion.SECOND = new Inversion();
    Inversion.THIRD = new Inversion();
    theory.Inversion = Inversion;
    class Key {
        constructor(letter, accidental = Accidental.NONE) {
            this.letter = letter;
            this.accidental = accidental;
        }
        step(amount, policies = Policy.DEFAULT_PRIORITY) {
            return Key.fromOffset(util.MathUtil.floorMod(this.getOffset() + amount, MusicConstants.KEYS_IN_OCTAVE), policies);
        }
        apply(keySignature) {
            let key = keySignature.getKey();
            let offset = key.getOffset();
            offset += (keySignature.isMajor() ? Scale.Quality.MAJOR : Scale.Quality.NATURAL_MINOR)
                .getStepPattern()
                .slice(0, util.MathUtil.floorMod(this.letter.ordinal() - key.letter.ordinal(), Letter.size))
                .reduce(util.MathUtil.add, 0);
            offset %= MusicConstants.KEYS_IN_OCTAVE;
            if (offset - this.letter.getOffset() > Accidental.TRIPLE_SHARP.getOffset()) {
                offset -= MusicConstants.KEYS_IN_OCTAVE;
            }
            else if (offset - this.letter.getOffset() < Accidental.TRIPLE_FLAT.getOffset()) {
                offset += MusicConstants.KEYS_IN_OCTAVE;
            }
            let accidental = Accidental.fromOffset(offset - this.letter.getOffset());
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
        getEnharmonicEquivalent(parameter) {
            if (parameter instanceof Letter) {
                let letter = parameter;
                let targetOffset = this.getOffset();
                let initialOffset = letter.getOffset();
                let accidentalOffset = targetOffset - initialOffset;
                if (accidentalOffset > Accidental.TRIPLE_SHARP.getOffset()) {
                    accidentalOffset -= MusicConstants.KEYS_IN_OCTAVE;
                }
                else if (accidentalOffset < Accidental.TRIPLE_FLAT.getOffset()) {
                    accidentalOffset += MusicConstants.KEYS_IN_OCTAVE;
                }
                let accidental;
                try {
                    accidental = Accidental.fromOffset(accidentalOffset);
                }
                catch (e) {
                    return null;
                }
                return new Key(letter, accidental);
            }
            else if (parameter instanceof util.ImmutablePrioritySet) {
                let policies = parameter;
                for (let policy of policies) {
                    let optional = Letter
                        .values()
                        .map(l => this.getEnharmonicEquivalent(l))
                        .filter(k => k !== null)
                        .find(p => policy(p));
                    if (optional !== undefined) {
                        return optional;
                    }
                }
                return null;
            }
        }
        static isEnharmonic(a, b) {
            return util.MathUtil.floorMod(a.getOffset(), MusicConstants.KEYS_IN_OCTAVE) === util.MathUtil.floorMod(b.getOffset(), MusicConstants.KEYS_IN_OCTAVE);
        }
        static fromOffset(offset, policies = Policy.DEFAULT_PRIORITY) {
            if (policies.size === 0) {
                throw new error.EtudeError("Policies should not be empty");
            }
            let letter;
            let accidental = Accidental.NONE;
            // determine key without taking into account policies
            // maintain order of cases for fall throughs to function correctly
            switch (util.MathUtil.floorMod(offset, MusicConstants.KEYS_IN_OCTAVE)) {
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
                    throw new error.AssertionError("Invalid offset: " + offset);
            }
            return new Key(letter, accidental).getEnharmonicEquivalent(policies);
        }
        getOffset() {
            return util.MathUtil.floorMod(this.letter.getOffset() + this.accidental.getOffset(), MusicConstants.KEYS_IN_OCTAVE);
        }
        static fromString(keyString) {
            let letter = Letter.fromChar(keyString.charAt(0));
            let accidental = keyString.length === 1 ? Accidental.NONE : Accidental.fromString(keyString.substring(1));
            return new Key(letter, accidental);
        }
        toString() {
            return this.letter.toString() + this.accidental.toString();
        }
        equals(other) {
            if (!(other instanceof Key)) {
                return false;
            }
            if (other === this) {
                return true;
            }
            let otherKey = other;
            return this.letter === otherKey.getLetter() && this.accidental === otherKey.getAccidental();
        }
        getLetter() {
            return this.letter;
        }
        getAccidental() {
            return this.accidental;
        }
    }
    theory.Key = Key;
    class Letter {
        constructor(offset) {
            this.offset = offset;
            ++Letter.size;
            Letter._values.push(this);
        }
        static values(direction = Direction.DEFAULT, startingLetter = Letter.A) {
            if (direction instanceof Letter) {
                if (arguments.length !== 1) {
                    throw new error.EtudeError("Invalid number of arguments for values");
                }
                startingLetter = direction;
                direction = Direction.DEFAULT;
            }
            let letters = Letter._values.slice();
            if (direction === Direction.DESCENDING) {
                letters.reverse();
            }
            util.MathUtil.rotate(letters, letters.indexOf(startingLetter));
            return letters;
        }
        ordinal() {
            return this.toString().charCodeAt(0) - "A".charCodeAt(0);
        }
        static valueOf(letterString) {
            let letter = Letter[letterString];
            if (letter instanceof Letter) {
                return letter;
            }
            throw new error.EtudeError("Invalid letter string: " + letterString);
        }
        getOffset() {
            return this.offset;
        }
        static stream(direction = Direction.DEFAULT, startingLetter = Letter.A) {
            if (direction instanceof Letter) {
                if (arguments.length !== 1) {
                    throw new error.EtudeError("Invalid number of arguments for stream");
                }
                startingLetter = direction;
                direction = Direction.DEFAULT;
            }
            return util.CircularStream.of(this.values(direction, startingLetter));
        }
        static iterator(direction = Direction.DEFAULT, startingLetter = Letter.A) {
            if (direction instanceof Letter) {
                if (arguments.length !== 1) {
                    throw new error.EtudeError("Invalid number of arguments for iterator");
                }
                startingLetter = direction;
                direction = Direction.DEFAULT;
            }
            return util.CircularIterator.of(this.values(direction, startingLetter));
        }
        static isValid(letterChar) {
            let value = letterChar.charCodeAt(0);
            return (value >= 'A'.charCodeAt(0) && value <= 'G'.charCodeAt(0)) || (value >= 'a'.charCodeAt(0) && value <= 'g'.charCodeAt(0));
        }
        static fromChar(letterChar) {
            if (!Letter.isValid(letterChar)) {
                throw new error.EtudeError("Invalid letter character: " + letterChar);
            }
            return Letter._values[letterChar.toUpperCase().charCodeAt(0) - "A".charCodeAt(0)];
        }
        toString() {
            return Object.keys(Letter).find(l => Letter[l] === this);
        }
    }
    Letter.size = 0;
    Letter._values = [];
    /**
     * Values derived from General MIDI's program numbers
     * (https://en.wikipedia.org/wiki/General_MIDI)
     * and the octave convention for scientific pitch notation
     * (https://en.wikipedia.org/wiki/Scientific_pitch_notation)
     * Ex. The E (E4) above middle C (C4):
     *   - new octaves start on C
     *   - C4's program number is 48
     *   - increment that value by Letter.E's offset value (4)
     *   - E4: 48 + 4 == 52 == E4's program number
     */
    Letter.A = new Letter(9);
    Letter.B = new Letter(11);
    Letter.C = new Letter(0);
    Letter.D = new Letter(2);
    Letter.E = new Letter(4);
    Letter.F = new Letter(5);
    Letter.G = new Letter(7);
    theory.Letter = Letter;
    class Mode {
        constructor(stepPattern) {
            this.stepPattern = stepPattern;
        }
        getStepPattern() {
            return this.stepPattern.slice();
        }
        toString() {
            return Object.keys(Mode).find(m => Mode[m] === this);
        }
    }
    Mode.IONIAN = new Mode([2, 2, 1, 2, 2, 2, 1]);
    Mode.DORIAN = new Mode([2, 1, 2, 2, 2, 1, 2]);
    Mode.PHRYGIAN = new Mode([1, 2, 2, 2, 1, 2, 2]);
    Mode.LYDIAN = new Mode([2, 2, 2, 1, 2, 2, 1]);
    Mode.MIXOLYDIAN = new Mode([2, 2, 1, 2, 2, 1, 2]);
    Mode.AEOLIAN = new Mode([2, 1, 2, 2, 1, 2, 2]);
    Mode.LOCRIAN = new Mode([1, 2, 2, 1, 2, 2, 2]);
    theory.Mode = Mode;
    var MusicConstants;
    (function (MusicConstants) {
        MusicConstants.KEYS_IN_OCTAVE = 12;
        MusicConstants.SMALLEST_PROGRAM_NUMBER = 0;
        MusicConstants.LARGEST_PROGRAM_NUMBER = 127;
    })(MusicConstants = theory.MusicConstants || (theory.MusicConstants = {}));
    class Note {
        constructor(pitch, value) {
            this.pitch = pitch;
            this.value = value;
        }
        static fromString(noteString) {
            let split = noteString.split("[");
            if (split.length < 2 || !split[0].trim() || !split[1].trim()) {
                throw new error.EtudeError("Invalid note string: " + noteString + " (missing information)");
            }
            else if (split.length > 2) {
                throw new error.EtudeError("Invalid note string: " + noteString + " (contains extra information)");
            }
            let pitch = Pitch.fromString(split[0]);
            if (!split[1].includes("]")) {
                throw new error.EtudeError("Invalid note string: " + noteString + " (missing closing bracket)");
            }
            else if (!split[1].endsWith("]")) {
                throw new error.EtudeError("Invalid note string: " + noteString + " (contains extra information)");
            }
            let value = Value.fromString(split[1].substring(0, split[1].length - 1));
            return new Note(pitch, value);
        }
        toString() {
            return this.pitch + "[" + this.value + "]";
        }
        equals(other) {
            if (!(other instanceof Note)) {
                return false;
            }
            if (other === this) {
                return true;
            }
            let otherNote = other;
            return this.pitch.equals(otherNote.getPitch()) && this.value === otherNote.getValue();
        }
        getPitch() {
            return this.pitch;
        }
        getValue() {
            return this.value;
        }
    }
    theory.Note = Note;
    class Pitch {
        constructor(key, octave) {
            this.key = key;
            this.octave = octave;
            let programNumber = this.getProgramNumber();
            if (programNumber < MusicConstants.SMALLEST_PROGRAM_NUMBER || programNumber > MusicConstants.LARGEST_PROGRAM_NUMBER) {
                throw new error.EtudeError("Invalid program number: " + programNumber);
            }
        }
        apply(keySignature) {
            return new Pitch(this.key.apply(keySignature), this.octave);
        }
        step(amount, policies = Policy.DEFAULT_PRIORITY) {
            if (amount instanceof Interval) {
                if (arguments.length !== 1) {
                    throw new error.EtudeError("Invalid number of arguments for step");
                }
                let letter = Letter.values(this.key.getLetter())[util.MathUtil.floorMod(amount.getDistance() - 1, Letter.size)];
                let accidental = new Key(letter).apply(new KeySignature(this.key, KeySignature.Quality.MAJOR)).getAccidental();
                // change accidental based on interval's quality
                switch (amount.getQuality()) {
                    case Interval.Quality.PERFECT:
                    case Interval.Quality.MAJOR:
                        break;
                    case Interval.Quality.MINOR:
                        accidental = Accidental.fromOffset(accidental.getOffset() - 1);
                        break;
                    case Interval.Quality.DIMINISHED:
                        accidental = Accidental.fromOffset(accidental.getOffset() - (Interval.isPerfect(amount.getDistance()) ? 1 : 2));
                        break;
                    case Interval.Quality.DOUBLY_DIMINISHED:
                        accidental = Accidental.fromOffset(accidental.getOffset() - (Interval.isPerfect(amount.getDistance()) ? 2 : 3));
                        break;
                    case Interval.Quality.AUGMENTED:
                        accidental = Accidental.fromOffset(accidental.getOffset() + 1);
                        break;
                    case Interval.Quality.DOUBLY_AUGMENTED:
                        accidental = Accidental.fromOffset(accidental.getOffset() + 2);
                        break;
                }
                // refer to Interval.between for how this equation was derived
                let octaveOffset = Math.trunc((amount.getDistance()
                    - 1
                    + (util.MathUtil.floorMod(this.key.getLetter().ordinal() - 2, Letter.size) - util.MathUtil.floorMod(letter.ordinal() - 2, Letter.size))) / Letter.size);
                return new Pitch(new Key(letter, accidental), this.octave + octaveOffset);
            }
            else if (typeof amount === "number") {
                return Pitch.fromProgramNumber(this.getProgramNumber() + amount, policies);
            }
        }
        halfStepUp(policies = Policy.DEFAULT_PRIORITY) {
            return Pitch.fromProgramNumber(this.getProgramNumber() + 1, policies);
        }
        halfStepDown(policies = Policy.DEFAULT_PRIORITY) {
            return Pitch.fromProgramNumber(this.getProgramNumber() - 1, policies);
        }
        isHigherThan(pitch) {
            return this.getProgramNumber() > pitch.getProgramNumber();
        }
        isLowerThan(pitch) {
            return this.getProgramNumber() < pitch.getProgramNumber();
        }
        compareTo(pitch) {
            return util.MathUtil.compare(this.getProgramNumber(), pitch.getProgramNumber());
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
            return a.getProgramNumber() === b.getProgramNumber();
        }
        static fromProgramNumber(programNumber, policies = Policy.DEFAULT_PRIORITY) {
            if (programNumber < MusicConstants.SMALLEST_PROGRAM_NUMBER || programNumber > MusicConstants.LARGEST_PROGRAM_NUMBER) {
                throw new error.EtudeError("Invalid program number: " + programNumber);
            }
            let key = Key.fromOffset(util.MathUtil.floorMod(programNumber, MusicConstants.KEYS_IN_OCTAVE), policies);
            if (key === null) {
                return null;
            }
            let octave = Math.trunc(programNumber / MusicConstants.KEYS_IN_OCTAVE);
            /**
             * Key offsets are bounded by the range [0, MusicConstants.KEYS_IN_OCTAVE) whereas program numbers go across octave boundaries.
             * If [actual key offset] is equal to [offset after normalizing], then octave is not changed.
             * If [actual key offset] is lower than [offset after normalizing], then octave is raised by 1.
             * If [actual key offset] is higher than [offset after normalizing], then octave is lowered by 1.
             */
            octave += (key.getOffset() - (key.getLetter().getOffset() + key.getAccidental().getOffset())) / MusicConstants.KEYS_IN_OCTAVE;
            return new Pitch(key, octave);
        }
        getProgramNumber() {
            return this.octave * MusicConstants.KEYS_IN_OCTAVE + this.key.getLetter().getOffset() + this.key.getAccidental().getOffset();
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
                throw new error.EtudeError("Invalid pitch string: " + pitchString + " (missing octave)");
            }
            let octave = parseInt(octaveString);
            let pitch = new Pitch(key, octave);
            let programNumber = null;
            // a number that has an open parentheses somewhere before it (this captures both the number and the open parentheses)
            let searchResults = pitchString.match(/\((\d+)/g);
            if (searchResults != null) {
                programNumber = searchResults[0].substring(1);
                if (programNumber !== null) {
                    if (pitch.getProgramNumber() !== parseInt(programNumber)) {
                        throw new error.EtudeError("Invalid pitch string: " + pitchString + " (program number doesn't match key and octave)");
                    }
                }
            }
            let converted = pitch.toString();
            if (programNumber === null) {
                let convertedNoParentheses = converted.substring(0, converted.indexOf("("));
                if (convertedNoParentheses !== pitchString) {
                    if (convertedNoParentheses.length > pitchString.length) {
                        throw new error.EtudeError("Invalid pitch string: " + pitchString + " (missing information)");
                    }
                    else {
                        throw new error.EtudeError("Invalid pitch string: " + pitchString + " (contains extra information)");
                    }
                }
            }
            else {
                if (converted !== pitchString) {
                    if (converted.length > pitchString.length) {
                        throw new error.EtudeError("Invalid pitch string: " + pitchString + " (missing information)");
                    }
                    else {
                        throw new error.EtudeError("Invalid pitch string: " + pitchString + " (contains extra information)");
                    }
                }
            }
            return pitch;
        }
        toString() {
            return this.key.toString() + this.octave + "(" + this.getProgramNumber() + ")";
        }
        equals(other) {
            if (!(other instanceof Pitch)) {
                return false;
            }
            if (other === this) {
                return true;
            }
            let otherPitch = other;
            return this.key.equals(otherPitch.getKey()) && this.octave === otherPitch.getOctave();
        }
        getKey() {
            return this.key;
        }
        getOctave() {
            return this.octave;
        }
    }
    theory.Pitch = Pitch;
    var Policy;
    (function (Policy) {
        function prioritize(...policies) {
            return util.ImmutablePrioritySet.of(policies);
        }
        Policy.prioritize = prioritize;
        function matchLetter(letter) {
            return k => k.getLetter() === letter;
        }
        Policy.matchLetter = matchLetter;
        function matchAccidental(accidental) {
            return k => k.getAccidental() === accidental;
        }
        Policy.matchAccidental = matchAccidental;
        function matchKeySignature(keySignature) {
            let keys = Letter
                .values()
                .map(l => new Key(l))
                .map(k => k.apply(keySignature));
            return k => keys[k.getLetter().ordinal()].equals(k);
        }
        Policy.matchKeySignature = matchKeySignature;
        Policy.NONE_OR_NATURAL = k => k.getAccidental().getOffset() === Accidental.NONE.getOffset();
        Policy.SHARP = Policy.matchAccidental(Accidental.SHARP);
        Policy.DOUBLE_SHARP = Policy.matchAccidental(Accidental.DOUBLE_SHARP);
        Policy.TRIPLE_SHARP = Policy.matchAccidental(Accidental.TRIPLE_SHARP);
        Policy.SHARPS = k => k.getAccidental().getOffset() > Accidental.NONE.getOffset();
        Policy.FLAT = Policy.matchAccidental(Accidental.FLAT);
        Policy.DOUBLE_FLAT = Policy.matchAccidental(Accidental.DOUBLE_FLAT);
        Policy.TRIPLE_FLAT = Policy.matchAccidental(Accidental.TRIPLE_FLAT);
        Policy.FLATS = k => k.getAccidental().getOffset() < Accidental.NONE.getOffset();
        Policy.DEFAULT_PRIORITY = Policy.prioritize(Policy.NONE_OR_NATURAL, Policy.SHARP, Policy.FLAT);
    })(Policy = theory.Policy || (theory.Policy = {}));
    class Scale {
        constructor(key, parameter, descending) {
            this.key = key;
            if (parameter instanceof Scale.Quality) {
                this.quality = parameter;
            }
            else {
                let ascending = parameter;
                if (descending === undefined) {
                    descending = ascending.slice().reverse().map(n => -n);
                }
                this.quality = new Scale.Quality(ascending, descending);
            }
        }
        getDefaultPolicy(direction) {
            if (this.quality.isOctaveRepeating(direction) && this.quality.getStepPattern(direction).length === Letter.size) {
                let it = Letter.iterator(direction, this.key.getLetter());
                // first key is already determined by initial value in InfiniteIterator (which in this case is 'key')
                it.next();
                let current = it.next().value;
                return Policy.prioritize(k => {
                    let pass = k.getLetter() === current;
                    if (pass) {
                        current = it.next().value;
                    }
                    return pass;
                });
            }
            else {
                return Policy.DEFAULT_PRIORITY;
            }
        }
        stream(direction = Direction.DEFAULT, policies) {
            if (direction instanceof util.ImmutablePrioritySet) {
                if (arguments.length !== 1) {
                    throw new error.EtudeError("Invalid number of arguments for stream");
                }
                policies = direction;
                direction = Direction.DEFAULT;
            }
            else if (direction instanceof Direction) {
                if (policies == null) {
                    policies = this.getDefaultPolicy(direction);
                }
            }
            let it = util.CircularIterator.of(this.quality.getStepPattern(direction));
            return util.InfiniteStream.of(this.key, previous => previous.step(it.next().value, policies));
        }
        iterator(direction = Direction.DEFAULT, policies) {
            if (direction instanceof util.ImmutablePrioritySet) {
                if (arguments.length !== 1) {
                    throw new error.EtudeError("Invalid number of arguments for iterator");
                }
                policies = direction;
                direction = Direction.DEFAULT;
            }
            else if (direction instanceof Direction) {
                if (policies == null) {
                    policies = this.getDefaultPolicy(direction);
                }
            }
            let it = util.CircularIterator.of(this.quality.getStepPattern(direction));
            return util.InfiniteIterator.of(this.key, previous => previous.step(it.next().value, policies));
        }
        getKeys(direction = Direction.DEFAULT, policies) {
            if (direction instanceof util.ImmutablePrioritySet) {
                if (arguments.length !== 1) {
                    throw new error.EtudeError("Invalid number of arguments for getKeys");
                }
                policies = direction;
                direction = Direction.DEFAULT;
            }
            else if (direction instanceof Direction) {
                if (policies == null) {
                    policies = this.getDefaultPolicy(direction);
                }
            }
            let keys = [];
            let it = this.iterator(direction, policies);
            let length = this.quality.getStepPattern(direction).length;
            for (let i = 0; i < length; ++i) {
                keys.push(it.next().value);
            }
            return keys;
        }
        toString(direction = Direction.DEFAULT) {
            return "[" + this.getKeys(direction).join(", ") + "]";
        }
        getKey() {
            return this.key;
        }
        getQuality() {
            return this.quality;
        }
    }
    theory.Scale = Scale;
    (function (Scale) {
        class Quality {
            constructor(ascending, descending = ascending.slice().reverse().map(n => -n)) {
                this.ascending = ascending;
                this.descending = descending;
            }
            getStepPattern(direction = Direction.DEFAULT) {
                switch (direction) {
                    case Direction.ASCENDING: return this.ascending;
                    case Direction.DESCENDING: return this.descending;
                    default: throw new error.AssertionError("Invalid direction: " + direction);
                }
            }
            isOctaveRepeating(direction = Direction.DEFAULT) {
                return Math.abs(this.getStepPattern(direction).reduce(util.MathUtil.add, 0)) === MusicConstants.KEYS_IN_OCTAVE;
            }
        }
        Quality.MAJOR = new Quality([2, 2, 1, 2, 2, 2, 1]);
        Quality.NATURAL_MINOR = new Quality([2, 1, 2, 2, 1, 2, 2]);
        Quality.HARMONIC_MINOR = new Quality([2, 1, 2, 2, 1, 3, 1]);
        Quality.MELODIC_MINOR = new Quality([2, 1, 2, 2, 2, 2, 1], [-2, -2, -1, -2, -2, -1, -2]);
        Quality.CHROMATIC = new Quality([1]);
        Quality.WHOLE_TONE = new Quality([2]);
        Scale.Quality = Quality;
    })(Scale = theory.Scale || (theory.Scale = {}));
    class Value {
        constructor(duration) {
            this.duration = duration;
            ++Value.size;
            Value._values.push(this);
        }
        static values() {
            return Value._values.slice();
        }
        ordinal() {
            return Value._values.indexOf(this);
        }
        static valueOf(valueString) {
            let value = Value[valueString];
            if (value instanceof Value) {
                return value;
            }
            throw new error.EtudeError("Invalid value string: " + valueString);
        }
        static fromDuration(duration) {
            if (duration === 0) {
                throw new error.EtudeError("Invalid duration: " + duration + " (cannot be zero)");
            }
            let index = Math.log(duration) / Math.log(2);
            // if index is not an integer value
            if (index % 1 !== 0) {
                throw new error.EtudeError("Invalid duration: " + duration + " (cannot be represented as a value)");
            }
            // 1 - index due to the order of enums
            return Value.values()[1 - index];
        }
        static fromString(valueString) {
            let value;
            let duration = 0;
            if (valueString.match("\\d+\\/\\d+")) {
                let split = valueString.split("/");
                duration = parseFloat(split[0]) / parseFloat(split[1]);
                value = Value.fromDuration(duration);
            }
            else {
                try {
                    value = Value.valueOf(valueString);
                }
                catch (e) {
                    try {
                        duration = parseFloat(valueString);
                        value = Value.fromDuration(duration);
                    }
                    catch (ee) {
                        if (ee instanceof error.EtudeError) {
                            throw ee;
                        }
                        else {
                            throw new error.EtudeError("Invalid value string: " + valueString + " (does not match a valid form)");
                        }
                    }
                }
            }
            return value;
        }
        toString() {
            return Object.keys(Value).find(v => Value[v] === this);
        }
        getDuration() {
            return this.duration;
        }
    }
    Value.size = 0;
    Value._values = [];
    Value.DOUBLE_WHOLE = new Value(2.0);
    Value.WHOLE = new Value(1.0);
    Value.HALF = new Value(0.5);
    Value.QUARTER = new Value(0.25);
    Value.EIGHTH = new Value(0.125);
    Value.SIXTEENTH = new Value(0.0625);
    Value.THIRTY_SECOND = new Value(0.03125);
    Value.SIXTY_FOURTH = new Value(0.015625);
    Value.HUNDRED_TWENTY_EIGHTH = new Value(0.0078125);
    Value.TWO_HUNDRED_FIFTY_SIXTH = new Value(0.00390625);
    theory.Value = Value;
    class Tempo {
        constructor(bpm, parameterA = Value.QUARTER, parameterB = (parameterA + " = " + bpm)) {
            this.bpm = bpm;
            if (parameterA instanceof Value) {
                this.beatValue = parameterA;
                this.tempoMarking = parameterB;
            }
            else if (typeof parameterA === "string") {
                if (arguments.length !== 2) {
                    throw new error.EtudeError("Invalid number of arguments for tempo constructor");
                }
                this.beatValue = Value.QUARTER;
                this.tempoMarking = parameterA;
            }
        }
        getBPM() {
            return this.bpm;
        }
        getBeatValue() {
            return this.beatValue;
        }
        getTempoMarking() {
            return this.tempoMarking;
        }
    }
    /*
     * Values based on the mean of the values given in
     * https://en.wikipedia.org/wiki/Tempo
     */
    Tempo.LARGHISSIMO = new Tempo(24, "Larghissimo");
    Tempo.GRAVE = new Tempo(35, "Grave");
    Tempo.LARGO = new Tempo(50, "Largo");
    Tempo.LENTO = new Tempo(53, "Lento");
    Tempo.LARGHETTO = new Tempo(63, "Larghetto");
    Tempo.ADAGIO = new Tempo(71, "Adagio");
    Tempo.ADAGIETTO = new Tempo(74, "Adagietto");
    Tempo.ANDANTE = new Tempo(92, "Andante");
    Tempo.ANDANTINO = new Tempo(94, "Andantino");
    Tempo.MARCIA_MODERATO = new Tempo(84, "Marcia Moderato");
    Tempo.ANDANTE_MODERATO = new Tempo(102, "Andante Moderato");
    Tempo.MODERATO = new Tempo(114, "Moderato");
    Tempo.ALLEGRETTO = new Tempo(116, "Allegretto");
    Tempo.ALLEGRO_MODERATO = new Tempo(118, "Allegro Moderato");
    Tempo.ALLEGRO = new Tempo(144, "Allegro");
    Tempo.VIVACE = new Tempo(172, "Vivace");
    Tempo.VIVACISSIMO = new Tempo(174, "Vivacissimo");
    Tempo.ALLEGRISSIMO = new Tempo(174, "Allegrissimo");
    Tempo.ALLEGRO_VIVACE = new Tempo(174, "Allegro Vivace");
    Tempo.PRESTO = new Tempo(184, "Presto");
    Tempo.PRESTISSIMO = new Tempo(200, "Prestissimo");
    theory.Tempo = Tempo;
    class Interval {
        constructor(quality, distance) {
            this.quality = quality;
            this.distance = distance;
            if (distance <= 0) {
                throw new error.EtudeError("Invalid interval: " + quality + distance + " (distance must be a positive integer)");
            }
            switch (quality) {
                case Interval.Quality.PERFECT:
                    if (!Interval.isPerfect(distance)) {
                        throw new error.EtudeError("Invalid interval: " + quality + distance + " (distance cannot have a perfect quality)");
                    }
                    break;
                case Interval.Quality.MAJOR:
                case Interval.Quality.MINOR:
                    if (Interval.isPerfect(distance)) {
                        throw new error.EtudeError("Invalid interval: " + quality + distance + " (distance cannot have major or minor quality)");
                    }
                    break;
                case Interval.Quality.DIMINISHED:
                case Interval.Quality.DOUBLY_DIMINISHED:
                case Interval.Quality.AUGMENTED:
                case Interval.Quality.DOUBLY_AUGMENTED:
                    break;
            }
        }
        static between(a, b) {
            let letterA = a.getKey().getLetter();
            let letterB = b.getKey().getLetter();
            /**
             * 1 (because no distance == 1)
             * + letterDistance (subtracted 2 because C is the start of the octave)
             * + octaveDistance
             */
            let distance = 1
                + (util.MathUtil.floorMod(letterB.ordinal() - 2, Letter.size) - util.MathUtil.floorMod(letterA.ordinal() - 2, Letter.size))
                + (b.getOctave() - a.getOctave()) * Letter.size;
            if (distance <= 0) {
                throw new error.EtudeError("Cannot create interval with nonpositive number");
            }
            let offset = (b.getProgramNumber() - a.getProgramNumber()) % MusicConstants.KEYS_IN_OCTAVE;
            offset -= Scale.Quality.MAJOR
                .getStepPattern()
                .slice(0, (distance - 1) % Letter.size)
                .reduce(util.MathUtil.add, 0);
            let quality;
            switch (offset) {
                case -3:
                    if (Interval.isPerfect(distance)) {
                        throw new error.EtudeError("Cannot create interval for pitches: " + a + " -> " + b);
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
                    throw new error.EtudeError("Cannot create interval for pitches: " + a + " -> " + b);
            }
            return new Interval(quality, distance);
        }
        getOffset() {
            // initialize offset to take into account octave
            let offset = Math.trunc((this.distance - 1) / Letter.size) * MusicConstants.KEYS_IN_OCTAVE;
            // take into account normalized number (within the range of an octave)
            offset += Scale.Quality.MAJOR
                .getStepPattern()
                .slice(0, this.distance - 1)
                .reduce(util.MathUtil.add, 0);
            // take into account quality
            switch (this.quality) {
                case Interval.Quality.PERFECT:
                case Interval.Quality.MAJOR:
                    break;
                case Interval.Quality.MINOR:
                    --offset;
                    break;
                case Interval.Quality.DIMINISHED:
                    offset -= Interval.isPerfect(this.distance) ? 1 : 2;
                    break;
                case Interval.Quality.DOUBLY_DIMINISHED:
                    offset -= Interval.isPerfect(this.distance) ? 2 : 3;
                    break;
                case Interval.Quality.AUGMENTED:
                    ++offset;
                    break;
                case Interval.Quality.DOUBLY_AUGMENTED:
                    offset += 2;
                    break;
            }
            return offset;
        }
        static isPerfect(distance) {
            let normalized = distance % 7;
            return normalized === 1 || normalized === 4 || normalized === 5;
        }
        static fromString(intervalString) {
            let matches = intervalString.match(/\D+|\d+/g);
            if (matches.length < 2) {
                throw new error.EtudeError("Invalid interval string: " + intervalString + " (missing information)");
            }
            else if (matches.length > 2) {
                throw new error.EtudeError("Invalid interval string: " + intervalString + " (contains extra information)");
            }
            let quality = Interval.Quality.fromString(matches[0]);
            let distance = parseInt(matches[1]);
            return new Interval(quality, distance);
        }
        toString() {
            return this.quality.toString() + this.distance;
        }
        getQuality() {
            return this.quality;
        }
        getDistance() {
            return this.distance;
        }
    }
    theory.Interval = Interval;
    (function (Interval) {
        class Quality {
            constructor(symbol) {
                this.symbol = symbol;
            }
            static fromString(qualityString) {
                let quality = Object
                    .keys(Quality)
                    .map(q => Quality[q])
                    .filter(q => q instanceof Quality)
                    .find(q => q.toString() === qualityString);
                if (quality === undefined) {
                    throw new error.EtudeError("Invalid quality string: " + qualityString);
                }
                return quality;
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
    })(Interval = theory.Interval || (theory.Interval = {}));
    class Chord {
        constructor(parameter, quality, inversion = Inversion.ROOT) {
            if (parameter instanceof Pitch) {
                if (arguments.length < 2 || arguments.length > 3) {
                    throw new error.EtudeError("Invalid number of arguments for chord constructor");
                }
                this.pitches = Chord
                    .builder()
                    .setRoot(parameter)
                    .add(quality)
                    .setInversion(inversion)
                    .build()
                    .pitches;
            }
            else if (parameter instanceof Array) {
                this.pitches = parameter;
            }
        }
        static fromString(chordString) {
            if (!chordString.includes("[") || !chordString.includes("]")) {
                throw new error.EtudeError("Invalid chord string: " + chordString + " (missing brackets that enclose pitches)");
            }
            if (!chordString.startsWith("[") || !chordString.endsWith("]")) {
                throw new error.EtudeError("Invalid chord string: " + chordString + " (contains extra information)");
            }
            let pitchesString = chordString.substring(1, chordString.length - 1);
            if (pitchesString.includes("[") || pitchesString.includes("]")) {
                throw new error.EtudeError("Invalid chord string: " + chordString + " (contains extra brackets)");
            }
            let pitches = pitchesString
                .split(",")
                .map(s => s.trim())
                .map(Pitch.fromString);
            return new Chord(pitches);
        }
        toString() {
            return "[" + this.pitches.join(", ") + "]";
        }
        getPitches() {
            return this.pitches;
        }
        static builder() {
            return new Chord.Builder();
        }
    }
    theory.Chord = Chord;
    (function (Chord) {
        class Quality {
            constructor(intervalPattern) {
                this.intervalPattern = intervalPattern;
            }
            getIntervalPattern() {
                return this.intervalPattern;
            }
        }
        Quality.MAJOR = new Quality([
            new Interval(Interval.Quality.PERFECT, 1),
            new Interval(Interval.Quality.MAJOR, 3),
            new Interval(Interval.Quality.PERFECT, 5)
        ]);
        Quality.MINOR = new Quality([
            new Interval(Interval.Quality.PERFECT, 1),
            new Interval(Interval.Quality.MINOR, 3),
            new Interval(Interval.Quality.PERFECT, 5)
        ]);
        Quality.DIMINISHED = new Quality([
            new Interval(Interval.Quality.PERFECT, 1),
            new Interval(Interval.Quality.MINOR, 3),
            new Interval(Interval.Quality.DIMINISHED, 5)
        ]);
        Quality.AUGMENTED = new Quality([
            new Interval(Interval.Quality.PERFECT, 1),
            new Interval(Interval.Quality.MAJOR, 3),
            new Interval(Interval.Quality.AUGMENTED, 5)
        ]);
        Quality.MAJOR_SEVENTH = new Quality([
            new Interval(Interval.Quality.PERFECT, 1),
            new Interval(Interval.Quality.MAJOR, 3),
            new Interval(Interval.Quality.PERFECT, 5),
            new Interval(Interval.Quality.MAJOR, 7)
        ]);
        Quality.MINOR_SEVENTH = new Quality([
            new Interval(Interval.Quality.PERFECT, 1),
            new Interval(Interval.Quality.MINOR, 3),
            new Interval(Interval.Quality.PERFECT, 5),
            new Interval(Interval.Quality.MINOR, 7)
        ]);
        Quality.DOMINANT_SEVENTH = new Quality([
            new Interval(Interval.Quality.PERFECT, 1),
            new Interval(Interval.Quality.MAJOR, 3),
            new Interval(Interval.Quality.PERFECT, 5),
            new Interval(Interval.Quality.MINOR, 7)
        ]);
        Quality.DIMINISHED_SEVENTH = new Quality([
            new Interval(Interval.Quality.PERFECT, 1),
            new Interval(Interval.Quality.MINOR, 3),
            new Interval(Interval.Quality.DIMINISHED, 5),
            new Interval(Interval.Quality.DIMINISHED, 7)
        ]);
        Quality.HALF_DIMINISHED_SEVENTH = new Quality([
            new Interval(Interval.Quality.PERFECT, 1),
            new Interval(Interval.Quality.MINOR, 3),
            new Interval(Interval.Quality.DIMINISHED, 5),
            new Interval(Interval.Quality.MINOR, 7)
        ]);
        Quality.MINOR_MAJOR_SEVENTH = new Quality([
            new Interval(Interval.Quality.PERFECT, 1),
            new Interval(Interval.Quality.MINOR, 3),
            new Interval(Interval.Quality.PERFECT, 5),
            new Interval(Interval.Quality.MAJOR, 7)
        ]);
        Quality.AUGMENTED_MAJOR_SEVENTH = new Quality([
            new Interval(Interval.Quality.PERFECT, 1),
            new Interval(Interval.Quality.MAJOR, 3),
            new Interval(Interval.Quality.AUGMENTED, 5),
            new Interval(Interval.Quality.MAJOR, 7)
        ]);
        Chord.Quality = Quality;
        class Builder {
            constructor() {
                this.pitches = [];
                this.bottomDegree = Degree.TONIC;
            }
            setRoot(root) {
                this.root = root;
                return this;
            }
            add(element) {
                if (element instanceof Interval) {
                    this.pitches.push(this.root.step(element));
                }
                else if (element instanceof Quality) {
                    element
                        .getIntervalPattern()
                        .forEach(i => this.pitches.push(this.root.step(i)));
                }
                return this;
            }
            setInversion(inversion) {
                switch (inversion) {
                    case Inversion.ROOT: return this.setBottomDegree(Degree.TONIC);
                    case Inversion.FIRST: return this.setBottomDegree(Degree.MEDIANT);
                    case Inversion.SECOND: return this.setBottomDegree(Degree.DOMINANT);
                    case Inversion.THIRD: return this.setBottomDegree(Degree.LEADING_TONE);
                    default: throw new error.AssertionError("Invalid inversion: " + inversion);
                }
            }
            setBottomDegree(degree) {
                this.bottomDegree = degree;
                return this;
            }
            build() {
                let pitchesArray = this.pitches.sort((a, b) => a.compareTo(b));
                let keySignature = new KeySignature(this.root.getKey(), KeySignature.Quality.MAJOR);
                let letter = keySignature.keyOf(this.bottomDegree).getLetter();
                let optional = pitchesArray.find(p => p.getKey().getLetter() === letter);
                if (optional === undefined) {
                    throw new error.EtudeError("Unable to invert chord: missing " + this.bottomDegree + " pitch");
                }
                let lowestPitch = optional;
                while (lowestPitch !== pitchesArray[0]) {
                    pitchesArray.push(lowestPitch.getHigherPitch(pitchesArray.shift().getKey()));
                }
                return new Chord(pitchesArray);
            }
        }
        Chord.Builder = Builder;
    })(Chord = theory.Chord || (theory.Chord = {}));
    class KeySignature {
        constructor(key, quality) {
            this.key = key;
            this.quality = quality;
        }
        isMajor() {
            return this.quality === KeySignature.Quality.MAJOR;
        }
        isMinor() {
            return this.quality === KeySignature.Quality.MINOR;
        }
        degreeOf(key) {
            let difference = util.MathUtil.floorMod(key.getLetter().ordinal() - this.key.getLetter().ordinal(), Letter.size);
            return Degree.fromValue(difference + 1);
        }
        keyOf(degree) {
            let letters = Letter.values(this.key.getLetter());
            let key = new Key(letters[degree.getValue() - 1]);
            return key.apply(this);
        }
        getKeysWithAccidentals() {
            let keysWithAccidentals = new Scale(this.key, this.isMajor() ? Scale.Quality.MAJOR : Scale.Quality.NATURAL_MINOR)
                .getKeys()
                .filter(k => !k.isNone() && !k.isNatural());
            if (keysWithAccidentals.length !== 0) {
                let ordered;
                switch (keysWithAccidentals[0].getAccidental()) {
                    case Accidental.FLAT:
                    case Accidental.DOUBLE_FLAT:
                    case Accidental.TRIPLE_FLAT:
                        ordered = KeySignature.ORDER_OF_FLATS;
                        break;
                    case Accidental.SHARP:
                    case Accidental.DOUBLE_SHARP:
                    case Accidental.TRIPLE_SHARP:
                        ordered = KeySignature.ORDER_OF_SHARPS;
                        break;
                    default:
                        throw new error.AssertionError("Invalid accidental: " + keysWithAccidentals[0].getAccidental());
                }
                keysWithAccidentals.sort((a, b) => util.MathUtil.compare(ordered.indexOf(a.getLetter()), ordered.indexOf(b.getLetter())));
            }
            return keysWithAccidentals;
        }
        getAccidentalCount() {
            return new Scale(this.key, this.isMajor() ? Scale.Quality.MAJOR : Scale.Quality.NATURAL_MINOR)
                .getKeys()
                .filter(k => !k.isNone() && !k.isNatural())
                .length;
        }
        static fromAccidentals(accidental, count, quality) {
            if (count < 0 || count > 7) {
                throw new error.EtudeError("Invalid accidental count: " + count);
            }
            if (count === 0 && (accidental !== Accidental.NONE && accidental !== Accidental.NATURAL)) {
                throw new error.EtudeError("Invalid count for accidental type: " + count + " " + accidental);
            }
            let key;
            let letter;
            // determine the key assuming quality is MAJOR
            switch (accidental) {
                case Accidental.FLAT:
                    letter = KeySignature.ORDER_OF_FLATS[util.MathUtil.floorMod(count - 2, Letter.size)];
                    key = new Key(letter, 
                    // accidental; if flats for key signature contain the letter, make the key flat
                    KeySignature.ORDER_OF_FLATS.slice(0, count).indexOf(letter) > -1
                        ? Accidental.FLAT
                        : Accidental.NONE);
                    break;
                case Accidental.SHARP:
                    letter = KeySignature.ORDER_OF_SHARPS[util.MathUtil.floorMod(count + 1, Letter.size)];
                    key = new Key(letter, 
                    // accidental; if sharps for key signature contain the letter, make the key sharp
                    KeySignature.ORDER_OF_SHARPS.slice(0, count).indexOf(letter) > -1
                        ? Accidental.SHARP
                        : Accidental.NONE);
                    break;
                case Accidental.NONE:
                case Accidental.NATURAL:
                    if (count !== 0) {
                        throw new error.EtudeError("Invalid count for accidental type: " + count + " " + accidental);
                    }
                    letter = Letter.C;
                    key = new Key(letter);
                    break;
                default:
                    throw new error.EtudeError("Invalid accidental type to create KeySignature from: " + accidental);
            }
            let keySignature = new KeySignature(key, KeySignature.Quality.MAJOR);
            if (quality === KeySignature.Quality.MINOR) {
                keySignature = keySignature.getRelative();
            }
            return keySignature;
        }
        getParallel() {
            return new KeySignature(this.key, this.isMajor() ? KeySignature.Quality.MINOR : KeySignature.Quality.MAJOR);
        }
        getRelative() {
            let keys = this.getKeysWithAccidentals();
            /**
             * 0 flats/sharps = NONE_OR_NATURAL
                 * flats = NONE_OR_NATURAL + FLAT
                 * sharps = NONE_OR_NATURAL + SHARP
                 */
            let policies = keys.length === 0
                ? Policy.prioritize(Policy.NONE_OR_NATURAL)
                : Policy.prioritize(Policy.NONE_OR_NATURAL, keys[0].getAccidental() === Accidental.FLAT
                    ? Policy.FLAT
                    : Policy.SHARP);
            /**
             * major -> minor = -3
             * minor -> major = 3
             */
            return new KeySignature(Key.fromOffset(util.MathUtil.floorMod(this.key.getOffset() + (this.isMajor() ? -3 : 3), MusicConstants.KEYS_IN_OCTAVE), policies), this.isMajor() ? KeySignature.Quality.MINOR : KeySignature.Quality.MAJOR);
        }
        toString() {
            return this.key.toString() + this.quality.toString();
        }
        getKey() {
            return this.key;
        }
        getQuality() {
            return this.quality;
        }
    }
    KeySignature.ORDER_OF_FLATS = "BEADGCF".split("").map(Letter.fromChar);
    KeySignature.ORDER_OF_SHARPS = "FCGDAEB".split("").map(Letter.fromChar);
    theory.KeySignature = KeySignature;
    (function (KeySignature) {
        class Quality {
            constructor() {
            }
            toString() {
                return Object.keys(Quality).find(q => Quality[q] === this);
            }
        }
        Quality.MAJOR = new Quality();
        Quality.MINOR = new Quality();
        KeySignature.Quality = Quality;
    })(KeySignature = theory.KeySignature || (theory.KeySignature = {}));
    class TimeSignature {
        constructor(beatsPerMeasure, parameter) {
            this.beatsPerMeasure = beatsPerMeasure;
            if (typeof parameter === "number") {
                this.oneBeat = Value.fromDuration(1.0 / parameter);
            }
            else {
                this.oneBeat = parameter;
            }
        }
        getDurationOfMeasure() {
            return this.beatsPerMeasure * this.oneBeat.getDuration();
        }
        getBeatsPerMeasure() {
            return this.beatsPerMeasure;
        }
        getOneBeat() {
            return this.oneBeat;
        }
    }
    TimeSignature.COMMON_TIME = new TimeSignature(4, Value.QUARTER);
    theory.TimeSignature = TimeSignature;
})(theory = exports.theory || (exports.theory = {}));
