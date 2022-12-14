exports.handler = async function (event, context) {
  const value = process.env.LAMBDA_TASK_ROOT;

  return {
    statusCode: 200,
    body: JSON.stringify({ message: `Value of LAMBDA_TASK_ROOT is ${value}.` }),
  };
};
