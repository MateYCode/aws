const policy = require('./policy.json');
const crypto = require('crypto');
const { buildBase64Policy } = require('./index');

const accessKeyId = 'elIdEs123';
const sessionToken = 'elTokenEs456'

const today = new Date();
const date = today.toISOString().split('T')[0].replace(/-/g, '');

const stringToSign = buildBase64Policy({ accessKeyId, date, sessionToken });
console.log('This is the policy', policy, '\n');
console.log('This is the base64 policy: ', stringToSign, '\n');



