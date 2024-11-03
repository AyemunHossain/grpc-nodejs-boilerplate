const grpc = require('@grpc/grpc-js');

const validateRequest = (schema, requestData) => {
  const { error } = schema.validate(requestData.toObject(), { abortEarly: false });
  if (error) {
    const validationError = new Error(`Invalid request data: ${error.message}`);
    validationError.code = grpc.status.INVALID_ARGUMENT;
    throw validationError;
  }
};

module.exports = validateRequest;
