'use strict';
db.createUser(
  {
      user: "secureadmin1",
      pwd: "!!19$^ashiK!!19$^",
      roles: [
          {
              role: "readWrite",
              db: "boiler-plate"
          }
      ]
  }
);