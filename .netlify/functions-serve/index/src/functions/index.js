// functions/index.js
var headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST",
  "Access-Control-Allow-Headers": "Content-Type"
};
exports.handler = async (event, context) => {
  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      message: "ok"
    })
  };
};
//# sourceMappingURL=index.js.map
