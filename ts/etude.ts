
export module Etude {
	export class Accidental {
		static size = 0;
		private static _values = [];

		static TRIPLE_FLAT = new Accidental("bbb", -3);
		static DOUBLE_FLAT = new Accidental("bb", -2);
		static FLAT = new Accidental("b", -1);
		static NONE = new Accidental("", 0);
		static NATURAL = new Accidental("n", 0);
		static SHARP = new Accidental("#", 1);
		static DOUBLE_SHARP = new Accidental("x", 2);
		static TRIPLE_SHARP = new Accidental("#x", 3);

		constructor(public symbol: string, public offset: number) {
			if (Accidental.size === 8 || Accidental._values.length === 8) {
				throw new Error("Accidental should not be instantiated.");
			}
			++Accidental.size;
			Accidental._values.push(this);
		}

		static fromOffset(offset: number): Accidental {
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

		static fromString(accidentalString: string): Accidental {
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

		static values(): Array<Accidental> {
			return Accidental._values.slice();
		}

		toString(): string {
			return this.symbol;
		}
	}

	export class Key {

	}

	export class Letter {
		static size = 0;
		private static _values = [];

		static A = new Letter("A", 9);
		static B = new Letter("B", 11);
		static C = new Letter("C", 0);
		static D = new Letter("D", 2);
		static E = new Letter("E", 4);
		static F = new Letter("F", 5);
		static G = new Letter("G", 7);

		constructor(public name: string, public offset: number) {
			if (Letter.size === 7 || Letter._values.length === 7) {
				throw new Error("Letter should not be instantiated.");
			}
			++Letter.size;
			Letter._values.push(this);
		}

		static values(startingLetter = Letter.A): Array<Letter> {
			let letters = Letter._values.slice();
			Util.rotate(letters, startingLetter.ordinal());
			return letters;
		}

		ordinal(): number {
			return this.name.charCodeAt(0) - "A".charCodeAt(0);
		}

		toString(): string {
			return this.name;
		}
	}

	export module Util {
		export function rotate(array, distance) {
			while (distance-- > 0) {
				array.push(array.shift());
			}
		}
	}
}
