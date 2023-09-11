const policy = require('./policy.json');
const crypto = require('crypto');

const accessKeyId = 'elIdEs123';
const sessionToken = 'elTokenEs456'

const today = new Date();
const date = today.toISOString().split('T')[0].replace(/-/g, '');

// We update the policy before converting it to base64
const credentialObj = policy.conditions.find(condition => condition["x-amz-credential"]);
credentialObj["x-amz-credential"] = credentialObj["x-amz-credential"].replace(/{accessId}/, accessKeyId);
credentialObj["x-amz-credential"] = credentialObj["x-amz-credential"].replace(/{date}/, date);

const securityObj = policy.conditions.find(condition => condition["x-amz-security-token"]);
securityObj["x-amz-security-token"] = securityObj["x-amz-security-token"].replace(/{sessionToken}/, sessionToken);

const dateObj = policy.conditions.find(condition => condition["x-amz-date"]);
dateObj["x-amz-date"] = dateObj["x-amz-date"].replace(/{date}/, date);

// We create a base64 string from the policy
const stringToSign = btoa(JSON.stringify(policy));

console.log('This is the policy', policy, '\n');
console.log('This is the base64 policy: ', stringToSign);



