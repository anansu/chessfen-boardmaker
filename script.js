document.addEventListener('DOMContentLoaded', () => {
    const generateBtn = document.getElementById('generate-btn');
    const fenInput = document.getElementById('fen-input');
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    const imagePlaceholder = document.getElementById('image-placeholder');
    const downloadLink = document.getElementById('download-link');

    const PIECE_IMAGES = {};
    const PIECE_FILES = {
        'b': 'bb.svg', 'k': 'bk.svg', 'n': 'bn.svg', 'p': 'bp.svg', 'q': 'bq.svg', 'r': 'br.svg',
        'B': 'wb.svg', 'K': 'wk.svg', 'N': 'wn.svg', 'P': 'wp.svg', 'Q': 'wq.svg', 'R': 'wr.svg'
    };

    function preloadPieceImages(callback) {
        let loadedImages = 0;
        const numImages = Object.keys(PIECE_FILES).length;
        for (const key in PIECE_FILES) {
            PIECE_IMAGES[key] = new Image();
            PIECE_IMAGES[key].src = `images/${PIECE_FILES[key]}`;
            PIECE_IMAGES[key].onload = () => {
                if (++loadedImages >= numImages) {
                    callback();
                }
            };
            PIECE_IMAGES[key].onerror = () => {
                console.error(`Error loading image: images/${PIECE_FILES[key]}`);
                // Handle error if necessary
            };
        }
    }

    generateBtn.addEventListener('click', () => {
        // Main logic will go here in next steps
        console.log("Generate button clicked");
        generateCompositeImage();
    });

    function drawBoard(context, boardSize, startX, startY) {
        const squareSize = boardSize / 8;
        const lightColor = '#f0d9b5';
        const darkColor = '#b58863';

        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                context.fillStyle = (row + col) % 2 === 0 ? lightColor : darkColor;
                context.fillRect(startX + col * squareSize, startY + row * squareSize, squareSize, squareSize);
            }
        }
    }

    function parseFen(fen) {
        const pieces = [];
        const [placement] = fen.split(' ');
        const rows = placement.split('/');

        rows.forEach((rowStr, rowIndex) => {
            let colIndex = 0;
            for (const char of rowStr) {
                if (isNaN(char)) {
                    pieces.push({ type: char, row: rowIndex, col: colIndex });
                    colIndex++;
                } else {
                    colIndex += parseInt(char, 10);
                }
            }
        });
        return pieces;
    }

    function drawPieces(context, boardSize, startX, startY, pieces) {
        const squareSize = boardSize / 8;
        pieces.forEach(piece => {
            const img = PIECE_IMAGES[piece.type];
            if (img) {
                const x = startX + piece.col * squareSize;
                const y = startY + piece.row * squareSize;
                context.drawImage(img, x, y, squareSize, squareSize);
            }
        });
    }

    function generateCompositeImage() {
        const fens = fenInput.value.trim().split('\n').slice(0, 12);
        if (fens.length === 0 || (fens.length === 1 && fens[0] === '')) {
            alert('FEN 코드를 입력해주세요.');
            return;
        }

        const boardSize = 400; // 개별 보드 크기
        const padding = 50;   // 보드 간 간격
        const cols = 3;
        const rows = Math.ceil(fens.length / cols);

        canvas.width = cols * boardSize + (cols - 1) * padding;
        canvas.height = rows * boardSize + (rows - 1) * padding;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        for (let i = 0; i < fens.length; i++) {
            const fen = fens[i];
            if (!fen) continue;

            const row = Math.floor(i / cols);
            const col = i % cols;
            const startX = col * (boardSize + padding);
            const startY = row * (boardSize + padding);

            drawBoard(ctx, boardSize, startX, startY);
            
            const pieces = parseFen(fen);
            drawPieces(ctx, boardSize, startX, startY, pieces);
        }

        const dataUrl = canvas.toDataURL('image/png');
        imagePlaceholder.innerHTML = `<img src="${dataUrl}" alt="Generated Chess Boards">`;
        downloadLink.href = dataUrl;
        downloadLink.download = 'chess_boards.png';
        downloadLink.style.display = 'inline-block';
    }
    
    preloadPieceImages(() => {
        console.log("All piece images preloaded.");
        generateBtn.disabled = false;
    });

    generateBtn.disabled = true; // Disable button until images are loaded
}); 