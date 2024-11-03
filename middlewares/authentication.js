const jwt = require("jsonwebtoken");
const grpc = require("@grpc/grpc-js");

function authInterceptor(method) {
  return (call, callback) => {
    // Implement your authentication logic here
    let metadata;
    if (call.metadata) {
      metadata = call.metadata.get("authorization")[0];
    } else if (call.call && call.call.metadata) {
      metadata = call.call.metadata.get("authorization")[0];
    }

    metadata = metadata && metadata.split(" ");
    const token = metadata && metadata.length && metadata[1];

    if (!token) {
      return handleUnauthenticated(call, callback, "Authorization token missing");
    }

    let decodedToken;
    try {
      decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      // console.log({ error });
      return handleUnauthenticated(call, callback, "Token is invalid");
    }

    if (!decodedToken) {
      return handleUnauthenticated(call, callback, "Token is invalid");
    }
    call.user = decodedToken;

    // Call the original method
    if (callback) {
      method(call, callback);
    } else {
      method(call);
    }
  };
}

function handleUnauthenticated(call, callback, message) {
  if (callback) {
    return callback({
      code: grpc.status.UNAUTHENTICATED,
      message: message,
    });
  } else {
    call.emit('error', {
      code: grpc.status.UNAUTHENTICATED,
      message: message,
    });
    call.end();
  }
}

module.exports = authInterceptor;