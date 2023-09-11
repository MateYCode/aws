const policy = require('./policy.json');
const crypto = require('crypto');

const region = "us-west-2";

const accessKeyId = '1'
const secretAccessKey = '2' 
const sessionToken = '3'

// We update the x-amz-credential in the policy, passing the current access id 
const credentialObj = policy.conditions.find(condition => condition["x-amz-credential"]);
credentialObj["x-amz-credential"] = credentialObj["x-amz-credential"].replace(/{accessId}/, accessKeyId);

// We create a base64 string from the policy
const stringToSign = btoa(JSON.stringify(policy));

const date = '20230908';
const service = 's3';
const dateKey = crypto.createHmac('sha256', `AWS4${secretAccessKey}`).update(date).digest();
const dateRegionKey = crypto.createHmac('sha256', dateKey).update(region).digest();
const dateRegionServiceKey = crypto.createHmac('sha256', dateRegionKey).update(service).digest();
const signingKey = crypto.createHmac('sha256', dateRegionServiceKey).update('aws4_request').digest();
const signature = crypto.createHmac('sha256', signingKey).update(stringToSign).digest('hex');

console.log('This is the accessKeyId: ', accessKeyId, '\n');
console.log('This is the sessionToken', sessionToken);
console.log('This is the signature', signature);


