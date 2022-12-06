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
const {
  MAILGUN_API_KEY: key,
  MAILGUN_DOMAIN: domain,
  MAILGUN_API_PUBLIC_KEY: public_key
} = process.env;
const mg = mailgun.client({
  username: 'api',
  key,
  public_key
});

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

    const sendingMail = await mg.messages.create(domain, {
      from: process.env.MAILGUN_SENDER || 'contato@thomasgroch.xyz',
      to: process.env.MAILGUN_SENDER || 'contato@thomasgroch.xyz',
      subject: `☺️ Você tem um novo interessado: ${payload.nome}.`,
      html: `nome: ${payload.nome}<br>
				   email: ${payload.email}<br>
				   telefone: ${payload.telefone}<br>
				   estado: ${payload.estado}<br>
				   cidade: ${payload.cidade}<br>
				   mensagem: ${payload.mensagem}`
    })
    const thanksMail = await mg.messages.create(domain, {
      from: process.env.MAILGUN_FROM || 'Thomas Groch <contato@thomasgroch.xyz>',
      to: payload.email,
      subject: `☺ Olá ${payload.nome}. Thomas aqui, Obrigada pelo seu interesse.`,
      text: 'Retorno para você o mais cedo possível!'
    })

		if (!sendingMail || sendingMail.status != 200) {
			throw new Error( (sendingMail.details) ? sendingMail.details : sendingMail )
		}
    if (!thanksMail || thanksMail.status != 200) {
      throw new Error( (thanksMail.details) ? thanksMail.details : thanksMail )
    }

	} catch (error) {
    console.error(error)
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
