import {io} from 'socket.io-client'

<<<<<<< HEAD
const socket = io(process.env.REACT_APP_BACK_URL);
=======
const socket = io(process.env.Back_url);
>>>>>>> dbf440180cc3afb79a472e767161cc93802fe4ed

socket.on('connect-error', (err) => {
    console.error(`connection error ${err.message}`)
})

export default socket;
