// src/services/webrtcBroadcastService.js
// ✅ FINAL VERSION - Complete with waiting students notification handling

import { io } from 'socket.io-client';

class WebRTCBroadcastService {
    constructor() {
        this.socket = null;
        this.localStream = null;
        this.peerConnections = new Map(); // studentId -> RTCPeerConnection
        this.sessionId = null;
        this.isInstructor = false;
        this.isBroadcasting = false;
        this.waitingStudents = new Set(); // Students waiting for broadcast

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

            // ✅ NEW: Wait for socket to connect FIRST
            await new Promise((resolve) => {
                this.socket.on('connect', () => {
                    console.log('✅ Connected to signaling server');
                    resolve();
                });
            });

            // Join session as instructor
            if (isInstructor) {
                this.socket.emit('instructor-join', {
                    sessionId,
                    instructorId: this.getUserId()
                });

                // ✅ NEW: Wait a bit for waiting-students event
                await new Promise(resolve => setTimeout(resolve, 100));
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
            // ✅ NEW: Receive list of waiting students from server
            this.socket.on('waiting-students', ({ students }) => {
                console.log('📋 Received', students.length, 'waiting students from server');
                students.forEach(studentId => {
                    this.waitingStudents.add(studentId);
                });
                console.log('✅ Waiting students added:', this.waitingStudents.size);
            });

            // Track students who join after instructor is present
            this.socket.on('student-joined', async ({ studentId }) => {
                console.log('🎓 New student joined:', studentId);

                // If we're already broadcasting, immediately create connection
                if (this.isBroadcasting && this.localStream) {
                    await this.createPeerConnection(studentId);
                } else {
                    // Add to waiting list
                    console.log('⏳ Student waiting for broadcast:', studentId);
                    this.waitingStudents.add(studentId);
                }
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
                this.waitingStudents.delete(studentId);
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
            this.isBroadcasting = true;

            // Notify all students that broadcast has started
            if (this.socket) {
                this.socket.emit('broadcast-started', {
                    sessionId: this.sessionId
                });
            }

            // Create connections for all waiting students
            console.log('🔗 Creating connections for', this.waitingStudents.size, 'waiting students');
            for (const studentId of this.waitingStudents) {
                await this.createPeerConnection(studentId);
            }
            this.waitingStudents.clear();

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

        this.isBroadcasting = false;

        // Notify students that broadcast stopped
        if (this.socket) {
            this.socket.emit('broadcast-stopped', {
                sessionId: this.sessionId
            });
        }

        // Close all peer connections
        this.peerConnections.forEach((pc, studentId) => {
            this.closePeerConnection(studentId);
        });

        // Clear waiting students
        this.waitingStudents.clear();

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
        if (typeof window !== 'undefined' && window.localStorage) {
            const authToken = localStorage.getItem('auth_token');
            if (authToken) {
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