// src/services/webrtcBroadcastService.js
// WebRTC Broadcasting Service - Instructor broadcasts to multiple students

import { io } from 'socket.io-client';

class WebRTCBroadcastService {
  constructor() {
    this.socket = null;
    this.localStream = null;
    this.peerConnections = new Map(); // studentId -> RTCPeerConnection
    this.sessionId = null;
    this.isInstructor = false;
    
    // STUN servers for ICE
    this.iceServers = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ]
    };
  }

  /**
   * Initialize signaling connection
   */
  async initialize(sessionId, isInstructor = false) {
    try {
      this.sessionId = sessionId;
      this.isInstructor = isInstructor;
      
      console.log('🔄 Connecting to signaling server...', {
        sessionId,
        isInstructor
      });
      
      // Connect to signaling server
      this.socket = io(process.env.NEXT_PUBLIC_SIGNALING_URL || 'http://localhost:3001', {
        transports: ['websocket'],
        reconnection: true
      });
      
      this.setupSocketListeners();
      
      // Join session
      if (isInstructor) {
        this.socket.emit('instructor-join', {
          sessionId,
          instructorId: this.getUserId()
        });
      }
      
      return { success: true };
    } catch (error) {
      console.error('❌ Failed to initialize WebRTC:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Setup socket event listeners
   */
  setupSocketListeners() {
    if (this.isInstructor) {
      // Instructor listeners
      this.socket.on('student-joined', async ({ studentId }) => {
        console.log('🎓 New student joined:', studentId);
        await this.createPeerConnection(studentId);
      });

      this.socket.on('answer', async ({ answer, studentId }) => {
        console.log('📥 Received answer from student:', studentId);
        const pc = this.peerConnections.get(studentId);
        if (pc) {
          await pc.setRemoteDescription(new RTCSessionDescription(answer));
        }
      });

      this.socket.on('student-left', ({ studentId }) => {
        console.log('🎓 Student left:', studentId);
        this.closePeerConnection(studentId);
      });
    }

    // ICE candidates
    this.socket.on('ice-candidate', async ({ candidate, from }) => {
      console.log('📥 Received ICE candidate from:', from);
      const pc = this.peerConnections.get(from);
      if (pc && candidate) {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      }
    });
  }

  /**
   * Instructor: Start broadcasting
   */
  async startBroadcast(stream) {
    try {
      console.log('🎥 Starting broadcast with stream');
      this.localStream = stream;
      
      // Create peer connections for any students already in room
      // They will be added via 'student-joined' event
      
      return { success: true };
    } catch (error) {
      console.error('❌ Failed to start broadcast:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Create peer connection to a student
   */
  async createPeerConnection(studentId) {
    try {
      console.log('🔗 Creating peer connection to student:', studentId);
      
      const pc = new RTCPeerConnection(this.iceServers);
      this.peerConnections.set(studentId, pc);

      // Add local stream tracks to peer connection
      if (this.localStream) {
        this.localStream.getTracks().forEach(track => {
          pc.addTrack(track, this.localStream);
          console.log('➕ Added track to peer connection:', track.kind);
        });
      }

      // Handle ICE candidates
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          console.log('📤 Sending ICE candidate to student:', studentId);
          this.socket.emit('ice-candidate', {
            targetId: studentId,
            candidate: event.candidate
          });
        }
      };

      // Connection state changes
      pc.onconnectionstatechange = () => {
        console.log(`📡 Connection state with ${studentId}:`, pc.connectionState);
      };

      // Create and send offer
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      
      console.log('📤 Sending offer to student:', studentId);
      this.socket.emit('offer', {
        targetId: studentId,
        offer: pc.localDescription
      });

    } catch (error) {
      console.error('❌ Failed to create peer connection:', error);
    }
  }

  /**
   * Close peer connection
   */
  closePeerConnection(studentId) {
    const pc = this.peerConnections.get(studentId);
    if (pc) {
      pc.close();
      this.peerConnections.delete(studentId);
      console.log('🔌 Closed connection to student:', studentId);
    }
  }

  /**
   * Stop broadcasting
   */
  stopBroadcast() {
    console.log('🛑 Stopping broadcast');
    
    // Close all peer connections
    this.peerConnections.forEach((pc, studentId) => {
      this.closePeerConnection(studentId);
    });

    // Stop local stream
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }

    // Disconnect socket
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  /**
   * Get user ID from auth or generate one
   */
  getUserId() {
    // Try to get from auth context
    if (typeof window !== 'undefined' && window.localStorage) {
      const authToken = localStorage.getItem('auth_token');
      if (authToken) {
        // Extract user ID from token
        try {
          const payload = JSON.parse(atob(authToken.split('.')[1]));
          return payload.userId;
        } catch (e) {
          console.error('Failed to parse auth token');
        }
      }
    }
    return `user_${Date.now()}`;
  }
}

// Create singleton instance
const webrtcBroadcastService = new WebRTCBroadcastService();

export default webrtcBroadcastService;