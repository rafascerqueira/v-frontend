module.exports = {
  apps: [
    {
      name: 'vendinhas-web',
      cwd: '/var/www/vendinhas/frontend',
      // next.config.ts uses output: "standalone" — run the bundled server directly
      script: 'server.js',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
        HOSTNAME: '0.0.0.0',
      },
      error_file: '/var/log/pm2/vendinhas-web-error.log',
      out_file: '/var/log/pm2/vendinhas-web-out.log',
      merge_logs: true,
      time: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    },
  ],
};
