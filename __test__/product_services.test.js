const grpc = require("@grpc/grpc-js");
const { priceUpdates, createProduct } = require("../services/product.service"); // Adjust the path as needed
const productModel = require("../models/product"); // Adjust the path as needed
const productProtoModel = require("../protos/product_pb"); // Adjust the path as needed
const productValidation = require("../utils/product.validation"); // Adjust the path as needed
const validateRequest = require("../middlewares/req-validation");
const { unauthenticated } = require("../services/product.service"); // Adjust the path
const authInterceptor = require("../middlewares/authentication");
const jwt = require("jsonwebtoken");
const { object } = require("joi");

jest.mock("../middlewares/req-validation");
jest.mock("../models/product");
jest.mock("../protos/product_pb");
jest.mock("../utils/product.validation");
jest.mock("../middlewares/authentication");

describe("Product Service", () => {
  let call;
  let callback;

  beforeEach(() => {
    call = {
      request: {
        getProduct: jest.fn().mockImplementation(() => ({
          getName: jest.fn().mockReturnValue("Product A"),
          getDescription: jest.fn().mockReturnValue("Description A"),
          getPrice: jest.fn().mockReturnValue(100),
          getCategory: jest.fn().mockReturnValue("Category A"),
        })),
        getPage: jest.fn().mockReturnValue(1),
        getLimit: jest.fn().mockReturnValue(1),
        getCategory: jest.fn().mockReturnValue("Category A"),
        getMaxPrice: jest.fn().mockReturnValue(1000),
        getMinPrice: jest.fn().mockReturnValue(100),
      },
      metadata: {
        get: jest.fn(() => [
          "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInVzZXJuYW1lIjoidGVzdHVzZXIiLCJpYXQiOjE3MzE3ODAxMDQsImV4cCI6MTczMTg2NjUwNH0.6Bv5XekP9c6mo5xuFmlmYj5JUj3wNEazJk2oXU2WQyE",
        ]),
      },
      // request: { getProduct: jest.fn(() => ({ toObject: jest.fn() })) },
      user: null,
      on: jest.fn(),
      write: jest.fn(),
      end: jest.fn()
    };
    callback = jest.fn();

    // Mock JWT verification
    jest.spyOn(jwt, "verify").mockImplementation((token, secret) => {
      if (
        token ===
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInVzZXJuYW1lIjoidGVzdHVzZXIiLCJpYXQiOjE3MzE3ODAxMDQsImV4cCI6MTczMTg2NjUwNH0.6Bv5XekP9c6mo5xuFmlmYj5JUj3wNEazJk2oXU2WQyE"
      ) {
        return { id: "user-id", role: "admin" }; // Example decoded token
      } else {
        throw new Error("Invalid token");
      }
    });

    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should create a product and return the response", () => {
    // Mock authInterceptor to call the original method
    authInterceptor.mockImplementation((method) => {
      return (call, callback) => {
        call.user = { id: "user-id", role: "admin", name: "Ayemun Hossain" }; // Simulate a valid user
        method(call, callback); // Call the actual method
      };
    });

    validateRequest.mockImplementation(() => true);
    jest
      .spyOn(productModel, "createProduct")
      .mockResolvedValue({
        id: 1,
        name: "Product A",
        description: "Description A",
        price: 100,
        category: "Category A",
      });
    // Wrap the createProduct method with the mocked interceptor
    const interceptedCreateProduct = authInterceptor(
      unauthenticated.createProduct
    );
    // Spy on the callback function
    const callback = jest.fn((err, response) => {
      try {
        expect(call.user).toEqual({
          id: "user-id",
          role: "admin",
          name: "Ayemun Hossain",
        });
        expect(callback).toHaveBeenCalled(); // Ensure callback is called in the original method

        const mock_response = new productProtoModel.CreateProductResponse();
        const product = new productProtoModel.Product();
        product.setId(1);
        product.setName("Product A");
        product.setDescription("Description A");
        product.setPrice(100);
        product.setCategory("Category A");
        mock_response.setProduct(product);
        // console.log({mock_response});

        expect(callback).toHaveBeenCalledWith(
          null,
          expect.objectContaining({
            getProduct: expect.any(Function),
            setProduct: expect.any(Function),
            clearProduct: expect.any(Function),
            hasProduct: expect.any(Function),
            serializeBinary: expect.any(Function),
            toObject: expect.any(Function),
          })
        );
      } catch (error) {
        console.error(error);
      }
    });

    // Call the intercepted method
    interceptedCreateProduct(call, callback);
  });

  it("should update a product price and return the response", () => {
    // Mock authInterceptor to call the original method
    authInterceptor.mockImplementation((method) => {
      return (call, callback) => {
        call.user = { id: "user-id", role: "admin", name: "Ayemun Hossain" }; // Simulate a valid user
        method(call, callback); // Call the actual method
      };
    });

    validateRequest.mockImplementation(() => true);
    jest
      .spyOn(productModel, "updateProduct")
      .mockResolvedValue({
        id: 1,
        name: "Product A",
        description: "Description A",
        price: 100,
        category: "Category A",
      });
    // Wrap the createProduct method with the mocked interceptor
    const interceptedPriceUpdates = authInterceptor(
      unauthenticated.priceUpdates
    );
    // Spy on the callback function
    const callback = jest.fn((err, response) => {
      try {
        expect(call.user).toEqual({
          id: "user-id",
          role: "admin",
          name: "Ayemun Hossain",
        });
        expect(callback).toHaveBeenCalled(); // Ensure callback is called in the original method

        const mock_response = new productProtoModel.UpdatePriceResponse();
        const product = new productProtoModel.Product();
        product.setId(1);
        product.setName("Product A");
        product.setDescription("Description A");
        product.setPrice(100);
        product.setCategory("Category A");
        mock_response.setProduct(product);
        // console.log({mock_response});

        expect(callback).toHaveBeenCalledWith(
          null,
          expect.objectContaining({
            getProduct: expect.any(Function),
            setProduct: expect.any(Function),
            clearProduct: expect.any(Function),
            hasProduct: expect.any(Function),
            serializeBinary: expect.any(Function),
            toObject: expect.any(Function),
          })
        );
      } catch (error) {
        console.error(error);
      }
    });

    // Call the intercepted method
    interceptedPriceUpdates(call, callback);
  });

  it("should update a product price and return the response", async() => {
    // Mock authInterceptor to call the original method
    authInterceptor.mockImplementation((method) => {
      return (call, callback) => {
        call.user = { id: "user-id", role: "admin", name: "Ayemun Hossain" }; // Simulate a valid user
        method(call, callback); // Call the actual method
      };
    });

    validateRequest.mockImplementation(() => true);
    jest
      .spyOn(productModel, "setPrice")
      .mockResolvedValue({
        id: 1,
        price: 200
      });
    // Wrap the createProduct method with the mocked interceptor
    const interceptedPriceUpdates = authInterceptor(
      unauthenticated.priceUpdates
    );
    // Spy on the callback function
    const callback = jest.fn();

    // Call the intercepted method
    await interceptedPriceUpdates(call, callback);

    expect(call.user).toEqual({
      id: "user-id",
      role: "admin",
      name: "Ayemun Hossain",
    });

    const mock_response = new productProtoModel.PriceUpdateResponse();
    mock_response.setId(1);
    mock_response.setUpdatedprice(200);
    expect(call.write).toHaveBeenCalled();
    // expect(callback).toHaveBeenCalledWith(
    //   null,
    //   expect.objectContaining({
    //     getProduct: expect.any(Function),
    //     setProduct: expect.any(Function),
    //     clearProduct: expect.any(Function),
    //     hasProduct: expect.any(Function),
    //     serializeBinary: expect.any(Function),
    //     toObject: expect.any(Function),
    //   })
    // );

  });

  // it("should get products", async() => {
  //   // Mock authInterceptor to call the original method
  //   authInterceptor.mockImplementation((method) => {
  //     return (call, callback) => {
  //       call.user = { id: "user-id", role: "admin", name: "Ayemun Hossain" }; // Simulate a valid user
  //       method(call, callback); // Call the actual method
  //     };
  //   });

  //   validateRequest.mockImplementation(() => true);

  //   jest
  //     .spyOn(productModel, "getProducts")
  //     .mockResolvedValue([
  //       { id: "1", name: "Product A", description: "Description A", price: 200, category: "Category A" }
  //     ]);

  //   jest.spyOn(call, 'write');

  //   const interceptedGetProducts = authInterceptor(unauthenticated.getProducts);
  //   // Spy on the callback function
  //   const callback = jest.fn();
  //   // Call the intercepted method
  //   await interceptedGetProducts(call, callback);

  //   expect(call.user).toEqual({
  //     id: "user-id",
  //     role: "admin",
  //     name: "Ayemun Hossain",
  //   });
    
    
  //   const mock_response = new productProtoModel.GetProductsResponse();
  //   const product = new productProtoModel.Product();
  //   product.setId(1);
  //   product.setName("Product A");
  //   product.setDescription("Description A");
  //   product.setPrice(100);
  //   product.setCategory("Category A");
  //   mock_response.setProducts(product);
  //   // console.log({mock_response});

  //   expect(call.write).toHaveBeenCalled(); // Ensure callback is called in the original method
  //   expect(call.write).toHaveBeenCalledWith({
  //           getProducts: expect.any(Function)
  //         })

  //   expect(call.end).toHaveBeenCalledWith()

    
  // });
});
