const grpc = require('@grpc/grpc-js');
const { priceUpdates } = require('../services/product.service'); // Adjust the path as needed
const productModel = require('../models/product'); // Adjust the path as needed
const productProtoModel = require('../protos/product_pb'); // Adjust the path as needed
const productValidation = require('../utils/product.validation'); // Adjust the path as needed

jest.mock('../models/product');
jest.mock('../protos/product_pb');
jest.mock('../utils/product.validation');

describe('priceUpdates', () => {
  let call, request, responseSpy, writeSpy,emmitSpy, endSpy, errorSpy, dataSpy, endCallbackSpy;;

  beforeEach(() => {
    writeSpy = jest.fn();
    endSpy = jest.fn();
    errorSpy = jest.fn();
    dataSpy = jest.fn();
    endCallbackSpy = jest.fn();
    emmitSpy = jest.fn();

    call = {
      write: writeSpy,
      end: endSpy,
      on: jest.fn((event, callback) => {
        if (event === 'data') {
          call.dataCallback = callback;
        } else if (event === 'end') {
          call.endCallback = callback;
        } else if (event === 'error') {
          call.errorCallback = callback;
        }
      }),
      emit: emmitSpy,
      errorCallback: errorSpy,
      endCallback: endCallbackSpy,
      dataCallback: dataSpy,
    };

    callback = jest.fn();

    request = {
      getId: jest.fn().mockReturnValue('1'),
      getNewprice: jest.fn().mockReturnValue(99.99),
    };

    responseSpy = {
      setId: jest.fn(),
      setUpdatedprice: jest.fn(),
    };

    productProtoModel.PriceUpdateResponse = jest.fn().mockImplementation(() => responseSpy);
    productValidation.updatePriceRequestSchema = jest.fn();
    productModel.setPrice = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should update the price and send a response', async () => {
    productValidation.updatePriceRequestSchema.mockReturnValue(true);
    productModel.setPrice.mockResolvedValue({ id: '1', price: 99.99 });

    await priceUpdates(call);

    call.dataCallback(request);

    // Validate interactions
    expect(productValidation.updatePriceRequestSchema).toHaveBeenCalledWith(request);
    expect(productModel.setPrice).toHaveBeenCalledWith('1', 99.99);

    // Verify the response structure
    expect(responseSpy.setId).toHaveBeenCalledWith('1');
    expect(responseSpy.setUpdatedprice).toHaveBeenCalledWith(99.99);

    // Ensure response is sent through the call
    expect(writeSpy).toHaveBeenCalledWith(responseSpy);
  });

  it('should handle errors during price update', async () => {
    productValidation.updatePriceRequestSchema.mockReturnValue(true);
    productModel.setPrice.mockRejectedValue(new Error('Database error'));

    await priceUpdates(call);

    call.dataCallback(request);

    // Validate interactions
    expect(productValidation.updatePriceRequestSchema).toHaveBeenCalledWith(request);
    expect(productModel.setPrice).toHaveBeenCalledWith('1', 99.99);

    // Ensure error response is sent
    expect(writeSpy).toHaveBeenCalledWith({
      code: grpc.status.INTERNAL,
      details: 'Internal server error',
    });
  });

  it('should end the stream when client ends streaming', async () => {
    await priceUpdates(call);

    call.endCallback();

    // Ensure the stream is closed
    expect(endSpy).toHaveBeenCalled();
  });

  it('should handle stream errors', async () => {
    await priceUpdates(call);

    call.errorCallback(new Error('Stream error'));

    // Ensure the stream is closed
    expect(endSpy).toHaveBeenCalled();
  });
});
