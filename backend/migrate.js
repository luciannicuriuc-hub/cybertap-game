require('dotenv').config();
const { pool } = require('./src/config/db');
const { migrateDatabase } = require('./src/database/migrate');

async function run() {
    try {
        await migrateDatabase(pool);
        console.log('✅ Migration finished successfully');
        await pool.end();
    } catch (error) {
        console.error('❌ Migration failed:', error);
        try {
            await pool.end();
        } catch (closeError) {
            console.error('❌ Pool close failed:', closeError);
        }
        process.exitCode = 1;
    }
}

run();