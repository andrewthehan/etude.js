# etude.js
JavaScript Music Theory API

Work in progress.

## Installation
```
npm install etude
```

## Usage
```javascript
const {Key, Letter, Pitch} = require("Etude");

let pitch = new Pitch(new Key(Letter.C), 4);
console.log(pitch.toString()); // C4(48)
```