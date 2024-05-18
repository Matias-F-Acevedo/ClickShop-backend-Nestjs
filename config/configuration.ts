import { registerAs } from "@nestjs/config";


export default registerAs('config', () => ({
    // Base de datos: 
    db_type: process.env.DATABASE_TYPE,
    db_host: process.env.DATABASE_HOST,
    db_username:process.env.DATABASE_USERNAME,
    db_password:process.env.DATABASE_PASSWORD,
    db_port: parseInt(process.env.DATABASE_PORT,10) || 3306,
    db_database:process.env.DATABASE,
    // Contraseña de aplicacion gmail clickshop para Mailer (dependencia con la cual envio el email para restablecer la contraseña).
    email_user: process.env.EMAIL_USER,
    email_pass: process.env.EMAIL_PASS,
    // JWT:
    jwt_secret: process.env.JWT_SECRET,
    // Firebase:
    firebase_service_account_path: process.env.FIREBASE_SERVICE_ACCOUNT_PATH,
    firebase_storage_bucket: process.env.FIREBASE_STORAGE_BUCKET,
}));

