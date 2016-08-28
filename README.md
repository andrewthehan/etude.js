# etude.js [![npm version](https://badge.fury.io/js/etude.svg)](https://badge.fury.io/js/etude)
JavaScript Music Theory API

Try it [here](https://tonicdev.com/npm/etude)!

A port of [etude](https://github.com/andrewthehan/etude), the Java version. While similar, there are a few changes to take note of:
- Accessbility of instance members were changed from `private` to `public`. The respective getters were also removed.
- Various computed values (such as `offset` and `programNumber`) were changed from methods to variables.
- `asList` was removed due to the way arrays are implemented in JavaScript (JavaScript arrays can do most of what Java ArrayLists can do). `stream` was removed due to the lack of infinite streams in JavaScript. `iterator` was implemented using generators.
- Lack of most enum members. `values` was ported (and "overloaded" via default parameters to take in `startingElement` for Letter).
- `Pitch` not being `Comparable`. However, `compareTo` was ported.
- Complete alteration of utility methods. These were dependent on what was available in each respective language.
- Lack of type checks due to the differences between Java and JavaScript as languages. However, static type checks are available if using [TypeScript](https://www.typescriptlang.org/).
- Any whole number will not contain a decimal point when converted to a string (e.g. `1.0` will be converted to "1.0" in Java whereas `1.0` will be converted to "1" in JavaScript). This is relevant for `Value.DOUBLE_WHOLE` and `Value.WHOLE`.
- Small syntactical changes

  | Java                        | JavaScript         | Reason                                    |
  |-----------------------------|--------------------|-------------------------------------------|
  | `EnumName.values().length`  | `EnumName.size`    | Flexibility to design enum ports          |
  | `interval.getNumber()`      | `interval.distance`| `number` is a reserved word in JavaScript |

## Installation
### Browser
Add this line to your html file:
```html
<script type="text/javascript" src="https://npmcdn.com/etude/js/etude-browser.js"></script>
```
The `src` pulls from the latest version of etude on npm. This may cause builds to break if a backward-incompatible version is released. To target a specific version, include the version number in the `src`:
```html
<script type="text/javascript" src="https://npmcdn.com/etude@version/js/etude-browser.js"></script>
```
More information on the version tag can be found at [npmcdn](https://npmcdn.com/).

If you do not wish to use npmcdn, use [Browserify](http://browserify.org/) along with the require methods below. If you do not wish to use either, download the [file](https://raw.githubusercontent.com/andrewthehan/etude.js/master/js/etude-browser.js) and add this line to your html file:
```html
<script type="text/javascript" src="path/to/file/etude-browser.js"></script>
```
Any of the above methods adds `etude` to the global namespace (e.g. `etude.Letter`). To avoid prepending `etude` to each module name with each use, add this line:
```javascript
const {Accidental, Chord, Degree, Dynamic, Interval, Inversion, Key, KeySignature, Letter, Mode, MusicConstants, Note, Pitch, Scale, Value} = etude;
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
This method requires you to prepend each module with `etude` (e.g. `etude.Letter`).

#### Each module separately:
```javascript
const {Accidental, Chord, Degree, Dynamic, Interval, Inversion, Key, KeySignature, Letter, Mode, MusicConstants, Note, Pitch, Scale, Value} = require("etude");
```
This method allows you to omit modules (i.e. `const {Letter} = require("etude");`).

## Examples
For extensive example usage, refer to the Java version's [unit tests](https://github.com/andrewthehan/etude/tree/master/src/test/java/tests).

#### Letter
```javascript
let letter = Letter.A;
console.log(letter.toString()); // A

let it = Letter.iterator(Letter.C);
let letters = [];
for (let i = 0; i < 8; ++i) {
  letters.push(it.next().value);
}
console.log(letters.map(l => l.toString())); // [ 'C', 'D', 'E', 'F', 'G', 'A', 'B', 'C' ]
```

#### Key
```javascript
let key = new Key(Letter.C);
console.log(key.toString()); // C

console.log(key.sharp().toString()); // C#

let anotherKey = new Key(Letter.F, Accidental.FLAT);
console.log(anotherKey.toString()); // Fb

let keyFromString = Key.fromString("Gx");
console.log(keyFromString.letter === Letter.G); // true
console.log(keyFromString.accidental === Accidental.DOUBLE_SHARP); // true
```

#### Pitch
```javascript
let pitch = new Pitch(new Key(Letter.C), 4);
console.log(pitch.toString()); // C4(48)

console.log(pitch.halfStepUp().toString()); // C#(49);
console.log(pitch.halfStepUp(Accidental.Policy.PRIORITIZE_FLAT).toString()); // Db(49)

console.log(pitch.step(2).toString()); // Dn(50)
```

#### Interval
```javascript
let interval = new Interval(Interval.Quality.MAJOR, 6);
console.log(interval.offset); // 9

let intervalBetween = Interval.between(Pitch.fromString("Eb4"), Pitch.fromString("Ab4"));
console.log(intervalBetween.toString()); // P4
```

#### Chord
```javascript
let chord = Chord
  .builder()
  .setRoot(Pitch.fromString("C4"))
  .add(Chord.Quality.MAJOR)
  .build();
console.log(chord.toString()); // {Cn4(48),En4(52),Gn4(55)}

let anotherChord = Chord
  .builder()
  .setRoot(Pitch.fromString("Ab4"))
  .add(Chord.Quality.MINOR)
  .add(Interval.fromString("M6"))
  .build();
console.log(anotherChord.toString()); // {Ab4(56),Cb5(59),Eb5(63),Fn5(65)}

let invertedChord = Chord
  .builder()
  .setRoot(Pitch.fromString("C4"))
  .add(Chord.Quality.DIMINISHED_SEVENTH)
  .setInversion(Inversion.FIRST)
  .build();
console.log(invertedChord.toString()); // {Eb4(51),Gb4(54),Bbb4(57),Cn5(60)}
```

#### KeySignature
```javascript
let keySignature = new KeySignature(Key.fromString("C"), Mode.MAJOR);
console.log(keySignature.keysWithAccidentals.map(k => k.toString())); // []

let anotherKeySignature = new KeySignature(Key.fromString("C"), Mode.NATURAL_MINOR);
console.log(anotherKeySignature.keysWithAccidentals.map(k => k.toString())); // [ 'Bb', 'Eb', 'Ab' ]

console.log(KeySignature.ORDER_OF_SHARPS.map(k => k.toString()));  // [ 'F', 'C', 'G', 'D', 'A', 'E', 'B' ]

let oneMoreKeySignature = KeySignature.fromAccidentals(Accidental.SHARP, 3, Mode.MAJOR);
console.log(oneMoreKeySignature.key + " " + oneMoreKeySignature.mode); // A MAJOR
```

#### Scale
```javascript
let scale = new Scale(new KeySignature(Key.fromString("C"), Mode.MAJOR));
console.log(scale.keys.map(k => k.toString())); // [ 'Cn', 'Dn', 'En', 'Fn', 'Gn', 'An', 'Bn' ]

let anotherScale = new Scale(new KeySignature(Key.fromString("G"), Mode.HARMONIC_MINOR));
console.log(anotherScale.keys.map(k => k.toString())); // [ 'Gn', 'An', 'Bb', 'Cn', 'Dn', 'Eb', 'F#' ]

let it = new Scale(KeySignature.fromAccidentals(Accidental.FLAT, 3, Mode.MAJOR)).iterator();
let keys = [];
for (let i = 0; i < 8; ++i) {
  keys.push(it.next().value);
}
console.log(keys.map(k => k.toString())); // [ 'Eb', 'Fn', 'Gn', 'Ab', 'Bb', 'Cn', 'Dn', 'Eb' ]
```

#### Dynamic
```javascript
let dynamic = Dynamic.MEZZO_FORTE;
console.log(dynamic.toString()); // mf

console.log(dynamic.crescendo().toString()); // f
console.log(dynamic.diminuendo().toString()); // mp
```

#### Value
```javascript
let value = Value.QUARTER;
console.log(value.duration === 0.25); // true

let valueFromDuration = Value.fromDuration(1.0);
console.log(valueFromDuration === Value.WHOLE); // true

let valueFromString = Value.fromString("1/2");
console.log(valueFromString === Value.HALF); // true
```

#### Note
```javascript
let note = new Note(Pitch.fromString("C4"), Value.QUARTER);
console.log(note.toString()); // C4(48)[0.25]

let noteFromString = Note.fromString("F4[1/4]");
console.log(noteFromString.toString()); // F4(53)[0.25]
```