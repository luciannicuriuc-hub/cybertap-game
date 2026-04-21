const { Pool } = require('pg');

function resolveDatabaseUrl() {
    const primaryUrl = process.env.DATABASE_URL || '';
    const publicUrl = process.env.DATABASE_URL_PUBLIC || process.env.DATABASE_PUBLIC_URL || '';

    if (primaryUrl.includes('railway.internal') && publicUrl) {
        return publicUrl;
    }

    if (primaryUrl.includes('railway.internal') && !publicUrl) {
        throw new Error(
            'DATABASE_URL points to a Railway internal host. Set DATABASE_URL_PUBLIC to the public Railway Postgres connection string when running locally.'
        );
    }

    return primaryUrl || publicUrl;
}

const connectionString = resolveDatabaseUrl();

const pool = new Pool({
    connectionString,
    ssl: connectionString ? { rejectUnauthorized: false } : false,
});

module.exports = { pool };
