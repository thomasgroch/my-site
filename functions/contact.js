const path = require('path');
const moment = require('moment');
const { URLSearchParams } = require('url');
// Commented out unused imports
// const formData = require('form-data');
const handlebars = require('handlebars');
const nodemailer = require('nodemailer');
const mg = require('nodemailer-mailgun-transport');
// Ensure URLSearchParams is available in Node.js environment
const {
  MAILGUN_API_KEY: api_key,
  MAILGUN_DOMAIN: domain
} = process.env;
const options = {
  auth: {
    api_key,
    domain
  },
  // host: 'api.eu.mailgun.net' // e.g. for EU region
}
const transporter = nodemailer.createTransport(mg(options))

const headers = {
	'Access-Control-Allow-Origin': '*', // better change this for production
	'Access-Control-Allow-Methods': 'POST',
	'Access-Control-Allow-Headers': 'Content-Type'
}

exports.handler = async (event) => {
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
	} catch {
		// The parse function was not defined, so we're using a simpler fallback
		// This assumes the body is URL-encoded form data
		payload = Object.fromEntries(new URLSearchParams(event.body))
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
		// FaunaDB storage removed to avoid rate limiting

    const sendingMail = await transporter.sendMail({
      from: process.env.MAILGUN_SENDER || 'contato@thomasgroch.xyz',
      to: process.env.MAILGUN_SENDER || 'contato@thomasgroch.xyz',
      subject: `🗈️ Novo contato. ${payload.nome}, do site thomasgroch.xyz as ${new Date().toDateString()}.`,
      template: {
        name:  path.resolve('./functions/emails/base/sending.hbs'),
        engine: 'handlebars',
        context: payload
      }
    })
    const thanksMail = await transporter.sendMail({
      from: process.env.MAILGUN_FROM || 'Thomas Groch <contato@thomasgroch.xyz>',
      to: payload.email,
      subject: `☺ Olá ${payload.nome}. Thomas aqui, Obrigada pelo seu interesse.`,
      template: {
        name:  path.resolve('./functions/emails/base/thanks.hbs'),
        engine: 'handlebars',
        context: payload
      }
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
