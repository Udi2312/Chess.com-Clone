const express = require('express');
const socket = require('socket.io');
const http = require('http')
const {Chess} = require('chess.js')
const path = require('path');
const { title } = require('process');
 const app = express();
const server = http.createServer(app);
const io = socket(server);
require('dotenv').config();

const chess = new Chess();
let players = {};
let currentplayer = "W"

app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.render('index', {title: 'Chess Game'});
})

io.on('connection', (uniquesocket) => {
    console.log("Connected");
    if(!players.white){
        players.white = uniquesocket.id;
        uniquesocket.emit("playerRole", "w");
    }
    else if(!players.black){
        players.black = uniquesocket.id;
        uniquesocket.emit("playerRole", "b");
    }
    else{
        uniquesocket.emit("spectatorRole");
    }

    uniquesocket.on('disconnect', () => {
        if(uniquesocket.id === players.white){
            delete players.white;
        }
        else if(uniquesocket.id === players.black){
            delete players.black;
        }
    })

    uniquesocket.on('move',(move) =>{
        try{
            if(chess.turn() ==="w" && uniquesocket.id !== players.white) return;
            if(chess.turn() ==="b" && uniquesocket.id !== players.black) return;

            const result = chess.move(move);
            if(result){
                currentplayer = chess.turn();
                io.emit('move', move);
                io.emit('boardState', chess.fen());

                if (chess.in_checkmate()) {
                    io.emit('gameAlert', 'Checkmate! Game over.');
                } else if (chess.in_check()) {
                    io.emit('gameAlert', 'Check!');
                } else if (chess.in_draw()) {
                    io.emit('gameAlert', 'Draw!');
                }
                else if (chess.in_stalemate()) {
                    io.emit('gameAlert', 'Stalemate!');
                }
            }
            else{
                console.log("Invalid Move" , move);
                uniquesocket.emit('invalidMove', move);
                
            }
        }
        catch(err){
            console.log("Invalid Move", err);
            uniquesocket.emit('invalidMove', move);
        }
    })
})
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});