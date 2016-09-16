export declare module error {
    class AssertionError extends Error {
        constructor(message: string);
    }
    class EtudeError extends Error {
        constructor(message: string);
    }
}
export declare module util {
    module MathUtil {
        function add(a: number, b: number): number;
        function compare(a: number, b: number): number;
        function floorMod(a: number, b: number): number;
        function rotate(array: any[], distance: number): void;
    }
    class CircularIterator<E> implements IterableIterator<E> {
        private values;
        private i;
        constructor(values: E[]);
        static of<E>(values: E[]): CircularIterator<E>;
        [Symbol.iterator](): IterableIterator<E>;
        getValues(): E[];
        getCurrentValue(): E;
        private increment();
        getCycleLength(): number;
        next(): IteratorResult<E>;
    }
    class CircularStream<E> implements Stream<E> {
        private values;
        private it;
        constructor(values: E[]);
        static of<E>(values: E[]): CircularStream<E>;
        filter(filter: Predicate<E>): CircularStream<E>;
        map<R>(map: Function<E, R>): CircularStream<R>;
        limit(size: number): E[];
        skip(amount: number): this;
    }
    class ImmutablePrioritySet<E> extends Set<E> {
        private _values;
        constructor(_values: E[]);
        static of<E>(values: E[]): ImmutablePrioritySet<E>;
        compare(a: E, b: E): number;
        iterator(): IterableIterator<E>;
    }
    class InfiniteIterator<E> implements IterableIterator<E> {
        private initial;
        private func;
        private current;
        constructor(initial: E, func: Function<E, E>);
        static of<E>(initial: E, func: Function<E, E>): InfiniteIterator<E>;
        [Symbol.iterator](): IterableIterator<E>;
        getCurrentValue(): E;
        reset(): void;
        next(): IteratorResult<E>;
    }
    class InfiniteStream<E> implements Stream<E> {
        private initial;
        private func;
        private it;
        constructor(initial: E, func: Function<E, E>);
        static of<E>(initial: E, func: Function<E, E>): InfiniteStream<E>;
        filter(filter: Predicate<E>): InfiniteStream<E>;
        map<R>(map: Function<E, R>): InfiniteStream<R>;
        limit(size: number): E[];
        skip(amount: number): this;
    }
    interface Stream<E> {
        filter(filter: Predicate<E>): Stream<E>;
        map<R>(map: Function<E, R>): Stream<R>;
        limit(size: number): E[];
        skip(amount: number): Stream<E>;
    }
    interface Function<T, R> {
        (t: T): R;
    }
    interface Predicate<T> {
        (t: T): boolean;
    }
}
export declare module theory {
    class Accidental {
        private symbol;
        private offset;
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
        static values(): Accidental[];
        ordinal(): number;
        static valueOf(accidentalString: string): Accidental;
        static fromOffset(offset: number): Accidental;
        getOffset(): number;
        static fromString(accidentalString: string): Accidental;
        toString(): string;
    }
    class Degree {
        static size: number;
        private static _values;
        static TONIC: Degree;
        static SUPERTONIC: Degree;
        static MEDIANT: Degree;
        static SUBDOMINANT: Degree;
        static DOMINANT: Degree;
        static SUBMEDIANT: Degree;
        static LEADING_TONE: Degree;
        constructor();
        static values(startingDegree?: Degree): Degree[];
        ordinal(): number;
        static valueOf(degreeString: string): Degree;
        static fromValue(value: number): Degree;
        getValue(): number;
        toString(): string;
    }
    class Direction {
        static ASCENDING: Direction;
        static DESCENDING: Direction;
        static DEFAULT: Direction;
        toString(): string;
    }
    class Dynamic {
        private symbol;
        static size: number;
        private static _values;
        static PIANISSISSIMO: Dynamic;
        static PIANISSIMO: Dynamic;
        static PIANO: Dynamic;
        static MEZZO_PIANO: Dynamic;
        static MEZZO_FORTE: Dynamic;
        static FORTE: Dynamic;
        static FORTISSIMO: Dynamic;
        static FORTISSISSIMO: Dynamic;
        constructor(symbol: string);
        static values(): Dynamic[];
        ordinal(): number;
        static valueOf(dynamicString: string): Dynamic;
        crescendo(): Dynamic;
        diminuendo(): Dynamic;
        static fromString(dynamicString: string): Dynamic;
        toString(): string;
    }
    class Inversion {
        static size: number;
        private static _values;
        static ROOT: Inversion;
        static FIRST: Inversion;
        static SECOND: Inversion;
        static THIRD: Inversion;
        constructor();
        static values(): Inversion[];
        ordinal(): number;
        static valueOf(inversionString: string): Inversion;
        getValue(): number;
        toString(): string;
    }
    class Key {
        private letter;
        private accidental;
        constructor(letter: Letter, accidental?: Accidental);
        step(amount: number, policies?: util.ImmutablePrioritySet<Policy>): Key;
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
        getEnharmonicEquivalent(parameter: Letter | util.ImmutablePrioritySet<Policy>): Key;
        static isEnharmonic(a: Key, b: Key): boolean;
        static fromOffset(offset: number, policies?: util.ImmutablePrioritySet<Policy>): Key;
        getOffset(): number;
        static fromString(keyString: string): Key;
        toString(): string;
        equals(other: any): boolean;
        getLetter(): Letter;
        getAccidental(): Accidental;
    }
    class Letter {
        private offset;
        static size: number;
        private static _values;
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
        static A: Letter;
        static B: Letter;
        static C: Letter;
        static D: Letter;
        static E: Letter;
        static F: Letter;
        static G: Letter;
        constructor(offset: number);
        static values(direction?: Direction | Letter, startingLetter?: Letter): Letter[];
        ordinal(): number;
        static valueOf(letterString: string): Letter;
        getOffset(): number;
        static stream(direction?: Direction | Letter, startingLetter?: Letter): util.CircularStream<Letter>;
        static iterator(direction?: Direction | Letter, startingLetter?: Letter): util.CircularIterator<Letter>;
        static isValid(letterChar: string): boolean;
        static fromChar(letterChar: string): Letter;
        toString(): string;
    }
    class Mode {
        private stepPattern;
        static IONIAN: Mode;
        static DORIAN: Mode;
        static PHRYGIAN: Mode;
        static LYDIAN: Mode;
        static MIXOLYDIAN: Mode;
        static AEOLIAN: Mode;
        static LOCRIAN: Mode;
        constructor(stepPattern: number[]);
        getStepPattern(): number[];
        toString(): string;
    }
    module MusicConstants {
        const KEYS_IN_OCTAVE: number;
        const SMALLEST_PROGRAM_NUMBER: number;
        const LARGEST_PROGRAM_NUMBER: number;
    }
    class Note {
        private pitch;
        private value;
        constructor(pitch: Pitch, value: Value);
        static fromString(noteString: string): Note;
        toString(): string;
        equals(other: any): boolean;
        getPitch(): Pitch;
        getValue(): Value;
    }
    class Pitch {
        private key;
        private octave;
        constructor(key: Key, octave: number);
        apply(keySignature: KeySignature): Pitch;
        step(amount: Interval | number, policies?: util.ImmutablePrioritySet<Policy>): Pitch;
        halfStepUp(policies?: util.ImmutablePrioritySet<Policy>): Pitch;
        halfStepDown(policies?: util.ImmutablePrioritySet<Policy>): Pitch;
        isHigherThan(pitch: Pitch): boolean;
        isLowerThan(pitch: Pitch): boolean;
        compareTo(pitch: Pitch): number;
        getHigherPitch(key: Key): Pitch;
        getLowerPitch(key: Key): Pitch;
        static isEnharmonic(a: Pitch, b: Pitch): boolean;
        static fromProgramNumber(programNumber: number, policies?: util.ImmutablePrioritySet<Policy>): Pitch;
        getProgramNumber(): number;
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
        equals(other: any): boolean;
        getKey(): Key;
        getOctave(): number;
    }
    interface Policy extends util.Predicate<Key> {
    }
    module Policy {
        function prioritize(...policies: Policy[]): util.ImmutablePrioritySet<Policy>;
        function matchLetter(letter: Letter): Policy;
        function matchAccidental(accidental: Accidental): Policy;
        function matchKeySignature(keySignature: KeySignature): Policy;
        let NONE_OR_NATURAL: (k: any) => boolean;
        let SHARP: Policy;
        let DOUBLE_SHARP: Policy;
        let TRIPLE_SHARP: Policy;
        let SHARPS: (k: any) => boolean;
        let FLAT: Policy;
        let DOUBLE_FLAT: Policy;
        let TRIPLE_FLAT: Policy;
        let FLATS: (k: any) => boolean;
        let DEFAULT_PRIORITY: util.ImmutablePrioritySet<Policy>;
    }
    class Scale {
        private key;
        private quality;
        constructor(key: Key, parameter: number[] | Scale.Quality, descending?: number[]);
        getDefaultPolicy(direction: Direction): util.ImmutablePrioritySet<Policy>;
        stream(direction?: Direction | util.ImmutablePrioritySet<Policy>, policies?: util.ImmutablePrioritySet<Policy>): util.InfiniteStream<Key>;
        iterator(direction?: Direction | util.ImmutablePrioritySet<Policy>, policies?: util.ImmutablePrioritySet<Policy>): util.InfiniteIterator<Key>;
        getKeys(direction?: Direction | util.ImmutablePrioritySet<Policy>, policies?: util.ImmutablePrioritySet<Policy>): Key[];
        toString(direction?: Direction): string;
        getKey(): Key;
        getQuality(): Scale.Quality;
    }
    module Scale {
        class Quality {
            private ascending;
            private descending;
            static MAJOR: Quality;
            static NATURAL_MINOR: Quality;
            static HARMONIC_MINOR: Quality;
            static MELODIC_MINOR: Quality;
            static CHROMATIC: Quality;
            static WHOLE_TONE: Quality;
            constructor(ascending: number[], descending?: number[]);
            getStepPattern(direction?: Direction): number[];
            isOctaveRepeating(direction?: Direction): boolean;
        }
    }
    class Value {
        private duration;
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
        static values(): Value[];
        ordinal(): number;
        static valueOf(valueString: string): Value;
        static fromDuration(duration: number): Value;
        static fromString(valueString: string): Value;
        toString(): string;
        getDuration(): number;
    }
    class Tempo {
        private bpm;
        static LARGHISSIMO: Tempo;
        static GRAVE: Tempo;
        static LARGO: Tempo;
        static LENTO: Tempo;
        static LARGHETTO: Tempo;
        static ADAGIO: Tempo;
        static ADAGIETTO: Tempo;
        static ANDANTE: Tempo;
        static ANDANTINO: Tempo;
        static MARCIA_MODERATO: Tempo;
        static ANDANTE_MODERATO: Tempo;
        static MODERATO: Tempo;
        static ALLEGRETTO: Tempo;
        static ALLEGRO_MODERATO: Tempo;
        static ALLEGRO: Tempo;
        static VIVACE: Tempo;
        static VIVACISSIMO: Tempo;
        static ALLEGRISSIMO: Tempo;
        static ALLEGRO_VIVACE: Tempo;
        static PRESTO: Tempo;
        static PRESTISSIMO: Tempo;
        private beatValue;
        private tempoMarking;
        constructor(bpm: number, parameterA?: Value | string, parameterB?: string);
        getBPM(): number;
        getBeatValue(): Value;
        getTempoMarking(): string;
    }
    class Interval {
        private quality;
        private distance;
        constructor(quality: Interval.Quality, distance: number);
        static between(a: Pitch, b: Pitch): Interval;
        getOffset(): number;
        static isPerfect(distance: number): boolean;
        static fromString(intervalString: string): Interval;
        toString(): string;
        getQuality(): Interval.Quality;
        getDistance(): number;
    }
    module Interval {
        class Quality {
            private symbol;
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
    class Chord {
        private pitches;
        constructor(parameter: Pitch | Pitch[], quality?: Chord.Quality, inversion?: Inversion);
        static fromString(chordString: string): Chord;
        toString(): string;
        getPitches(): Pitch[];
        static builder(): Chord.RequiresRoot;
    }
    module Chord {
        class Quality {
            private intervalPattern;
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
            constructor(intervalPattern: Interval[]);
            getIntervalPattern(): Interval[];
        }
        class Builder implements Base, RequiresRoot, Manipulate, End {
            pitches: Pitch[];
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
    class KeySignature {
        private key;
        private quality;
        static ORDER_OF_FLATS: Letter[];
        static ORDER_OF_SHARPS: Letter[];
        constructor(key: Key, quality: KeySignature.Quality);
        isMajor(): boolean;
        isMinor(): boolean;
        degreeOf(key: Key): Degree;
        keyOf(degree: Degree): Key;
        getKeysWithAccidentals(): Key[];
        getAccidentalCount(): number;
        static fromAccidentals(accidental: Accidental, count: number, quality: KeySignature.Quality): KeySignature;
        getParallel(): KeySignature;
        getRelative(): KeySignature;
        toString(): string;
        getKey(): Key;
        getQuality(): KeySignature.Quality;
    }
    module KeySignature {
        class Quality {
            static MAJOR: Quality;
            static MINOR: Quality;
            constructor();
            toString(): string;
        }
    }
    class TimeSignature {
        private beatsPerMeasure;
        static COMMON_TIME: TimeSignature;
        private oneBeat;
        constructor(beatsPerMeasure: number, parameter: number | Value);
        getDurationOfMeasure(): number;
        getBeatsPerMeasure(): number;
        getOneBeat(): Value;
    }
}
