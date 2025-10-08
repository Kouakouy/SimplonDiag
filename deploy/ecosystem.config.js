module.exports = {
  apps: [
    {
      name: 'simplonform-frontend',
      cwd: '/var/www/simplonform',
      script: 'npm',
      args: 'start',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        NEXT_PUBLIC_API_URL: 'https://api.votre-domaine.com/api',
        NEXT_PUBLIC_APP_URL: 'https://votre-domaine.com'
      },
      error_file: '/var/log/simplonform/frontend-error.log',
      out_file: '/var/log/simplonform/frontend-out.log',
      log_file: '/var/log/simplonform/frontend-combined.log',
      time: true,
      max_memory_restart: '1G',
      node_args: '--max-old-space-size=1024'
    },
    {
      name: 'simplonform-backend',
      cwd: '/var/www/simplonform/backend',
      script: 'dist/server.js',
      instances: 2,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
        MONGODB_URI: 'mongodb+srv://kouakouy898_db_user:q7EQ4jjjMtBQQW9h@cluster0.i0cliky.mongodb.net/simplonform?retryWrites=true&w=majority&appName=Cluster0',
        JWT_SECRET: '9f8a32b7c6e14d98a04c45f3f9f4b92c8e72d1ff45a7e63e09d2f143b0ae567c',
        SMTP_HOST: 'smtp.gmail.com',
        SMTP_PORT: '587',
        SMTP_USER: 'your-email@gmail.com',
        SMTP_PASS: 'your-app-password',
        SMTP_FROM: 'noreply@simplonform.com',
        APP_URL: 'https://votre-domaine.com',
        CORS_ORIGIN: 'https://votre-domaine.com'
      },
      error_file: '/var/log/simplonform/backend-error.log',
      out_file: '/var/log/simplonform/backend-out.log',
      log_file: '/var/log/simplonform/backend-combined.log',
      time: true,
      max_memory_restart: '1G',
      node_args: '--max-old-space-size=1024'
    }
  ]
};
