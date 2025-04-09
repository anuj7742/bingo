import {io} from 'socket.io-client'

const socket = io('http://localhost:4000');

socket.on('connect-error', (err) => {
    console.error(`connection error ${err.message}`)
})

export default socket;