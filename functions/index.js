// Using ES module syntax as specified by "type": "module" in package.json
const headers = {
	'Access-Control-Allow-Origin': '*', // better change this for production
	'Access-Control-Allow-Methods': 'POST',
	'Access-Control-Allow-Headers': 'Content-Type'
}

export const handler = async () => {
	return {
		statusCode: 200,
		headers,
		body: JSON.stringify({
			message: 'ok',
		}),
	}
}