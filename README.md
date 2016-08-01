# etude.js
JavaScript Music Theory API

A port of [etude](https://github.com/andrewthehan/etude), the Java version. While similar, there are a few changes to take note of:
- Accessbility of instance members were changed from `private` to `public`. The respective getters were also removed.
- Various computed values (such as `offset` and `programNumber`) were changed from methods to variables.
- Most of the `asList`, `iterator`, `stream` methods were removed due to the lack of native iterators and infinite streams in JavaScript.
- Lack of most enum members. `values` was ported (and overloaded to take in `startingElement` for most enums).
- `Pitch` not being `Comparable`. However, `compareTo` was ported.
- Complete alteration of utility methods. These were dependent on what was available in each respective language.
- Lack of type checks due to the differences between Java and JavaScript as languages. However, static type checks are available if using [TypeScript](https://www.typescriptlang.org/).
- Small syntactical changes

  | Java                        | JavaScript         | Reason                                    |
  |-----------------------------|--------------------|-------------------------------------------|
  | `EnumName.values().length`  | `EnumName.size`    | Flexibility to design enum ports
  | `interval.getNumber()`      | `interval.distance`| `number` is a reserved word in JavaScript
  

## Installation
```
npm install etude
```

## Usage
### require
#### Top level module:
```javascript
const Etude = require("etude");
```
This method requires you to prepend each module with `Etude` (e.g. `Etude.Letter.A`).

#### Each module separately:
```javascript
const {Accidental, Chord, Degree, Interval, Key, KeySignature, Letter, Mode, Pitch, Scale} = require("etude");
```
This method allows you to omit modules (i.e. `const {Letter} = require("etude");`).

### Examples
For extensive example usage, refer to the Java version's [unit tests](https://github.com/andrewthehan/etude/tree/master/src/test/java/tests).

#### Letter
```javascript
let letter = Letter.A;
console.log(letter.toString()); // A
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

#### Scale
```javascript
let scale = new Scale(new KeySignature(Key.fromString("C"), Mode.MAJOR));
console.log(scale.keys.map(k => k.toString())); // [ 'Cn', 'Dn', 'En', 'Fn', 'Gn', 'An', 'Bn' ]

let anotherScale = new Scale(new KeySignature(Key.fromString("G"), Mode.HARMONIC_MINOR));
console.log(anotherScale.keys.map(k => k.toString())); // [ 'Gn', 'An', 'Bb', 'Cn', 'Dn', 'Eb', 'F#' ]
```