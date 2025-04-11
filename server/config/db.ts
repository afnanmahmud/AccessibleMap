import sql from 'mssql';

// Helper function to validate environment variables
const getEnvVariable = (name: string): string => {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Environment variable ${name} is not defined`);
  }
  return value;
};

// Define the dbConfig using validated environment variables
const dbConfig: sql.config = {
  user: getEnvVariable('SQL_USER'),
  password: getEnvVariable('SQL_PASSWORD'),
  server: getEnvVariable('SQL_SERVER'), // Now guaranteed to be a string
  database: getEnvVariable('SQL_DATABASE'),
  options: {
    encrypt: true, // Required for Azure SQL
    trustServerCertificate: false // Enforce certificate validation
  },
  pool: {
    max: 10, // Maximum number of connections in pool
    min: 0,
    idleTimeoutMillis: 30000 // Close idle connections after 30 seconds
  }
};

export const connectToDatabase = async () => {
  try {
    const pool = await sql.connect(dbConfig);
    console.log('Connected to Azure SQL Database');
    return pool;
  } catch (err) {
    console.error('Database connection failed:', err);
    throw err;
  }
};