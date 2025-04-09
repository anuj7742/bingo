import {io} from 'socket.io-client'

const socket = io(process.env.REACT_APP_BACK_URL);


socket.on('connect-error', (err) => {
    console.error(`connection error ${err.message}`)
})

export default socket;
