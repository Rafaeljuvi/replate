const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const {
    isValidEmail,
    isValidPassword,
    isValidPhoneNumber
} = require('../utils/validation');


