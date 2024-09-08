module.exports = {
  apps: [
    {
      name: 'budget-app',
      script: './server.cjs',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      }
    }
  ]
}
