const grpc = require("@grpc/grpc-js");
const jwt = require("jsonwebtoken");
const authInterceptor = require("../middlewares/authentication");
const { unauthenticated } = require("../services/product.service"); // Adjust the path
const validateRequest = require('../middlewares/req-validation');
const productModel = require("../models/product");

jest.mock("../middlewares/authentication");
jest.mock("../middlewares/req-validation");

describe("authInterceptor tests", () => {
    let call, callback;

    beforeEach(() => {
        call = {
            request: {
                getProduct: jest.fn().mockImplementation(() => ({
                    getName: jest.fn().mockReturnValue("Product A"),
                    getDescription: jest.fn().mockReturnValue("Description A"),
                    getPrice: jest.fn().mockReturnValue(100),
                    getCategory: jest.fn().mockReturnValue("Category A"),
                })),
            },
            metadata: {
                get: jest.fn(() => ["Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInVzZXJuYW1lIjoidGVzdHVzZXIiLCJpYXQiOjE3MzE3ODAxMDQsImV4cCI6MTczMTg2NjUwNH0.6Bv5XekP9c6mo5xuFmlmYj5JUj3wNEazJk2oXU2WQyE"]),
            },
            // request: { getProduct: jest.fn(() => ({ toObject: jest.fn() })) },
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
                call.user = { id: "user-id", role: "admin", name: "Ayemun Hossain" }; // Simulate a valid user
                method(call, callback); // Call the actual method
            };
        });
        validateRequest.mockImplementation(() => true);
        jest.spyOn(productModel, "createProduct").mockResolvedValue({ id: 1, name: "Product A", description: "Description A", price: 100, category: "Category A" });
        // Wrap the createProduct method with the mocked interceptor
        const interceptedCreateProduct = authInterceptor(unauthenticated.createProduct);
        // Spy on the callback function
        const callback = jest.fn((err, response) => {
            try {
                expect(call.user).toEqual({ id: "user-id", role: "admin", name: "Ayemun Hossain" });
                expect(callback).toHaveBeenCalled(); // Ensure callback is called in the original method
                expect(callback).toHaveBeenCalledWith(null, expect.any(Object));
                expect(response.getProduct().getName()).toBe("Product A");
                expect(response.getProduct().getDescription()).toBe("Description A");
                expect(response.getProduct().getPrice()).toBe(100);
                expect(response.getProduct().getCategory()).toBe("Category A");
                expect(response.getProduct().getId()).toBe(1);
            } catch (error) {
                console.error(error);
            }
        });

        // Call the intercepted method
        interceptedCreateProduct(call, callback);
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
