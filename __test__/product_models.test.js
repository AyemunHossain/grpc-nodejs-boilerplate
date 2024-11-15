const mysql = require('../microservices/mysql-connect');
const redis = require('../microservices/redis-connect');
const { setPrice, createProduct, updateProduct, deleteProduct, getProducts } = require('../models/product');

describe('setPrice', () => {
  let getConnectionSpy;
  let querySpy;
  let releaseSpy;
  let redisClientSetSpy;
  let redisClientGetSpy;

  beforeEach(() => {
    // Mock connection object
    releaseSpy = jest.fn();
    const mockConnection = {
      query: jest.fn(),
      release: releaseSpy,
    };

    // Spy on mysql.getConnection and resolve with mockConnection
    getConnectionSpy = jest.spyOn(mysql, 'getConnection').mockImplementation((label, callback) => {
      callback(null, mockConnection);
    });

    // Spy on mockConnection.query
    querySpy = mockConnection.query.mockImplementation((sql, params, callback) => {
      callback(null, { affectedRows: 1 });
    });

    // Mock Redis client methods
    redisClientSetSpy = jest.spyOn(redis.redisClient, 'setEx').mockResolvedValue();
    redisClientGetSpy = jest.spyOn(redis.redisClient, 'get').mockResolvedValue(null);
    
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should update the price and return the result', async () => {
    const id = 1;
    const price = 100;

    const result = await setPrice(id, price);

    // Verify the result
    expect(result).toEqual({ id, price });

    // Verify interactions
    expect(getConnectionSpy).toHaveBeenCalledWith('MASTER', expect.any(Function));
    expect(getConnectionSpy).toHaveBeenCalledTimes(1);
    const connection = getConnectionSpy.mock.calls[0][1];
    expect(connection).toBeDefined();

    expect(querySpy).toHaveBeenCalledWith(
      'UPDATE products SET price = ? WHERE id = ?',
      [price, id],
      expect.any(Function)
    );

    expect(redisClientGetSpy).toHaveBeenCalledWith(`products:${id}`);
    expect(redisClientSetSpy).toHaveBeenCalledWith(`products:${id}`, 3600, JSON.stringify({ id, price }));
    expect(releaseSpy).toHaveBeenCalled(); // Ensure the connection is released
  });

  it('should handle cache miss and not update the cache', async () => {
    const id = 1;
    const price = 200;
  
    // Simulate cache miss by ensuring redisClient.get resolves to null
    redisClientGetSpy.mockResolvedValue(null);
  
    const result = await setPrice(id, price);
  
    // Verify the result
    expect(result).toEqual({ id, price });
  
    // Verify interactions
    expect(getConnectionSpy).toHaveBeenCalledWith('MASTER', expect.any(Function));
    expect(querySpy).toHaveBeenCalledWith(
      'UPDATE products SET price = ? WHERE id = ?',
      [price, id],
      expect.any(Function)
    );
  
    // Verify Redis interactions
    expect(redisClientGetSpy).toHaveBeenCalledWith(`products:${id}`);
    expect(redisClientSetSpy).toHaveBeenCalledWith(`products:${id}`, 3600, JSON.stringify({ id, price }));
    expect(releaseSpy).toHaveBeenCalled(); // Ensure the connection is released
  });

  it('should update the cache if data exists in Redis', async () => {
    const id = 1;
    const price = 300;
  
    // Simulate a cache hit by returning a cached value
    const cachedData = JSON.stringify({ id, price: 250 });
    redisClientGetSpy.mockResolvedValueOnce(cachedData);
  
    const result = await setPrice(id, price);
  
    // Verify the result
    expect(result).toEqual({ id, price });
  
    // Verify Redis interactions
    expect(redisClientGetSpy).toHaveBeenCalledWith(`products:${id}`);
    expect(redisClientSetSpy).toHaveBeenCalledWith(
      `products:${id}`,
      3600,
      JSON.stringify({ id, price })
    );
  });

  it('should handle database connection failure gracefully', async () => {
    // Simulate database connection error
    getConnectionSpy.mockImplementationOnce((label, callback) => callback(new Error('DB Connection Error')));
  
    const result = await setPrice(1, 100);
  
    // Verify the result
    expect(result).toEqual(false);
  
    // Verify interactions
    expect(getConnectionSpy).toHaveBeenCalledWith('MASTER', expect.any(Function));
    expect(querySpy).not.toHaveBeenCalled();
    expect(redisClientGetSpy).not.toHaveBeenCalled();
    expect(redisClientSetSpy).not.toHaveBeenCalled();
  });

  
  it('should handle query execution error gracefully', async () => {
    // Simulate query execution error
    querySpy.mockImplementationOnce((sql, params, callback) => callback(new Error('Query Error')));
  
    const result = await setPrice(1, 100);
  
    // Verify the result
    expect(result).toEqual(false);
  
    // Verify interactions
    expect(getConnectionSpy).toHaveBeenCalledWith('MASTER', expect.any(Function));
    expect(querySpy).toHaveBeenCalledWith(
      'UPDATE products SET price = ? WHERE id = ?',
      [100, 1],
      expect.any(Function)
    );
    expect(redisClientGetSpy).not.toHaveBeenCalled();
    expect(redisClientSetSpy).not.toHaveBeenCalled();
    expect(releaseSpy).toHaveBeenCalled(); // Ensure the connection is released
  });

  
  it('should handle Redis get failure gracefully', async () => {
    const id = 1;
    const price = 150;
  
    // Simulate Redis get method error
    redisClientGetSpy.mockRejectedValueOnce(new Error('Redis Get Error'));
  
    const result = await setPrice(id, price);
  
    // Verify the result
    expect(result).toEqual(false);
  
    // Verify interactions
    expect(redisClientGetSpy).toHaveBeenCalledWith(`products:${id}`);
    expect(redisClientSetSpy).not.toHaveBeenCalled(); // Cache should not be updated due to error
    expect(releaseSpy).toHaveBeenCalled(); // Ensure the connection is released
  });

  
  it('should handle Redis get failure gracefully', async () => {
    const id = 1;
    const price = 150;
  
    // Simulate Redis get method error
    redisClientGetSpy.mockRejectedValueOnce(new Error('Redis Get Error'));
  
    const result = await setPrice(id, price);
  
    // Verify the result
    expect(result).toEqual(false);
  
    // Verify interactions
    expect(redisClientGetSpy).toHaveBeenCalledWith(`products:${id}`);
    expect(redisClientSetSpy).not.toHaveBeenCalled(); // Cache should not be updated due to error
    expect(releaseSpy).toHaveBeenCalled(); // Ensure the connection is released
  });
  

});


describe('Product Model', () => {
  let getConnectionSpy;
  let querySpy;
  let releaseSpy;
  let redisClientSetSpy;
  let redisClientGetSpy;
  let redisClientDelSpy;

  beforeEach(() => {
    // Mock connection object
    releaseSpy = jest.fn();
    const mockConnection = {
      query: jest.fn(),
      release: releaseSpy,
    };

    // Spy on mysql.getConnection and resolve with mockConnection
    getConnectionSpy = jest.spyOn(mysql, 'getConnection').mockImplementation((label, callback) => {
      callback(null, mockConnection);
    });

    // Spy on mockConnection.query
    querySpy = mockConnection.query.mockImplementation((sql, params, callback) => {
      callback(null, { affectedRows: 1, insertId: 1 });
    });

    // Mock Redis client methods
    redisClientSetSpy = jest.spyOn(redis.redisClient, 'setEx').mockResolvedValue();
    redisClientGetSpy = jest.spyOn(redis.redisClient, 'get').mockResolvedValue(null);
    redisClientDelSpy = jest.spyOn(redis.redisClient, 'del').mockResolvedValue();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should create a product and return the result', async () => {
    const data = { name: 'Product A', description: 'Description A', price: 100, category: 'Category A' };

    const result = await createProduct(data);

    // Verify the result
    expect(result).toEqual({ id: 1, ...data });

    // Verify the query was called with the correct SQL and parameters
    expect(querySpy).toHaveBeenCalledWith(
      'INSERT INTO products (name, description, price, category) VALUES (?, ?, ?, ?)',
      [data.name, data.description, data.price, data.category],
      expect.any(Function)
    );

    // Verify the cache was updated
    expect(redisClientSetSpy).toHaveBeenCalledWith(
      `products:1`,
      3600,
      JSON.stringify(data)
    );
  });

  it('should update a product and return the result', async () => {
    const data = { id: 1, name: 'Product A', description: 'Description A', price: 100, category: 'Category A' };

    const result = await updateProduct(data);

    // Verify the result
    expect(result).toEqual(data);

    // Verify the query was called with the correct SQL and parameters
    expect(querySpy).toHaveBeenCalledWith(
      'UPDATE products SET name = ?, description = ?, price = ?, category = ? WHERE id = ?',
      [data.name, data.description, data.price, data.category, data.id],
      expect.any(Function)
    );

    // Verify the cache was updated
    expect(redisClientSetSpy).toHaveBeenCalledWith(
      `products:${data.id}`,
      3600,
      JSON.stringify(data)
    );
  });

  it('should delete a product and return the result', async () => {
    const id = 1;

    const result = await deleteProduct(id);

    // Verify the result
    expect(result).toEqual({ id });

    // Verify the query was called with the correct SQL and parameters
    expect(querySpy).toHaveBeenCalledWith(
      'DELETE FROM products WHERE id = ?',
      [id],
      expect.any(Function)
    );

    // Verify the cache was deleted
    expect(redisClientDelSpy).toHaveBeenCalledWith(`products:${id}`);
  });

  it('should fetch products and return the result', async () => {
    const results = [{ id: 1, name: 'Product A', description: 'Description A', price: 100, category: 'Category A' }];
    querySpy.mockImplementationOnce((sql, params, callback) => {
      callback(null, results);
    });

    const page = 1;
    const limit = 5;
    const category = 'Category A';
    const minPrice = 0;
    const maxPrice = 100;

    const result = await getProducts(page, limit, category, minPrice, maxPrice);

    // Verify the result
    expect(result).toEqual(results);

    // Verify the query was called with the correct SQL and parameters
    expect(querySpy).toHaveBeenCalledWith(
      'SELECT * FROM products WHERE category = ? AND price >= ? AND price <= ? LIMIT ? OFFSET ?',
      [category, minPrice, maxPrice, limit, (page - 1) * limit],
      expect.any(Function)
    );
  });
});