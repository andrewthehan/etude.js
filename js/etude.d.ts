export declare module Etude {
    class Accidental {
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
        static values(): Array<Accidental>;
        toString(): string;
    }
    class Key {
    }
    class Letter {
        name: string;
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
        constructor(name: string, offset: number);
        static values(startingLetter?: Letter): Array<Letter>;
        ordinal(): number;
        toString(): string;
    }
    module Util {
        function rotate(array: any, distance: any): void;
    }
}
