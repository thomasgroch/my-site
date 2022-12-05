import {parse} from 'querystring'

const faunadb = require('faunadb')
const moment = require('moment')
const formData = require('form-data');
const Mailgun = require('mailgun.js');
const mailgun = new Mailgun(formData);
const q = faunadb.query
const client = new faunadb.Client({
	secret: process.env.FAUNADB_SERVER_SECRET
})
const {MAILGUN_API_KEY: apiKey, MAILGUN_DOMAIN: domain} = process.env
// const mailgun = Mailgun({
// 	apiKey,
// 	domain,
// 	retry: 3
// })

const headers = {
	'Access-Control-Allow-Origin': '*', // better change this for production
	'Access-Control-Allow-Methods': 'POST',
	'Access-Control-Allow-Headers': 'Content-Type'
}
//
// const sendEmail = data => {
// 	const {from, to, subject, text} = data
// 	const email = {from, to, subject, text}
//
// 	return mailgun.messages().send(email)
// }


// const sendEmail = async data => {
//   const {from, to, subject, text} = data
//   const email = {from, to, subject, text}
//
//   const mailgun = new Mailgun(data);
//   const mg = mailgun.client({
//     username: 'api',
//     key: process.env.MAILGUN_API_KEY,
//     public_key: process.env.MAILGUN_API_PUBLIC_KEY,
//   });
//   const msg = await mg.messages.send(domain, data)
//   console.log('msg', msg);
//   return msg
//   // return mailgun.messages().send(email)
// }

exports.handler = async (event, context) => {
	// only allow POST requests
	if (event.httpMethod !== 'POST') {
		return {
			statusCode: 410,
			headers,
			body: JSON.stringify({
				error: 'Only POST requests allowed.',
			}),
		}
	}

	// parse the body to JSON so we can use it in JS
	let payload = {}
	// console.log(event)
	try {
		payload = JSON.parse(event.body)
	} catch (e) {
		payload = parse(event.body)
	}

	// validate the form
	if (
		!payload.nome ||
		!payload.email ||
		!payload.telefone ||
		!payload.estado ||
		!payload.cidade ||
		!payload.mensagem
	) {
		return {
			statusCode: 422,
			headers,
			body: JSON.stringify({
				error: 'Required information is missing.',
			}),
		}
	}

	// code
	try {
		const dbResponse = await client.query(q.Create(q.Ref('classes/contacts'), {
			data: {
				...payload,
				createdAt: moment().format()
			}
		}))

    const {
      MAILGUN_API_KEY: key,
      MAILGUN_DOMAIN: domain,
      MAILGUN_API_PUBLIC_KEY: public_key
    } = process.env;

		const payloadMail = {
			from: process.env.MAILGUN_FROM || 'Thomas Groch <contato@thomasgroch.com>',
			to: payload.email,
			subject: 'Obrigado pelo seu interesse ' + payload.nome + '.',
			text: 'Retorno para você o mais cedo possível!'
		}
    const mg = mailgun.client({
      username: 'api',
      key,
      public_key
    });
    const msg = await mg.messages.create(domain, payloadMail)
    console.log('msg', msg);

		// const result = await sendEmail(payloadMail)
		// if (!result || !result.message) {
		// 	throw new Error( (result.message) ? result.message : result )
		// }

	} catch (error) {
    console.log(error)
		return {
			statusCode: 500,
			headers,
			body: JSON.stringify({
				error
			}),
		}
	}

	// Do redirect for JS disabled browsers
	if (event.headers['content-type'] === 'application/x-www-form-urlencoded') {
		return {
			statusCode: 302,
			headers: {
				Location: '/thanks.html',
				'Cache-Control': 'no-cache',
			},
			body: JSON.stringify({})
		}
	}

	// return data to AJAX request
	return {
		statusCode: 200,
		headers,
		body: JSON.stringify({
			message: 'Message sent successfully!',
		}),
	}
}
