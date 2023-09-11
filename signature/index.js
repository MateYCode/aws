const policy = require('./policy.json');
const crypto = require('crypto');
const { AssumeRoleCommand, STSClient } = require('@aws-sdk/client-sts');

const region = "us-west-2";
const client = new STSClient({ region });

function buildBase64Policy({ accessKeyId, date, sessionToken }) {
	if (!(accessKeyId && date && sessionToken)) throw new Error('Missing credentials');

	// We update the policy before converting it to base64
	const credentialObj = policy.conditions.find(condition => condition["x-amz-credential"]);
	credentialObj["x-amz-credential"] = credentialObj["x-amz-credential"].replace(/{accessId}/, accessKeyId);
	credentialObj["x-amz-credential"] = credentialObj["x-amz-credential"].replace(/{date}/, date);

	const securityObj = policy.conditions.find(condition => condition["x-amz-security-token"]);
	securityObj["x-amz-security-token"] = securityObj["x-amz-security-token"].replace(/{sessionToken}/, sessionToken);

	const dateObj = policy.conditions.find(condition => condition["x-amz-date"]);
	dateObj["x-amz-date"] = dateObj["x-amz-date"].replace(/{date}/, date);

	// We create a base64 string from the policy
	return btoa(JSON.stringify(policy));
}

module.exports.buildBase64Policy = buildBase64Policy;

(async () => {

	try {
		const command = new AssumeRoleCommand({
			RoleArn: process.env.AWSROLE,
			RoleSessionName: 'DelegatedSession',
			DurationSeconds: 1800,
		});
		const response = await client.send(command)

		const accessKeyId = response.Credentials.AccessKeyId;
		const secretAccessKey = response.Credentials.SecretAccessKey;
		const sessionToken = response.Credentials.SessionToken

		const today = new Date();
		const date = today.toISOString().split('T')[0].replace(/-/g, '');

		const stringToSign = buildBase64Policy({ accessKeyId, date, sessionToken });

		const service = 's3';
		const dateKey = crypto.createHmac('sha256', `AWS4${secretAccessKey}`).update(date).digest();
		const dateRegionKey = crypto.createHmac('sha256', dateKey).update(region).digest();
		const dateRegionServiceKey = crypto.createHmac('sha256', dateRegionKey).update(service).digest();
		const signingKey = crypto.createHmac('sha256', dateRegionServiceKey).update('aws4_request').digest();
		const signature = crypto.createHmac('sha256', signingKey).update(stringToSign).digest('hex');

		console.log('This is the accessKeyId: ', accessKeyId, '\n');
		console.log('This is the sessionToken', sessionToken);
		console.log('This is the signature', signature);

	} catch (error) {
		console.error('Oops! Something went wrong.', error);
	}
})();
