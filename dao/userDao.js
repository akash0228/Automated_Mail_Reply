const connection = require("../config/mySqlConfig");

const addUser = async (
  email,
  refresh_token,
  access_token,
  token_type,
  expiry_date,
  scope
) => {
  try {
    const result = await connection.query(
      "INSERT INTO users (email, refresh_token, access_token, token_type, expiry_date, scope) VALUES (?, ?, ?, ?, ?, ?)",
      [email, refresh_token, access_token, token_type, expiry_date, scope]
    );
    return result;
  } catch (err) {
    console.error("Error adding user:", err);
    throw err;
  }
};

const getUsers = () => {
  return new Promise((resolve, reject) => {
    const query = "SELECT * FROM Users";
    connection.query(query, (err, rows, fields) => {
      if (err) {
        console.error("Error retrieving users:", err);
        return reject(err);
      }
      resolve(rows);
    });
  });
};


module.exports = { addUser, getUsers };
