// server/signaling-server.js
// WebRTC Signaling Server for Live Sessions

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

io.on('connection', (socket) => {
  console.log('🔌 Client connected:', socket.id);

  // Instructor joins session
  socket.on('instructor-join', ({ sessionId, instructorId }) => {
    console.log('👨‍🏫 Instructor joining session:', sessionId);
    
    socket.join(sessionId);
    
    // Store instructor info
    if (!activeSessions.has(sessionId)) {
      activeSessions.set(sessionId, {
        instructorId: socket.id,
        instructor: instructorId,
        students: new Set()
      });
    }
    
    console.log('✅ Instructor joined session:', sessionId);
  });

  // Student joins session
  socket.on('student-join', ({ sessionId, studentId }) => {
    console.log('🎓 Student joining session:', sessionId, '| Student:', studentId);
    
    socket.join(sessionId);
    
    const session = activeSessions.get(sessionId);
    if (session) {
      session.students.add(socket.id);
      
      // Notify instructor about new student
      io.to(session.instructorId).emit('student-joined', {
        studentId: socket.id,
        studentInfo: studentId
      });
      
      // Tell student who the instructor is
      socket.emit('instructor-info', {
        instructorId: session.instructorId
      });
      
      console.log('✅ Student joined. Total students:', session.students.size);
    } else {
      console.log('⚠️ Session not found:', sessionId);
      socket.emit('error', { message: 'Session not found' });
    }
  });

  // Instructor sends offer to student
  socket.on('offer', ({ targetId, offer }) => {
    console.log('📤 Forwarding offer to student:', targetId);
    io.to(targetId).emit('offer', {
      offer,
      instructorId: socket.id
    });
  });

  // Student sends answer back to instructor
  socket.on('answer', ({ instructorId, answer }) => {
    console.log('📤 Forwarding answer to instructor:', instructorId);
    io.to(instructorId).emit('answer', {
      answer,
      studentId: socket.id
    });
  });

  // ICE candidate exchange
  socket.on('ice-candidate', ({ targetId, candidate }) => {
    console.log('📤 Forwarding ICE candidate to:', targetId);
    io.to(targetId).emit('ice-candidate', {
      candidate,
      from: socket.id
    });
  });

  // Disconnect
  socket.on('disconnect', () => {
    console.log('🔌 Client disconnected:', socket.id);
    
    // Remove from sessions
    activeSessions.forEach((session, sessionId) => {
      if (session.instructorId === socket.id) {
        console.log('👨‍🏫 Instructor left session:', sessionId);
        // Notify all students
        io.to(sessionId).emit('instructor-left');
        activeSessions.delete(sessionId);
      } else if (session.students.has(socket.id)) {
        console.log('🎓 Student left session:', sessionId);
        session.students.delete(socket.id);
        // Notify instructor
        io.to(session.instructorId).emit('student-left', {
          studentId: socket.id
        });
      }
    });
  });
});

server.listen(PORT, () => {
  console.log(`🚀 WebRTC Signaling Server running on port ${PORT}`);
});