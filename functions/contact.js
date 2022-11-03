// import {parse} from 'querystring'
// import fs from 'fs'

// const faunadb = require('faunadb')
// const moment = require('moment')
const Mailgun = require('mailgun-js')
// const q = faunadb.query
// const client = new faunadb.Client({
// 	secret: process.env.FAUNADB_SERVER_SECRET
// })
const {MAILGUN_API_KEY: apiKey, MAILGUN_DOMAIN: domain} = process.env
const mailgun = Mailgun({
	apiKey,
	domain,
	retry: 3
})

const headers = {
	'Access-Control-Allow-Origin': '*', // better change this for production
	'Access-Control-Allow-Methods': 'POST',
	'Access-Control-Allow-Headers': 'Content-Type'
}

const sendEmail = data => {
	const {from, to, subject, html, text} = data
	const email = {from, to, subject, text, html}

	return mailgun.messages().send(email)
}

exports.handler = async (event/*, context*/) => {
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
		// const dbResponse = await client.query(q.Create(q.Ref('classes/contacts'), {
		// 	data: {
		// 		...payload,
		// 		createdAt: moment().format()
		// 	}
		// }))

		const data = `
		<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
		<html style="width:100%;font-family:'open sans', 'helvetica neue', helvetica, arial, sans-serif;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;padding:0;Margin:0;">
		 <head>
		  <meta charset="UTF-8">
		  <meta content="width=device-width, initial-scale=1" name="viewport">
		  <meta name="x-apple-disable-message-reformatting">
		  <meta http-equiv="X-UA-Compatible" content="IE=edge">
		  <meta content="telephone=no" name="format-detection">
		  <title>New Template</title>
		  <!--[if (mso 16)]>
			<style type="text/css">
			a {text-decoration: none;}
			</style>
			<![endif]-->
		  <!--[if gte mso 9]><style>sup { font-size: 100% !important; }</style><![endif]-->
		  <!--[if !mso]><!-- -->
		  <link href="https://fonts.googleapis.com/css?family=Open+Sans:400,400i,700,700i" rel="stylesheet">
		  <!--<![endif]-->
		  <style type="text/css">
		@media only screen and (max-width:600px) {p, ul li, ol li, a { font-size:16px!important; line-height:150%!important } h1 { font-size:30px!important; text-align:center; line-height:120%!important } h2 { font-size:26px!important; text-align:center; line-height:120%!important } h3 { font-size:20px!important; text-align:center; line-height:120%!important } h1 a { font-size:30px!important } h2 a { font-size:26px!important } h3 a { font-size:20px!important } .es-menu td a { font-size:16px!important } .es-header-body p, .es-header-body ul li, .es-header-body ol li, .es-header-body a { font-size:16px!important } .es-footer-body p, .es-footer-body ul li, .es-footer-body ol li, .es-footer-body a { font-size:16px!important } .es-infoblock p, .es-infoblock ul li, .es-infoblock ol li, .es-infoblock a { font-size:12px!important } *[class="gmail-fix"] { display:none!important } .es-m-txt-c, .es-m-txt-c h1, .es-m-txt-c h2, .es-m-txt-c h3 { text-align:center!important } .es-m-txt-r, .es-m-txt-r h1, .es-m-txt-r h2, .es-m-txt-r h3 { text-align:right!important } .es-m-txt-l, .es-m-txt-l h1, .es-m-txt-l h2, .es-m-txt-l h3 { text-align:left!important } .es-m-txt-r img, .es-m-txt-c img, .es-m-txt-l img { display:inline!important } .es-button-border { display:inline-block!important } a.es-button { font-size:20px!important; display:inline-block!important; border-width:15px 25px 15px 25px!important } .es-btn-fw { border-width:10px 0px!important; text-align:center!important } .es-adaptive table, .es-btn-fw, .es-btn-fw-brdr, .es-left, .es-right { width:100%!important } .es-content table, .es-header table, .es-footer table, .es-content, .es-footer, .es-header { width:100%!important; max-width:600px!important } .es-adapt-td { display:block!important; width:100%!important } .adapt-img { width:100%!important; height:auto!important } .es-m-p0 { padding:0px!important } .es-m-p0r { padding-right:0px!important } .es-m-p0l { padding-left:0px!important } .es-m-p0t { padding-top:0px!important } .es-m-p0b { padding-bottom:0!important } .es-m-p20b { padding-bottom:20px!important } .es-mobile-hidden, .es-hidden { display:none!important } .es-desk-hidden { display:table-row!important; width:auto!important; overflow:visible!important; float:none!important; max-height:inherit!important; line-height:inherit!important } .es-desk-menu-hidden { display:table-cell!important } table.es-table-not-adapt, .esd-block-html table { width:auto!important } table.es-social { display:inline-block!important } table.es-social td { display:inline-block!important } }
		.rollover:hover .rollover-first {
		  max-height:0px!important;
		  display:none!important;
		}
		.rollover:hover .rollover-second {
		  max-height:none!important;
		  display:block!important;
		}
		#outlook a {
		  padding:0;
		}
		.ExternalClass {
		  width:100%;
		}
		.ExternalClass,
		.ExternalClass p,
		.ExternalClass span,
		.ExternalClass font,
		.ExternalClass td,
		.ExternalClass div {
		  line-height:100%;
		}
		.es-button {
		  mso-style-priority:100!important;
		  text-decoration:none!important;
		}
		a[x-apple-data-detectors] {
		  color:inherit!important;
		  text-decoration:none!important;
		  font-size:inherit!important;
		  font-family:inherit!important;
		  font-weight:inherit!important;
		  line-height:inherit!important;
		}
		.es-desk-hidden {
		  display:none;
		  float:left;
		  overflow:hidden;
		  width:0;
		  max-height:0;
		  line-height:0;
		  mso-hide:all;
		}
		</style>
		 </head>
		 <body style="width:100%;font-family:'open sans', 'helvetica neue', helvetica, arial, sans-serif;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;padding:0;Margin:0;">
		  <div class="es-wrapper-color" style="background-color:#F6F6F6;">
		   <!--[if gte mso 9]>
			  <v:background xmlns:v="urn:schemas-microsoft-com:vml" fill="t">
				<v:fill type="tile" color="#f6f6f6"></v:fill>
			  </v:background>
			<![endif]-->
		   <table class="es-wrapper" width="100%" cellspacing="0" cellpadding="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;padding:0;Margin:0;width:100%;height:100%;background-repeat:repeat;background-position:center top;">
			 <tr style="border-collapse:collapse;">
			  <td valign="top" style="padding:0;Margin:0;">
			   <table class="es-content" cellspacing="0" cellpadding="0" align="center" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%;">
				 <tr style="border-collapse:collapse;"></tr>
				 <tr style="border-collapse:collapse;">
				  <td align="center" style="padding:0;Margin:0;">
				   <table class="es-content-body" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:transparent;" width="640" cellspacing="0" cellpadding="0" align="center">
					 <tr style="border-collapse:collapse;">
					  <td align="left" style="Margin:0;padding-top:15px;padding-bottom:15px;padding-left:20px;padding-right:20px;">
					   <!--[if mso]><table width="600" cellpadding="0" cellspacing="0"><tr><td width="290" valign="top"><![endif]-->
					   <!--[if mso]></td></tr></table><![endif]--></td>
					 </tr>
				   </table></td>
				 </tr>
			   </table>
			   <table class="es-header" cellspacing="0" cellpadding="0" align="center" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%;background-color:transparent;background-repeat:repeat;background-position:center top;">
				 <tr style="border-collapse:collapse;">
				  <td style="padding:0;Margin:0;background-image:url(https://pixabay.com/get/57e0d14b4d50ae14ea898175cf2e3e7a1722dfe05554764a712b79dc_640.jpg);background-position:center top;background-repeat:no-repeat;background-size:cover;background-color:#ED8936;" bgcolor="#ed8936" align="center" background="https://pixabay.com/get/57e0d14b4d50ae14ea898175cf2e3e7a1722dfe05554764a712b79dc_640.jpg">
				   <table class="es-header-body" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:transparent;" width="640" cellspacing="0" cellpadding="0" align="center">
					 <tr style="border-collapse:collapse;">
					  <td align="left" style="padding:0;Margin:0;padding-top:10px;padding-left:20px;padding-right:20px;">
					   <table width="100%" cellspacing="0" cellpadding="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;">
						 <tr style="border-collapse:collapse;">
						  <td width="600" valign="top" align="center" style="padding:0;Margin:0;">
						   <table width="100%" cellspacing="0" cellpadding="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-position:center top;">
							 <tr style="border-collapse:collapse;">
							  <td align="center" style="padding:0;Margin:0;display:none;"></td>
							 </tr>
						   </table></td>
						 </tr>
					   </table></td>
					 </tr>
				   </table></td>
				 </tr>
			   </table>
			   <table class="es-content" cellspacing="0" cellpadding="0" align="center" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%;">
				 <tr style="border-collapse:collapse;">
				  <td align="center" style="padding:0;Margin:0;">
				   <table class="es-content-body" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:transparent;" width="640" cellspacing="0" cellpadding="0" align="center">
					 <tr style="border-collapse:collapse;">
					  <td align="left" style="padding:0;Margin:0;padding-left:20px;padding-right:20px;">
					   <table width="100%" cellspacing="0" cellpadding="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;">
						 <tr style="border-collapse:collapse;">
						  <td width="600" valign="top" align="center" style="padding:0;Margin:0;">
						   <table style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:separate;border-spacing:0px;border-radius:3px;background-color:#FFFFFF;" width="100%" cellspacing="0" cellpadding="0" bgcolor="#ffffff">
							 <tr style="border-collapse:collapse;">
							  <td align="center" style="Margin:0;padding-bottom:5px;padding-left:20px;padding-right:20px;padding-top:25px;"><h2 style="Margin:0;line-height:34px;mso-line-height-rule:exactly;font-family:'open sans', 'helvetica neue', helvetica, arial, sans-serif;font-size:28px;font-style:normal;font-weight:bold;color:#444444;">Oi ${payload.nome},<br></h2></td>
							 </tr>
							 <tr style="border-collapse:collapse;">
							  <td align="center" style="Margin:0;padding-top:10px;padding-bottom:15px;padding-left:20px;padding-right:20px;"><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-size:16px;font-family:'open sans', 'helvetica neue', helvetica, arial, sans-serif;line-height:24px;color:#999999;">
							  <span class="product-description">
								  <p>Já recebi sua mensagem, em breve entrarei em contato com um feedback.</p>
								  <p>=]</p>
								  <p>Att,</p>
								  <p><i>Thomas Groch</i></p>
							  </span></p></td>


						   </table></td>
						 </tr>
					   </table></td>
					 </tr>
				   </table></td>
				 </tr>
			   </table>
			   <table class="es-content" cellspacing="0" cellpadding="0" align="center" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%;">
				 <tr style="border-collapse:collapse;">
				  <td align="center" style="padding:0;Margin:0;">
				   <table class="es-content-body" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:#F6F6F6;" width="640" cellspacing="0" cellpadding="0" bgcolor="#f6f6f6" align="center">
					 <tr style="border-collapse:collapse;">
					  <td align="left" style="padding:0;Margin:0;padding-top:10px;padding-left:20px;padding-right:20px;">
					   <table width="100%" cellspacing="0" cellpadding="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;">
						 <tr style="border-collapse:collapse;">
						  <td width="600" valign="top" align="center" style="padding:0;Margin:0;">
						   <table width="100%" cellspacing="0" cellpadding="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;">
							 <tr style="border-collapse:collapse;">
							  <td align="center" style="padding:0;Margin:0;padding-top:10px;padding-bottom:10px;">
							   <table width="100%" height="100%" cellspacing="0" cellpadding="0" border="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;">
								 <tr style="border-collapse:collapse;">
								  <td style="padding:0;Margin:0px;border-bottom:1px solid #F6F6F6;background:rgba(0, 0, 0, 0) none repeat scroll 0% 0%;height:1px;width:100%;margin:0px;"></td>
								 </tr>
							   </table></td>
							 </tr>
						   </table></td>
						 </tr>
					   </table></td>
					 </tr>
				   </table></td>
				 </tr>
			   </table>
			   <table class="es-footer" cellspacing="0" cellpadding="0" align="center" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%;background-color:transparent;background-repeat:repeat;background-position:center top;">
				 <tr style="border-collapse:collapse;">
				  <td align="center" style="padding:0;Margin:0;">
				   <table class="es-footer-body" width="640" cellspacing="0" cellpadding="0" align="center" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:#F6F6F6;">
					 <tr style="border-collapse:collapse;">
					  <td align="left" style="Margin:0;padding-left:20px;padding-right:20px;padding-top:40px;padding-bottom:40px;">
					   <table width="100%" cellspacing="0" cellpadding="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;">
						 <tr style="border-collapse:collapse;">
						  <td width="600" valign="top" align="center" style="padding:0;Margin:0;">
						   <table width="100%" cellspacing="0" cellpadding="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;">
							 <tr style="border-collapse:collapse;">
							  <td align="center" style="padding:0;Margin:0;padding-top:15px;padding-bottom:15px;"><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-size:14px;font-family:'open sans', 'helvetica neue', helvetica, arial, sans-serif;line-height:21px;color:#999999;">camilarody.xyz&nbsp;</p></td>
							 </tr>
						   </table></td>
						 </tr>
					   </table></td>
					 </tr>
				   </table></td>
				 </tr>
			   </table></td>
			 </tr>
		   </table>
		  </div>
		 </body>
		</html>`

		const result = await sendEmail({
			from: process.env.MAILGUN_FROM || 'Thomas Groch <camilasrody@gmail.com>',
			to: `${payload.nome} <${payload.email}>`,
			subject: `☺ Olá ${payload.nome}. Camila aqui, Obrigada pelo seu interesse.`,
			html: data
		})

		const result2 = await sendEmail({
			from: 'Thomas Groch <contato@mg.camilarody.xyz>',
			to: process.env.MAILGUN_FROM || 'Thomas Groch <camilasrody@gmail.com>',
			subject: `☺️ Você tem um novo interessado: ${payload.nome}.`,
			html: `nome: ${payload.nome}<br>
				   email: ${payload.email}<br>
				   telefone: ${payload.telefone}<br>
				   estado: ${payload.estado}<br>
				   cidade: ${payload.cidade}<br>
				   mensagem: ${payload.mensagem}`
		})

		if (!result || !result.message) {
			throw new Error( (result.message) ? result.message : result )
		}
		if (!result2 || !result2.message) {
			throw new Error( (result2.message) ? result2.message : result2 )
		}

	} catch (error) {
		console.log(error)
		return {
			statusCode: 500,
			headers,
			body: JSON.stringify(error),
		}
	}

	// Do redirect for JS disabled browsers
	if (event.headers['content-type'] === 'application/x-www-form-urlencoded') {
		return {
			statusCode: 302,
			headers: {
				Location: '/thanks',
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
