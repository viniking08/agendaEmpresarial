require('dotenv').config();

const express = require('express');
const { pool } = require('./config/db');
const app = express;

module.exports = app;