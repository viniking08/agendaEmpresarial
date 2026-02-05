const mysql = require("mysql2/promise");

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
});

async function testConnection() {
    try{
        const connection = await pool.getConnection();
        await connection.ping();
        connection.release();
        return { success: true,message:"Conexão com banco de dados feita"};
    }catch(error){
        return{success:false,message:`´Falha na conecção: ${error.message}`};
    }
}

module.exports = {pool,testConnection};