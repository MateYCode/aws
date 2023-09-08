const policy = require('./policy.json');
const crypto = require('crypto');
const { AssumeRoleCommand, STSClient } = require('@aws-sdk/client-sts');

const region = "us-east-1";
const client = new STSClient({ region });

(async () => {

	try {
		const command = new AssumeRoleCommand({
			RoleArn: 'arn:aws:iam::123456789012:role/DelegatorRole',
			RoleSessionName: 'DelegatedSession',
			DurationSeconds: 900,
		});
		const response = await client.send(command)

		const accessKeyId = response.Credentials.AccessKeyId;
		const secretAccessKey = response.Credentials.SecretAccessKey;
		
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
		console.log('signature', signature);

	} catch (error) {
		console.error('Oops! Something went wrong.', error);
	}
})();
