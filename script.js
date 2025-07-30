document.addEventListener('DOMContentLoaded', () => {
    // alert("Script v3 Loaded - High Res Test"); // 이전 alert는 삭제합니다.
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

        const boardSize = 400; 
        const padding = 50;   
        const cols = 3;       
        const rows = Math.ceil(fens.length / cols);
        const baseWidth = cols * boardSize + (cols - 1) * padding;
        const baseHeight = rows * boardSize + (rows - 1) * padding;
        const dpr = 2; // 강제 2배율

        canvas.width = baseWidth * dpr;
        canvas.height = baseHeight * dpr;
        canvas.style.width = `${baseWidth}px`;
        canvas.style.height = `${baseHeight}px`;
        
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

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

        // 최종 확인용 로그
        console.log(`Final check before export. Canvas physical size: ${canvas.width}x${canvas.height}`);

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