// Using CommonJS syntax for AWS/Netlify Lambda functions
const headers = {
	'Access-Control-Allow-Origin': process.env.URL || 'https://thomasgroch.xyz',
	'Access-Control-Allow-Methods': 'POST',
	'Access-Control-Allow-Headers': 'Content-Type'
}

exports.handler = async () => {
	return {
		statusCode: 200,
		headers,
		body: JSON.stringify({
			message: 'ok',
		}),
	}
}