const weight = 60;
const EPSILON = Number.EPSILON;
const result = Math.round((weight + EPSILON) * 100) / 100;
console.log('Weight:', weight);
console.log('EPSILON:', EPSILON);
console.log('Result:', result);

const weight2 = 59.99999999999999;
const result2 = Math.round((weight2 + EPSILON) * 100) / 100;
console.log('Weight2:', weight2);
console.log('Result2:', result2);
