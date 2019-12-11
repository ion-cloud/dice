# dice
Take a complex dice string and compute results based on it

## Setup
Merely `npm i --save @ion-cloud/dice` and then import the Dice library and pass it a string to create an instance like so:
```
import {Dice} from '@ion-cloud/dice';

let myDice = new Dice('3d12+17-3d4');

console.log(myDice.min); //shows the minimum amount possible
console.log(myDice.max); //shows the maximum amount possible
console.log(myDice.roll()); //generates a random roll based on the string
myDice.add('5d4'); //you can directly modify the string by appending more
console.log(myDice.string); //show the current dice string
// -> 17+2d4+3d12
myDice.subtract('1d4');
myDice.subtract('1d10')
console.log(myDice.string);
// -> 17+1d4+3d12-1d10
```
Please see code example [here](https://github.com/ion-cloud/dice/blob/master/demo/src/App.vue).
