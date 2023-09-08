const policy = require('./policy.json');
const crypto = require('crypto');
const { AssumeRoleCommand, STSClient } = require('@aws-sdk/client-sts');

const region = "us-east-1";
const client = new STSClient({ region });

(async () => {

	try {
		// When you create a role, you create two policies: a role trust policy that specifies who can assume the role, and a permissions policy that specifies what can be done with the role. You specify the trusted principal that is allowed to assume the role in the role trust policy.
		// To allow a user to assume a role in the same account, you can do either of the following:
		// Attach a policy to the user that allows the user to call AssumeRole (as long as the role's trust policy trusts the account).
		//Add the user as a principal directly in the role's trust policy.
		// You can do either because the role’s trust policy acts as an IAM resource-based policy
		// https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/sts/command/AssumeRoleCommand/
		const command = new AssumeRoleCommand({
			RoleArn: 'arn:aws:iam::123456789012:role/DelegatorRole', // The Amazon Resource Name (ARN) of the role to assume.
			RoleSessionName: 'DelegatedSession', // An identifier for the assumed role session. Can be any string as far as it's unique
			DurationSeconds: 900,
		});
		const response = await client.send(command)

		const accessKeyId = response.Credentials.AccessKeyId;
		const secretAccessKey = response.Credentials.SecretAccessKey;
		const stringToSign = btoa(JSON.stringify(policy));

		// const AWSAccessKeyId = 'AKIAIOSFODNN7EXAMPLE';// este se pasa como parte de la policy
		// const AWSSecretKey = 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY';
		// const AWSStringToSignExample = 'eyAiZXhwaXJhdGlvbiI6ICIyMDE1LTEyLTMwVDEyOjAwOjAwLjAwMFoiLA0KICAiY29uZGl0aW9ucyI6IFsNCiAgICB7ImJ1Y2tldCI6ICJzaWd2NGV4YW1wbGVidWNrZXQifSwNCiAgICBbInN0YXJ0cy13aXRoIiwgIiRrZXkiLCAidXNlci91c2VyMS8iXSwNCiAgICB7ImFjbCI6ICJwdWJsaWMtcmVhZCJ9LA0KICAgIHsic3VjY2Vzc19hY3Rpb25fcmVkaXJlY3QiOiAiaHR0cDovL3NpZ3Y0ZXhhbXBsZWJ1Y2tldC5zMy5hbWF6b25hd3MuY29tL3N1Y2Nlc3NmdWxfdXBsb2FkLmh0bWwifSwNCiAgICBbInN0YXJ0cy13aXRoIiwgIiRDb250ZW50LVR5cGUiLCAiaW1hZ2UvIl0sDQogICAgeyJ4LWFtei1tZXRhLXV1aWQiOiAiMTQzNjUxMjM2NTEyNzQifSwNCiAgICB7IngtYW16LXNlcnZlci1zaWRlLWVuY3J5cHRpb24iOiAiQUVTMjU2In0sDQogICAgWyJzdGFydHMtd2l0aCIsICIkeC1hbXotbWV0YS10YWciLCAiIl0sDQoNCiAgICB7IngtYW16LWNyZWRlbnRpYWwiOiAiQUtJQUlPU0ZPRE5ON0VYQU1QTEUvMjAxNTEyMjkvdXMtZWFzdC0xL3MzL2F3czRfcmVxdWVzdCJ9LA0KICAgIHsieC1hbXotYWxnb3JpdGhtIjogIkFXUzQtSE1BQy1TSEEyNTYifSwNCiAgICB7IngtYW16LWRhdGUiOiAiMjAxNTEyMjlUMDAwMDAwWiIgfQ0KICBdDQp9'
		// const AWSSignature = '8afdbf4008c03f22c2cd3cdb72e4afbb1f6a588f3255ac628749a66d7f09699e'

		const date = '20151229';
		const service = 's3';
		const dateKey = crypto.createHmac('sha256', `AWS4${secretAccessKey}`).update(date).digest();
		const dateRegionKey = crypto.createHmac('sha256', dateKey).update(region).digest();
		const dateRegionServiceKey = crypto.createHmac('sha256', dateRegionKey).update(service).digest();
		const signingKey = crypto.createHmac('sha256', dateRegionServiceKey).update('aws4_request').digest();
		const signature = crypto.createHmac('sha256', signingKey).update(stringToSign).digest('hex');
		console.log('signature', signature);
		// console.log('signature matches aws example', signature === AWSSignature);

	} catch (error) {
		console.error('Oops! Something went wrong.', error);
	}
})();
