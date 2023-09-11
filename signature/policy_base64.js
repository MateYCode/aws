const policy = require('./policy.json');
const crypto = require('crypto');

const accessKeyId = '{accessKeyId}'

// We update the x-amz-credential in the policy, passing the current access id 
const credentialObj = policy.conditions.find(condition => condition["x-amz-credential"]);
credentialObj["x-amz-credential"] = credentialObj["x-amz-credential"].replace(/{accessId}/, accessKeyId);

// We create a base64 string from the policy
const stringToSign = btoa(JSON.stringify(policy));


console.log('This is the policy', policy);
console.log('This is the base64 policy: ', stringToSign, '\n');



