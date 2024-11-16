const grpc = require("@grpc/grpc-js");
const jwt = require("jsonwebtoken");
const authInterceptor = require("../middlewares/authentication");
const { unauthenticated } = require("../services/product.service"); // Adjust the path
const validateRequest = require('../middlewares/req-validation');
jest.mock("../middlewares/authentication");
jest.mock("../middlewares/req-validation");

describe("authInterceptor tests", () => {
    let call, callback;

    beforeEach(() => {
        call = {
            request: {
                getProduct: jest.fn().mockReturnValue({
                    toObject: jest.fn().mockReturnValue({
                        name: 'Product A',
                        description: 'Description A',
                        price: 100,
                        category: 'Category A',
                    }),
                }),
            },
            metadata: {
                get: jest.fn(() => ["Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInVzZXJuYW1lIjoidGVzdHVzZXIiLCJpYXQiOjE3MzE3ODAxMDQsImV4cCI6MTczMTg2NjUwNH0.6Bv5XekP9c6mo5xuFmlmYj5JUj3wNEazJk2oXU2WQyE"]),
            },
            request: { getProduct: jest.fn(() => ({ toObject: jest.fn() })) },
            user: null,
        };
        callback = jest.fn();

        // Mock JWT verification
        jest.spyOn(jwt, "verify").mockImplementation((token, secret) => {
            if (token === "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInVzZXJuYW1lIjoidGVzdHVzZXIiLCJpYXQiOjE3MzE3ODAxMDQsImV4cCI6MTczMTg2NjUwNH0.6Bv5XekP9c6mo5xuFmlmYj5JUj3wNEazJk2oXU2WQyE") {
                return { id: "user-id", role: "admin" }; // Example decoded token
            } else {
                throw new Error("Invalid token");
            }
        });

        jest.clearAllMocks();
    });

    it("should call the wrapped method when token is valid", () => {
        // Mock authInterceptor to call the original method
        authInterceptor.mockImplementation((method) => {
            return (call, callback) => {
                call.user = { id: "user-id", role: "admin" }; // Simulate a valid user
                method(call, callback); // Call the actual method
            };
        });
        validateRequest.mockImplementation(() => true);

        // Wrap the createProduct method with the mocked interceptor
        const interceptedCreateProduct = authInterceptor(unauthenticated.createProduct);

        // Call the intercepted method
        interceptedCreateProduct(call, callback);

        expect(call.user).toEqual({ id: "user-id", role: "admin" });
        expect(callback).toHaveBeenCalled(); // Ensure callback is called in the original method
    });

    it("should return an UNAUTHENTICATED error when token is invalid", () => {
        authInterceptor.mockImplementation(() => {
            return (call, callback) => {
                callback({
                    code: grpc.status.UNAUTHENTICATED,
                    message: "Token is invalid",
                });
            };
        });

        const interceptedCreateProduct = authInterceptor(unauthenticated.createProduct);

        interceptedCreateProduct(call, callback);

        expect(callback).toHaveBeenCalledWith(
            expect.objectContaining({
                code: grpc.status.UNAUTHENTICATED,
                message: "Token is invalid",
            })
        );
    });

    it("should return an UNAUTHENTICATED error when token is missing", () => {
        call.metadata.get = jest.fn(() => []); // Simulate no token

        authInterceptor.mockImplementation(() => {
            return (call, callback) => {
                callback({
                    code: grpc.status.UNAUTHENTICATED,
                    message: "Authorization token missing",
                });
            };
        });

        const interceptedCreateProduct = authInterceptor(unauthenticated.createProduct);

        interceptedCreateProduct(call, callback);

        expect(callback).toHaveBeenCalledWith(
            expect.objectContaining({
                code: grpc.status.UNAUTHENTICATED,
                message: "Authorization token missing",
            })
        );
    });
});
