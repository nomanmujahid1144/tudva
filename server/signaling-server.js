// server/signaling-server.js
// ✅ FINAL VERSION - WebRTC signaling + Real-time chat

const http = require('http');
const { Server } = require('socket.io');

const PORT = process.env.SIGNALING_PORT || 3001;

const server = http.createServer();
const io = new Server(server, {
  cors: {
    origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Store active sessions
const activeSessions = new Map();
// Store room chat participants
const chatRooms = new Map();

io.on('connection', (socket) => {
  console.log('🔌 Client connected:', socket.id);

  // ============================================
  // WEBRTC SIGNALING EVENTS
  // ============================================

  socket.on('instructor-join', ({ sessionId, instructorId }) => {
    console.log('👨‍🏫 Instructor joining session:', sessionId);
    
    socket.join(sessionId);
    
    let session = activeSessions.get(sessionId);
    
    if (!session) {
      activeSessions.set(sessionId, {
        instructorId: socket.id,
        instructor: instructorId,
        students: new Set(),
        isBroadcasting: false,
        waitingStudents: new Set()
      });
    } else {
      session.instructorId = socket.id;
      session.instructor = instructorId;
      
      console.log('👨‍🏫 Instructor arrived, notifying', session.waitingStudents.size, 'waiting students');
      session.waitingStudents.forEach(studentSocketId => {
        io.to(studentSocketId).emit('instructor-arrived', {
          instructorId: socket.id
        });
      });
      
      const waitingStudentsList = Array.from(session.waitingStudents);
      socket.emit('waiting-students', {
        students: waitingStudentsList
      });
      console.log('📋 Sent', waitingStudentsList.length, 'waiting students to instructor');
      
      console.log('✅ Instructor joined session:', sessionId);
    }
  });

  socket.on('student-join', ({ sessionId, studentId }) => {
    console.log('🎓 Student joining session:', sessionId, '| Student:', studentId);
    
    socket.join(sessionId);
    
    let session = activeSessions.get(sessionId);
    
    if (!session) {
      console.log('⏳ Session not created yet, creating placeholder');
      activeSessions.set(sessionId, {
        instructorId: null,
        instructor: null,
        students: new Set(),
        isBroadcasting: false,
        waitingStudents: new Set()
      });
      session = activeSessions.get(sessionId);
    }
    
    session.students.add(socket.id);
    
    if (!session.instructorId) {
      console.log('⏳ Instructor not here yet, student will wait');
      session.waitingStudents.add(socket.id);
      
      socket.emit('instructor-info', {
        instructorId: null,
        isBroadcasting: false,
        waiting: true
      });
    } else {
      io.to(session.instructorId).emit('student-joined', {
        studentId: socket.id,
        studentInfo: studentId
      });
      
      socket.emit('instructor-info', {
        instructorId: session.instructorId,
        isBroadcasting: session.isBroadcasting
      });
      
      if (session.isBroadcasting) {
        console.log('📡 Instructor already broadcasting, notifying student');
        socket.emit('broadcast-started');
      }
    }
    
    console.log('✅ Student joined. Total students:', session.students.size);
  });

  socket.on('broadcast-started', ({ sessionId }) => {
    console.log('📡 Broadcast started for session:', sessionId);
    
    const session = activeSessions.get(sessionId);
    if (session && session.instructorId === socket.id) {
      session.isBroadcasting = true;
      io.to(sessionId).emit('broadcast-started');
      console.log('✅ Notified', session.students.size, 'students that broadcast started');
    }
  });

  socket.on('broadcast-stopped', ({ sessionId }) => {
    console.log('🛑 Broadcast stopped for session:', sessionId);
    
    const session = activeSessions.get(sessionId);
    if (session && session.instructorId === socket.id) {
      session.isBroadcasting = false;
      io.to(sessionId).emit('broadcast-stopped');
      console.log('✅ Notified', session.students.size, 'students that broadcast stopped');
    }
  });

  socket.on('offer', ({ targetId, offer }) => {
    console.log('📤 Forwarding offer to student:', targetId);
    io.to(targetId).emit('offer', {
      offer,
      instructorId: socket.id
    });
  });

  socket.on('answer', ({ instructorId, answer }) => {
    console.log('📤 Forwarding answer to instructor:', instructorId);
    io.to(instructorId).emit('answer', {
      answer,
      studentId: socket.id
    });
  });

  socket.on('ice-candidate', ({ targetId, candidate }) => {
    console.log('📤 Forwarding ICE candidate to:', targetId);
    io.to(targetId).emit('ice-candidate', {
      candidate,
      from: socket.id
    });
  });

  // ============================================
  // REAL-TIME CHAT EVENTS
  // ============================================

  // Join chat room
  socket.on('chat-join', ({ roomId, userId, userName, userRole }) => {
    console.log('💬 User joining chat:', userName, `(${userRole})`, '| Room:', roomId);
    
    socket.join(`chat:${roomId}`);
    
    // Track room participants
    if (!chatRooms.has(roomId)) {
      chatRooms.set(roomId, new Map());
    }
    
    const room = chatRooms.get(roomId);
    room.set(socket.id, {
      userId,
      userName,
      userRole,
      joinedAt: Date.now()
    });
    
    console.log('✅ User joined chat. Room has', room.size, 'participants');
    
    // Notify others about new participant
    socket.to(`chat:${roomId}`).emit('user-joined-chat', {
      userId,
      userName,
      userRole
    });
  });

  // Send chat message
  socket.on('chat-message', async ({ roomId, message }) => {
    console.log('💬 Chat message from', message.sender, '→', roomId);
    
    // Broadcast message to all in room (including sender for confirmation)
    io.to(`chat:${roomId}`).emit('new-message', {
      message,
      roomId
    });
    
    console.log('✅ Message broadcast to room:', roomId);
  });

  // Typing indicator
  socket.on('chat-typing', ({ roomId, userId, userName, isTyping }) => {
    // Broadcast to others (not sender)
    socket.to(`chat:${roomId}`).emit('user-typing', {
      userId,
      userName,
      isTyping
    });
  });

  // Leave chat room
  socket.on('chat-leave', ({ roomId, userId }) => {
    console.log('💬 User leaving chat:', userId, '| Room:', roomId);
    
    socket.leave(`chat:${roomId}`);
    
    const room = chatRooms.get(roomId);
    if (room) {
      room.delete(socket.id);
      
      // Notify others
      socket.to(`chat:${roomId}`).emit('user-left-chat', {
        userId
      });
      
      // Clean up empty rooms
      if (room.size === 0) {
        chatRooms.delete(roomId);
        console.log('🧹 Cleaned up empty chat room:', roomId);
      }
    }
  });

  // ============================================
  // DISCONNECT HANDLING
  // ============================================

  socket.on('disconnect', () => {
    console.log('🔌 Client disconnected:', socket.id);
    
    // Clean up WebRTC sessions
    activeSessions.forEach((session, sessionId) => {
      if (session.instructorId === socket.id) {
        console.log('👨‍🏫 Instructor left session:', sessionId);
        io.to(sessionId).emit('instructor-left');
        activeSessions.delete(sessionId);
      } else if (session.students.has(socket.id)) {
        console.log('🎓 Student left session:', sessionId);
        session.students.delete(socket.id);
        session.waitingStudents.delete(socket.id);
        if (session.instructorId) {
          io.to(session.instructorId).emit('student-left', {
            studentId: socket.id
          });
        }
      }
    });
    
    // Clean up chat rooms
    chatRooms.forEach((room, roomId) => {
      if (room.has(socket.id)) {
        const userInfo = room.get(socket.id);
        room.delete(socket.id);
        
        // Notify others
        io.to(`chat:${roomId}`).emit('user-left-chat', {
          userId: userInfo.userId
        });
        
        // Clean up empty rooms
        if (room.size === 0) {
          chatRooms.delete(roomId);
        }
      }
    });
  });
});

server.listen(PORT, () => {
  console.log(`🚀 WebRTC Signaling Server + Chat running on port ${PORT}`);
});