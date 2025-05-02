
const socket = io();
const chess = new Chess();
const boardElement = document.querySelector('.chessboard');

let draggedPiece = null;
let souceSquare = null;
let playerRole = null;

const renderBoard = () => {
    const board = chess.board();
    boardElement.innerHTML = ''
    board.forEach((row, rowIndex) => {
        row.forEach((square , squareIndex) =>{
            const squareElement = document.createElement('div');
            squareElement.classList.add('square', (rowIndex + squareIndex) % 2 === 0 ? 'light' : 'black');
            squareElement.dataset.row = rowIndex;
            squareElement.dataset.col = squareIndex;
            if(square){
                const pieceElement = document.createElement('div');
                pieceElement.classList.add('piece', square.color === 'w' ? 'white' : 'black');
                pieceElement.innerText = getPieceUnicode(square);
                pieceElement.draggable = playerRole === square.color;

                pieceElement.addEventListener('dragstart', (e) => {
                    if(pieceElement.draggable){
                        draggedPiece = pieceElement;
                        souceSquare = {row: rowIndex, col: squareIndex};
                        e.dataTransfer.setData('text/plain', '');
                    }
                })
                pieceElement.addEventListener('dragend', (e) => {
                    draggedPiece = null;
                    souceSquare = null;
                })

                squareElement.appendChild(pieceElement);
            }

            squareElement.addEventListener('dragover', (e) => {
                e.preventDefault();
            })

            squareElement.addEventListener('drop' , (e)=>{
                e.preventDefault();
                if(draggedPiece){
                    const targetSquare = {row: parseInt(squareElement.dataset.row), 
                        col: parseInt(squareElement.dataset.col)};
                        handleMove(souceSquare, targetSquare);
                }
            })
            boardElement.appendChild(squareElement);
        })
    }
)
if(playerRole === 'b'){
    boardElement.classList.add('flipped');
}
else{
    boardElement.classList.remove('flipped');
}
}
const handleMove = (source, target) => {
    const move = {
        from: `${String.fromCharCode(97 + source.col)}${8 - source.row}`, 
        to: `${String.fromCharCode(97 + target.col)}${8 - target.row}`,
        promotion: 'q',
    }
    socket.emit('move', move);
}

const getPieceUnicode = (piece) => {
    const unicodePieces = {
        'w': {
            'p': '♙',
            'r': '♖',
            'n': '♘',
            'b': '♗',
            'q': '♕',
            'k': '♔'
        },
        'b': {
            'p': '♟',
            'r': '♜',
            'n': '♞',
            'b': '♝',
            'q': '♛',
            'k': '♚'
        }
    };
    return unicodePieces[piece.color][piece.type] || '';
};
socket.on('playerRole', (role) => {
    playerRole = role;
    renderBoard();
})

socket.on('spectatorRole', () => {
    playerRole = null;
    renderBoard();
})

socket.on('boardState', (fen) => {
    chess.load(fen);
    renderBoard();
})

socket.on('move', (move) => {
    chess.move(move);
    renderBoard();
})

socket.on('invalidMove', (move) => {
    alert(`Invalid Move: ${move.from} to ${move.to}`);
})

socket.on('gameAlert', (message) => {
    alert(message);
});
socket.on('gameOver', (message) => {
    alert(message);
});