// src/services/webrtcService.js
import RecordRTC from 'recordrtc';
import axios from 'axios';

class WebRTCService {
  constructor() {
    this.localStream = null;
    this.peerConnection = null;
    this.recorder = null;
    this.pollingInterval = null;
  }

  async getMediaStream() {
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true
        }
      });
      
      console.log('✅ Got media stream');
      return this.localStream;
    } catch (error) {
      console.error('❌ Error getting media:', error);
      throw error;
    }
  }

  createPeerConnection(onIceCandidate, onTrack) {
    const config = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ]
    };

    this.peerConnection = new RTCPeerConnection(config);

    if (this.localStream) {
      this.localStream.getTracks().forEach(track => {
        this.peerConnection.addTrack(track, this.localStream);
      });
    }

    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate && onIceCandidate) {
        onIceCandidate(event.candidate);
      }
    };

    if (onTrack) {
      this.peerConnection.ontrack = onTrack;
    }

    return this.peerConnection;
  }

  async createOffer() {
    if (!this.peerConnection) {
      throw new Error('Peer connection not created');
    }

    const offer = await this.peerConnection.createOffer();
    await this.peerConnection.setLocalDescription(offer);
    return offer;
  }

  async createAnswer(offer) {
    if (!this.peerConnection) {
      throw new Error('Peer connection not created');
    }

    await this.peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await this.peerConnection.createAnswer();
    await this.peerConnection.setLocalDescription(answer);
    return answer;
  }

  async setRemoteAnswer(answer) {
    if (!this.peerConnection) {
      throw new Error('Peer connection not created');
    }

    await this.peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
  }

  async addIceCandidate(candidate) {
    if (!this.peerConnection) {
      throw new Error('Peer connection not created');
    }

    await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
  }

  startRecording() {
    if (!this.localStream) {
      throw new Error('No local stream');
    }

    this.recorder = new RecordRTC(this.localStream, {
      type: 'video',
      mimeType: 'video/webm',
      videoBitsPerSecond: 2500000
    });

    this.recorder.startRecording();
    console.log('🔴 Recording started');
  }

  stopRecording() {
    return new Promise((resolve) => {
      if (!this.recorder) {
        resolve(null);
        return;
      }

      this.recorder.stopRecording(() => {
        const blob = this.recorder.getBlob();
        console.log('⏹️ Recording stopped');
        resolve(blob);
      });
    });
  }

  async uploadRecording(blob, courseId, slotIndex) {
    const formData = new FormData();
    formData.append('video', blob, 'recording.webm');
    formData.append('courseId', courseId);
    formData.append('slotIndex', slotIndex);

    const response = await axios.post('/api/session/upload-recording', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    return response.data;
  }

  startSignalingPolling(roomId, peerId, onMessage) {
    this.pollingInterval = setInterval(async () => {
      try {
        const response = await axios.get(`/api/webrtc/signal?roomId=${roomId}`);
        if (response.data.success && onMessage) {
          onMessage(response.data.data);
        }
      } catch (error) {
        console.error('Polling error:', error);
      }
    }, 2000);
  }

  stopSignalingPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
  }

  stopLocalStream() {
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }
  }

  closeConnection() {
    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }
  }

  cleanup() {
    this.stopLocalStream();
    this.closeConnection();
    this.stopSignalingPolling();
  }
}

export default new WebRTCService();