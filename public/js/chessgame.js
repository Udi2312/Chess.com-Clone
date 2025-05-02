const socket = io();
const chess = new Chess();
const boardElement = document.querySelector('.chessboard');

let draggedPiece = null;
let souceSquare = null;
let playerRole = null;

const renderBoard = () => {
    const board = chess.board();
    boardElement.innerHTML = ''; 
    board.forEach((row, rowIndex) => {
        row.forEach((square , squareIndex) =>{
            
        })
    }
)
}

const handleMove = () => {

}

const getPieceUnicode = () =>{

}