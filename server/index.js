const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const database = require("./config/database")
const { boardEntry } = require("./utils/generateBoards")
const BingoBoard = require('./models/board');
const Player = require("./models/Player")

const app = express();
app.use(cors());

// app.use(express.json());
database.connect();



const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// app.use('/api/bingo', bingo)

// boardEntry();
const boards = async () => {
    const allBoards = await BingoBoard.find({});
    const result = allBoards.map(b => b.numbers[0])
    // console.log(result)
    return result;
}


io.on('connection', async (socket) => {
    console.log("User Connected", socket.id);
    await Player.create({socketId: socket.id})

    const allBoards = await boards();


    const randomBoards = allBoards.sort(() => 0.5 - Math.random()).slice(0, 4);
    socket.emit("choose-boards", randomBoards);



    socket.on("select-board", (board) => {

        socket.data.selectedBoard = board;
        socket.data.score = 0;
    });

    // To make sure that each number is generated only once
    const calledNumbers = new Set();
    let numberInterval = null;

    socket.on('start-game', ()=> {
        const callNumber = () => {
            if (calledNumbers.size > 35) {
                socket.emit('game-over', { message: 'Game Over!' });
                clearInterval(numberInterval);
                return;
            }
    
            let randomNumber;
    
            do {
                randomNumber = Math.floor(Math.random() * 75) + 1;
            } while (calledNumbers.has(randomNumber));
    
            calledNumbers.add(randomNumber);
            const now = Date.now();
            socket.emit('number-called',  { number: randomNumber, time: now })
        }

        numberInterval = setInterval(callNumber, process.env.INTERVAL_TIME)
    })

   

    

    // setInterval(() => {
    //     const randomNumber = Math.floor(Math.random() * 75) + 1;
    //     const now = Date.now();
    //     socket.emit("number-called", { number: randomNumber, time: now })
    // }, process.env.INTERVAL_TIME);

    socket.on('click-number', ({ number, createdAt, Bingo=false }) => {
        
        let points = 0;
        if(Bingo){
            points = 1000;
            socket.emit('game-over', { message: 'Game Over!' });
        }else{
            const elapsed = (Date.now() - createdAt) / 1000;
            if (elapsed <= 2) points = 100;
            else if (elapsed <= 4) points = 70;
            else points = 20;
        }
        
        // console.log(points, number)
        socket.data.score += points;
        socket.emit("score-update", socket.data.score);


        Player.findOneAndUpdate(
            { socketId: socket.id },
            { $set: { score: socket.data.score } },
            { upsert: true }
        ).exec()

    })

    socket.on("disconnect", () => {
        console.log("User disconnected")
    })


})

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
    console.log(`Server running at port number ${PORT}.`)
})

