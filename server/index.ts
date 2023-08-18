const express = require('express')
const http = require('http')
const app = express()
const server = http.createServer(app)

import { Server } from 'socket.io'
const io = new Server(server, {
  cors: {
    origin: '*',
  },
})


app.get('/', (req: any, res: { sendFile: (arg0: string) => void }) => {
  res.sendFile(__dirname + '/index.html')
})

type Point = { x: number; y: number }

type DrawLine = {
  prevPoint: Point | null
  currentPoint: Point
  color: string
}

io.on('connection', (socket) => {
  socket.on('client-ready', () => {
    socket.broadcast.emit('get-canvas-state')
  })

  socket.on('canvas-state', (state) => {
    console.log('received canvas state')
    socket.broadcast.emit('canvas-state-from-server', state)
  })

  socket.on('draw-line', ({ prevPoint, currentPoint, color }: DrawLine) => {
    socket.broadcast.emit('draw-line', { prevPoint, currentPoint, color })
  })

  // when a user sends a message, broadcast it to all other users
  socket.on('message', ({message, username}) => {
      socket.broadcast.emit('message', {message, username})        
  })

  // if a user disconnects, log it to the console
  socket.on('disconnect', reason => {
    console.log(`User disconnected (${reason})`)
  })

  //if user clears canvas, clear canvases for other users
  socket.on(' clear', () => io.emit('clear'))
})

server.listen(3001, () => {
  console.log('✔️ Server listening on port 3001')
})