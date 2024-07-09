import dotenv from 'dotenv';
dotenv.config()


const serverConfig = {
    appPort: process.env.SERVER_APP_PORT,
    dbUri:process.env.SERVER_APP_DB_URI,
    secretKey:process.env.SERVER_SECRET_KEY
}

export {
    serverConfig
}