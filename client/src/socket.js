import {io} from 'socket.io-client'

const socket = io(process.env.Back_url);

socket.on('connect-error', (err) => {
    console.error(`connection error ${err.message}`)
})

export default socket;
