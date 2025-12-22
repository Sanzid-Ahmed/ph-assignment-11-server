const fs = require('fs');
const key = fs.readFileSync('./assetverse-86357-firebase-adminsdk-fbsvc-1ff1cb7421.json', 'utf8')
const base64 = Buffer.from(key).toString('base64')
console.log(base64)