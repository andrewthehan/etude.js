"use strict";

export class Accidental {
	static size: number = 0;
	private static _values: Accidental[] = [];

	static TRIPLE_FLAT = new Accidental("bbb", -3);
	static DOUBLE_FLAT = new Accidental("bb", -2);
	static FLAT = new Accidental("b", -1);
	static NONE = new Accidental("", 0);
	static NATURAL = new Accidental("n", 0);
	static SHARP = new Accidental("#", 1);
	static DOUBLE_SHARP = new Accidental("x", 2);
	static TRIPLE_SHARP = new Accidental("#x", 3);

	constructor(public symbol: string, public offset: number) {
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

	static values(): Accidental[] {
		return Accidental._values.slice();
	}

	toString(): string {
		return this.symbol;
	}
}

export module Accidental {
	export enum Policy {
		MAINTAIN_LETTER,
		PRIORITIZE_NATURAL,
		PRIORITIZE_SHARP,
		PRIORITIZE_FLAT
	}
}

export class Degree {
	static size = 0;
	private static _values: Degree[] = [];

	static TONIC = new Degree(1);
	static SUPERTONIC = new Degree(2);
	static MEDIANT = new Degree(3);
	static SUBDOMINANT = new Degree(4);
	static DOMINANT = new Degree(5);
	static SUBMEDIANT = new Degree(6);
	static LEADING_TONE = new Degree(7);

	constructor(public value: number) {
		++Degree.size;
		Degree._values.push(this);
	}

	static values(startingDegree: Degree = Degree.TONIC): Degree[] {
		let degrees = Degree._values.slice();
		Util.rotate(degrees, startingDegree.value - 1);
		return degrees;
	}

	static fromValue(value): Degree {
		if (value < 1 || value > Degree.size) {
			throw new Error("Invalid value " + value);
		}
		return Degree._values[value - 1];
	}

	toString(): string {
		return Object.keys(Degree).find(d => Degree[d] === this);
	}
}

export class Inversion {
	static ROOT = new Inversion(0);
	static FIRST = new Inversion(1);
	static SECOND = new Inversion(2);
	static THIRD = new Inversion(3);

	constructor(public value: number) {
	}

	toString(): string {
		return Object.keys(Inversion).find(i => Inversion[i] === this);
	}
}

export class Key {
	offset: number;

	constructor(public letter: Letter, public accidental: Accidental = Accidental.NONE) {
		this.offset = letter.offset + accidental.offset;
	}

	apply(keySignature: KeySignature): Key {
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

	none(): Key {
		return new Key(this.letter, Accidental.NONE);
	}

	natural(): Key {
		return new Key(this.letter, Accidental.NATURAL);
	}

	sharp(): Key {
		return new Key(this.letter, Accidental.SHARP);
	}

	doubleSharp(): Key {
		return new Key(this.letter, Accidental.DOUBLE_SHARP);
	}

	tripleSharp(): Key {
		return new Key(this.letter, Accidental.TRIPLE_SHARP);
	}

	flat(): Key {
		return new Key(this.letter, Accidental.FLAT);
	}

	doubleFlat(): Key {
		return new Key(this.letter, Accidental.DOUBLE_FLAT);
	}

	tripleFlat(): Key {
		return new Key(this.letter, Accidental.TRIPLE_FLAT);
	}

	isNone(): boolean {
		return this.accidental === Accidental.NONE;
	}

	isNatural(): boolean {
		return this.accidental === Accidental.NATURAL;
	}

	isSharp(): boolean {
		return this.accidental === Accidental.SHARP;
	}

	isDoubleSharp(): boolean {
		return this.accidental === Accidental.DOUBLE_SHARP;
	}

	isTripleSharp(): boolean {
		return this.accidental === Accidental.TRIPLE_SHARP;
	}

	isFlat(): boolean {
		return this.accidental === Accidental.FLAT;
	}

	isDoubleFlat(): boolean {
		return this.accidental === Accidental.DOUBLE_FLAT;
	}

	isTripleFlat(): boolean {
		return this.accidental === Accidental.TRIPLE_FLAT;
	}

	static isEnharmonic(a: Key, b: Key): boolean {
		return Util.floorMod(a.offset, MusicConstants.KEYS_IN_OCTAVE) === Util.floorMod(b.offset, MusicConstants.KEYS_IN_OCTAVE);
	}

	static fromOffset(offset: number, policy: Accidental.Policy = Accidental.Policy.PRIORITIZE_NATURAL): Key {
		let letter: Letter;
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
			case Accidental.Policy.PRIORITIZE_NATURAL: case Accidental.Policy.PRIORITIZE_FLAT:
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

	static fromString(keyString: string): Key {
		let letter = Letter.fromChar(keyString.charAt(0));
		let accidental = keyString.length === 1 ? Accidental.NONE : Accidental.fromString(keyString.substring(1));
		return new Key(letter, accidental);
	}

	toString(): string {
		return this.letter.toString() + this.accidental.toString();
	}
}

export class Letter {
	static size = 0;
	private static _values = [];

	static A = new Letter(9);
	static B = new Letter(11);
	static C = new Letter(0);
	static D = new Letter(2);
	static E = new Letter(4);
	static F = new Letter(5);
	static G = new Letter(7);

	constructor(public offset: number) {
		++Letter.size;
		Letter._values.push(this);
	}

	static *iterator(startingLetter: Letter = Letter.A): IterableIterator<Letter> {
		yield* Util.infiniteIteratorOf(Letter.values(startingLetter));
	}

	static values(startingLetter: Letter = Letter.A): Letter[] {
		let letters = Letter._values.slice();
		Util.rotate(letters, startingLetter.ordinal());
		return letters;
	}

	static isValid(letterChar: string): boolean {
		let value = letterChar.charCodeAt(0);
		return (value >= 'A'.charCodeAt(0) && value <= 'G'.charCodeAt(0)) || (value >= 'a'.charCodeAt(0) && value <= 'g'.charCodeAt(0));
	}

	static fromChar(letterChar: string): Letter {
		if (!Letter.isValid(letterChar)) {
			throw new Error("Invalid letter character: " + letterChar);
		}
		return Letter._values[letterChar.toUpperCase().charCodeAt(0) - "A".charCodeAt(0)];
	}

	ordinal(): number {
		return this.toString().charCodeAt(0) - "A".charCodeAt(0);
	}

	toString(): string {
		return Object.keys(Letter).find(l => Letter[l] === this);
	}
}

export class Mode {
	static IONIAN = new Mode([2, 2, 1, 2, 2, 2, 1]);
	static DORIAN = new Mode([2, 1, 2, 2, 2, 1, 2]);
	static PHRYGIAN = new Mode([1, 2, 2, 2, 1, 2, 2]);
	static LYDIAN = new Mode([2, 2, 2, 1, 2, 2, 1]);
	static MIXOLYDIAN = new Mode([2, 2, 1, 2, 2, 1, 2]);
	static AEOLIAN = new Mode([2, 1, 2, 2, 1, 2, 2]);
	static LOCRIAN = new Mode([1, 2, 2, 1, 2, 2, 2]);
	static MAJOR = new Mode([2, 2, 1, 2, 2, 2, 1]);
	static NATURAL_MINOR = new Mode([2, 1, 2, 2, 1, 2, 2]);
	static HARMONIC_MINOR = new Mode([2, 1, 2, 2, 1, 3, 1]);
	// static MELODIC_MINOR: new Mode([2, 1, 2, 2, 2, 2, 1]);

	constructor(private _stepPattern: number[]) {
	}

	get stepPattern(): number[] {
		return this._stepPattern.slice();
	}

	toString(): string {
		return Object.keys(Mode).filter(m => Mode[m] === this)[0];
	}
}

export module MusicConstants {
	export const KEYS_IN_OCTAVE = 12;
	export const SMALLEST_PROGRAM_NUMBER = 0;
	export const LARGEST_PROGRAM_NUMBER = 127;
}

export class Pitch {
	programNumber: number;

	constructor(public key: Key, public octave: number) {
		this.programNumber = octave * MusicConstants.KEYS_IN_OCTAVE + key.offset;
		if (this.programNumber < MusicConstants.SMALLEST_PROGRAM_NUMBER || this.programNumber > MusicConstants.LARGEST_PROGRAM_NUMBER) {
			throw new Error("Invalid program number: " + this.programNumber);
		}
	}

	apply(keySignature: KeySignature): Pitch {
		return new Pitch(this.key.apply(keySignature), this.octave);
	}

	step(amount: Interval | number, policy: Accidental.Policy = Accidental.Policy.PRIORITIZE_NATURAL): Pitch {
		if (amount instanceof Interval) {
			if (arguments.length !== 1) {
				throw new Error("Invalid number of arguments for step.");
			}

			let letter = Letter.values(this.key.letter)[Util.floorMod(amount.distance - 1, Letter.size)];

			let accidental = new Key(letter).apply(new KeySignature(this.key, Mode.MAJOR)).accidental;
			// change accidental based on interval's quality
			switch (amount.quality) {
				case Interval.Quality.PERFECT: case Interval.Quality.MAJOR:
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

			// refer to Interval.between for how this equation was derived
			let octaveOffset = (amount.distance
				- 1
				+ (Util.floorMod(this.key.letter.ordinal() - 2, Letter.size) - Util.floorMod(letter.ordinal() - 2, Letter.size))
			) / Letter.size;

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

	halfStepUp(policy: Accidental.Policy = Accidental.Policy.PRIORITIZE_SHARP): Pitch {
		if (Accidental.Policy.MAINTAIN_LETTER === policy) {
			if (this.key.isTripleSharp()) {
				throw new Error("Can't move pitch half step up while maintaining letter: " + this);
			}
			return new Pitch(new Key(this.key.letter, Accidental.fromOffset(this.key.accidental.offset + 1)), this.octave);
		}
		return Pitch.fromProgramNumber(this.programNumber + 1, policy);
	}

	halfStepDown(policy: Accidental.Policy = Accidental.Policy.PRIORITIZE_FLAT): Pitch {
		if (Accidental.Policy.MAINTAIN_LETTER === policy) {
			if (this.key.isTripleFlat()) {
				throw new Error("Can't move pitch half step up while maintaining letter: " + this);
			}
			return new Pitch(new Key(this.key.letter, Accidental.fromOffset(this.key.accidental.offset - 1)), this.octave);
		}
		return Pitch.fromProgramNumber(this.programNumber - 1, policy);
	}

	isHigherThan(pitch: Pitch): boolean {
		return this.programNumber > pitch.programNumber;
	}

	isLowerThan(pitch: Pitch): boolean {
		return this.programNumber < pitch.programNumber;
	}

	compareTo(pitch: Pitch): number {
		return Util.compare(this.programNumber, pitch.programNumber);
	}

	getHigherPitch(key: Key): Pitch {
		let pitch = new Pitch(key, this.octave);
		if (!this.isLowerThan(pitch)) {
			pitch = new Pitch(key, this.octave + 1);
		}
		return pitch;
	}

	getLowerPitch(key: Key): Pitch {
		let pitch = new Pitch(key, this.octave);
		if (!this.isHigherThan(pitch)) {
			pitch = new Pitch(key, this.octave - 1);
		}
		return pitch;
	}

	static isEnharmonic(a: Pitch, b: Pitch): boolean {
		return a.programNumber === b.programNumber;
	}

	static fromProgramNumber(programNumber: number, policy: Accidental.Policy = Accidental.Policy.PRIORITIZE_NATURAL): Pitch {
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
	static fromString(pitchString: string): Pitch {
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

	toString(): string {
		return this.key.toString() + this.octave + "(" + this.programNumber + ")";
	}
}

export class Scale {
	private _keys: Key[];

	constructor(public keySignature: KeySignature) {
		this._keys = Degree.values().map(d => keySignature.keyOf(d));
	}

	*iterator(): IterableIterator<Key> {
		yield* Util.infiniteIteratorOf(this._keys);
	}

	get keys(): Key[] {
		return this._keys.slice();
	}
}

export module Util {
	export function add(a: number, b: number): number {
		return a + b;
	}

	export function compare(a: number, b: number): number {
		return (
			(a < b) ? -1 :
				(a == b) ? 0 :
					1
		);
	}

	export function floorMod(a: number, b: number): number {
		return ((a % b) + b) % b;
	}

	export function* infiniteIteratorOf(array: any[]): IterableIterator<any> {
		for (; ;) {
			for (let l of array) {
				yield l;
			}
		}
	}

	export function rotate(array: any[], distance: number): void {
		while (distance-- > 0) {
			array.push(array.shift());
		}
	}
}

export class Interval {
	offset: number;

	constructor(public quality: Interval.Quality, public distance: number) {
		if (distance <= 0) {
			throw new Error("Invalid interval: " + quality + distance + " (distance must be a positive integer)");
		}
		switch (quality) {
			case
				Interval.Quality.PERFECT:
				if (!Interval.isPerfect(distance)) {
					throw new Error("Invalid interval: " + quality + distance + " (distance cannot have a perfect quality)");
				}
				break;
			case Interval.Quality.MAJOR: case Interval.Quality.MINOR:
				if (Interval.isPerfect(distance)) {
					throw new Error("Invalid interval: " + quality + distance + " (distance cannot have major or minor quality)");
				}
				break;
			case Interval.Quality.DIMINISHED: case Interval.Quality.DOUBLY_DIMINISHED: case Interval.Quality.AUGMENTED: case Interval.Quality.DOUBLY_AUGMENTED:
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
			case Interval.Quality.PERFECT: case Interval.Quality.MAJOR:
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

	static fromString(intervalString: string): Interval {
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

	toString(): string {
		return this.quality.toString() + this.distance;
	}

	static between(a: Pitch, b: Pitch): Interval {
		let letterA = a.key.letter;
		let letterB = b.key.letter;

		if (a.isHigherThan(b) && a.octave === b.octave && letterA.offset > letterB.offset) {
			throw new Error("Cannot create interval with negative distance");
		}

		/**
		 * 1 (because no distance == 1)
		 * + letterDistance (subtracted 2 because C is the start of the octave)
		 * + octaveDistance
		 */
		let distance = 1
			+ (Util.floorMod(letterB.ordinal() - 2, Letter.size) - Util.floorMod(letterA.ordinal() - 2, Letter.size))
			+ (b.octave - a.octave) * Letter.size;

		let offset = (b.programNumber - a.programNumber) % MusicConstants.KEYS_IN_OCTAVE;
		offset -= Mode.MAJOR
			.stepPattern
			.slice(0, (distance - 1) % Letter.size)
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

	static isPerfect(distance: number): boolean {
		let normalized = distance % 7;
		return normalized === 1 || normalized === 4 || normalized === 5;
	}
}

export module Interval {
	export class Quality {
		static PERFECT = new Quality("P");
		static MAJOR = new Quality("M");
		static MINOR = new Quality("m");
		static DIMINISHED = new Quality("d");
		static DOUBLY_DIMINISHED = new Quality("dd");
		static AUGMENTED = new Quality("A");
		static DOUBLY_AUGMENTED = new Quality("AA");

		constructor(public symbol: string) {
		}

		static fromString(qualityString: string): Quality {
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
}

export class Chord {
	constructor(public pitches: Pitch[]) {
	}

	static fromString(chordString: string): Chord {
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

	toString(): string {
		return "{" + this.pitches.join(",") + "}";
	}

	static builder(): Chord.RequiresRoot {
		return new Chord.Builder();
	}
}

export module Chord {
	export class Quality {
		static MAJOR = new Quality([
			new Interval(Interval.Quality.PERFECT, 1),
			new Interval(Interval.Quality.MAJOR, 3),
			new Interval(Interval.Quality.PERFECT, 5)
		], "maj");
		static MINOR = new Quality([
			new Interval(Interval.Quality.PERFECT, 1),
			new Interval(Interval.Quality.MINOR, 3),
			new Interval(Interval.Quality.PERFECT, 5)
		], "min");
		static DIMINISHED = new Quality([
			new Interval(Interval.Quality.PERFECT, 1),
			new Interval(Interval.Quality.MINOR, 3),
			new Interval(Interval.Quality.DIMINISHED, 5)
		], "dim");
		static AUGMENTED = new Quality([
			new Interval(Interval.Quality.PERFECT, 1),
			new Interval(Interval.Quality.MAJOR, 3),
			new Interval(Interval.Quality.AUGMENTED, 5)
		], "aug");
		static MAJOR_SEVENTH = new Quality([
			new Interval(Interval.Quality.PERFECT, 1),
			new Interval(Interval.Quality.MAJOR, 3),
			new Interval(Interval.Quality.PERFECT, 5),
			new Interval(Interval.Quality.MAJOR, 7)
		], "maj7")
		static MINOR_SEVENTH = new Quality([
			new Interval(Interval.Quality.PERFECT, 1),
			new Interval(Interval.Quality.MINOR, 3),
			new Interval(Interval.Quality.PERFECT, 5),
			new Interval(Interval.Quality.MINOR, 7)
		], "min7");
		static DOMINANT_SEVENTH = new Quality([
			new Interval(Interval.Quality.PERFECT, 1),
			new Interval(Interval.Quality.MAJOR, 3),
			new Interval(Interval.Quality.PERFECT, 5),
			new Interval(Interval.Quality.MINOR, 7)
		], "7");
		static DIMINISHED_SEVENTH = new Quality([
			new Interval(Interval.Quality.PERFECT, 1),
			new Interval(Interval.Quality.MINOR, 3),
			new Interval(Interval.Quality.DIMINISHED, 5),
			new Interval(Interval.Quality.DIMINISHED, 7)
		], "dim7");
		static HALF_DIMINISHED_SEVENTH = new Quality([
			new Interval(Interval.Quality.PERFECT, 1),
			new Interval(Interval.Quality.MINOR, 3),
			new Interval(Interval.Quality.DIMINISHED, 5),
			new Interval(Interval.Quality.MINOR, 7)
		], "m7(b5)");
		static MINOR_MAJOR_SEVENTH = new Quality([
			new Interval(Interval.Quality.PERFECT, 1),
			new Interval(Interval.Quality.MINOR, 3),
			new Interval(Interval.Quality.PERFECT, 5),
			new Interval(Interval.Quality.MAJOR, 7)
		], "mMaj7");
		static AUGMENTED_MAJOR_SEVENTH = new Quality([
			new Interval(Interval.Quality.PERFECT, 1),
			new Interval(Interval.Quality.MAJOR, 3),
			new Interval(Interval.Quality.AUGMENTED, 5),
			new Interval(Interval.Quality.MAJOR, 7)
		], "maj7(#5)");

		constructor(public intervalPattern: Interval[], public symbol) {
		}

		toString(): string {
			return this.symbol;
		}
	}

	export class Builder implements Base, RequiresRoot, Manipulate, End {
		pitches = new Set<Pitch>();
		bottomDegree = Degree.TONIC;
		root: Pitch;

		setRoot(root: Pitch): Manipulate {
			this.root = root;
			return this;
		}

		add(element: Interval | Quality): Manipulate {
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

		setInversion(inversion: Inversion): End {
			switch (inversion) {
				case Inversion.ROOT: return this.setBottomDegree(Degree.TONIC);
				case Inversion.FIRST: return this.setBottomDegree(Degree.MEDIANT);
				case Inversion.SECOND: return this.setBottomDegree(Degree.DOMINANT);
				case Inversion.THIRD: return this.setBottomDegree(Degree.LEADING_TONE);
				default: throw new Error();
			}
		}

		setBottomDegree(degree: Degree): End {
			this.bottomDegree = degree;
			return this;
		}

		build(): Chord {
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

	export interface Base {
		build(): Chord;
	}

	export interface RequiresRoot {
		setRoot(root: Pitch): Manipulate;
	}

	export interface Manipulate extends Base {
		add(element: Interval | Quality): Manipulate;
		setInversion(inversion: Inversion): End;
		setBottomDegree(degree: Degree): End;
	}

	export interface End extends Base {
	}
}

export class KeySignature {
	public static ORDER_OF_FLATS = "BEADGCF".split("").map(Letter.fromChar);
	public static ORDER_OF_SHARPS = "FCGDAEB".split("").map(Letter.fromChar);

	keysWithAccidentals: Key[];
	accidentalCount: number;

	constructor(public key: Key, public mode: Mode) {
		this.keysWithAccidentals = new Scale(this)
			.keys
			.filter(k => !k.isNone() && !k.isNatural());
		if (this.keysWithAccidentals.length !== 0) {
			let ordered: Letter[];
			switch (this.keysWithAccidentals[0].accidental) {
				case Accidental.FLAT: case Accidental.DOUBLE_FLAT: case Accidental.TRIPLE_FLAT:
					ordered = KeySignature.ORDER_OF_FLATS;
					break;
				case Accidental.SHARP: case Accidental.DOUBLE_SHARP: case Accidental.TRIPLE_SHARP:
					ordered = KeySignature.ORDER_OF_SHARPS;
					break;
				default:
					throw new Error();
			}
			this.keysWithAccidentals.sort((a, b) => Util.compare(ordered.indexOf(a.letter), ordered.indexOf(b.letter)));
		}
		this.accidentalCount = this.keysWithAccidentals.length;
	}

	degreeOf(key: Key): Degree {
		let difference = Util.floorMod(key.letter.ordinal() - this.key.letter.ordinal(), Letter.size);
		return Degree.fromValue(difference + 1);
	}

	keyOf(degree: Degree): Key {
		let letters = Letter.values(this.key.letter);
		let key = new Key(letters[degree.value - 1]);
		return key.apply(this);
	}

	static fromAccidentals(accidental: Accidental, count: number, mode: Mode): KeySignature {
		if (count < 0 || count > 7) {
			throw new Error("Invalid accidental count: " + count);
		}

		let key;
		let letter;
		// determine the key assuming mode is MAJOR
		switch (accidental) {
			case Accidental.FLAT:
				letter = KeySignature.ORDER_OF_FLATS[Util.floorMod(count - 2, Letter.size)];
				key = new Key(
					letter,
					// accidental; if flats for key signature contain the letter, make the key flat
					KeySignature.ORDER_OF_FLATS.slice(0, count).indexOf(letter) > -1
						? Accidental.FLAT
						: Accidental.NONE
				);
				break;
			case Accidental.SHARP:
				letter = KeySignature.ORDER_OF_SHARPS[Util.floorMod(count + 1, Letter.size)];
				key = new Key(
					letter,
					// accidental; if sharps for key signature contain the letter, make the key sharp
					KeySignature.ORDER_OF_SHARPS.slice(0, count).indexOf(letter) > -1
						? Accidental.SHARP
						: Accidental.NONE
				);
				break;
			default:
				throw new Error("Invalid accidental type to create KeySignature from: " + accidental);
		}

		// lower key by 3 half steps if the mode is NATURAL_MINOR
		switch (mode) {
			case Mode.MAJOR:
				break;
			case Mode.NATURAL_MINOR:
				key = Key.fromOffset(
					Util.floorMod(key.offset - 3, MusicConstants.KEYS_IN_OCTAVE),
					accidental === Accidental.FLAT
						? Accidental.Policy.PRIORITIZE_FLAT
						: Accidental.Policy.PRIORITIZE_SHARP
				);
				break;
			default:
				throw new Error("Invalid mode type to create KeySignature from: " + mode);
		}

		return new KeySignature(key, mode);
	}

	toString(): string {
		return this.key.toString() + this.mode.toString();
	}
}
