import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { 
  Crown, 
  Clock, 
  Target, 
  Trophy, 
  MessageSquare, 
  Send,
  RotateCcw,
  Play,
  Pause,
  Square,
  CheckSquare,
  RotateCw
} from 'lucide-react';
import { toast } from 'react-hot-toast';

// Chess piece Unicode characters
const CHESS_PIECES = {
  white: {
    king: '♔',
    queen: '♕',
    rook: '♖',
    bishop: '♗',
    knight: '♘',
    pawn: '♙'
  },
  black: {
    king: '♚',
    queen: '♛',
    rook: '♜',
    bishop: '♝',
    knight: '♞',
    pawn: '♟'
  }
};

// Initial chess board setup
const INITIAL_BOARD = [
  ['br', 'bn', 'bb', 'bq', 'bk', 'bb', 'bn', 'br'],
  ['bp', 'bp', 'bp', 'bp', 'bp', 'bp', 'bp', 'bp'],
  ['', '', '', '', '', '', '', ''],
  ['', '', '', '', '', '', '', ''],
  ['', '', '', '', '', '', '', ''],
  ['', '', '', '', '', '', '', ''],
  ['wp', 'wp', 'wp', 'wp', 'wp', 'wp', 'wp', 'wp'],
  ['wr', 'wn', 'wb', 'wq', 'wk', 'wb', 'wn', 'wr']
];

const ChessGame = ({ gameData, levelData, onComplete, onExit }) => {
  const [socket, setSocket] = useState(null);
  const [gameState, setGameState] = useState({
    board: INITIAL_BOARD,
    currentPlayer: 'white',
    gameStatus: 'playing',
    timeRemaining: levelData?.time_limit || 600,
    selectedSquare: null,
    validMoves: [],
    isCheck: false,
    isCheckmate: false,
    isStalemate: false,
    capturedPieces: { white: [], black: [] },
    moveHistory: [],
    castlingRights: { white: { kingside: true, queenside: true }, black: { kingside: true, queenside: true } },
    enPassantTarget: null,
    lastMove: null
  });
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [showChat, setShowChat] = useState(false);
  const [timer, setTimer] = useState(null);
  const [sessionId] = useState(`chess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const [showPromotion, setShowPromotion] = useState(false);
  const [promotionMove, setPromotionMove] = useState(null);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Connected to game server');
      newSocket.emit('join_game_session', {
        session_id: sessionId,
        user_id: user.id,
        game_id: gameData.id,
        level_id: levelData.id
      });
    });

    newSocket.on('joined_session', (data) => {
      console.log('Joined game session:', data);
    });

    newSocket.on('game_move_update', (data) => {
      handleOpponentMove(data);
    });

    newSocket.on('chat_message', (data) => {
      setChatMessages(prev => [...prev, data]);
    });

    return () => {
      if (newSocket) {
        newSocket.emit('leave_game_session', { session_id: sessionId });
        newSocket.disconnect();
      }
    };
  }, []);

  useEffect(() => {
    if (gameState.gameStatus === 'playing' && gameState.timeRemaining > 0) {
      const interval = setInterval(() => {
        setGameState(prev => ({
          ...prev,
          timeRemaining: prev.timeRemaining - 1
        }));
      }, 1000);
      setTimer(interval);

      return () => clearInterval(interval);
    } else if (gameState.timeRemaining <= 0) {
      handleTimeUp();
    }
  }, [gameState.gameStatus, gameState.timeRemaining]);

  const getPieceSymbol = (piece) => {
    if (!piece) return '';
    
    const color = piece[0] === 'w' ? 'white' : 'black';
    const pieceType = piece[1];
    
    const pieceMap = {
      'k': 'king',
      'q': 'queen',
      'r': 'rook',
      'b': 'bishop',
      'n': 'knight',
      'p': 'pawn'
    };
    
    return CHESS_PIECES[color][pieceMap[pieceType]];
  };

  const getValidMoves = (row, col) => {
    const piece = gameState.board[row][col];
    if (!piece) return [];
    
    const color = piece[0];
    const pieceType = piece[1];
    const moves = [];
    
    switch (pieceType) {
      case 'p':
        moves.push(...getPawnMoves(row, col, color));
        break;
      case 'r':
        moves.push(...getRookMoves(row, col, color));
        break;
      case 'n':
        moves.push(...getKnightMoves(row, col, color));
        break;
      case 'b':
        moves.push(...getBishopMoves(row, col, color));
        break;
      case 'q':
        moves.push(...getQueenMoves(row, col, color));
        break;
      case 'k':
        moves.push(...getKingMoves(row, col, color));
        break;
    }
    
    // Filter out moves that would put/leave king in check
    return moves.filter(move => !wouldBeInCheck(row, col, move.row, move.col));
  };

  const getPawnMoves = (row, col, color) => {
    const moves = [];
    const direction = color === 'w' ? -1 : 1;
    const startRow = color === 'w' ? 6 : 1;
    
    // Forward move
    const newRow = row + direction;
    if (newRow >= 0 && newRow < 8 && !gameState.board[newRow][col]) {
      moves.push({ row: newRow, col, type: 'normal' });
      
      // Double move from starting position
      if (row === startRow && !gameState.board[row + 2 * direction][col] && !gameState.board[row + direction][col]) {
        moves.push({ row: row + 2 * direction, col, type: 'double' });
      }
    }
    
    // Diagonal captures
    const captureCols = [col - 1, col + 1];
    for (let captureCol of captureCols) {
      if (captureCol >= 0 && captureCol < 8 && newRow >= 0 && newRow < 8) {
        const targetPiece = gameState.board[newRow][captureCol];
        if (targetPiece && targetPiece[0] !== color) {
          moves.push({ row: newRow, col: captureCol, type: 'capture' });
        }
      }
    }
    
    // En passant
    if (gameState.enPassantTarget && newRow >= 0 && newRow < 8) {
      const [epRow, epCol] = gameState.enPassantTarget;
      if (newRow === epRow && (col - 1 === epCol || col + 1 === epCol)) {
        moves.push({ row: newRow, col: epCol, type: 'enpassant' });
      }
    }
    
    return moves;
  };

  const getRookMoves = (row, col, color) => {
    const moves = [];
    const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]];
    
    for (let [dRow, dCol] of directions) {
      let newRow = row + dRow;
      let newCol = col + dCol;
      
      while (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
        const targetPiece = gameState.board[newRow][newCol];
        if (!targetPiece) {
          moves.push({ row: newRow, col: newCol, type: 'normal' });
        } else {
          if (targetPiece[0] !== color) {
            moves.push({ row: newRow, col: newCol, type: 'capture' });
          }
          break;
        }
        newRow += dRow;
        newCol += dCol;
      }
    }
    
    return moves;
  };

  const getKnightMoves = (row, col, color) => {
    const moves = [];
    const knightMoves = [
      [-2, -1], [-2, 1], [-1, -2], [-1, 2],
      [1, -2], [1, 2], [2, -1], [2, 1]
    ];
    
    for (let [dRow, dCol] of knightMoves) {
      const newRow = row + dRow;
      const newCol = col + dCol;
      
      if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
        const targetPiece = gameState.board[newRow][newCol];
        if (!targetPiece || targetPiece[0] !== color) {
          moves.push({ row: newRow, col: newCol, type: targetPiece ? 'capture' : 'normal' });
        }
      }
    }
    
    return moves;
  };

  const getBishopMoves = (row, col, color) => {
    const moves = [];
    const directions = [[1, 1], [1, -1], [-1, 1], [-1, -1]];
    
    for (let [dRow, dCol] of directions) {
      let newRow = row + dRow;
      let newCol = col + dCol;
      
      while (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
        const targetPiece = gameState.board[newRow][newCol];
        if (!targetPiece) {
          moves.push({ row: newRow, col: newCol, type: 'normal' });
        } else {
          if (targetPiece[0] !== color) {
            moves.push({ row: newRow, col: newCol, type: 'capture' });
          }
          break;
        }
        newRow += dRow;
        newCol += dCol;
      }
    }
    
    return moves;
  };

  const getQueenMoves = (row, col, color) => {
    return [...getRookMoves(row, col, color), ...getBishopMoves(row, col, color)];
  };

  const getKingMoves = (row, col, color) => {
    const moves = [];
    const kingMoves = [
      [-1, -1], [-1, 0], [-1, 1],
      [0, -1], [0, 1],
      [1, -1], [1, 0], [1, 1]
    ];
    
    for (let [dRow, dCol] of kingMoves) {
      const newRow = row + dRow;
      const newCol = col + dCol;
      
      if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
        const targetPiece = gameState.board[newRow][newCol];
        if (!targetPiece || targetPiece[0] !== color) {
          moves.push({ row: newRow, col: newCol, type: targetPiece ? 'capture' : 'normal' });
        }
      }
    }
    
    // Castling
    const castlingRights = gameState.castlingRights[color === 'w' ? 'white' : 'black'];
    
    if (castlingRights.kingside && canCastleKingside(row, col, color)) {
      moves.push({ row, col: col + 2, type: 'castling', castlingType: 'kingside' });
    }
    
    if (castlingRights.queenside && canCastleQueenside(row, col, color)) {
      moves.push({ row, col: col - 2, type: 'castling', castlingType: 'queenside' });
    }
    
    return moves;
  };

  const canCastleKingside = (row, col, color) => {
    const rookCol = 7;
    const kingPiece = gameState.board[row][col];
    const rookPiece = gameState.board[row][rookCol];
    
    if (kingPiece !== color + 'k' || rookPiece !== color + 'r') {
      return false;
    }
    
    // Check if squares between king and rook are empty
    for (let c = col + 1; c < rookCol; c++) {
      if (gameState.board[row][c] !== '') {
        return false;
      }
    }
    
    // Check if king is not in check and squares are not under attack
    if (isSquareUnderAttack(row, col, color === 'w' ? 'b' : 'w', gameState.board)) {
      return false;
    }
    
    for (let c = col + 1; c <= col + 2; c++) {
      if (isSquareUnderAttack(row, c, color === 'w' ? 'b' : 'w', gameState.board)) {
        return false;
      }
    }
    
    return true;
  };

  const canCastleQueenside = (row, col, color) => {
    const rookCol = 0;
    const kingPiece = gameState.board[row][col];
    const rookPiece = gameState.board[row][rookCol];
    
    if (kingPiece !== color + 'k' || rookPiece !== color + 'r') {
      return false;
    }
    
    // Check if squares between king and rook are empty
    for (let c = col - 1; c > rookCol; c--) {
      if (gameState.board[row][c] !== '') {
        return false;
      }
    }
    
    // Check if king is not in check and squares are not under attack
    if (isSquareUnderAttack(row, col, color === 'w' ? 'b' : 'w', gameState.board)) {
      return false;
    }
    
    for (let c = col - 1; c >= col - 2; c--) {
      if (isSquareUnderAttack(row, c, color === 'w' ? 'b' : 'w', gameState.board)) {
        return false;
      }
    }
    
    return true;
  };

  const isSquareUnderAttack = (row, col, attackingColor, board) => {
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = board[r][c];
        if (piece && piece[0] === attackingColor) {
          const moves = getValidMovesForPiece(r, c, piece, board);
          for (let move of moves) {
            if (move.row === row && move.col === col) {
              return true;
            }
          }
        }
      }
    }
    return false;
  };

  const getValidMovesForPiece = (row, col, piece, board) => {
    const color = piece[0];
    const pieceType = piece[1];
    
    switch (pieceType) {
      case 'p':
        return getPawnMoves(row, col, color);
      case 'r':
        return getRookMoves(row, col, color);
      case 'n':
        return getKnightMoves(row, col, color);
      case 'b':
        return getBishopMoves(row, col, color);
      case 'q':
        return getQueenMoves(row, col, color);
      case 'k':
        return getKingMoves(row, col, color);
      default:
        return [];
    }
  };

  const wouldBeInCheck = (fromRow, fromCol, toRow, toCol) => {
    const tempBoard = gameState.board.map(row => [...row]);
    const piece = tempBoard[fromRow][fromCol];
    tempBoard[toRow][toCol] = piece;
    tempBoard[fromRow][fromCol] = '';
    
    const color = piece[0];
    let kingRow, kingCol;
    
    // Find the king in the temporary board
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        if (tempBoard[row][col] === color + 'k') {
          kingRow = row;
          kingCol = col;
          break;
        }
      }
      if (kingRow !== undefined) break;
    }
    
    // If king not found, something is wrong
    if (kingRow === undefined || kingCol === undefined) {
      return false;
    }
    
    const opponentColor = color === 'w' ? 'b' : 'w';
    return isSquareUnderAttack(kingRow, kingCol, opponentColor, tempBoard);
  };

  const handleSquareClick = (row, col) => {
    if (gameState.gameStatus !== 'playing') return;
    
    const piece = gameState.board[row][col];
    const currentColor = gameState.currentPlayer === 'white' ? 'w' : 'b';
    
    // If clicking on a piece of the current player's color
    if (piece && piece[0] === currentColor) {
      const validMoves = getValidMoves(row, col);
      setGameState(prev => ({
        ...prev,
        selectedSquare: { row, col },
        validMoves
      }));
    }
    // If a piece is selected and clicking on a valid move
    else if (gameState.selectedSquare) {
      const isValidMove = gameState.validMoves.some(move => 
        move.row === row && move.col === col
      );
      
      if (isValidMove) {
        makeMove(gameState.selectedSquare.row, gameState.selectedSquare.col, row, col);
      }
      
      setGameState(prev => ({
        ...prev,
        selectedSquare: null,
        validMoves: []
      }));
    }
  };

  const makeMove = (fromRow, fromCol, toRow, toCol) => {
    const newBoard = gameState.board.map(row => [...row]);
    const piece = newBoard[fromRow][fromCol];
    const capturedPiece = newBoard[toRow][toCol];
    
    // Find the move type
    const validMoves = getValidMoves(fromRow, fromCol);
    const moveInfo = validMoves.find(move => move.row === toRow && move.col === toCol);
    
    // Handle pawn promotion
    if (piece[1] === 'p' && (toRow === 0 || toRow === 7)) {
      setPromotionMove({ fromRow, fromCol, toRow, toCol, piece });
      setShowPromotion(true);
      return;
    }
    
    // Handle castling
    if (moveInfo && moveInfo.type === 'castling') {
      const rookFromCol = moveInfo.castlingType === 'kingside' ? 7 : 0;
      const rookToCol = moveInfo.castlingType === 'kingside' ? toCol - 1 : toCol + 1;
      const rookPiece = newBoard[fromRow][rookFromCol];
      
      newBoard[toRow][toCol] = piece;
      newBoard[fromRow][fromCol] = '';
      newBoard[fromRow][rookToCol] = rookPiece;
      newBoard[fromRow][rookFromCol] = '';
    }
    // Handle en passant
    else if (moveInfo && moveInfo.type === 'enpassant') {
      const capturedPawnRow = fromRow;
      const capturedPawnCol = toCol;
      
      newBoard[toRow][toCol] = piece;
      newBoard[fromRow][fromCol] = '';
      newBoard[capturedPawnRow][capturedPawnCol] = '';
    }
    // Normal move
    else {
      newBoard[toRow][toCol] = piece;
      newBoard[fromRow][fromCol] = '';
    }
    
    // Update castling rights
    const newCastlingRights = { ...gameState.castlingRights };
    if (piece[1] === 'k') {
      const color = piece[0] === 'w' ? 'white' : 'black';
      newCastlingRights[color] = { kingside: false, queenside: false };
    } else if (piece[1] === 'r') {
      const color = piece[0] === 'w' ? 'white' : 'black';
      if (fromCol === 0) {
        newCastlingRights[color].queenside = false;
      } else if (fromCol === 7) {
        newCastlingRights[color].kingside = false;
      }
    }
    
    // Update en passant target
    let newEnPassantTarget = null;
    if (piece[1] === 'p' && moveInfo && moveInfo.type === 'double') {
      newEnPassantTarget = [fromRow + (piece[0] === 'w' ? -1 : 1), fromCol];
    }
    
    // Update captured pieces
    const newCapturedPieces = { ...gameState.capturedPieces };
    if (capturedPiece) {
      const color = gameState.currentPlayer;
      newCapturedPieces[color] = [...newCapturedPieces[color], capturedPiece];
    }
    
    const move = {
      from: `${String.fromCharCode(97 + fromCol)}${8 - fromRow}`,
      to: `${String.fromCharCode(97 + toCol)}${8 - toRow}`,
      piece: piece[1],
      captured: capturedPiece ? capturedPiece[1] : null,
      type: moveInfo ? moveInfo.type : 'normal',
      castlingType: moveInfo ? moveInfo.castlingType : null,
      timestamp: Date.now()
    };
    
    const newCurrentPlayer = gameState.currentPlayer === 'white' ? 'black' : 'white';
    
    setGameState(prev => ({
      ...prev,
      board: newBoard,
      currentPlayer: newCurrentPlayer,
      selectedSquare: null,
      validMoves: [],
      capturedPieces: newCapturedPieces,
      moveHistory: [...prev.moveHistory, move],
      castlingRights: newCastlingRights,
      enPassantTarget: newEnPassantTarget,
      lastMove: { fromRow, fromCol, toRow, toCol }
    }));
    
    // Check game end conditions
    checkGameEnd(newBoard, newCurrentPlayer);
    
    // Send move to server
    if (socket) {
      socket.emit('game_move', {
        session_id: sessionId,
        move: move,
        user_id: user.id
      });
    }
  };

  const handlePromotion = (promotionPiece) => {
    if (!promotionMove) return;
    
    const { fromRow, fromCol, toRow, toCol, piece } = promotionMove;
    const newBoard = gameState.board.map(row => [...row]);
    
    const promotedPiece = piece[0] + promotionPiece;
    newBoard[toRow][toCol] = promotedPiece;
    newBoard[fromRow][fromCol] = '';
    
    const move = {
      from: `${String.fromCharCode(97 + fromCol)}${8 - fromRow}`,
      to: `${String.fromCharCode(97 + toCol)}${8 - toRow}`,
      piece: piece[1],
      promotion: promotionPiece,
      timestamp: Date.now()
    };
    
    const newCurrentPlayer = gameState.currentPlayer === 'white' ? 'black' : 'white';
    
    setGameState(prev => ({
      ...prev,
      board: newBoard,
      currentPlayer: newCurrentPlayer,
      moveHistory: [...prev.moveHistory, move],
      lastMove: { fromRow, fromCol, toRow, toCol }
    }));
    
    setShowPromotion(false);
    setPromotionMove(null);
    
    checkGameEnd(newBoard, newCurrentPlayer);
    
    if (socket) {
      socket.emit('game_move', {
        session_id: sessionId,
        move: move,
        user_id: user.id
      });
    }
  };

  const handleOpponentMove = (data) => {
    const move = data.move;
    
    // Ignore moves made by the current user to prevent double application
    if (data.user_id === user.id) {
      return;
    }
    
    const fromCol = move.from.charCodeAt(0) - 97;
    const fromRow = 8 - parseInt(move.from[1]);
    const toCol = move.to.charCodeAt(0) - 97;
    const toRow = 8 - parseInt(move.to[1]);
    
    const newBoard = gameState.board.map(row => [...row]);
    const piece = newBoard[fromRow][fromCol];
    
    // Handle castling
    if (move.type === 'castling') {
      const rookFromCol = move.castlingType === 'kingside' ? 7 : 0;
      const rookToCol = move.castlingType === 'kingside' ? toCol - 1 : toCol + 1;
      const rookPiece = newBoard[fromRow][rookFromCol];
      
      newBoard[toRow][toCol] = piece;
      newBoard[fromRow][fromCol] = '';
      newBoard[fromRow][rookToCol] = rookPiece;
      newBoard[fromRow][rookFromCol] = '';
    }
    // Handle en passant
    else if (move.type === 'enpassant') {
      const capturedPawnRow = fromRow;
      const capturedPawnCol = toCol;
      
      newBoard[toRow][toCol] = piece;
      newBoard[fromRow][fromCol] = '';
      newBoard[capturedPawnRow][capturedPawnCol] = '';
    }
    // Handle promotion
    else if (move.promotion) {
      newBoard[toRow][toCol] = piece[0] + move.promotion;
      newBoard[fromRow][fromCol] = '';
    }
    // Normal move
    else {
      newBoard[toRow][toCol] = piece;
      newBoard[fromRow][fromCol] = '';
    }
    
    // Update castling rights
    const newCastlingRights = { ...gameState.castlingRights };
    if (piece[1] === 'k') {
      const color = piece[0] === 'w' ? 'white' : 'black';
      newCastlingRights[color] = { kingside: false, queenside: false };
    } else if (piece[1] === 'r') {
      const color = piece[0] === 'w' ? 'white' : 'black';
      if (fromCol === 0) {
        newCastlingRights[color].queenside = false;
      } else if (fromCol === 7) {
        newCastlingRights[color].kingside = false;
      }
    }
    
    // Update en passant target
    let newEnPassantTarget = null;
    if (piece[1] === 'p' && move.type === 'double') {
      newEnPassantTarget = [fromRow + (piece[0] === 'w' ? -1 : 1), fromCol];
    }
    
    // Update captured pieces
    const newCapturedPieces = { ...gameState.capturedPieces };
    if (move.captured) {
      const capturedPiece = piece[0] === 'w' ? 'b' + move.captured : 'w' + move.captured;
      const color = gameState.currentPlayer === 'white' ? 'black' : 'white';
      newCapturedPieces[color] = [...newCapturedPieces[color], capturedPiece];
    }
    
    const newCurrentPlayer = gameState.currentPlayer === 'white' ? 'black' : 'white';
    
    setGameState(prev => ({
      ...prev,
      board: newBoard,
      currentPlayer: newCurrentPlayer,
      selectedSquare: null,
      validMoves: [],
      capturedPieces: newCapturedPieces,
      moveHistory: [...prev.moveHistory, move],
      castlingRights: newCastlingRights,
      enPassantTarget: newEnPassantTarget,
      lastMove: { fromRow, fromCol, toRow, toCol }
    }));
    
    checkGameEnd(newBoard, newCurrentPlayer);
  };

  const checkGameEnd = (board, currentPlayer) => {
    const color = currentPlayer === 'white' ? 'w' : 'b';
    const opponentColor = color === 'w' ? 'b' : 'w';
    
    // Find the king
    let kingRow, kingCol;
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        if (board[row][col] === color + 'k') {
          kingRow = row;
          kingCol = col;
          break;
        }
      }
    }
    
    // Check if king is in check
    const isInCheck = isSquareUnderAttack(kingRow, kingCol, opponentColor, board);
    
    // Check if any legal moves exist
    const hasLegalMoves = hasAnyLegalMoves(color, board);
    
    if (isInCheck && !hasLegalMoves) {
      setGameState(prev => ({
        ...prev,
        gameStatus: 'checkmate',
        isCheckmate: true
      }));
      toast.success(`Checkmate! ${currentPlayer === 'white' ? 'Black' : 'White'} wins!`);
    } else if (!isInCheck && !hasLegalMoves) {
      setGameState(prev => ({
        ...prev,
        gameStatus: 'stalemate',
        isStalemate: true
      }));
      toast.info('Stalemate! The game is a draw.');
    } else if (isInCheck) {
      setGameState(prev => ({
        ...prev,
        isCheck: true
      }));
      toast.warning('Check!');
    } else {
      setGameState(prev => ({
        ...prev,
        isCheck: false
      }));
    }
  };

  const hasAnyLegalMoves = (color, board) => {
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = board[row][col];
        if (piece && piece[0] === color) {
          const moves = getValidMovesForPiece(row, col, piece, board);
          for (let move of moves) {
            // Create a temporary board to check if this move would leave king in check
            const tempBoard = board.map(row => [...row]);
            const pieceToMove = tempBoard[row][col];
            tempBoard[move.row][move.col] = pieceToMove;
            tempBoard[row][col] = '';
            
            // Find the king in the temporary board
            let kingRow, kingCol;
            for (let r = 0; r < 8; r++) {
              for (let c = 0; c < 8; c++) {
                if (tempBoard[r][c] === color + 'k') {
                  kingRow = r;
                  kingCol = c;
                  break;
                }
              }
              if (kingRow !== undefined) break;
            }
            
            // If king not found, something is wrong
            if (kingRow === undefined || kingCol === undefined) {
              continue;
            }
            
            // Check if king would be in check after this move
            const opponentColor = color === 'w' ? 'b' : 'w';
            if (!isSquareUnderAttack(kingRow, kingCol, opponentColor, tempBoard)) {
              return true;
            }
          }
        }
      }
    }
    return false;
  };

  const handleTimeUp = () => {
    setGameState(prev => ({
      ...prev,
      gameStatus: 'completed'
    }));
    toast.error('Time\'s up!');
    onComplete && onComplete({ is_correct: false, score: 0 });
  };

  const handlePause = () => {
    setGameState(prev => ({
      ...prev,
      gameStatus: prev.gameStatus === 'playing' ? 'paused' : 'playing'
    }));
  };

  const handleReset = () => {
    setGameState(prev => ({
      ...prev,
      board: INITIAL_BOARD,
      currentPlayer: 'white',
      gameStatus: 'playing',
      timeRemaining: levelData.time_limit || 600,
      selectedSquare: null,
      validMoves: [],
      isCheck: false,
      isCheckmate: false,
      isStalemate: false,
      capturedPieces: { white: [], black: [] },
      moveHistory: [],
      castlingRights: { white: { kingside: true, queenside: true }, black: { kingside: true, queenside: true } },
      enPassantTarget: null,
      lastMove: null
    }));
  };

  const sendChatMessage = () => {
    if (!newMessage.trim()) return;

    if (socket) {
      socket.emit('chat_message', {
        session_id: sessionId,
        message: newMessage,
        user_id: user.id
      });
    }

    setNewMessage('');
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const renderChessBoard = () => {
    return (
      <div className="grid grid-cols-8 gap-0 bg-gray-800 p-4 rounded-lg">
        {Array.from({ length: 64 }, (_, i) => {
          const row = Math.floor(i / 8);
          const col = i % 8;
          const isLight = (row + col) % 2 === 0;
          const piece = gameState.board[row][col];
          const isSelected = gameState.selectedSquare && 
            gameState.selectedSquare.row === row && 
            gameState.selectedSquare.col === col;
          const isValidMove = gameState.validMoves.some(move => 
            move.row === row && move.col === col
          );
          const isLastMove = gameState.lastMove && 
            ((gameState.lastMove.fromRow === row && gameState.lastMove.fromCol === col) ||
             (gameState.lastMove.toRow === row && gameState.lastMove.toCol === col));
          
          return (
            <div
              key={i}
              className={`w-16 h-16 flex items-center justify-center text-3xl cursor-pointer transition-all relative ${
                isLight ? 'bg-yellow-100' : 'bg-yellow-800'
              } ${
                isSelected ? 'ring-4 ring-blue-500' : ''
              } ${
                isValidMove ? 'ring-2 ring-green-500' : ''
              } ${
                isLastMove ? 'bg-yellow-300' : ''
              } hover:bg-yellow-200`}
              onClick={() => handleSquareClick(row, col)}
            >
              {piece && (
                <span className={`${piece[0] === 'w' ? 'text-white' : 'text-black'} drop-shadow-lg`}>
                  {getPieceSymbol(piece)}
                </span>
              )}
              
              {/* Square coordinates */}
              {row === 7 && (
                <span className="absolute bottom-1 right-1 text-xs text-gray-600">
                  {String.fromCharCode(97 + col)}
                </span>
              )}
              {col === 0 && (
                <span className="absolute top-1 left-1 text-xs text-gray-600">
                  {8 - row}
                </span>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-blue-600 p-3 rounded-lg">
                <Crown className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">{gameData.name}</h1>
                <p className="text-blue-200">{levelData.title}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Timer */}
              <div className="bg-red-600/20 backdrop-blur-lg rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-red-400" />
                  <span className="text-xl font-mono text-red-400">
                    {formatTime(gameState.timeRemaining)}
                  </span>
                </div>
              </div>

              {/* Game Status */}
              {gameState.isCheck && (
                <div className="bg-yellow-600/20 backdrop-blur-lg rounded-lg p-3">
                  <span className="text-yellow-400 font-semibold">CHECK!</span>
                </div>
              )}
              
              {gameState.isCheckmate && (
                <div className="bg-red-600/20 backdrop-blur-lg rounded-lg p-3">
                  <span className="text-red-400 font-semibold">CHECKMATE!</span>
                </div>
              )}

              {/* Controls */}
              <div className="flex space-x-2">
                <button
                  onClick={handlePause}
                  className="bg-blue-600 hover:bg-blue-700 p-2 rounded-lg transition-colors"
                >
                  {gameState.gameStatus === 'playing' ? (
                    <Pause className="w-5 h-5 text-white" />
                  ) : (
                    <Play className="w-5 h-5 text-white" />
                  )}
                </button>
                <button
                  onClick={handleReset}
                  className="bg-yellow-600 hover:bg-yellow-700 p-2 rounded-lg transition-colors"
                >
                  <RotateCcw className="w-5 h-5 text-white" />
                </button>
                <button
                  onClick={() => setShowChat(!showChat)}
                  className="bg-green-600 hover:bg-green-700 p-2 rounded-lg transition-colors"
                >
                  <MessageSquare className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Game Board */}
          <div className="lg:col-span-2">
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-white">Chess Board</h2>
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${gameState.currentPlayer === 'white' ? 'bg-white' : 'bg-black'}`}></div>
                  <span className="text-white text-sm">
                    {gameState.currentPlayer === 'white' ? 'White\'s Turn' : 'Black\'s Turn'}
                  </span>
                </div>
              </div>
              
              <div className="flex justify-center">
                {renderChessBoard()}
              </div>

              {/* Captured Pieces */}
              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="bg-white/10 backdrop-blur-lg rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-white mb-2">Captured by White</h3>
                  <div className="flex flex-wrap gap-2">
                    {gameState.capturedPieces.white.map((piece, index) => (
                      <span key={index} className="text-2xl text-white">
                        {getPieceSymbol(piece)}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="bg-white/10 backdrop-blur-lg rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-white mb-2">Captured by Black</h3>
                  <div className="flex flex-wrap gap-2">
                    {gameState.capturedPieces.black.map((piece, index) => (
                      <span key={index} className="text-2xl text-black">
                        {getPieceSymbol(piece)}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Game Info */}
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Game Info</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-blue-200">Current Player:</span>
                  <span className="text-white font-semibold capitalize">{gameState.currentPlayer}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-200">Moves:</span>
                  <span className="text-white font-semibold">{gameState.moveHistory.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-200">Status:</span>
                  <span className="text-white font-semibold capitalize">{gameState.gameStatus}</span>
                </div>
              </div>
            </div>

            {/* Move History */}
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Move History</h3>
              <div className="max-h-48 overflow-y-auto space-y-2">
                {gameState.moveHistory.map((move, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span className="text-blue-200">{Math.floor(index / 2) + 1}.</span>
                    <span className="text-white">
                      {move.piece.toUpperCase()} {move.from} → {move.to}
                      {move.promotion && `=${move.promotion.toUpperCase()}`}
                    </span>
                  </div>
                ))}
                {gameState.moveHistory.length === 0 && (
                  <p className="text-blue-200 text-sm">No moves yet</p>
                )}
              </div>
            </div>

            {/* Chat */}
            {showChat && (
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Chat</h3>
                <div className="max-h-48 overflow-y-auto space-y-2 mb-4">
                  {chatMessages.map((msg, index) => (
                    <div key={index} className="text-sm">
                      <span className="text-green-400 font-semibold">{msg.user_name}:</span>
                      <span className="text-white ml-2">{msg.message}</span>
                    </div>
                  ))}
                </div>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                    placeholder="Type a message..."
                    className="flex-1 bg-white/20 text-white placeholder-blue-200 rounded-lg px-3 py-2 text-sm"
                  />
                  <button
                    onClick={sendChatMessage}
                    className="bg-blue-600 hover:bg-blue-700 p-2 rounded-lg transition-colors"
                  >
                    <Send className="w-4 h-4 text-white" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Pawn Promotion Modal */}
      {showPromotion && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Choose Promotion Piece</h3>
            <div className="flex space-x-4">
              {['q', 'r', 'b', 'n'].map((piece) => (
                <button
                  key={piece}
                  onClick={() => handlePromotion(piece)}
                  className="w-12 h-12 text-3xl border-2 border-gray-300 rounded hover:border-blue-500"
                >
                  {getPieceSymbol('w' + piece)}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChessGame; 