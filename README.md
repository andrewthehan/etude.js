# etude.js
[![npm](https://img.shields.io/npm/v/etude.svg?maxAge=86400)](https://www.npmjs.com/package/etude)

> JavaScript Music Theory API

Try it [here](https://tonicdev.com/npm/etude)!

A port of [etude](https://github.com/andrewthehan/etude), the Java version. While similar, there are a few changes to take note of:
- `asList` was removed due to the way arrays are implemented in JavaScript (JavaScript arrays can do most of what Java ArrayLists can do).
- Streams was ported for use with `Letter` and `Scale`. Contains `filter`, `map`, `limit`, and `skip`.
- Lack of most enum members. `values`, `ordinal`, and `valueOf` were ported (`values` was also "overloaded" via default parameters to take in `startingElement` where appropriate).
- `Pitch` not being `Comparable`. However, `compareTo` was ported.
- Complete alteration of utility methods. These were dependent on what was available in each respective language.
- Lack of type checks due to the differences between Java and JavaScript as languages. However, static type checks are available if using [TypeScript](https://www.typescriptlang.org/).
- Any whole number will not contain a decimal point when converted to a string (e.g. `1.0` will be converted to `"1.0"` in Java whereas `1.0` will be converted to `"1"` in JavaScript). This is relevant for `Value.DOUBLE_WHOLE` and `Value.WHOLE`.
- Small syntactical changes

  | Java                        | JavaScript          | Reason                                        |
  |-----------------------------|---------------------|-----------------------------------------------|
  | `EnumName.values().length`  | `EnumName.size`     | To avoid cloning `values` array               |
  | `interval.getNumber()`      | `interval.distance` | `number` is a reserved word in JavaScript     |
  | `policy.test(key)`          | `policy(key)`       | To allow `let policy = k => {...}` assignment |

## Installation
### Browser
Add this line to your html file:
```html
<script type="text/javascript" src="https://unpkg.com/etude/js/etude-browser.js"></script>
```
The `src` pulls from the latest version of etude on npm. This may cause builds to break if a backward-incompatible version is released. To target a specific version, include the version number in the `src`:
```html
<script type="text/javascript" src="https://unpkg.com/etude@version/js/etude-browser.js"></script>
```
More information on the version tag can be found at [unpkg](https://unpkg.com/).

If you do not wish to use unpkg, use [Browserify](http://browserify.org/) along with the require methods below. If you do not wish to use either, download the [file](https://raw.githubusercontent.com/andrewthehan/etude.js/master/js/etude-browser.js) and add this line to your html file:
```html
<script type="text/javascript" src="path/to/file/etude-browser.js"></script>
```
Any of the above methods adds `etude` to the global namespace. To avoid prepending module package names to each module name with each use (e.g. `etude.theory.Letter`), add these lines:
```javascript
const {error, theory, util} = etude;
const {EtudeError} = error;
const {Accidental, Chord, Degree, Direction, Dynamic, Interval, Inversion, Key, KeySignature, Letter, Mode, MusicConstants, Note, Pitch, Policy, Scale, Tempo, TimeSignature, Value} = theory;
const {CircularIterator, CircularStream, ImmutablePrioritySet, InfiniteIterator, InfiniteStream} = util;
```

### require
First install the package.
```
npm install etude
```
Then include the package in your code using one of the following methods:
#### Top level module:
```javascript
const etude = require("etude");
```
This method requires you to prepend module package names to each module name with each use (e.g. `etude.theory.Letter`).

#### Each module separately:
```javascript
const {error, theory, util} = require("etude");
const {EtudeError} = error;
const {Accidental, Chord, Degree, Direction, Dynamic, Interval, Inversion, Key, KeySignature, Letter, Mode, MusicConstants, Note, Pitch, Policy, Scale, Tempo, TimeSignature, Value} = theory;
const {CircularIterator, CircularStream, ImmutablePrioritySet, InfiniteIterator, InfiniteStream} = util;
```

## Examples
For extensive example usage, refer to the Java version's [unit tests](https://github.com/andrewthehan/etude/tree/master/src/test/java/tests).

#### Accidental
```javascript
let accidental = Accidental.FLAT;
console.log(accidental.toString()); // b
console.log(accidental.getOffset()); // -1

accidental = Accidental.DOUBLE_SHARP;
console.log(accidental.toString()); // x
console.log(accidental.getOffset()); // 2

accidental = Accidental.fromOffset(-3);
console.log(accidental.toString()); // bbb
console.log(accidental === Accidental.TRIPLE_FLAT); // true

accidental = Accidental.fromString("n");
console.log(accidental.getOffset()); // 0
console.log(accidental === Accidental.NATURAL); // true
```

#### Chord
```javascript
let chord = new Chord(Pitch.fromString("C4"), Chord.Quality.MAJOR);
console.log(chord.toString()); // [Cn4(48), En4(52), Gn4(55)]

chord = Chord
  .builder()
  .setRoot(Pitch.fromString("Ab4"))
  .add(Chord.Quality.MINOR)
  .add(Interval.fromString("M6"))
  .build();
console.log(chord.toString()); // [Ab4(56), Cb5(59), Eb5(63), Fn5(65)]

chord = Chord
  .builder()
  .setRoot(Pitch.fromString("C4"))
  .add(Chord.Quality.DIMINISHED_SEVENTH)
  .setInversion(Inversion.FIRST)
  .build();
console.log(chord.toString()); // [Eb4(51), Gb4(54), Bbb4(57), Cn5(60)]
```

#### Degree
```javascript
let degree = Degree.TONIC;
console.log(degree.getValue()); // 1

degree = Degree.fromValue(5);
console.log(degree.toString()); // DOMINANT
```

#### Direction
```javascript
let direction = Direction.ASCENDING;
console.log(direction === Direction.DEFAULT); // true

direction = Direction.DESCENDING;
console.log(direction !== Direction.DEFAULT); // true
```

#### Dynamic
```javascript
let dynamic = Dynamic.PIANO;
console.log(dynamic.toString()); // p
console.log(dynamic.crescendo().toString()); // mp
console.log(dynamic.diminuendo().toString()); // pp

dynamic = Dynamic.fromString("mf");
console.log(dynamic === Dynamic.MEZZO_FORTE); // true
console.log(dynamic.crescendo() === Dynamic.FORTE); // true
```

#### Interval
```javascript
let interval = new Interval(Interval.Quality.MAJOR, 6);
console.log(interval.getOffset()); // 9

interval = Interval.between(Pitch.fromString("Eb4"), Pitch.fromString("Ab4"));
console.log(interval.toString()); // P4
```

#### Inversion
```javascript
let inversion = Inversion.ROOT;
console.log(inversion.getValue()); // 0

inversion = Inversion.THIRD;
console.log(inversion.getValue()); // 3 
```

#### Key
```javascript
let key = new Key(Letter.C);
console.log(key.toString()); // C

key = new Key(Letter.G, Accidental.SHARP);
console.log(key.toString()); // G#

console.log(key.step(1).toString()); // A
console.log(key.step(2).toString()); // A#

key = new Key(Letter.F);
let ks = new KeySignature(Key.fromString("G"), KeySignature.Quality.MAJOR);
console.log(key.apply(ks).toString()); // F#

key = new Key(Letter.C, Accidental.FLAT);
console.log(key.sharp().toString()); // C#
console.log(key.none().toString()); // C
console.log(key.doubleFlat().toString()); // Cbb
console.log(key.isFlat()); // true

let anotherKey = key.getEnharmonicEquivalent(Letter.A);
console.log(anotherKey.toString()); // Ax
console.log(Key.isEnharmonic(key, anotherKey)); // true

key = Key.fromString("Eb");
console.log(key.getLetter() === Letter.E); // true
console.log(key.getAccidental() === Accidental.FLAT); // true
```

#### KeySignature
```javascript
let ks = new KeySignature(Key.fromString("D"), KeySignature.Quality.MAJOR);

console.log(ks.keyOf(Degree.MEDIANT).toString()); // F#
console.log(ks.degreeOf(Key.fromString("G")).toString()); // SUBDOMINANT

console.log(ks.getKeysWithAccidentals().toString()); // F#,C#

let parallel = ks.getParallel();
console.log(parallel.getKey().toString()); // D
console.log(parallel.getQuality().toString()); // MINOR

let relative = ks.getRelative();
console.log(relative.getKey().toString()); // B
console.log(relative.getQuality().toString()); // MINOR

console.log(KeySignature.ORDER_OF_SHARPS.toString()); // F,C,G,D,A,E,B
```

#### Letter
```javascript
let letter = Letter.A;
console.log(letter.getOffset()); // 9

letter = Letter.fromChar('c');
console.log(letter === Letter.C); // true

let letters = Letter
  .stream(Letter.E)
  .limit(10);
console.log(letters.toString()); // E,F,G,A,B,C,D,E,F,G

letters = Letter
  .stream(Direction.DESCENDING, Letter.C)
  .limit(8);
console.log(letters.toString());  // C,B,A,G,F,E,D,C
```

#### Mode
```javascript
let mode = Mode.IONIAN;
console.log(mode.getStepPattern().toString()); // 2,2,1,2,2,2,1
```

#### MusicConstants
```javascript
console.log(MusicConstants.KEYS_IN_OCTAVE); // 12
console.log(MusicConstants.SMALLEST_PROGRAM_NUMBER); // 0
console.log(MusicConstants.LARGEST_PROGRAM_NUMBER); // 127
```

#### Note
```javascript
let note = new Note(Pitch.fromString("C4"), Value.QUARTER);
console.log(note.toString()); // C4(48)[QUARTER]

note = Note.fromString("Db5[1]");
console.log(note.getPitch().toString()); // Db5(61)
console.log(note.getValue().toString()); // WHOLE
```

#### Pitch
```javascript
let pitch = new Pitch(Key.fromString("Bbb"), 4);
console.log(pitch.toString()); // Bbb4(57)

let ks = new KeySignature(Key.fromString("F"), KeySignature.Quality.MAJOR);
pitch = pitch.apply(ks);
console.log(pitch.toString()); // Bb4(58)

console.log(pitch.step(3).toString()); // C#5(61)
console.log(pitch.step(3, Policy.prioritize(Policy.FLAT)).toString()); // Db5(61)

let interval = new Interval(Interval.Quality.PERFECT, 4);
console.log(pitch.step(interval).toString()); // Eb5(63)

pitch = pitch.getHigherPitch(Key.fromString("C"));
console.log(pitch.toString()); // C5(60)

console.log(Pitch.isEnharmonic(Pitch.fromString("F#4"), Pitch.fromString("Gb4"))); // true

pitch = Pitch.fromProgramNumber(48);
console.log(pitch.toString()); // C4(48)

pitch = Pitch.fromString("Ax7");
console.log(pitch.getKey().equals(Key.fromString("Ax"))); // true
console.log(pitch.getOctave() === 7); // true
```

#### Policy
```javascript
let policy = Policy.DOUBLE_FLAT;
console.log(policy(Key.fromString("C#"))); // false
console.log(policy(Key.fromString("Ebb"))); // true

policy = Policy.SHARPS;
console.log(policy(Key.fromString("C#"))); // true
console.log(policy(Key.fromString("C#x"))); // true

policy = Policy.matchLetter(Letter.E);
console.log(policy(Key.fromString("Dn"))); // false
console.log(policy(Key.fromString("Ebb"))); // true

let ks = new KeySignature(Key.fromString("A"), KeySignature.Quality.MAJOR);
policy = Policy.matchKeySignature(ks);
console.log(policy(Key.fromString("F"))); // false
console.log(policy(Key.fromString("F#"))); // true

let key = Key.fromString("G");
let policies = Policy.prioritize(Policy.TRIPLE_SHARP, Policy.TRIPLE_FLAT, Policy.NONE_OR_NATURAL);
console.log(key.step(2, policies).toString()); // Cbbb
```

#### Scale
```javascript
let scale = new Scale(Key.fromString("Ab"), Scale.Quality.MAJOR);
let keys = scale
  .stream()
  .limit(8);
console.log(keys.toString()); // Ab,Bb,C,Db,Eb,F,G,Ab

keys = scale
  .stream(Direction.DESCENDING)
  .limit(8);
console.log(keys.toString()); // Ab,G,F,Eb,Db,C,Bb,Ab

scale = new Scale(Key.fromString("G"), Scale.Quality.HARMONIC_MINOR);
keys = scale
  .stream()
  .limit(8);
console.log(keys.toString()); // G,A,Bb,C,D,Eb,F#,G

keys = scale
  .stream(Policy.prioritize(Policy.TRIPLE_FLAT, Policy.DOUBLE_FLAT))
  .limit(8);
/**
 * NOTE: the first key is G despite the policy prioritizing TRIPLE_FLAT and DOUBLE_FLAT
 * this is because the scale was constructed with G being the initial key
 */
console.log(keys.toString()); // G,Cbbb,Cbb,Dbb,Fbbb,Fbb,Abbb,Abb

// apply the policy on the initial key
scale = new Scale(Key.fromString("G").getEnharmonicEquivalent(Policy.prioritize(Policy.TRIPLE_FLAT, Policy.DOUBLE_FLAT)), Scale.Quality.HARMONIC_MINOR);
keys = scale
  .stream(Policy.prioritize(Policy.TRIPLE_FLAT, Policy.DOUBLE_FLAT))
  .limit(8);
/**
 * NOTE: this begins with Abb
 */
console.log(keys.toString()); // Abb,Cbbb,Cbb,Dbb,Fbbb,Fbb,Abbb,Abb
```

#### Tempo
```javascript
let tempo = Tempo.ANDANTE;
console.log(tempo.getBPM()); // 92
console.log(tempo.getBeatValue() === Value.QUARTER); // true
console.log(tempo.getTempoMarking()); // Andante

tempo = Tempo.PRESTO;
console.log(tempo.getBPM()); // 184
console.log(tempo.getBeatValue() === Value.QUARTER); // true
console.log(tempo.getTempoMarking()); // Presto

tempo = new Tempo(100, Value.HALF);
console.log(tempo.getBPM()); // 100
console.log(tempo.getBeatValue() === Value.HALF); // true
console.log(tempo.getTempoMarking()); // HALF = 100

tempo = new Tempo(150, Value.EIGHTH, "Pretty fast");
console.log(tempo.getBPM()); // 150
console.log(tempo.getBeatValue() === Value.EIGHTH); // true
console.log(tempo.getTempoMarking()); // Pretty fast
```

#### TimeSignature
```javascript
let ts = TimeSignature.COMMON_TIME;
console.log(ts.getDurationOfMeasure()); // 1
console.log(ts.getBeatsPerMeasure()); // 4
console.log(ts.getOneBeat() === Value.QUARTER); // true

ts = new TimeSignature(6, 8);
console.log(ts.getDurationOfMeasure()); // 0.75
console.log(ts.getBeatsPerMeasure()); // 6
console.log(ts.getOneBeat() === Value.EIGHTH); // true

ts = new TimeSignature(3, Value.QUARTER);
console.log(ts.getDurationOfMeasure()); // 0.75
console.log(ts.getBeatsPerMeasure()); // 3
console.log(ts.getOneBeat() === Value.QUARTER); // true
```

#### Value
```javascript
let value = Value.QUARTER;
console.log(value.toString()); // QUARTER
console.log(value.getDuration()); // 0.25

value = Value.fromString("0.25");
console.log(value === Value.QUARTER); // true

value = Value.fromString("QUARTER");
console.log(value === Value.QUARTER); // true

value = Value.fromString("1/4");
console.log(value === Value.QUARTER); // true

value = Value.fromDuration(0.25);
console.log(value === Value.QUARTER); // true
```
