const mysql = require("../microservices/mysql-connect");
const redis = require("../microservices/redis-connect");

const createProduct = async (data) => {
    try {
        const { name, description, price, category } = data;

        const connection = await new Promise((resolve, reject) => {
            mysql.getConnection('MASTER', (err, conn) => {
                if (err) {
                    console.error('Database connection failed:', err.stack);
                    reject(err);
                } else {
                    resolve(conn);
                }
            });
        });

        try {
            const result = await new Promise((resolve, reject) => {
                connection.query(
                    'INSERT INTO products (name, description, price, category) VALUES (?, ?, ?, ?)',
                    [name, description, price, category],
                    (err, result) => {
                        if (err) {
                            console.error('Error occurred while inserting the product:', err.stack);
                            reject(err);
                        } else {
                            resolve(result);
                        }
                    }
                );
            });

            const cacheKey = `products:${result.insertId}`;
            await redis.redisClient.setEx(cacheKey, 3600, JSON.stringify(data)); // Cache for 1 hour

            return { id: result.insertId, name, description, price, category };
        } finally {
            connection.release();
        }
    } catch (err) {
        console.error("createProduct:", err);
        return false;
    }
};


const updateProduct = async (data) => {
    try {
        const { id, name, description, price, category } = data;

        const connection = await new Promise((resolve, reject) => {
            mysql.getConnection('MASTER', (err, conn) => {
                if (err) {
                    console.error('Database connection failed:', err.stack);
                    reject(err);
                } else {
                    resolve(conn);
                }
            });
        });

        try {
            await new Promise((resolve, reject) => {
                connection.query(
                    'UPDATE products SET name = ?, description = ?, price = ?, category = ? WHERE id = ?',
                    [name, description, price, category, id],
                    (err, result) => {
                        if (err) {
                            console.error('Error occurred while updating the product:', err.stack);
                            reject(err);
                        } else {
                            resolve(result);
                        }
                    }
                );
            });

            const cacheKey = `products:${id}`;
            await redis.redisClient.setEx(cacheKey, 3600, JSON.stringify(data)); // Cache for 1 hour

            return { id, name, description, price, category };
        } finally {
            connection.release();
        }
    } catch (err) {
        console.error("updateProduct:", err);
        return false;
    }
};


const deleteProduct = async (id) => {
    try {
        const connection = await new Promise((resolve, reject) => {
            mysql.getConnection('MASTER', (err, conn) => {
                if (err) {
                    console.error('Database connection failed:', err.stack);
                    reject(err);
                } else {
                    resolve(conn);
                }
            });
        });

        try {
            await new Promise((resolve, reject) => {
                connection.query(
                    'DELETE FROM products WHERE id = ?',
                    [id],
                    (err, result) => {
                        if (err) {
                            console.error('Error occurred while deleting the product:', err.stack);
                            reject(err);
                        } else {
                            resolve(result);
                        }
                    }
                );
            });

            const cacheKey = `products:${id}`;
            await redis.redisClient.del(cacheKey); // Remove from cache

            return { id };
        } finally {
            connection.release();
        }
    } catch (err) {
        console.error("deleteProduct:", err);
        return false;
    }
};


const getProducts = async (page = 1, limit = 5, category = '', minPrice = 0, maxPrice = 100) => {
    try {
        const connection = await new Promise((resolve, reject) => {
            mysql.getConnection('MASTER', (err, conn) => {
                if (err) {
                    console.error('Database connection failed:', err.stack);
                    reject(err);
                } else {
                    resolve(conn);
                }
            });
        });

        try {
            const results = await new Promise((resolve, reject) => {
                connection.query(
                    'SELECT * FROM products WHERE category = ? AND price >= ? AND price <= ? LIMIT ? OFFSET ?',
                    [category, minPrice, maxPrice, limit, (page - 1) * limit],
                    (err, results) => {
                        if (err) {
                            console.error('Error occurred while fetching the products:', err.stack);
                            reject(err);
                        } else {
                            resolve(results);
                        }
                    }
                );
            });

            return results;
        } finally {
            connection.release();
        }
    } catch (err) {
        console.error("getProducts:", err);
        return false;
    }
};


const setPrice = async (id, price) => {
    try {
        const connection = await new Promise((resolve, reject) => {
            mysql.getConnection('MASTER', (err, conn) => {
                if (err) {
                    console.error('Database connection failed:', err.stack);
                    reject(err);
                } else {
                    resolve(conn);
                }
            });
        });

        try {
            
            await new Promise((resolve, reject) => {
                connection.query(
                    'UPDATE products SET price = ? WHERE id = ?',
                    [price, id],
                    (err, results) => {
                        if (err) {
                            console.error('Error occurred while updating the price:', err.stack);
                            reject(err);
                        } else {
                            resolve(results);
                        }
                    }
                );
            });

            const cacheKey = `products:${id}`;
            const data = await redis.redisClient.get(cacheKey);
            if (data) {
                const product = JSON.parse(data);
                product.price = price;
                await redis.redisClient.setEx(cacheKey, 3600, JSON.stringify(product)); // Cache for 1 hour
            }else{
                await redis.redisClient.setEx(cacheKey, 3600, JSON.stringify({ id, price })); // Cache for 1 hour
            }

            return { id, price };
        } finally {
            connection.release();
        }
    } catch (err) {
        console.error("setPrice:", err);
        return false;
    }
};


module.exports = {
    createProduct,
    updateProduct,
    deleteProduct,
    getProducts,
    setPrice
};
