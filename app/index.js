/*
 * Primary file for API
 *
 */

// Dependencies
var http = require("http");
var url = require("url");
var StringDecoder = require("string_decoder").StringDecoder;
var routers = require("./routers");
var notfound = require("./routers/404");
var config = require("./config");
var _data = require("../lib/data");

_data.read("test", "newFile", function(err, data) {
  console.log("this was the error ", err, "and this was the data ", data);
});

_data.create("test", "newFile", { fool: "bar" }, function(err) {
  console.log("this was the error", err);
});

// Configure the server to respond to all requests with a string
var server = http.createServer(function(req, res) {
  // Parse the url
  var parsedUrl = url.parse(req.url, true);

  // Get the path
  var path = parsedUrl.pathname;
  var trimmedPath = path.replace(/^\/+|\/+$/g, "");

  // Get the query string as an object
  var queryStringObject = parsedUrl.query;

  // Get the HTTP method
  var method = req.method.toLowerCase();

  //Get the headers as an object
  var headers = req.headers;

  // Get the payload,if any
  var decoder = new StringDecoder("utf-8");
  var buffer = "";
  req.on("data", function(data) {
    buffer += decoder.write(data);
  });
  req.on("end", function() {
    buffer += decoder.end();

    // Check the router for a matching path for a handler. If one is not found, use the notFound handler instead.
    var chosenHandler =
      typeof routers[trimmedPath] !== "undefined"
        ? routers[trimmedPath]
        : notfound;

    // Construct the data object to send to the handler
    var data = {
      trimmedPath: trimmedPath,
      queryStringObject: queryStringObject,
      method: method,
      headers: headers,
      payload: buffer
    };

    // Route the request to the handler specified in the router
    chosenHandler(data, function(statusCode, payload) {
      // Use the status code returned from the handler, or set the default status code to 200
      statusCode = typeof statusCode == "number" ? statusCode : 200;

      // Use the payload returned from the handler, or set the default payload to an empty object
      payload = typeof payload == "object" ? payload : {};

      // Convert the payload to a string
      // with specific format (https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify)
      var payloadString = JSON.stringify(payload, null, "\t");

      // Return the response
      res.setHeader("Content-Type", "application/json");
      res.writeHead(statusCode);
      res.end(payloadString);
      console.log("Returning this response: ", statusCode, payloadString);
    });
  });
});

// Start the server
server.listen(config.port, function() {
  console.log(
    "The server is up and running on port " +
      config.port +
      " in " +
      config.envName +
      " mode."
  );
});
