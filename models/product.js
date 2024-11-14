const mysql = require("../microservices/mysql-connect");
const redis = require("../microservices/redis-connect");

const createProduct = async (data) => {
    try {
        const { name, description, price, category } = data;
    
        return new Promise((resolve, reject) => {
            mysql.getConnection('MASTER', (err, connection) => {
                if (err) {
                    console.error('Database connection failed: ' + err.stack);
                    reject(err);
                }
                connection.query(
                    'INSERT INTO products (name, description, price, category) VALUES (?, ?, ?, ?)',
                    [name, description, price, category],
                    (err, result) => {
                        if (err) {
                            console.error('Error occurred while inserting the product: ' + err.stack);
                            reject(err);
                        }
                        const cacheKey = `products:${result.insertId}`;
                        redis.redisClient.setEx(cacheKey, 3600, JSON.stringify(data)); // Cache for 1 hour
                        resolve({ id: result.insertId, name, description, price, category });
                    }
                );
                connection.release();
            });
        });
    } catch (err) {
        console.error({ "createProduct": err });
        return null;
    }
};

const updateProduct = async (data) => {
    try {
        const { id, name, description, price, category } = data;
        return new Promise((resolve, reject) => {
            mysql.getConnection('MASTER', (err, connection) => {
                if (err) {
                    console.error('Database connection failed: ' + err.stack);
                    reject(err);
                    return;
                }
                connection.query(
                    'UPDATE products SET name = ?, description = ?, price = ?, category = ? WHERE id = ?',
                    [name, description, price, category, id],
                    (err, result) => {
                        if (err) {
                            console.error('Error occurred while updating the product: ' + err.stack);
                            reject(err);
                            return;
                        }
                        const cacheKey = `products:${id}`;
                        redis.redisClient.setEx(cacheKey, 3600, JSON.stringify(data)); // Cache for 1 hour
                        resolve({ id, name, description, price, category });
                    }
                );
                connection.release();
            });
        });
    } catch (err) {
        console.error({ "updateProduct": err });
        return null;
    }
};

const deleteProduct = async (id) => {
    try {
        const [result] = await mysql.query(
        'DELETE FROM products WHERE id = ?',
        [id]
        );
    
        const cacheKey = `products:${id}`;
        redis.del(cacheKey);
    
        return { id };
    } catch (err) {
        console.error({ "deleteProduct": err });
        return null;
    }
}

const getProducts = async (page = 1, limit = 5, category = '', minPrice = 0, maxPrice = 100) => {
    try {
        return new Promise((resolve, reject) => {
            mysql.getConnection('MASTER', (err, connection) => {
                if (err) {
                    console.error('Database connection failed: ' + err.stack);
                    reject(err);
                }
                connection.query(
                    'SELECT * FROM products WHERE category = ? AND price >= ? AND price <= ? LIMIT ? OFFSET ?',
                    [category, minPrice, maxPrice, limit, (page - 1) * limit],
                    (err, results) => {
                        if (err) {
                            console.error('Error occurred while fetching the products: ' + err.stack);
                            reject(err);
                        }
                        resolve(results);
                    }
                );
                connection.release();
            });
        });
    } catch (err) {
        console.error({ "getProducts": err });
        return null;
    }
}

const setPrice = async (id, price) => {
    try {
        return new Promise((resolve, reject) => {
            mysql.getConnection('MASTER', async (err, connection) => {
                if (err) {
                    console.error('Database connection failed: ' + err.stack);
                    reject(err);
                    return;
                }
                try {
                    const [result] = await connection.query(
                        'UPDATE products SET price = ? WHERE id = ?',
                        [price, id],
                        (err, results) => {
                            if (err) {
                                console.error('Error occurred while fetching the products: ' + err.stack);
                                reject(err);
                            }
                            resolve(results);
                        }
                    );

                    const cacheKey = `products:${id}`;
                    redis.get(cacheKey, (err, data) => {
                        if (err) {
                            console.error('Error occurred while fetching the product from cache: ' + err.stack);
                        }
                        if (data) {
                            const product = JSON.parse(data);
                            product.price = price;
                            redis.setEx(cacheKey, 3600, JSON.stringify(product)); // Cache for 1 hour
                        }
                    });

                    resolve({ id, price });
                } catch (err) {
                    console.error('Error occurred while updating the product price: ' + err.stack);
                    reject(err);
                } finally {
                    connection.release();
                }
            });
        });
    } catch (err) {
        console.error({ "setPrice": err });
        return null;
    }
}
module.exports = {
    createProduct,
    updateProduct,
    deleteProduct,
    getProducts,
    setPrice
};