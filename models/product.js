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
                        redis.setEx(cacheKey, 3600, JSON.stringify(data)); // Cache for 1 hour
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
        const [result] = await mysql.query(
        'UPDATE products SET name = ?, description = ?, price = ?, category = ? WHERE id = ?',
        [name, description, price, category, id]
        );
    
        const cacheKey = `products:${id}`;
        redis.setEx(cacheKey, 3600, JSON.stringify(data)); // Cache for 1 hour
    
        return { id, name, description, price, category };
    } catch (err) {
        console.error({ "updateProduct": err });
        return null;
    }
}

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


module.exports = {
    createProduct,
    updateProduct,
    deleteProduct
};