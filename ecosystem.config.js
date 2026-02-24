module.exports = {
  apps: [
    {
      name: "crmsandiasoft",
      script: "standalone/server.js",
      env: {
        PORT: 3001,
        NODE_ENV: "production"
      }
    }
  ]
}