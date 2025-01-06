/* eslint-disable no-undef */
const express = require('express')
const path = require('path')
const cors = require('cors')

const app = express()
app.use(cors()) 

const port = process.env.PORT || 3001

// Serve static files from the 'dist' directory
app.use(express.static(path.join(__dirname, 'dist')))

// Catch all routes and redirect to the index file
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'))
})

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`)
})
