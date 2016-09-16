"use strict";

export module error {
	export class AssertionError extends Error {
		public constructor(message: string) {
			super("You should have never seen this. Please submit a bug report with the relevant code and the following message: \"" + message + "\"");
		}
	}

	export class EtudeError extends Error {
		public constructor(message: string) {
			super(message);
		}
	}
}

export module util {
	export module MathUtil {
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

		export function rotate(array: any[], distance: number): void {
			while (distance-- > 0) {
				array.push(array.shift());
			}
		}
	}

	export class CircularIterator<E> implements IterableIterator<E> {
		private i: number = 0;

		constructor(private values: E[]) {
		}

		public static of<E>(values: E[]): CircularIterator<E> {
			return new CircularIterator<E>(values);
		}

		public [Symbol.iterator](): IterableIterator<E> {
			return this;
		}

		public getValues(): E[] {
			return this.values;
		}

		public getCurrentValue(): E {
			return this.getValues()[this.i];
		}

		private increment(): void {
			this.i = (this.i + 1) % this.getCycleLength();
		}

		public getCycleLength(): number {
			return this.values.length;
		}

		public next(): IteratorResult<E> {
			let e = this.getCurrentValue();
			this.increment();
			return { value: e, done: false };
		}
	}

	export class CircularStream<E> implements Stream<E> {
		private it: CircularIterator<E>;

		constructor(private values: E[]) {
			this.it = CircularIterator.of(values);
		}

		public static of<E>(values: E[]): CircularStream<E> {
			return new CircularStream<E>(values);
		}

		public filter(filter: Predicate<E>): CircularStream<E> {
			this.it = CircularIterator.of(this.it.getValues().filter(filter));
			return this;
		}

		public map<R>(map: Function<E, R>): CircularStream<R> {
			return CircularStream.of(this.it.getValues().map(map));
		}

		public limit(size: number): E[] {
			let values: E[] = [];
			while (size-- > 0) {
				values.push(this.it.next().value);
			}
			return values;
		}

		public skip(amount: number): this {
			while (amount-- > 0) {
				this.it.next();
			}
			return this;
		}
	}

	export class ImmutablePrioritySet<E> extends Set<E> {
		constructor(private _values: E[]) {
			super(_values);
		}

		public static of<E>(values: E[]): ImmutablePrioritySet<E> {
			return new ImmutablePrioritySet<E>(values);
		}

		public compare(a: E, b: E): number {
			if (!this.has(a) || !this.has(b)) {
				throw new Error("No such element");
			}
			return util.MathUtil.compare(this._values.indexOf(a), this._values.indexOf(b));
		}

		public iterator(): IterableIterator<E> {
			return this[Symbol.iterator]();
		}
	}

	export class InfiniteIterator<E> implements IterableIterator<E> {
		private current: E = null;

		constructor(private initial: E, private func: Function<E, E>) {
		}

		public static of<E>(initial: E, func: Function<E, E>): InfiniteIterator<E> {
			return new InfiniteIterator<E>(initial, func);
		}

		public [Symbol.iterator](): IterableIterator<E> {
			return this;
		}

		public getCurrentValue(): E {
			if (this.current === null) {
				return this.initial;
			}
			return this.current;
		}

		public reset(): void {
			this.current = null;
		}

		public next(): IteratorResult<E> {
			if (this.current === null) {
				this.current = this.initial;
			}
			else {
				this.current = this.func(this.current);
			}
			return { value: this.current, done: false };
		}
	}

	export class InfiniteStream<E> implements Stream<E> {
		private it: InfiniteIterator<E>;

		constructor(private initial: E, private func: Function<E, E>) {
			this.it = InfiniteIterator.of(initial, func);
		}

		public static of<E>(initial: E, func: Function<E, E>): InfiniteStream<E> {
			return new InfiniteStream<E>(initial, func);
		}

		public filter(filter: Predicate<E>): InfiniteStream<E> {
			let it = this.it;

			let initial: E;
			do {
				initial = it.next().value;
			} while (!filter(initial));

			return InfiniteStream.of(initial, previous => {
				let e: E;
				do {
					e = it.next().value;
				} while (!filter(e));
				return e;
			});
		}

		public map<R>(map: Function<E, R>): InfiniteStream<R> {
			let it = this.it;
			return InfiniteStream.of(map(it.next().value), previous => map(it.next().value));
		}

		public limit(size: number): E[] {
			let values: E[] = [];
			while (size-- > 0) {
				values.push(this.it.next().value);
			}
			return values;
		}

		public skip(amount: number): this {
			while (amount-- > 0) {
				this.it.next();
			}
			return this;
		}
	}

	export interface Stream<E> {
		filter(filter: Predicate<E>): Stream<E>;
		map<R>(map: Function<E, R>): Stream<R>;
		limit(size: number): E[];
		skip(amount: number): Stream<E>;
	}

	export interface Function<T, R> {
		(t: T): R;
	}

	export interface Predicate<T> {
		(t: T): boolean;
	}
}

export module theory {
	export class Accidental {
		public static size: number = 0;
		private static _values: Accidental[] = [];

		public static TRIPLE_FLAT = new Accidental("bbb", -3);
		public static DOUBLE_FLAT = new Accidental("bb", -2);
		public static FLAT = new Accidental("b", -1);
		public static NONE = new Accidental("", 0);
		public static NATURAL = new Accidental("n", 0);
		public static SHARP = new Accidental("#", 1);
		public static DOUBLE_SHARP = new Accidental("x", 2);
		public static TRIPLE_SHARP = new Accidental("#x", 3);

		constructor(private symbol: string, private offset: number) {
			++Accidental.size;
			Accidental._values.push(this);
		}

		public static values(): Accidental[] {
			return Accidental._values.slice();
		}

		public ordinal(): number {
			return Accidental._values.indexOf(this);
		}

		public static valueOf(accidentalString: string): Accidental {
			let accidental = Accidental[accidentalString];
			if (accidental instanceof Accidental) {
				return accidental;
			}
			throw new error.EtudeError("Invalid accidental string: " + accidentalString);
		}

		public static fromOffset(offset: number): Accidental {
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

		public getOffset(): number {
			return this.offset;
		}

		public static fromString(accidentalString: string): Accidental {
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

		public toString(): string {
			return this.symbol;
		}
	}

	export class Degree {
		public static size = 0;
		private static _values: Degree[] = [];

		public static TONIC = new Degree();
		public static SUPERTONIC = new Degree();
		public static MEDIANT = new Degree();
		public static SUBDOMINANT = new Degree();
		public static DOMINANT = new Degree();
		public static SUBMEDIANT = new Degree();
		public static LEADING_TONE = new Degree();

		constructor() {
			++Degree.size;
			Degree._values.push(this);
		}

		public static values(startingDegree: Degree = Degree.TONIC): Degree[] {
			let degrees = Degree._values.slice();
			util.MathUtil.rotate(degrees, startingDegree.getValue() - 1);
			return degrees;
		}

		public ordinal(): number {
			return Degree._values.indexOf(this);
		}

		public static valueOf(degreeString: string): Degree {
			let degree = Degree[degreeString];
			if (degree instanceof Degree) {
				return degree;
			}
			throw new error.EtudeError("Invalid degree string: " + degreeString);
		}

		public static fromValue(value: number): Degree {
			if (value < 1 || value > Degree.size) {
				throw new error.EtudeError("Invalid value " + value);
			}
			return Degree._values[value - 1];
		}

		public getValue(): number {
			return this.ordinal() + 1;
		}

		public toString(): string {
			return Object.keys(Degree).find(d => Degree[d] === this);
		}
	}

	export class Direction {
		public static ASCENDING = new Direction();
		public static DESCENDING = new Direction();
		public static DEFAULT = Direction.ASCENDING;

		public toString(): string {
			return Object.keys(Direction).find(d => Direction[d] === this);
		}
	}

	export class Dynamic {
		public static size = 0;
		private static _values = [];

		public static PIANISSISSIMO = new Dynamic("ppp");
		public static PIANISSIMO = new Dynamic("pp");
		public static PIANO = new Dynamic("p");
		public static MEZZO_PIANO = new Dynamic("mp");
		public static MEZZO_FORTE = new Dynamic("mf");
		public static FORTE = new Dynamic("f");
		public static FORTISSIMO = new Dynamic("ff");
		public static FORTISSISSIMO = new Dynamic("fff");

		constructor(private symbol: string) {
			++Dynamic.size;
			Dynamic._values.push(this);
		}

		public static values(): Dynamic[] {
			return Dynamic._values.slice();
		}

		public ordinal(): number {
			return Dynamic._values.indexOf(this);
		}

		public static valueOf(dynamicString: string): Dynamic {
			let dynamic = Dynamic[dynamicString];
			if (dynamic instanceof Dynamic) {
				return dynamic;
			}
			throw new error.EtudeError("Invalid dynamic string: " + dynamicString);
		}

		public crescendo(): Dynamic {
			let index = this.ordinal() + 1;
			if (index >= Dynamic.size) {
				throw new error.EtudeError("Unable to apply crescendo on " + this);
			}
			return Dynamic._values[index];
		}

		public diminuendo(): Dynamic {
			let index = this.ordinal() - 1;
			if (index < 0) {
				throw new error.EtudeError("Unable to apply diminuendo on " + this);
			}
			return Dynamic._values[index];
		}

		public static fromString(dynamicString: string): Dynamic {
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

		public toString(): string {
			return this.symbol;
		}
	}

	export class Inversion {
		public static size = 0;
		private static _values = [];

		public static ROOT = new Inversion();
		public static FIRST = new Inversion();
		public static SECOND = new Inversion();
		public static THIRD = new Inversion();

		constructor() {
			++Inversion.size;
			Inversion._values.push(this);
		}

		public static values(): Inversion[] {
			return Inversion._values.slice();
		}

		public ordinal(): number {
			return Inversion._values.indexOf(this);
		}

		public static valueOf(inversionString: string): Inversion {
			let inversion = Inversion[inversionString];
			if (inversion instanceof Inversion) {
				return inversion;
			}
			throw new error.EtudeError("Invalid inversion string: " + inversionString);
		}


		public getValue(): number {
			return this.ordinal();
		}

		public toString(): string {
			return Object.keys(Inversion).find(i => Inversion[i] === this);
		}
	}

	export class Key {
		constructor(private letter: Letter, private accidental: Accidental = Accidental.NONE) {
		}

		public step(amount: number, policies: util.ImmutablePrioritySet<Policy> = Policy.DEFAULT_PRIORITY): Key {
			return Key.fromOffset(util.MathUtil.floorMod(this.getOffset() + amount, MusicConstants.KEYS_IN_OCTAVE), policies);
		}

		public apply(keySignature: KeySignature): Key {
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

		public none(): Key {
			return new Key(this.letter, Accidental.NONE);
		}

		public natural(): Key {
			return new Key(this.letter, Accidental.NATURAL);
		}

		public sharp(): Key {
			return new Key(this.letter, Accidental.SHARP);
		}

		public doubleSharp(): Key {
			return new Key(this.letter, Accidental.DOUBLE_SHARP);
		}

		public tripleSharp(): Key {
			return new Key(this.letter, Accidental.TRIPLE_SHARP);
		}

		public flat(): Key {
			return new Key(this.letter, Accidental.FLAT);
		}

		public doubleFlat(): Key {
			return new Key(this.letter, Accidental.DOUBLE_FLAT);
		}

		public tripleFlat(): Key {
			return new Key(this.letter, Accidental.TRIPLE_FLAT);
		}

		public isNone(): boolean {
			return this.accidental === Accidental.NONE;
		}

		public isNatural(): boolean {
			return this.accidental === Accidental.NATURAL;
		}

		public isSharp(): boolean {
			return this.accidental === Accidental.SHARP;
		}

		public isDoubleSharp(): boolean {
			return this.accidental === Accidental.DOUBLE_SHARP;
		}

		public isTripleSharp(): boolean {
			return this.accidental === Accidental.TRIPLE_SHARP;
		}

		public isFlat(): boolean {
			return this.accidental === Accidental.FLAT;
		}

		public isDoubleFlat(): boolean {
			return this.accidental === Accidental.DOUBLE_FLAT;
		}

		public isTripleFlat(): boolean {
			return this.accidental === Accidental.TRIPLE_FLAT;
		}

		public getEnharmonicEquivalent(parameter: Letter | util.ImmutablePrioritySet<Policy>): Key {
			if (parameter instanceof Letter) {
				let letter = parameter as Letter;

				let targetOffset = this.getOffset();
				let initialOffset = letter.getOffset();

				let accidentalOffset = targetOffset - initialOffset;
				if (accidentalOffset > Accidental.TRIPLE_SHARP.getOffset()) {
					accidentalOffset -= MusicConstants.KEYS_IN_OCTAVE;
				}
				else if (accidentalOffset < Accidental.TRIPLE_FLAT.getOffset()) {
					accidentalOffset += MusicConstants.KEYS_IN_OCTAVE;
				}

				let accidental: Accidental;
				try {
					accidental = Accidental.fromOffset(accidentalOffset);
				}
				catch (e) {
					return null;
				}

				return new Key(letter, accidental);
			}
			else if (parameter instanceof util.ImmutablePrioritySet) {
				let policies = parameter as util.ImmutablePrioritySet<Policy>;
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

		public static isEnharmonic(a: Key, b: Key): boolean {
			return util.MathUtil.floorMod(a.getOffset(), MusicConstants.KEYS_IN_OCTAVE) === util.MathUtil.floorMod(b.getOffset(), MusicConstants.KEYS_IN_OCTAVE);
		}

		public static fromOffset(offset: number, policies: util.ImmutablePrioritySet<Policy> = Policy.DEFAULT_PRIORITY): Key {
			if (policies.size === 0) {
				throw new error.EtudeError("Policies should not be empty");
			}

			let letter: Letter;
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

		public getOffset(): number {
			return util.MathUtil.floorMod(this.letter.getOffset() + this.accidental.getOffset(), MusicConstants.KEYS_IN_OCTAVE);
		}

		public static fromString(keyString: string): Key {
			let letter = Letter.fromChar(keyString.charAt(0));
			let accidental = keyString.length === 1 ? Accidental.NONE : Accidental.fromString(keyString.substring(1));
			return new Key(letter, accidental);
		}

		public toString(): string {
			return this.letter.toString() + this.accidental.toString();
		}

		public equals(other: any): boolean {
			if (!(other instanceof Key)) {
				return false;
			}
			if (other === this) {
				return true;
			}

			let otherKey = other as Key;
			return this.letter === otherKey.getLetter() && this.accidental === otherKey.getAccidental();
		}

		public getLetter(): Letter {
			return this.letter;
		}

		public getAccidental(): Accidental {
			return this.accidental;
		}
	}

	export class Letter {
		public static size = 0;
		private static _values = [];

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
		public static A = new Letter(9);
		public static B = new Letter(11);
		public static C = new Letter(0);
		public static D = new Letter(2);
		public static E = new Letter(4);
		public static F = new Letter(5);
		public static G = new Letter(7);

		constructor(private offset: number) {
			++Letter.size;
			Letter._values.push(this);
		}

		public static values(direction: Direction | Letter = Direction.DEFAULT, startingLetter: Letter = Letter.A): Letter[] {
			if (direction instanceof Letter) {
				if (arguments.length !== 1) {
					throw new error.EtudeError("Invalid number of arguments for values");
				}
				startingLetter = direction as Letter;
				direction = Direction.DEFAULT;
			}

			let letters = Letter._values.slice();
			if (direction === Direction.DESCENDING) {
				letters.reverse();
			}
			util.MathUtil.rotate(letters, letters.indexOf(startingLetter));
			return letters;
		}

		public ordinal(): number {
			return this.toString().charCodeAt(0) - "A".charCodeAt(0);
		}

		public static valueOf(letterString: string): Letter {
			let letter = Letter[letterString];
			if (letter instanceof Letter) {
				return letter;
			}
			throw new error.EtudeError("Invalid letter string: " + letterString);
		}

		public getOffset(): number {
			return this.offset;
		}

		public static stream(direction: Direction | Letter = Direction.DEFAULT, startingLetter: Letter = Letter.A): util.CircularStream<Letter> {
			if (direction instanceof Letter) {
				if (arguments.length !== 1) {
					throw new error.EtudeError("Invalid number of arguments for stream");
				}
				startingLetter = direction as Letter;
				direction = Direction.DEFAULT;
			}

			return util.CircularStream.of(this.values(direction, startingLetter));
		}

		public static iterator(direction: Direction | Letter = Direction.DEFAULT, startingLetter: Letter = Letter.A): util.CircularIterator<Letter> {
			if (direction instanceof Letter) {
				if (arguments.length !== 1) {
					throw new error.EtudeError("Invalid number of arguments for iterator");
				}
				startingLetter = direction as Letter;
				direction = Direction.DEFAULT;
			}

			return util.CircularIterator.of(this.values(direction, startingLetter));
		}

		public static isValid(letterChar: string): boolean {
			let value = letterChar.charCodeAt(0);
			return (value >= 'A'.charCodeAt(0) && value <= 'G'.charCodeAt(0)) || (value >= 'a'.charCodeAt(0) && value <= 'g'.charCodeAt(0));
		}

		public static fromChar(letterChar: string): Letter {
			if (!Letter.isValid(letterChar)) {
				throw new error.EtudeError("Invalid letter character: " + letterChar);
			}
			return Letter._values[letterChar.toUpperCase().charCodeAt(0) - "A".charCodeAt(0)];
		}

		public toString(): string {
			return Object.keys(Letter).find(l => Letter[l] === this);
		}
	}

	export class Mode {
		public static IONIAN = new Mode([2, 2, 1, 2, 2, 2, 1]);
		public static DORIAN = new Mode([2, 1, 2, 2, 2, 1, 2]);
		public static PHRYGIAN = new Mode([1, 2, 2, 2, 1, 2, 2]);
		public static LYDIAN = new Mode([2, 2, 2, 1, 2, 2, 1]);
		public static MIXOLYDIAN = new Mode([2, 2, 1, 2, 2, 1, 2]);
		public static AEOLIAN = new Mode([2, 1, 2, 2, 1, 2, 2]);
		public static LOCRIAN = new Mode([1, 2, 2, 1, 2, 2, 2]);

		constructor(private stepPattern: number[]) {
		}

		public getStepPattern(): number[] {
			return this.stepPattern.slice();
		}

		public toString(): string {
			return Object.keys(Mode).find(m => Mode[m] === this);
		}
	}

	export module MusicConstants {
		export const KEYS_IN_OCTAVE = 12;
		export const SMALLEST_PROGRAM_NUMBER = 0;
		export const LARGEST_PROGRAM_NUMBER = 127;
	}

	export class Note {
		constructor(private pitch: Pitch, private value: Value) {
		}

		public static fromString(noteString: string): Note {
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

		public toString(): string {
			return this.pitch + "[" + this.value + "]";
		}

		public equals(other: any): boolean {
			if (!(other instanceof Note)) {
				return false;
			}
			if (other === this) {
				return true;
			}

			let otherNote = other as Note;
			return this.pitch.equals(otherNote.getPitch()) && this.value === otherNote.getValue();
		}

		public getPitch(): Pitch {
			return this.pitch;
		}

		public getValue(): Value {
			return this.value;
		}
	}

	export class Pitch {
		constructor(private key: Key, private octave: number) {
			let programNumber = this.getProgramNumber();
			if (programNumber < MusicConstants.SMALLEST_PROGRAM_NUMBER || programNumber > MusicConstants.LARGEST_PROGRAM_NUMBER) {
				throw new error.EtudeError("Invalid program number: " + programNumber);
			}
		}

		public apply(keySignature: KeySignature): Pitch {
			return new Pitch(this.key.apply(keySignature), this.octave);
		}

		public step(amount: Interval | number, policies: util.ImmutablePrioritySet<Policy> = Policy.DEFAULT_PRIORITY): Pitch {
			if (amount instanceof Interval) {
				if (arguments.length !== 1) {
					throw new error.EtudeError("Invalid number of arguments for step");
				}

				let letter = Letter.values(this.key.getLetter())[util.MathUtil.floorMod(amount.getDistance() - 1, Letter.size)];

				let accidental = new Key(letter).apply(new KeySignature(this.key, KeySignature.Quality.MAJOR)).getAccidental();
				// change accidental based on interval's quality
				switch (amount.getQuality()) {
					case Interval.Quality.PERFECT: case Interval.Quality.MAJOR:
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
				let octaveOffset = Math.trunc(
					(amount.getDistance()
						- 1
						+ (util.MathUtil.floorMod(this.key.getLetter().ordinal() - 2, Letter.size) - util.MathUtil.floorMod(letter.ordinal() - 2, Letter.size))
					) / Letter.size
				);

				return new Pitch(new Key(letter, accidental), this.octave + octaveOffset);
			}
			else if (typeof amount === "number") {
				return Pitch.fromProgramNumber(this.getProgramNumber() + amount, policies);
			}
		}

		public halfStepUp(policies: util.ImmutablePrioritySet<Policy> = Policy.DEFAULT_PRIORITY): Pitch {
			return Pitch.fromProgramNumber(this.getProgramNumber() + 1, policies);
		}

		public halfStepDown(policies: util.ImmutablePrioritySet<Policy> = Policy.DEFAULT_PRIORITY): Pitch {
			return Pitch.fromProgramNumber(this.getProgramNumber() - 1, policies);
		}

		public isHigherThan(pitch: Pitch): boolean {
			return this.getProgramNumber() > pitch.getProgramNumber();
		}

		public isLowerThan(pitch: Pitch): boolean {
			return this.getProgramNumber() < pitch.getProgramNumber();
		}

		public compareTo(pitch: Pitch): number {
			return util.MathUtil.compare(this.getProgramNumber(), pitch.getProgramNumber());
		}

		public getHigherPitch(key: Key): Pitch {
			let pitch = new Pitch(key, this.octave);
			if (!this.isLowerThan(pitch)) {
				pitch = new Pitch(key, this.octave + 1);
			}
			return pitch;
		}

		public getLowerPitch(key: Key): Pitch {
			let pitch = new Pitch(key, this.octave);
			if (!this.isHigherThan(pitch)) {
				pitch = new Pitch(key, this.octave - 1);
			}
			return pitch;
		}

		public static isEnharmonic(a: Pitch, b: Pitch): boolean {
			return a.getProgramNumber() === b.getProgramNumber();
		}

		public static fromProgramNumber(programNumber: number, policies: util.ImmutablePrioritySet<Policy> = Policy.DEFAULT_PRIORITY): Pitch {
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

		public getProgramNumber(): number {
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
		public static fromString(pitchString: string): Pitch {
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

		public toString(): string {
			return this.key.toString() + this.octave + "(" + this.getProgramNumber() + ")";
		}

		public equals(other: any): boolean {
			if (!(other instanceof Pitch)) {
				return false;
			}
			if (other === this) {
				return true;
			}

			let otherPitch = other as Pitch;
			return this.key.equals(otherPitch.getKey()) && this.octave === otherPitch.getOctave();
		}

		public getKey(): Key {
			return this.key;
		}

		public getOctave(): number {
			return this.octave;
		}
	}

	export interface Policy extends util.Predicate<Key> {
	}

	export module Policy {
		export function prioritize(...policies: Policy[]): util.ImmutablePrioritySet<Policy> {
			return util.ImmutablePrioritySet.of(policies);
		}

		export function matchLetter(letter: Letter): Policy {
			return k => k.getLetter() === letter;
		}

		export function matchAccidental(accidental: Accidental): Policy {
			return k => k.getAccidental() === accidental;
		}

		export function matchKeySignature(keySignature: KeySignature): Policy {
			let keys = Letter
				.values()
				.map(l => new Key(l))
				.map(k => k.apply(keySignature))
			return k => keys[k.getLetter().ordinal()].equals(k);
		}

		export let NONE_OR_NATURAL = k => k.getAccidental().getOffset() === Accidental.NONE.getOffset();
		export let SHARP = Policy.matchAccidental(Accidental.SHARP);
		export let DOUBLE_SHARP = Policy.matchAccidental(Accidental.DOUBLE_SHARP);
		export let TRIPLE_SHARP = Policy.matchAccidental(Accidental.TRIPLE_SHARP);
		export let SHARPS = k => k.getAccidental().getOffset() > Accidental.NONE.getOffset();
		export let FLAT = Policy.matchAccidental(Accidental.FLAT);
		export let DOUBLE_FLAT = Policy.matchAccidental(Accidental.DOUBLE_FLAT);
		export let TRIPLE_FLAT = Policy.matchAccidental(Accidental.TRIPLE_FLAT);
		export let FLATS = k => k.getAccidental().getOffset() < Accidental.NONE.getOffset();

		export let DEFAULT_PRIORITY = Policy.prioritize(
			Policy.NONE_OR_NATURAL,
			Policy.SHARP,
			Policy.FLAT
		);
	}

	export class Scale {
		private quality: Scale.Quality;

		public constructor(private key: Key, parameter: number[] | Scale.Quality, descending?: number[]) {
			if (parameter instanceof Scale.Quality) {
				this.quality = parameter as Scale.Quality;
			}
			else {
				let ascending = parameter as number[];
				if (descending === undefined) {
					descending = ascending.slice().reverse().map(n => -n);
				}
				this.quality = new Scale.Quality(ascending, descending);
			}
		}

		public getDefaultPolicy(direction: Direction): util.ImmutablePrioritySet<Policy> {
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

		public stream(direction: Direction | util.ImmutablePrioritySet<Policy> = Direction.DEFAULT, policies?: util.ImmutablePrioritySet<Policy>): util.InfiniteStream<Key> {
			if (direction instanceof util.ImmutablePrioritySet) {
				if (arguments.length !== 1) {
					throw new error.EtudeError("Invalid number of arguments for stream");
				}
				policies = direction as util.ImmutablePrioritySet<Policy>;
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

		public iterator(direction: Direction | util.ImmutablePrioritySet<Policy> = Direction.DEFAULT, policies?: util.ImmutablePrioritySet<Policy>): util.InfiniteIterator<Key> {
			if (direction instanceof util.ImmutablePrioritySet) {
				if (arguments.length !== 1) {
					throw new error.EtudeError("Invalid number of arguments for iterator");
				}
				policies = direction as util.ImmutablePrioritySet<Policy>;
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

		public getKeys(direction: Direction | util.ImmutablePrioritySet<Policy> = Direction.DEFAULT, policies?: util.ImmutablePrioritySet<Policy>): Key[] {
			if (direction instanceof util.ImmutablePrioritySet) {
				if (arguments.length !== 1) {
					throw new error.EtudeError("Invalid number of arguments for getKeys");
				}
				policies = direction as util.ImmutablePrioritySet<Policy>;
				direction = Direction.DEFAULT;
			}
			else if (direction instanceof Direction) {
				if (policies == null) {
					policies = this.getDefaultPolicy(direction);
				}
			}

			let keys: Key[] = [];
			let it = this.iterator(direction, policies);
			let length = this.quality.getStepPattern(direction).length;
			for (let i = 0; i < length; ++i) {
				keys.push(it.next().value);
			}
			return keys;
		}

		public toString(direction: Direction = Direction.DEFAULT): string {
			return "[" + this.getKeys(direction).join(", ") + "]";
		}

		public getKey(): Key {
			return this.key;
		}

		public getQuality(): Scale.Quality {
			return this.quality;
		}
	}

	export module Scale {
		export class Quality {
			public static MAJOR = new Quality([2, 2, 1, 2, 2, 2, 1]);
			public static NATURAL_MINOR = new Quality([2, 1, 2, 2, 1, 2, 2]);
			public static HARMONIC_MINOR = new Quality([2, 1, 2, 2, 1, 3, 1]);
			public static MELODIC_MINOR = new Quality([2, 1, 2, 2, 2, 2, 1], [-2, -2, -1, -2, -2, -1, -2]);
			public static CHROMATIC = new Quality([1]);
			public static WHOLE_TONE = new Quality([2]);

			constructor(private ascending: number[], private descending: number[] = ascending.slice().reverse().map(n => -n)) {
			}

			public getStepPattern(direction: Direction = Direction.DEFAULT): number[] {
				switch (direction) {
					case Direction.ASCENDING: return this.ascending;
					case Direction.DESCENDING: return this.descending;
					default: throw new error.AssertionError("Invalid direction: " + direction);
				}
			}

			public isOctaveRepeating(direction: Direction = Direction.DEFAULT): boolean {
				return Math.abs(this.getStepPattern(direction).reduce(util.MathUtil.add, 0)) === MusicConstants.KEYS_IN_OCTAVE;
			}
		}
	}

	export class Value {
		public static size: number = 0;
		private static _values: Value[] = [];

		public static DOUBLE_WHOLE = new Value(2.0);
		public static WHOLE = new Value(1.0);
		public static HALF = new Value(0.5);
		public static QUARTER = new Value(0.25);
		public static EIGHTH = new Value(0.125);
		public static SIXTEENTH = new Value(0.0625);
		public static THIRTY_SECOND = new Value(0.03125);
		public static SIXTY_FOURTH = new Value(0.015625);
		public static HUNDRED_TWENTY_EIGHTH = new Value(0.0078125);
		public static TWO_HUNDRED_FIFTY_SIXTH = new Value(0.00390625);

		constructor(private duration: number) {
			++Value.size;
			Value._values.push(this);
		}

		public static values(): Value[] {
			return Value._values.slice();
		}

		public ordinal(): number {
			return Value._values.indexOf(this);
		}

		public static valueOf(valueString: string): Value {
			let value = Value[valueString];
			if (value instanceof Value) {
				return value;
			}
			throw new error.EtudeError("Invalid value string: " + valueString);
		}

		public static fromDuration(duration: number): Value {
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

		public static fromString(valueString: string): Value {
			let value: Value;
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

		public toString(): string {
			return Object.keys(Value).find(v => Value[v] === this);
		}

		public getDuration(): number {
			return this.duration;
		}
	}

	export class Tempo {
		/*
		 * Values based on the mean of the values given in
		 * https://en.wikipedia.org/wiki/Tempo
		 */
		public static LARGHISSIMO = new Tempo(24, "Larghissimo");
		public static GRAVE = new Tempo(35, "Grave");
		public static LARGO = new Tempo(50, "Largo");
		public static LENTO = new Tempo(53, "Lento");
		public static LARGHETTO = new Tempo(63, "Larghetto");
		public static ADAGIO = new Tempo(71, "Adagio");
		public static ADAGIETTO = new Tempo(74, "Adagietto");
		public static ANDANTE = new Tempo(92, "Andante");
		public static ANDANTINO = new Tempo(94, "Andantino");
		public static MARCIA_MODERATO = new Tempo(84, "Marcia Moderato");
		public static ANDANTE_MODERATO = new Tempo(102, "Andante Moderato");
		public static MODERATO = new Tempo(114, "Moderato");
		public static ALLEGRETTO = new Tempo(116, "Allegretto");
		public static ALLEGRO_MODERATO = new Tempo(118, "Allegro Moderato");
		public static ALLEGRO = new Tempo(144, "Allegro");
		public static VIVACE = new Tempo(172, "Vivace");
		public static VIVACISSIMO = new Tempo(174, "Vivacissimo");
		public static ALLEGRISSIMO = new Tempo(174, "Allegrissimo");
		public static ALLEGRO_VIVACE = new Tempo(174, "Allegro Vivace");
		public static PRESTO = new Tempo(184, "Presto");
		public static PRESTISSIMO = new Tempo(200, "Prestissimo");

		private beatValue: Value;
		private tempoMarking: string;

		constructor(private bpm: number, parameterA: Value | string = Value.QUARTER, parameterB: string = (parameterA + " = " + bpm)) {
			if (parameterA instanceof Value) {
				this.beatValue = parameterA as Value;
				this.tempoMarking = parameterB as string;
			}
			else if (typeof parameterA === "string") {
				if (arguments.length !== 2) {
					throw new error.EtudeError("Invalid number of arguments for tempo constructor");
				}
				this.beatValue = Value.QUARTER;
				this.tempoMarking = parameterA as string;
			}
		}

		public getBPM(): number {
			return this.bpm;
		}

		public getBeatValue(): Value {
			return this.beatValue;
		}

		public getTempoMarking(): string {
			return this.tempoMarking;
		}
	}

	export class Interval {
		constructor(private quality: Interval.Quality, private distance: number) {
			if (distance <= 0) {
				throw new error.EtudeError("Invalid interval: " + quality + distance + " (distance must be a positive integer)");
			}
			switch (quality) {
				case
					Interval.Quality.PERFECT:
					if (!Interval.isPerfect(distance)) {
						throw new error.EtudeError("Invalid interval: " + quality + distance + " (distance cannot have a perfect quality)");
					}
					break;
				case Interval.Quality.MAJOR: case Interval.Quality.MINOR:
					if (Interval.isPerfect(distance)) {
						throw new error.EtudeError("Invalid interval: " + quality + distance + " (distance cannot have major or minor quality)");
					}
					break;
				case Interval.Quality.DIMINISHED: case Interval.Quality.DOUBLY_DIMINISHED: case Interval.Quality.AUGMENTED: case Interval.Quality.DOUBLY_AUGMENTED:
					break;
			}
		}

		public static between(a: Pitch, b: Pitch): Interval {
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

		public getOffset(): number {
			// initialize offset to take into account octave
			let offset = Math.trunc((this.distance - 1) / Letter.size) * MusicConstants.KEYS_IN_OCTAVE;

			// take into account normalized number (within the range of an octave)
			offset += Scale.Quality.MAJOR
				.getStepPattern()
				.slice(0, this.distance - 1)
				.reduce(util.MathUtil.add, 0);

			// take into account quality
			switch (this.quality) {
				case Interval.Quality.PERFECT: case Interval.Quality.MAJOR:
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

		public static isPerfect(distance: number): boolean {
			let normalized = distance % 7;
			return normalized === 1 || normalized === 4 || normalized === 5;
		}

		public static fromString(intervalString: string): Interval {
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

		public toString(): string {
			return this.quality.toString() + this.distance;
		}

		public getQuality(): Interval.Quality {
			return this.quality;
		}

		public getDistance(): number {
			return this.distance;
		}
	}

	export module Interval {
		export class Quality {
			public static PERFECT = new Quality("P");
			public static MAJOR = new Quality("M");
			public static MINOR = new Quality("m");
			public static DIMINISHED = new Quality("d");
			public static DOUBLY_DIMINISHED = new Quality("dd");
			public static AUGMENTED = new Quality("A");
			public static DOUBLY_AUGMENTED = new Quality("AA");

			constructor(private symbol: string) {
			}

			public static fromString(qualityString: string): Quality {
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

			public toString(): string {
				return this.symbol;
			}
		}
	}

	export class Chord {
		private pitches: Pitch[];

		public constructor(parameter: Pitch | Pitch[], quality?: Chord.Quality, inversion: Inversion = Inversion.ROOT) {
			if (parameter instanceof Pitch) {
				if (arguments.length < 2 || arguments.length > 3) {
					throw new error.EtudeError("Invalid number of arguments for chord constructor");
				}
				this.pitches = Chord
					.builder()
					.setRoot(parameter as Pitch)
					.add(quality)
					.setInversion(inversion)
					.build()
					.pitches;
			}
			else if (parameter instanceof Array) {
				this.pitches = parameter as Pitch[];
			}
		}

		public static fromString(chordString: string): Chord {
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

		public toString(): string {
			return "[" + this.pitches.join(", ") + "]";
		}

		public getPitches(): Pitch[] {
			return this.pitches;
		}

		public static builder(): Chord.RequiresRoot {
			return new Chord.Builder();
		}
	}

	export module Chord {
		export class Quality {
			public static MAJOR = new Quality([
				new Interval(Interval.Quality.PERFECT, 1),
				new Interval(Interval.Quality.MAJOR, 3),
				new Interval(Interval.Quality.PERFECT, 5)
			]);
			public static MINOR = new Quality([
				new Interval(Interval.Quality.PERFECT, 1),
				new Interval(Interval.Quality.MINOR, 3),
				new Interval(Interval.Quality.PERFECT, 5)
			]);
			public static DIMINISHED = new Quality([
				new Interval(Interval.Quality.PERFECT, 1),
				new Interval(Interval.Quality.MINOR, 3),
				new Interval(Interval.Quality.DIMINISHED, 5)
			]);
			public static AUGMENTED = new Quality([
				new Interval(Interval.Quality.PERFECT, 1),
				new Interval(Interval.Quality.MAJOR, 3),
				new Interval(Interval.Quality.AUGMENTED, 5)
			]);
			public static MAJOR_SEVENTH = new Quality([
				new Interval(Interval.Quality.PERFECT, 1),
				new Interval(Interval.Quality.MAJOR, 3),
				new Interval(Interval.Quality.PERFECT, 5),
				new Interval(Interval.Quality.MAJOR, 7)
			]);
			public static MINOR_SEVENTH = new Quality([
				new Interval(Interval.Quality.PERFECT, 1),
				new Interval(Interval.Quality.MINOR, 3),
				new Interval(Interval.Quality.PERFECT, 5),
				new Interval(Interval.Quality.MINOR, 7)
			]);
			public static DOMINANT_SEVENTH = new Quality([
				new Interval(Interval.Quality.PERFECT, 1),
				new Interval(Interval.Quality.MAJOR, 3),
				new Interval(Interval.Quality.PERFECT, 5),
				new Interval(Interval.Quality.MINOR, 7)
			]);
			public static DIMINISHED_SEVENTH = new Quality([
				new Interval(Interval.Quality.PERFECT, 1),
				new Interval(Interval.Quality.MINOR, 3),
				new Interval(Interval.Quality.DIMINISHED, 5),
				new Interval(Interval.Quality.DIMINISHED, 7)
			]);
			public static HALF_DIMINISHED_SEVENTH = new Quality([
				new Interval(Interval.Quality.PERFECT, 1),
				new Interval(Interval.Quality.MINOR, 3),
				new Interval(Interval.Quality.DIMINISHED, 5),
				new Interval(Interval.Quality.MINOR, 7)
			]);
			public static MINOR_MAJOR_SEVENTH = new Quality([
				new Interval(Interval.Quality.PERFECT, 1),
				new Interval(Interval.Quality.MINOR, 3),
				new Interval(Interval.Quality.PERFECT, 5),
				new Interval(Interval.Quality.MAJOR, 7)
			]);
			public static AUGMENTED_MAJOR_SEVENTH = new Quality([
				new Interval(Interval.Quality.PERFECT, 1),
				new Interval(Interval.Quality.MAJOR, 3),
				new Interval(Interval.Quality.AUGMENTED, 5),
				new Interval(Interval.Quality.MAJOR, 7)
			]);

			constructor(private intervalPattern: Interval[]) {
			}

			public getIntervalPattern(): Interval[] {
				return this.intervalPattern;
			}
		}

		export class Builder implements Base, RequiresRoot, Manipulate, End {
			public pitches: Pitch[] = [];
			public bottomDegree = Degree.TONIC;
			public root: Pitch;

			public setRoot(root: Pitch): Manipulate {
				this.root = root;
				return this;
			}

			public add(element: Interval | Quality): Manipulate {
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

			public setInversion(inversion: Inversion): End {
				switch (inversion) {
					case Inversion.ROOT: return this.setBottomDegree(Degree.TONIC);
					case Inversion.FIRST: return this.setBottomDegree(Degree.MEDIANT);
					case Inversion.SECOND: return this.setBottomDegree(Degree.DOMINANT);
					case Inversion.THIRD: return this.setBottomDegree(Degree.LEADING_TONE);
					default: throw new error.AssertionError("Invalid inversion: " + inversion);
				}
			}

			public setBottomDegree(degree: Degree): End {
				this.bottomDegree = degree;
				return this;
			}

			public build(): Chord {
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

		constructor(private key: Key, private quality: KeySignature.Quality) {
		}

		public isMajor(): boolean {
			return this.quality === KeySignature.Quality.MAJOR;
		}

		public isMinor(): boolean {
			return this.quality === KeySignature.Quality.MINOR;
		}

		public degreeOf(key: Key): Degree {
			let difference = util.MathUtil.floorMod(key.getLetter().ordinal() - this.key.getLetter().ordinal(), Letter.size);
			return Degree.fromValue(difference + 1);
		}

		public keyOf(degree: Degree): Key {
			let letters = Letter.values(this.key.getLetter());
			let key = new Key(letters[degree.getValue() - 1]);
			return key.apply(this);
		}

		public getKeysWithAccidentals(): Key[] {
			let keysWithAccidentals = new Scale(this.key, this.isMajor() ? Scale.Quality.MAJOR : Scale.Quality.NATURAL_MINOR)
				.getKeys()
				.filter(k => !k.isNone() && !k.isNatural());
			if (keysWithAccidentals.length !== 0) {
				let ordered: Letter[];
				switch (keysWithAccidentals[0].getAccidental()) {
					case Accidental.FLAT: case Accidental.DOUBLE_FLAT: case Accidental.TRIPLE_FLAT:
						ordered = KeySignature.ORDER_OF_FLATS;
						break;
					case Accidental.SHARP: case Accidental.DOUBLE_SHARP: case Accidental.TRIPLE_SHARP:
						ordered = KeySignature.ORDER_OF_SHARPS;
						break;
					default:
						throw new error.AssertionError("Invalid accidental: " + keysWithAccidentals[0].getAccidental());
				}
				keysWithAccidentals.sort((a, b) => util.MathUtil.compare(ordered.indexOf(a.getLetter()), ordered.indexOf(b.getLetter())));
			}
			return keysWithAccidentals;
		}

		public getAccidentalCount(): number {
			return new Scale(this.key, this.isMajor() ? Scale.Quality.MAJOR : Scale.Quality.NATURAL_MINOR)
				.getKeys()
				.filter(k => !k.isNone() && !k.isNatural())
				.length;
		}

		public static fromAccidentals(accidental: Accidental, count: number, quality: KeySignature.Quality): KeySignature {
			if (count < 0 || count > 7) {
				throw new error.EtudeError("Invalid accidental count: " + count);
			}

			if (count === 0 && (accidental !== Accidental.NONE && accidental !== Accidental.NATURAL)) {
				throw new error.EtudeError("Invalid count for accidental type: " + count + " " + accidental);
			}

			let key: Key;
			let letter: Letter;
			// determine the key assuming quality is MAJOR
			switch (accidental) {
				case Accidental.FLAT:
					letter = KeySignature.ORDER_OF_FLATS[util.MathUtil.floorMod(count - 2, Letter.size)];
					key = new Key(
						letter,
						// accidental; if flats for key signature contain the letter, make the key flat
						KeySignature.ORDER_OF_FLATS.slice(0, count).indexOf(letter) > -1
							? Accidental.FLAT
							: Accidental.NONE
					);
					break;
				case Accidental.SHARP:
					letter = KeySignature.ORDER_OF_SHARPS[util.MathUtil.floorMod(count + 1, Letter.size)];
					key = new Key(
						letter,
						// accidental; if sharps for key signature contain the letter, make the key sharp
						KeySignature.ORDER_OF_SHARPS.slice(0, count).indexOf(letter) > -1
							? Accidental.SHARP
							: Accidental.NONE
					);
					break;
				case Accidental.NONE: case Accidental.NATURAL:
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

		public getParallel(): KeySignature {
			return new KeySignature(this.key, this.isMajor() ? KeySignature.Quality.MINOR : KeySignature.Quality.MAJOR);
		}

		public getRelative(): KeySignature {
			let keys = this.getKeysWithAccidentals();
			/**
			 * 0 flats/sharps = NONE_OR_NATURAL
				 * flats = NONE_OR_NATURAL + FLAT
				 * sharps = NONE_OR_NATURAL + SHARP
				 */
			let policies = keys.length === 0
				? Policy.prioritize(Policy.NONE_OR_NATURAL)
				: Policy.prioritize(
					Policy.NONE_OR_NATURAL,
					keys[0].getAccidental() === Accidental.FLAT
						? Policy.FLAT
						: Policy.SHARP
				);
			/**
			 * major -> minor = -3
			 * minor -> major = 3
			 */
			return new KeySignature(
				Key.fromOffset(
					util.MathUtil.floorMod(this.key.getOffset() + (this.isMajor() ? -3 : 3), MusicConstants.KEYS_IN_OCTAVE),
					policies
				),
				this.isMajor() ? KeySignature.Quality.MINOR : KeySignature.Quality.MAJOR
			);
		}

		public toString(): string {
			return this.key.toString() + this.quality.toString();
		}

		public getKey(): Key {
			return this.key;
		}

		public getQuality(): KeySignature.Quality {
			return this.quality;
		}
	}

	export module KeySignature {
		export class Quality {
			public static MAJOR = new Quality();
			public static MINOR = new Quality();

			constructor() {
			}

			public toString(): string {
				return Object.keys(Quality).find(q => Quality[q] === this);
			}
		}
	}

	export class TimeSignature {
		public static COMMON_TIME = new TimeSignature(4, Value.QUARTER);

		private oneBeat: Value;

		public constructor(private beatsPerMeasure: number, parameter: number | Value) {
			if (typeof parameter === "number") {
				this.oneBeat = Value.fromDuration(1.0 / (parameter as number));
			}
			else {
				this.oneBeat = parameter as Value;
			}
		}

		public getDurationOfMeasure(): number {
			return this.beatsPerMeasure * this.oneBeat.getDuration();
		}

		public getBeatsPerMeasure(): number {
			return this.beatsPerMeasure;
		}

		public getOneBeat(): Value {
			return this.oneBeat;
		}
	}
}
