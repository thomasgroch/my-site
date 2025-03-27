const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json'
};

exports.handler = async (event, context) => {
  // Handle OPTIONS request (CORS preflight)
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  // only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({
        error: 'Method not allowed. Only POST requests are accepted.',
      }),
    };
  }

  try {
    // parse the body to JSON
    let payload = {};
    try {
      payload = JSON.parse(event.body);
    } catch (e) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: 'Invalid JSON in request body',
        }),
      };
    }

    // validate the form
    const requiredFields = ['nome', 'email', 'telefone', 'estado', 'cidade', 'mensagem'];
    const missingFields = requiredFields.filter(field => !payload[field]);

    if (missingFields.length > 0) {
      return {
        statusCode: 422,
        headers,
        body: JSON.stringify({
          error: 'Required information is missing.',
          missingFields,
        }),
      };
    }

    // Mock successful response for testing
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        message: 'Message sent successfully!',
        success: true
      }),
    };
  } catch (error) {
    console.error('Function error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Internal server error',
      }),
    };
  }
};

