// src/services/webrtcReceiveService.js
// ✅ FINAL VERSION - Complete with proper socket connection handling

import { io } from 'socket.io-client';

class WebRTCReceiveService {
  constructor() {
    this.socket = null;
    this.peerConnection = null;
    this.remoteStream = null;
    this.sessionId = null;
    this.onStreamCallback = null;
    this.onBroadcastStoppedCallback = null;

    // STUN servers
    this.iceServers = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ]
    };
  }

  /**
   * Initialize and join session as student
   */
  async initialize(sessionId, studentId, onStreamReceived, onBroadcastStopped) {
    try {
      this.sessionId = sessionId;
      this.onStreamCallback = onStreamReceived;
      this.onBroadcastStoppedCallback = onBroadcastStopped;

      console.log('🔄 Student connecting to signaling server...', {
        sessionId,
        studentId
      });

      // Connect to signaling server
      this.socket = io(process.env.NEXT_PUBLIC_SIGNALING_URL || 'http://localhost:3001', {
        transports: ['websocket'],
        reconnection: true
      });

      // Wait for socket to connect FIRST
      await new Promise((resolve) => {
        this.socket.on('connect', () => {
          console.log('✅ Connected to signaling server');
          resolve();
        });
      });

      // NOW setup listeners (socket is connected)
      this.setupSocketListeners();
      console.log('✅ Socket listeners attached');

      // NOW emit student-join (socket is ready)
      this.socket.emit('student-join', {
        sessionId,
        studentId
      });

      return { success: true };
    } catch (error) {
      console.error('❌ Failed to initialize WebRTC receive:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Setup socket listeners
   */
  setupSocketListeners() {
    // Listen for broadcast started event
    this.socket.on('broadcast-started', () => {
      console.log('📡 Instructor started broadcasting!');
      // The offer will come automatically from the instructor
    });

    // Listen for broadcast stopped event
    this.socket.on('broadcast-stopped', () => {
      console.log('🛑 Instructor stopped broadcasting');

      // Clean up connection
      if (this.peerConnection) {
        this.peerConnection.close();
        this.peerConnection = null;
      }

      this.remoteStream = null;

      // Notify UI
      if (this.onBroadcastStoppedCallback) {
        this.onBroadcastStoppedCallback();
      }
    });

    // Receive offer from instructor
    this.socket.on('offer', async ({ offer, instructorId }) => {
      console.log('📥 Received offer from instructor:', instructorId);
      await this.handleOffer(offer, instructorId);
    });

    // Receive ICE candidates
    this.socket.on('ice-candidate', async ({ candidate, from }) => {
      console.log('📥 Received ICE candidate from instructor');
      if (this.peerConnection && candidate) {
        try {
          await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (error) {
          console.error('❌ Error adding ICE candidate:', error);
        }
      }
    });

    // Instructor left
    this.socket.on('instructor-left', () => {
      console.log('👨‍🏫 Instructor left the session');
      this.cleanup();

      // Notify UI
      if (this.onBroadcastStoppedCallback) {
        this.onBroadcastStoppedCallback();
      }
    });

    // Connection errors
    this.socket.on('error', ({ message }) => {
      console.error('❌ Signaling error:', message);
    });
  }

  /**
   * Handle offer from instructor
   */
  async handleOffer(offer, instructorId) {
    try {
      // Create peer connection
      this.peerConnection = new RTCPeerConnection(this.iceServers);

      // Handle incoming stream
      this.peerConnection.ontrack = (event) => {
        console.log('📥 Received track from instructor:', event.track.kind);

        if (!this.remoteStream) {
          this.remoteStream = new MediaStream();
        }

        this.remoteStream.addTrack(event.track);

        // Notify callback with stream
        if (this.onStreamCallback) {
          this.onStreamCallback(this.remoteStream);
        }
      };

      // Handle ICE candidates
      this.peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          console.log('📤 Sending ICE candidate to instructor');
          this.socket.emit('ice-candidate', {
            targetId: instructorId,
            candidate: event.candidate
          });
        }
      };

      // Connection state
      this.peerConnection.onconnectionstatechange = () => {
        console.log('📡 Connection state:', this.peerConnection.connectionState);

        if (this.peerConnection.connectionState === 'connected') {
          console.log('✅ Connected to instructor!');
        } else if (this.peerConnection.connectionState === 'failed') {
          console.error('❌ Connection failed');
        } else if (this.peerConnection.connectionState === 'disconnected') {
          console.log('🔌 Disconnected from instructor');
        }
      };

      // Set remote description (offer)
      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(offer));

      // Create answer
      const answer = await this.peerConnection.createAnswer();
      await this.peerConnection.setLocalDescription(answer);

      // Send answer back to instructor
      console.log('📤 Sending answer to instructor');
      this.socket.emit('answer', {
        instructorId,
        answer: this.peerConnection.localDescription
      });

    } catch (error) {
      console.error('❌ Error handling offer:', error);
    }
  }

  /**
   * Cleanup
   */
  cleanup() {
    console.log('🧹 Cleaning up WebRTC receive service');

    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }

    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }

    this.remoteStream = null;
  }

  /**
   * Disconnect
   */
  disconnect() {
    this.cleanup();
  }
}

// Create singleton instance
const webrtcReceiveService = new WebRTCReceiveService();

export default webrtcReceiveService;