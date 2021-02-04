const properties = require('./json/properties.json');
const users = require('./json/users.json');

const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  password: 'myPassword',
  host: 'localhost',
  database: 'lightbnb'
});

pool.connect((err) => {
  if (err) throw new Error(err);
  console.log('connected!');
});
/// Users

/**
 * Get a single user from the database given their email.
 * @param {String} email The email of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithEmail = function(email) {
    return pool.query(`
    SELECT * FROM users
    WHERE email = $1
    `, [email])
    .then(res => res.rows[0])
    .catch(e => console.log(e))
}
exports.getUserWithEmail = getUserWithEmail;


/**
 * Get a single user from the database given their id.
 * @param {string} id The id of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithId = function(id) {
  return pool.query(`
  SELECT * FROM users
  WHERE id = $1
  `, [id])
  .then(res => res.rows[0])
  .catch(e => console.log(e))
}

exports.getUserWithId = getUserWithId;


/**
 * Add a new user to the database.
 * @param {{name: string, password: string, email: string}} user
 * @return {Promise<{}>} A promise to the user.
 */
const addUser =  function(user) {
  return pool.query(`INSERT INTO users (name,email,password)
  VALUES 
  ($1, $2, $3)`, [user.name,user.email,user.password])
  .then(res => res.rows[0])
  .catch(e => console.log(e))
}
exports.addUser = addUser;

/// Reservations

/**
 * Get all reservations for a single user.
 * @param {string} guest_id The id of the user.
 * @return {Promise<[{}]>} A promise to the reservations.
 */
const getAllReservations = function(guest_id, limit = 10) {
  return pool.query(`
  SELECT * FROM reservations
  JOIN properties on properties.id = property_id
  WHERE guest_id = $1
  LIMIT $2
  `, [guest_id, limit])
  .then(res => res.rows)
  .catch(e => console.log(e))
}
exports.getAllReservations = getAllReservations;

/// Properties

/**
 * Get all properties.
 * @param {{}} options An object containing query options.
 * @param {*} limit The number of results to return.
 * @return {Promise<[{}]>}  A promise to the properties.
 */

const getAllProperties = function(options, limit = 20) {
   // 1
   const queryParams = [];
   // 2
   let queryString = `
   SELECT properties.*, avg(property_reviews.rating) as average_rating
   FROM properties
   JOIN property_reviews ON properties.id = property_id
   `;
   if (options.owner_id) {
    return pool.query(`SELECT properties.*, avg(property_reviews.rating) as average_rating
    FROM properties
    left JOIN property_reviews ON properties.id = property_id
    WHERE owner_id = $1
    GROUP BY properties.id
    ORDER BY cost_per_night`, [options.owner_id])
    .then(res => res.rows)
    .catch(e => console.log(e))

  }

   if (options.city && !options.minimum_price_per_night && !options.maximum_price_per_night && !options.minimum_rating) {
  
     queryParams.push(`%${options.city}%`);
     queryString += `WHERE city LIKE $${queryParams.length} `;
   }
   if (options.city && options.minimum_price_per_night && !options.maximum_price_per_night && !options.minimum_rating) {
    queryParams.push(`%${options.city}%`);
    queryString += `WHERE city LIKE $${queryParams.length} `
    queryParams.push(`${options.minimum_price_per_night * 100}`);
    queryString += `AND cost_per_night > $${queryParams.length} `;
  }
  if (options.city && !options.minimum_price_per_night && options.maximum_price_per_night && !options.minimum_rating) {
    queryParams.push(`%${options.city}%`);
    queryString += `WHERE city LIKE $${queryParams.length} `
    queryParams.push(`${options.maximum_price_per_night * 100}`);
    queryString += `AND cost_per_night < $${queryParams.length} `;
  }
  if (options.city && options.minimum_price_per_night && options.maximum_price_per_night && !options.minimum_rating) {
    queryParams.push(`%${options.city}%`);
    queryString += `WHERE city LIKE $${queryParams.length} `
    queryParams.push(`${options.minimum_price_per_night * 100}`);
    queryString += `AND cost_per_night > $${queryParams.length} `;
    queryParams.push(`${options.maximum_price_per_night * 100}`);
    queryString += `AND cost_per_night < $${queryParams.length} `;
  }

  if(options.minimum_price_per_night && options.maximum_price_per_night && !options.city && !options.minimum_rating) {
    queryParams.push(`${options.minimum_price_per_night * 100}`);
    queryString += `WHERE cost_per_night > $${queryParams.length} `;
    queryParams.push(`${options.maximum_price_per_night * 100}`);
    queryString += `AND cost_per_night < $${queryParams.length} `;
  }
  if (options.minimum_price_per_night && !options.maximum_price_per_night && !options.city && !options.minimum_rating) {
    queryParams.push(`${options.minimum_price_per_night * 100}`);
    queryString += `WHERE cost_per_night > $${queryParams.length} `;
  }
  if (options.maximum_price_per_night && options.minimum_price_per_night && !options.city && !options.minimum_rating) {
    queryParams.push(`${options.maximum_price_per_night * 100}`);
    queryString += `WHERE cost_per_night < $${queryParams.length} `;
  }

  if(options.minimum_rating && !options.maximum_price_per_night && !options.minimum_price_per_night && !options.city) {
    queryParams.push(`${options.minimum_rating}`);
    queryString += `WHERE rating > $${queryParams.length} `;
  } else {
    if(options.minimum_rating) {
      queryParams.push(`${options.minimum_rating}`);
        queryString += `WHERE rating > $${queryParams.length} `;
      if(options.city) { 
        queryParams.push(`%${options.city}%`);
        queryString += `AND city LIKE $${queryParams.length} `;
      }
      if(options.minimum_price_per_night) { 
        queryParams.push(`${options.minimum_price_per_night * 100}`);
        queryString += `AND cost_per_night > $${queryParams.length} `;
      }
      if(options.maximum_price_per_night) { 
        queryParams.push(`${options.maximum_price_per_night * 100}`);
        queryString += `AND cost_per_night < $${queryParams.length} `;
      }
    }
  }

   queryParams.push(limit);
   queryString += `
   GROUP BY properties.id
   ORDER BY cost_per_night
   LIMIT $${queryParams.length};
   `;

   return pool.query(queryString, queryParams)
   .then(res => res.rows)
   .catch(e => console.log(e))
}
exports.getAllProperties = getAllProperties;


/**
 * Add a property to the database
 * @param {{}} property An object containing all of the property details.
 * @return {Promise<{}>} A promise to the property.
 */
const addProperty = function(property) {
  return pool.query(`INSERT INTO properties (
    owner_id,
    title,
    description,
    thumbnail_photo_url,
    cover_photo_url,
    cost_per_night,
    parking_spaces,
    number_of_bathrooms,
    number_of_bedrooms,
    street,
    city,
    province,
    post_code,
    country
    )
  VALUES 
  ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`, [
    property.owner_id,
    property.title,
    property.description,
    property.thumbnail_photo_url,
    property.cover_photo_url,
    property.cost_per_night, 
    property.parking_spaces,
    property.number_of_bathrooms,
    property.number_of_bedrooms,
    property.street,
    property.city,
    property.province,
    property.post_code,
    property.country
  ])
  .then(res => res.rows[0])
  .catch(e => console.log(e))
}
exports.addProperty = addProperty;
