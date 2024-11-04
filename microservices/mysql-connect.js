const mysqllib2 = require('mysql2');
const config = require('config');

// Create a pool cluster
const mysql = mysqllib2.createPoolCluster();

// Configuration for the master database (write operations)
const masterConfig = {
  host: config.get('mysqldb.host'),
  user: config.get('mysqldb.username'),
  password: config.get('mysqldb.password'),
  database: config.get('mysqldb.db'),
  port: config.get('mysqldb.port'),
  waitForConnections: true,
  connectionLimit: config.get('mysqldb.connectionLimit'),
  queueLimit: config.get('mysqldb.queueLimit'),
};


mysql.on('enqueue', function () {
  console.log('Waiting for available connection slot');
});

mysql.on('release', function (connection) {
  console.log('Connection %d released', connection.threadId);
});

mysql.on('acquire', function (connection) {
  console.log('Connection %d acquired', connection.threadId);
});

mysql.on('connection', function (connection) {
  console.log('Connection %d connected', connection.threadId);
});

mysql.on('error', function (err) {
  console.log('Connection error: ' + err.stack);
});

mysql.on('close', function (err) {
  console.log('Connection closed: ' + err.stack);
});


mysql.add('MASTER', masterConfig);
// connection.add('READ_REPLICA', replica1Config);


// Check if connection is successful
mysql.getConnection('MASTER', (err, connection) => {
  if (err) {
    console.error('Database connection failed: ' + err.stack);
    return;
  }
  console.log('MySql Connected.');
});

// Export the connection
module.exports = mysql;