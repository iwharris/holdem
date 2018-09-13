#!/usr/bin/env node

const fs = require('fs');

const data = fs.readFileSync(0, 'utf8');

console.log(data);
console.log('hello world')
