export default {
    development: {
        client: 'pg',
        connection: {
            host: process.env.POSTGRES_HOST,
            port: process.env.POSTGRES_PORT,
            user: process.env.POSTGRES_USER,
            password: process.env.POSTGRES_PASSWORD,
            database: process.env.POSTGRES_DB
        },

        migrations: {
            directory: './migrations',
        }
    },

    testing: {
        client: 'pg',
        connection: {
            host: process.env.POSTGRES_HOST,
            port: process.env.POSTGRES_PORT,
            user: process.env.POSTGRES_USER,
            password: process.env.POSTGRES_PASSWORD,
            database: process.env.POSTGRES_DB
        },

        migrations: {
            directory: './migrations',
        }
    },

    production: {
        client: 'pg',
        connection: process.env.PG_ADMIN_URI,
        migrations: {
            directory: './migrations'
        }
    }
}