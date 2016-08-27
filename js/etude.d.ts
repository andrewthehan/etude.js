export declare class Accidental {
    symbol: string;
    offset: number;
    static size: number;
    private static _values;
    static TRIPLE_FLAT: Accidental;
    static DOUBLE_FLAT: Accidental;
    static FLAT: Accidental;
    static NONE: Accidental;
    static NATURAL: Accidental;
    static SHARP: Accidental;
    static DOUBLE_SHARP: Accidental;
    static TRIPLE_SHARP: Accidental;
    constructor(symbol: string, offset: number);
    static fromOffset(offset: number): Accidental;
    static fromString(accidentalString: string): Accidental;
    static values(): Accidental[];
    toString(): string;
}
export declare module Accidental {
    enum Policy {
        MAINTAIN_LETTER = 0,
        PRIORITIZE_NATURAL = 1,
        PRIORITIZE_SHARP = 2,
        PRIORITIZE_FLAT = 3,
    }
}
export declare class Degree {
    value: number;
    static size: number;
    private static _values;
    static TONIC: Degree;
    static SUPERTONIC: Degree;
    static MEDIANT: Degree;
    static SUBDOMINANT: Degree;
    static DOMINANT: Degree;
    static SUBMEDIANT: Degree;
    static LEADING_TONE: Degree;
    constructor(value: number);
    static values(startingDegree?: Degree): Degree[];
    static fromValue(value: any): Degree;
    toString(): string;
}
export declare class Inversion {
    value: number;
    static ROOT: Inversion;
    static FIRST: Inversion;
    static SECOND: Inversion;
    static THIRD: Inversion;
    constructor(value: number);
    toString(): string;
}
export declare class Key {
    letter: Letter;
    accidental: Accidental;
    offset: number;
    constructor(letter: Letter, accidental?: Accidental);
    apply(keySignature: KeySignature): Key;
    none(): Key;
    natural(): Key;
    sharp(): Key;
    doubleSharp(): Key;
    tripleSharp(): Key;
    flat(): Key;
    doubleFlat(): Key;
    tripleFlat(): Key;
    isNone(): boolean;
    isNatural(): boolean;
    isSharp(): boolean;
    isDoubleSharp(): boolean;
    isTripleSharp(): boolean;
    isFlat(): boolean;
    isDoubleFlat(): boolean;
    isTripleFlat(): boolean;
    static isEnharmonic(a: Key, b: Key): boolean;
    static fromOffset(offset: number, policy?: Accidental.Policy): Key;
    static fromString(keyString: string): Key;
    toString(): string;
}
export declare class Letter {
    offset: number;
    static size: number;
    private static _values;
    static A: Letter;
    static B: Letter;
    static C: Letter;
    static D: Letter;
    static E: Letter;
    static F: Letter;
    static G: Letter;
    constructor(offset: number);
    static iterator(startingLetter?: Letter): IterableIterator<Letter>;
    static values(startingLetter?: Letter): Letter[];
    static isValid(letterChar: string): boolean;
    static fromChar(letterChar: string): Letter;
    ordinal(): number;
    toString(): string;
}
export declare class Mode {
    private _stepPattern;
    static IONIAN: Mode;
    static DORIAN: Mode;
    static PHRYGIAN: Mode;
    static LYDIAN: Mode;
    static MIXOLYDIAN: Mode;
    static AEOLIAN: Mode;
    static LOCRIAN: Mode;
    static MAJOR: Mode;
    static NATURAL_MINOR: Mode;
    static HARMONIC_MINOR: Mode;
    constructor(_stepPattern: number[]);
    stepPattern: number[];
    toString(): string;
}
export declare module MusicConstants {
    const KEYS_IN_OCTAVE: number;
    const SMALLEST_PROGRAM_NUMBER: number;
    const LARGEST_PROGRAM_NUMBER: number;
}
export declare class Pitch {
    key: Key;
    octave: number;
    programNumber: number;
    constructor(key: Key, octave: number);
    apply(keySignature: KeySignature): Pitch;
    step(amount: Interval | number, policy?: Accidental.Policy): Pitch;
    halfStepUp(policy?: Accidental.Policy): Pitch;
    halfStepDown(policy?: Accidental.Policy): Pitch;
    isHigherThan(pitch: Pitch): boolean;
    isLowerThan(pitch: Pitch): boolean;
    compareTo(pitch: Pitch): number;
    getHigherPitch(key: Key): Pitch;
    getLowerPitch(key: Key): Pitch;
    static isEnharmonic(a: Pitch, b: Pitch): boolean;
    static fromProgramNumber(programNumber: number, policy?: Accidental.Policy): Pitch;
    /**
     * Any input in the form
     *   - ${key}${octave}
     *   - ${key}${octave}(${program number})
     * is accepted and converted into a Pitch.
     * ${program number} is intentionally not accepted because #fromProgramNumber
     * exists and should be used instead.
     */
    static fromString(pitchString: string): Pitch;
    toString(): string;
}
export declare class Scale {
    keySignature: KeySignature;
    private _keys;
    constructor(keySignature: KeySignature);
    iterator(): IterableIterator<Key>;
    keys: Key[];
}
export declare module Util {
    function add(a: number, b: number): number;
    function compare(a: number, b: number): number;
    function floorMod(a: number, b: number): number;
    function infiniteIteratorOf(array: any[]): IterableIterator<any>;
    function rotate(array: any[], distance: number): void;
}
export declare class Value {
    duration: number;
    static size: number;
    private static _values;
    static DOUBLE_WHOLE: Value;
    static WHOLE: Value;
    static HALF: Value;
    static QUARTER: Value;
    static EIGHTH: Value;
    static SIXTEENTH: Value;
    static THIRTY_SECOND: Value;
    static SIXTY_FOURTH: Value;
    static HUNDRED_TWENTY_EIGHTH: Value;
    static TWO_HUNDRED_FIFTY_SIXTH: Value;
    constructor(duration: number);
    static fromDuration(duration: number): Value;
    static fromString(valueString: string): Value;
    static values(): Value[];
    toString(): string;
}
export declare class Interval {
    quality: Interval.Quality;
    distance: number;
    offset: number;
    constructor(quality: Interval.Quality, distance: number);
    static fromString(intervalString: string): Interval;
    toString(): string;
    static between(a: Pitch, b: Pitch): Interval;
    static isPerfect(distance: number): boolean;
}
export declare module Interval {
    class Quality {
        symbol: string;
        static PERFECT: Quality;
        static MAJOR: Quality;
        static MINOR: Quality;
        static DIMINISHED: Quality;
        static DOUBLY_DIMINISHED: Quality;
        static AUGMENTED: Quality;
        static DOUBLY_AUGMENTED: Quality;
        constructor(symbol: string);
        static fromString(qualityString: string): Quality;
        toString(): string;
    }
}
export declare class Chord {
    pitches: Pitch[];
    constructor(pitches: Pitch[]);
    static fromString(chordString: string): Chord;
    toString(): string;
    static builder(): Chord.RequiresRoot;
}
export declare module Chord {
    class Quality {
        intervalPattern: Interval[];
        symbol: any;
        static MAJOR: Quality;
        static MINOR: Quality;
        static DIMINISHED: Quality;
        static AUGMENTED: Quality;
        static MAJOR_SEVENTH: Quality;
        static MINOR_SEVENTH: Quality;
        static DOMINANT_SEVENTH: Quality;
        static DIMINISHED_SEVENTH: Quality;
        static HALF_DIMINISHED_SEVENTH: Quality;
        static MINOR_MAJOR_SEVENTH: Quality;
        static AUGMENTED_MAJOR_SEVENTH: Quality;
        constructor(intervalPattern: Interval[], symbol: any);
        toString(): string;
    }
    class Builder implements Base, RequiresRoot, Manipulate, End {
        pitches: Set<Pitch>;
        bottomDegree: Degree;
        root: Pitch;
        setRoot(root: Pitch): Manipulate;
        add(element: Interval | Quality): Manipulate;
        setInversion(inversion: Inversion): End;
        setBottomDegree(degree: Degree): End;
        build(): Chord;
    }
    interface Base {
        build(): Chord;
    }
    interface RequiresRoot {
        setRoot(root: Pitch): Manipulate;
    }
    interface Manipulate extends Base {
        add(element: Interval | Quality): Manipulate;
        setInversion(inversion: Inversion): End;
        setBottomDegree(degree: Degree): End;
    }
    interface End extends Base {
    }
}
export declare class KeySignature {
    key: Key;
    mode: Mode;
    static ORDER_OF_FLATS: Letter[];
    static ORDER_OF_SHARPS: Letter[];
    keysWithAccidentals: Key[];
    accidentalCount: number;
    constructor(key: Key, mode: Mode);
    degreeOf(key: Key): Degree;
    keyOf(degree: Degree): Key;
    static fromAccidentals(accidental: Accidental, count: number, mode: Mode): KeySignature;
    toString(): string;
}
