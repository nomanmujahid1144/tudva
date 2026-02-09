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

  /**
   * ✅ NEW: Upload recording using chunked upload system (for large files)
   */
  async uploadRecording(blob, courseId, slotIndex) {
    try {
      console.log('📤 Starting chunked recording upload...');
      console.log('📊 Recording size:', blob.size, 'bytes (', Math.round(blob.size / 1024 / 1024), 'MB)');

      // Generate unique upload ID
      const uploadId = `recording_${courseId}_${slotIndex}_${Date.now()}`;

      // Get auth token
      const authToken = localStorage.getItem('auth_token');
      if (!authToken) {
        throw new Error('No authentication token found');
      }

      // Calculate chunks
      const FIRST_CHUNK_SIZE = 3 * 1024 * 1024; // 3MB
      const REGULAR_CHUNK_SIZE = 5 * 1024 * 1024; // 5MB

      let offset = 0;
      let chunkIndex = 0;
      const totalSize = blob.size;

      console.log('📦 Total size:', totalSize, 'bytes');

      // Upload chunks
      while (offset < totalSize) {
        const isFirstChunk = chunkIndex === 0;
        const chunkSize = isFirstChunk ? FIRST_CHUNK_SIZE : REGULAR_CHUNK_SIZE;
        const end = Math.min(offset + chunkSize, totalSize);
        const chunk = blob.slice(offset, end);

        console.log(`📤 Uploading chunk ${chunkIndex}: ${offset}-${end} (${chunk.size} bytes)`);

        const formData = new FormData();
        formData.append('file', chunk, `recording-chunk-${chunkIndex}.webm`);
        formData.append('chunkIndex', chunkIndex.toString());
        formData.append('uploadId', uploadId);
        formData.append('courseId', courseId);
        formData.append('fileType', 'video');
        formData.append('isFirstChunk', isFirstChunk.toString());
        formData.append('originalFileName', `session_${slotIndex}_recording.webm`);
        formData.append('totalFileSize', totalSize.toString());

        const response = await fetch('/api/course/upload/chunk', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${authToken}`
          },
          body: formData
        });

        const result = await response.json();

        if (!result.success) {
          throw new Error(result.error || 'Failed to upload chunk');
        }

        console.log(`✅ Chunk ${chunkIndex} uploaded:`, result.data?.status);

        // If first chunk, we get tempUrl immediately
        if (isFirstChunk && result.data?.tempUrl) {
          console.log('🎬 First chunk uploaded, temp URL:', result.data.tempUrl);
        }

        offset = end;
        chunkIndex++;
      }

      console.log('✅ All chunks uploaded, waiting for processing...');

      // Wait for upload to complete and get final URL
      const finalUrl = await this.waitForUploadCompletion(uploadId);

      console.log('🎉 Recording upload completed:', finalUrl);

      return {
        success: true,
        data: {
          url: finalUrl,
          uploadId: uploadId
        }
      };

    } catch (error) {
      console.error('❌ Failed to upload recording:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * ✅ NEW: Wait for upload completion using SSE
   */
  async waitForUploadCompletion(uploadId, timeout = 10 * 60 * 1000) {
    return new Promise((resolve, reject) => {
      console.log('⏳ Waiting for upload completion via SSE...');

      const eventSource = new EventSource(`/api/course/upload/progress/${uploadId}`);
      const startTime = Date.now();

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('📡 Upload progress:', data);

          if (data.type === 'completed' && data.finalUrl) {
            console.log('✅ Upload completed! Final URL:', data.finalUrl);
            eventSource.close();
            resolve(data.finalUrl);
          } else if (data.type === 'failed') {
            console.error('❌ Upload failed:', data.error);
            eventSource.close();
            reject(new Error(data.error || 'Upload failed'));
          } else if (data.type === 'progress') {
            console.log(`📊 Progress: ${data.progress}% - ${data.message}`);
          }
        } catch (error) {
          console.error('Error parsing SSE data:', error);
        }
      };

      eventSource.onerror = (error) => {
        console.error('❌ SSE connection error:', error);
        eventSource.close();

        // Check if timeout
        if (Date.now() - startTime > timeout) {
          reject(new Error('Upload timeout'));
        }
      };

      // Set timeout
      setTimeout(() => {
        eventSource.close();
        reject(new Error('Upload timeout after ' + (timeout / 1000) + ' seconds'));
      }, timeout);
    });
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