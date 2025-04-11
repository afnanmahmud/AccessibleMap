import { ConnectionPool } from 'mssql';

// Utility function to ensure an environment variable is a string
const getEnvVariable = (name: string): string => {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Environment variable ${name} is not defined`);
  }
  return value;
};

export const connectToDatabase = async () => {
  console.log('Starting database connection...');
  console.log('DB_HOST:', process.env.DB_HOST);
  console.log('DB_USER:', process.env.DB_USER);
  console.log('DB_NAME:', process.env.DB_NAME);

  // Validate and retrieve environment variables
  const dbUser = getEnvVariable('DB_USER');
  const dbPass = getEnvVariable('DB_PASS');
  const dbHost = getEnvVariable('DB_HOST');
  const dbName = getEnvVariable('DB_NAME');

  try {
    const pool = new ConnectionPool({
      user: dbUser,
      password: dbPass,
      server: dbHost,
      database: dbName,
      options: {
        encrypt: true,
        trustServerCertificate: true
      }
    });
    console.log('Connecting to database...');
    await pool.connect();
    console.log('Connected!');
    return pool;
  } catch (err) {
    console.error('Database connection failed:', err);
    throw err;
  }
};