'use client'

import { FC, useState, useEffect } from 'react'
import { useDraw } from '../hooks/useDraw'
import { ChromePicker } from 'react-color'
interface pageProps {}
import { io } from 'socket.io-client'
import { drawLine } from '../utils/drawline'
const socket = io('http://localhost:3001')


type DrawLineProps = {
  prevPoint: Point | null
  currentPoint: Point
  color: string
}

const index: FC<pageProps> = ({}) => {
  const [color, setColor] = useState<string>('#000')
  const { canvasRef, onMouseDown, clear } = useDraw(createLine)

  
  useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d')

    socket.emit('client-ready')
    socket.on('get-canvas-state', () => {
      if (!canvasRef.current?.toDataURL()) return
      console.log('sending canvas state')
      socket.emit('canvas-state', canvasRef.current.toDataURL())
    })

    socket.on('canvas-state-from-server', (state: string) => {
      console.log('I received the state')
      const img = new Image()
      img.src = state
      img.onload = () => {
        ctx?.drawImage(img, 0, 0)
      }
    })


    socket.on('draw-line', ({ prevPoint, currentPoint, color }: DrawLineProps) => {
      if (!ctx) return console.log('no ctx here')
      drawLine({ prevPoint, currentPoint, ctx, color })
    })

    socket.on('clear', clear)

    return () => {
      socket.off('draw-line')
      socket.off('get-canvas-state')
      socket.off('canvas-state-from-server')
      socket.off('clear')
    }

    
  }, [canvasRef])

function createLine({ prevPoint, currentPoint, ctx }: Draw) {
  socket.emit('draw-line', { prevPoint, currentPoint, color })
  drawLine({ prevPoint, currentPoint, ctx, color })
}  


function disableText(){
  document.getElementById('user_name').disabled= true;
  let x: HTMLElement | null = document.getElementById('set_user')
  x.style.display ='none';
}

function saveImage(){
  let canvas: HTMLElement | null = document.getElementById('myCanvas')
  let image = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream"); 
  window.location.href=image;
}

function addToChat(message: any, username: any) {
  const chat: HTMLElement | null= document.getElementById('chat')
  chat.innerHTML += `<p>${username}:</p><p1> ${message}</p1></br>`
}

function addToChatOtherRooms(data: Object) {
  const chat: HTMLElement | null= document.getElementById('chat')
  chat.innerHTML += `<p>${data.username}:</p><p1> ${data.message}</p1></br>`
}

  function sendMessage() {
    const text: HTMLElement | null = document.getElementById('text')
    const username = document.getElementById('user_name')
    addToChat(text.value, username.value)
    socket.emit('message', {message: text.value, username: username.value})
    text.value = ''
  }

  socket.on('message', addToChatOtherRooms)


  return (
    <div className='w-screen h-screen bg-white flex justify-center items-center md:w-auto md:h-auto'>
      <div className='flex flex-col gap-10 pr-10  md: my-20 md: mx-2'>
        <input type="text" id="user_name" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="User Name"></input>
        <button id = 'set_user' className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full m-1" onClick={disableText}>Set UserName</button>
        
        <ChromePicker color={color} onChange={(e) => setColor(e.hex)} />
        <button type='button' className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full m-1" onClick={clear}>
          Clear canvas
        </button>
      </div>

      <div className='p-3 md: my-2'>
      <canvas
        id='myCanvas'
        ref={canvasRef}
        onMouseDown={onMouseDown}
        width={300}
        height={300}
        className='border border-black rounded-md md: w-auto md: h-auto'
      />
      <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full m-1" onClick={saveImage}>Save Our Image</button>

        <div id="chat" className="h-2/6 p-2.5 w-4/5 break-normal text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 "></div>
        <input type='text' id='text' className='border border-black rounded-md'></input>
        <button type="button" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full m-1" onClick={sendMessage}>Send</button>
      </div>
    </div>
  )
}

export default index

