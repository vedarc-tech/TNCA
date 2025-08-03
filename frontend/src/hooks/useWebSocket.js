import { useEffect, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import { toast } from 'react-hot-toast';
import { sessionManager } from '../utils/sessionManager';

const useWebSocket = () => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [gameSession, setGameSession] = useState(null);
  const [tournamentSession, setTournamentSession] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const socketRef = useRef(null);

  // Initialize WebSocket connection
  useEffect(() => {
    // Get user and token from session storage
    const user = sessionManager.getCurrentUser();
    const token = sessionManager.getAccessToken();
    
    if (!user?.id || !token) return;

    const newSocket = io('http://localhost:5000', {
      auth: {
        token: token
      }
    });

    socketRef.current = newSocket;
    setSocket(newSocket);

    // Connection events
    newSocket.on('connect', () => {
      console.log('Connected to WebSocket server');
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from WebSocket server');
      setIsConnected(false);
    });

    newSocket.on('connected', (data) => {
      console.log('WebSocket connection established:', data);
    });

    // Game events
    newSocket.on('joined_session', (data) => {
      console.log('Joined game session:', data);
      setGameSession(data);
    });

    newSocket.on('left_session', (data) => {
      console.log('Left game session:', data);
      setGameSession(null);
    });

    newSocket.on('game_move_update', (data) => {
      console.log('Game move update:', data);
      // Handle game move update
    });

    newSocket.on('game_solution_result', (data) => {
      console.log('Game solution result:', data);
      if (data.result.is_correct) {
        toast.success(`Solution correct! Score: ${data.result.score}`);
      } else {
        toast.error('Incorrect solution. Try again!');
      }
    });

    newSocket.on('game_error', (data) => {
      console.error('Game error:', data);
      toast.error(data.error);
    });

    // Tournament events
    newSocket.on('joined_tournament', (data) => {
      console.log('Joined tournament:', data);
      setTournamentSession(data);
    });

    newSocket.on('left_tournament', (data) => {
      console.log('Left tournament:', data);
      setTournamentSession(null);
    });

    newSocket.on('tournament_update', (data) => {
      console.log('Tournament update:', data);
      toast.success('Tournament updated!');
    });

    newSocket.on('tournament_completed', (data) => {
      console.log('Tournament completed:', data);
      toast.success(`Tournament completed! Winner: ${data.winner_id}`);
    });

    newSocket.on('tournament_error', (data) => {
      console.error('Tournament error:', data);
      toast.error(data.error);
    });

    // Chat events
    newSocket.on('chat_message', (data) => {
      console.log('Chat message:', data);
      setChatMessages(prev => [...prev, data]);
    });

    // Leaderboard events
    newSocket.on('leaderboard_update', (data) => {
      console.log('Leaderboard update:', data);
      // Handle leaderboard update
    });

    // Notification events
    newSocket.on('notification', (data) => {
      console.log('Notification:', data);
      setNotifications(prev => [...prev, data]);
      toast(data.message, {
        icon: data.type === 'success' ? '✅' : data.type === 'error' ? '❌' : 'ℹ️'
      });
    });

    // Achievement events
    newSocket.on('achievement_unlocked', (data) => {
      console.log('Achievement unlocked:', data);
      toast.success(`🎉 Achievement Unlocked: ${data.title}!`);
    });

    return () => {
      if (newSocket) {
        newSocket.disconnect();
      }
    };
  }, []);

  // Join game session
  const joinGameSession = useCallback((sessionData) => {
    if (socket && isConnected) {
      socket.emit('join_game_session', sessionData);
    }
  }, [socket, isConnected]);

  // Leave game session
  const leaveGameSession = useCallback((sessionData) => {
    if (socket && isConnected) {
      socket.emit('leave_game_session', sessionData);
    }
  }, [socket, isConnected]);

  // Submit game move
  const submitGameMove = useCallback((moveData) => {
    if (socket && isConnected) {
      socket.emit('game_move', moveData);
    }
  }, [socket, isConnected]);

  // Submit game solution
  const submitGameSolution = useCallback((solutionData) => {
    if (socket && isConnected) {
      socket.emit('game_solution_submit', solutionData);
    }
  }, [socket, isConnected]);

  // Join tournament
  const joinTournament = useCallback((tournamentData) => {
    if (socket && isConnected) {
      socket.emit('join_tournament', tournamentData);
    }
  }, [socket, isConnected]);

  // Leave tournament
  const leaveTournament = useCallback((tournamentData) => {
    if (socket && isConnected) {
      socket.emit('leave_tournament', tournamentData);
    }
  }, [socket, isConnected]);

  // Update tournament match
  const updateTournamentMatch = useCallback((matchData) => {
    if (socket && isConnected) {
      socket.emit('tournament_match_update', matchData);
    }
  }, [socket, isConnected]);

  // Send chat message
  const sendChatMessage = useCallback((messageData) => {
    if (socket && isConnected) {
      socket.emit('chat_message', messageData);
    }
  }, [socket, isConnected]);

  // Clear chat messages
  const clearChatMessages = useCallback(() => {
    setChatMessages([]);
  }, []);

  // Clear notifications
  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  return {
    socket,
    isConnected,
    gameSession,
    tournamentSession,
    chatMessages,
    notifications,
    joinGameSession,
    leaveGameSession,
    submitGameMove,
    submitGameSolution,
    joinTournament,
    leaveTournament,
    updateTournamentMatch,
    sendChatMessage,
    clearChatMessages,
    clearNotifications
  };
};

export default useWebSocket; 