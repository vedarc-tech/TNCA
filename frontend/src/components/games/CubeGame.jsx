import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { 
  Box, 
  Clock, 
  Target, 
  Trophy, 
  MessageSquare, 
  Send,
  RotateCcw,
  Play,
  Pause,
  Eye,
  EyeOff,
  Timer,
  Zap
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const CubeGame = ({ gameData, levelData, onComplete, onExit }) => {
  const [socket, setSocket] = useState(null);
  const [gameState, setGameState] = useState({
    cubeState: null,
    gameStatus: 'playing', // playing, completed, paused
    timeRemaining: levelData?.time_limit || 600,
    elapsedTime: 0,
    moves: [],
    isScrambled: false,
    isSolved: false
  });
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [showChat, setShowChat] = useState(false);
  const [timer, setTimer] = useState(null);
  const [sessionId] = useState(`cube_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const [showSolution, setShowSolution] = useState(false);
  const [scrambleSequence, setScrambleSequence] = useState([]);
  const cubeRef = useRef(null);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    // Initialize WebSocket connection
    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);

    // Socket event handlers
    newSocket.on('connect', () => {
      console.log('Connected to cube game server');
      newSocket.emit('join_game_session', {
        session_id: sessionId,
        user_id: user.id,
        game_id: gameData.id,
        level_id: levelData.id
      });
    });

    newSocket.on('joined_session', (data) => {
      console.log('Joined cube game session:', data);
      initializeCube();
    });

    newSocket.on('game_move_update', (data) => {
      handleOpponentMove(data.move);
    });

    newSocket.on('game_solution_result', (data) => {
      handleGameResult(data.result);
    });

    newSocket.on('chat_message', (data) => {
      setChatMessages(prev => [...prev, data]);
    });

    newSocket.on('game_error', (data) => {
      toast.error(data.error);
    });

    return () => {
      if (newSocket) {
        newSocket.emit('leave_game_session', { session_id: sessionId });
        newSocket.disconnect();
      }
    };
  }, []);

  useEffect(() => {
    // Timer countdown and elapsed time
    if (gameState.gameStatus === 'playing') {
      const interval = setInterval(() => {
        setGameState(prev => ({
          ...prev,
          timeRemaining: Math.max(0, prev.timeRemaining - 1),
          elapsedTime: prev.elapsedTime + 1
        }));
      }, 1000);
      setTimer(interval);

      return () => clearInterval(interval);
    }
  }, [gameState.gameStatus]);

  useEffect(() => {
    if (gameState.timeRemaining <= 0) {
      handleTimeUp();
    }
  }, [gameState.timeRemaining]);

  const initializeCube = () => {
    // Initialize cube state based on level data
    const cubeType = levelData.cube_type || '3x3';
    const initialState = generateCubeState(cubeType);
    const scramble = generateScramble(cubeType);
    
    setGameState(prev => ({
      ...prev,
      cubeState: initialState,
      scrambleSequence: scramble,
      timeRemaining: levelData.time_limit || 600
    }));
  };

  const generateCubeState = (cubeType) => {
    // Generate solved cube state
    const size = parseInt(cubeType.split('x')[0]);
    const faces = ['U', 'D', 'F', 'B', 'L', 'R'];
    const colors = ['white', 'yellow', 'red', 'orange', 'blue', 'green'];
    
    const state = {};
    faces.forEach((face, index) => {
      state[face] = Array(size * size).fill(colors[index]);
    });
    
    return state;
  };

  const generateScramble = (cubeType) => {
    // Generate scramble sequence
    const moves = ['U', 'D', 'F', 'B', 'L', 'R'];
    const modifiers = ['', "'", '2'];
    const sequence = [];
    
    for (let i = 0; i < 20; i++) {
      const move = moves[Math.floor(Math.random() * moves.length)];
      const modifier = modifiers[Math.floor(Math.random() * modifiers.length)];
      sequence.push(move + modifier);
    }
    
    return sequence;
  };

  const handleCubeMove = (move) => {
    if (gameState.gameStatus !== 'playing') return;

    const newMoves = [...gameState.moves, move];
    const newCubeState = applyMove(gameState.cubeState, move);
    
    setGameState(prev => ({
      ...prev,
      cubeState: newCubeState,
      moves: newMoves
    }));

    // Send move to server
    if (socket) {
      socket.emit('game_move', {
        session_id: sessionId,
        move: move,
        user_id: user.id
      });
    }

    // Check if cube is solved
    if (isCubeSolved(newCubeState)) {
      handleCubeSolved();
    }
  };

  const applyMove = (cubeState, move) => {
    // Apply move to cube state
    // This would implement actual cube move logic
    return cubeState; // Simplified for now
  };

  const isCubeSolved = (cubeState) => {
    // Check if cube is in solved state
    // This would check all faces for uniform colors
    return false; // Simplified for now
  };

  const handleCubeSolved = () => {
    const timeTaken = gameState.elapsedTime;
    
    // Submit solution to server
    if (socket) {
      socket.emit('game_solution_submit', {
        session_id: sessionId,
        solution: gameState.moves,
        time_taken: timeTaken,
        user_id: user.id
      });
    }

    setGameState(prev => ({
      ...prev,
      gameStatus: 'completed',
      isSolved: true
    }));
  };

  const handleGameResult = (result) => {
    if (result.is_correct) {
      toast.success(`Cube solved! Time: ${formatTime(result.time_taken)}`);
      onComplete && onComplete(result);
    } else {
      toast.error('Incorrect solution. Try again!');
      setGameState(prev => ({
        ...prev,
        gameStatus: 'playing'
      }));
    }
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
    initializeCube();
    setGameState(prev => ({
      ...prev,
      gameStatus: 'playing',
      timeRemaining: levelData.time_limit || 600,
      elapsedTime: 0,
      moves: [],
      isSolved: false
    }));
  };

  const handleScramble = () => {
    // Apply scramble sequence
    let newState = gameState.cubeState;
    scrambleSequence.forEach(move => {
      newState = applyMove(newState, move);
    });
    
    setGameState(prev => ({
      ...prev,
      cubeState: newState,
      isScrambled: true,
      moves: []
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
    const ms = Math.floor((seconds % 1) * 100);
    return `${mins}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
  };

  const renderCube = () => {
    // Render 3D cube visualization
    return (
      <div className="relative w-64 h-64 mx-auto">
        {/* 3D Cube Container */}
        <div className="relative w-full h-full transform-style-preserve-3d">
          {/* Front Face */}
          <div className="absolute w-64 h-64 bg-red-500 border-2 border-red-700 transform translateZ-32">
            <div className="grid grid-cols-3 gap-1 p-2">
              {Array.from({ length: 9 }, (_, i) => (
                <div key={i} className="w-16 h-16 bg-red-400 border border-red-600"></div>
              ))}
            </div>
          </div>
          
          {/* Back Face */}
          <div className="absolute w-64 h-64 bg-orange-500 border-2 border-orange-700 transform translateZ-neg32 rotateY-180">
            <div className="grid grid-cols-3 gap-1 p-2">
              {Array.from({ length: 9 }, (_, i) => (
                <div key={i} className="w-16 h-16 bg-orange-400 border border-orange-600"></div>
              ))}
            </div>
          </div>
          
          {/* Top Face */}
          <div className="absolute w-64 h-64 bg-white border-2 border-gray-700 transform translateY-neg32 rotateX-90">
            <div className="grid grid-cols-3 gap-1 p-2">
              {Array.from({ length: 9 }, (_, i) => (
                <div key={i} className="w-16 h-16 bg-gray-100 border border-gray-300"></div>
              ))}
            </div>
          </div>
          
          {/* Bottom Face */}
          <div className="absolute w-64 h-64 bg-yellow-500 border-2 border-yellow-700 transform translateY-32 rotateX-neg90">
            <div className="grid grid-cols-3 gap-1 p-2">
              {Array.from({ length: 9 }, (_, i) => (
                <div key={i} className="w-16 h-16 bg-yellow-400 border border-yellow-600"></div>
              ))}
            </div>
          </div>
          
          {/* Left Face */}
          <div className="absolute w-64 h-64 bg-green-500 border-2 border-green-700 transform translateX-neg32 rotateY-neg90">
            <div className="grid grid-cols-3 gap-1 p-2">
              {Array.from({ length: 9 }, (_, i) => (
                <div key={i} className="w-16 h-16 bg-green-400 border border-green-600"></div>
              ))}
            </div>
          </div>
          
          {/* Right Face */}
          <div className="absolute w-64 h-64 bg-blue-500 border-2 border-blue-700 transform translateX-32 rotateY-90">
            <div className="grid grid-cols-3 gap-1 p-2">
              {Array.from({ length: 9 }, (_, i) => (
                <div key={i} className="w-16 h-16 bg-blue-400 border border-blue-600"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderControls = () => {
    const moves = ['U', 'D', 'F', 'B', 'L', 'R'];
    const modifiers = ['', "'", '2'];
    
    return (
      <div className="grid grid-cols-6 gap-2">
        {moves.map(move => (
          <div key={move} className="space-y-1">
            <div className="text-center text-white font-semibold">{move}</div>
            {modifiers.map(mod => (
              <button
                key={mod}
                onClick={() => handleCubeMove(move + mod)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-1 rounded text-sm transition-colors"
              >
                {move}{mod}
              </button>
            ))}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-blue-900 to-purple-900 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-green-600 p-3 rounded-lg">
                <Box className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">{gameData.name}</h1>
                <p className="text-green-200">{levelData.title} - {levelData.cube_type}</p>
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

              {/* Elapsed Time */}
              <div className="bg-blue-600/20 backdrop-blur-lg rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <Timer className="w-5 h-5 text-blue-400" />
                  <span className="text-xl font-mono text-blue-400">
                    {formatTime(gameState.elapsedTime)}
                  </span>
                </div>
              </div>

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
                  onClick={handleScramble}
                  className="bg-purple-600 hover:bg-purple-700 p-2 rounded-lg transition-colors"
                >
                  <Zap className="w-5 h-5 text-white" />
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
          {/* Cube Display */}
          <div className="lg:col-span-2">
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-white">Cube Solver</h2>
                <div className="flex items-center space-x-2">
                  {gameState.isSolved && (
                    <div className="bg-green-600 px-3 py-1 rounded-full">
                      <span className="text-white text-sm font-semibold">SOLVED!</span>
                    </div>
                  )}
                  <button
                    onClick={() => setShowSolution(!showSolution)}
                    className="bg-gray-600 hover:bg-gray-700 p-2 rounded-lg transition-colors"
                  >
                    {showSolution ? <EyeOff className="w-5 h-5 text-white" /> : <Eye className="w-5 h-5 text-white" />}
                  </button>
                </div>
              </div>
              
              <div className="flex justify-center mb-6">
                {renderCube()}
              </div>

              {/* Cube Controls */}
              <div className="bg-blue-600/20 backdrop-blur-lg rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-4">Cube Controls</h3>
                {renderControls()}
              </div>

              {/* Scramble Sequence */}
              {showSolution && scrambleSequence.length > 0 && (
                <div className="mt-6 bg-yellow-600/20 backdrop-blur-lg rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-white mb-2">Scramble Sequence</h3>
                  <p className="text-yellow-200 font-mono">{scrambleSequence.join(' ')}</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Game Info */}
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Game Info</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-green-200">Cube Type:</span>
                  <span className="text-white font-semibold">{levelData.cube_type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-200">Difficulty:</span>
                  <span className="text-white font-semibold capitalize">{levelData.difficulty}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-200">Points:</span>
                  <span className="text-white font-semibold">{levelData.points}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-200">Moves:</span>
                  <span className="text-white font-semibold">{gameState.moves.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-200">Status:</span>
                  <span className={`font-semibold ${
                    gameState.isSolved ? 'text-green-400' : 
                    gameState.isScrambled ? 'text-yellow-400' : 'text-blue-400'
                  }`}>
                    {gameState.isSolved ? 'Solved' : 
                     gameState.isScrambled ? 'Scrambled' : 'Ready'}
                  </span>
                </div>
              </div>
            </div>

            {/* Move History */}
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Move History</h3>
              <div className="max-h-48 overflow-y-auto space-y-2">
                {gameState.moves.map((move, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span className="text-green-200">{index + 1}.</span>
                    <span className="text-white font-mono">{move}</span>
                  </div>
                ))}
                {gameState.moves.length === 0 && (
                  <p className="text-green-200 text-sm">No moves yet</p>
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
                    className="flex-1 bg-white/20 text-white placeholder-green-200 rounded-lg px-3 py-2 text-sm"
                  />
                  <button
                    onClick={sendChatMessage}
                    className="bg-green-600 hover:bg-green-700 p-2 rounded-lg transition-colors"
                  >
                    <Send className="w-4 h-4 text-white" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CubeGame; 