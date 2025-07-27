// src/app/api/course/upload/progress/[uploadId]/route.js - FIXED SSE with Next.js App Router
import { NextResponse } from 'next/server';
import { authenticateRequest } from '@/middlewares/authMiddleware';

// Global SSE clients store
global.sseClients = global.sseClients || new Map();
global.uploadProgressStore = global.uploadProgressStore || new Map();

// FIXED: Enhanced SSE response with correct Next.js App Router implementation
export async function GET(request, { params }) {
  try {
    const { uploadId } = params;
    
    if (!uploadId) {
      return NextResponse.json({
        success: false,
        error: 'Upload ID is required'
      }, { status: 400 });
    }

    console.log('🔗 Setting up enhanced SSE connection for upload:', uploadId);

    // FIXED: Create SSE response using ReadableStream (Next.js App Router way)
    const encoder = new TextEncoder();
    const customReadable = new ReadableStream({
      start(controller) {
        console.log('✅ Enhanced SSE stream started for:', uploadId);

        // Send initial connection confirmation
        const initialMessage = JSON.stringify({
          type: 'connected',
          uploadId: uploadId,
          timestamp: Date.now()
        });
        controller.enqueue(encoder.encode(`data: ${initialMessage}\n\n`));

        // FIXED: Store the controller (not a stream writer) for this upload
        if (!global.sseClients.has(uploadId)) {
          global.sseClients.set(uploadId, new Set());
        }
        global.sseClients.get(uploadId).add(controller);

        // Send any existing progress data
        if (global.uploadProgressStore.has(uploadId)) {
          const existingProgress = global.uploadProgressStore.get(uploadId);
          const progressMessage = JSON.stringify(existingProgress);
          controller.enqueue(encoder.encode(`data: ${progressMessage}\n\n`));
        }

        // Set up heartbeat to keep connection alive
        const heartbeatInterval = setInterval(() => {
          try {
            const heartbeat = JSON.stringify({
              type: 'heartbeat',
              timestamp: Date.now()
            });
            controller.enqueue(encoder.encode(`data: ${heartbeat}\n\n`));
          } catch (error) {
            console.log('❌ Heartbeat failed, cleaning up connection:', uploadId);
            clearInterval(heartbeatInterval);
            cleanup();
          }
        }, 30000); // Send heartbeat every 30 seconds

        // Cleanup function
        const cleanup = () => {
          clearInterval(heartbeatInterval);
          
          // Remove this controller from the clients set
          if (global.sseClients.has(uploadId)) {
            global.sseClients.get(uploadId).delete(controller);
            
            // If no more clients for this upload, remove the set
            if (global.sseClients.get(uploadId).size === 0) {
              global.sseClients.delete(uploadId);
              console.log('🧹 Cleaned up SSE clients for upload:', uploadId);
            }
          }

          try {
            controller.close();
          } catch (error) {
            console.log('⚠️ Error closing controller:', error.message);
          }
        };

        // Set up cleanup on connection close
        request.signal?.addEventListener('abort', cleanup);

        // Auto-cleanup after 20 minutes to prevent memory leaks
        setTimeout(() => {
          console.log('⏰ Auto-cleanup triggered for upload:', uploadId);
          cleanup();
        }, 20 * 60 * 1000);
      },

      cancel() {
        console.log('🔌 Enhanced SSE stream cancelled for:', uploadId);
        
        // Clean up clients
        if (global.sseClients.has(uploadId)) {
          global.sseClients.delete(uploadId);
        }
      }
    });

    return new Response(customReadable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Cache-Control',
      },
    });

  } catch (error) {
    console.error('❌ Error setting up enhanced SSE:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to establish SSE connection'
    }, { status: 500 });
  }
}

// Enhanced POST handler for manual progress updates and status checks
export async function POST(request, { params }) {
  try {
    const { uploadId } = params;
    const body = await request.json();
    
    if (!uploadId) {
      return NextResponse.json({
        success: false,
        error: 'Upload ID is required'
      }, { status: 400 });
    }

    // Handle different POST actions
    if (body.action === 'status') {
      // Return current status
      const currentProgress = global.uploadProgressStore.get(uploadId);
      
      return NextResponse.json({
        success: true,
        uploadId,
        progress: currentProgress || null,
        hasActiveClients: global.sseClients.has(uploadId) && global.sseClients.get(uploadId).size > 0
      });
    }

    if (body.action === 'update') {
      // Manual progress update
      const { progressData } = body;
      
      if (!progressData) {
        return NextResponse.json({
          success: false,
          error: 'Progress data is required'
        }, { status: 400 });
      }

      // Update progress store
      global.uploadProgressStore.set(uploadId, {
        ...progressData,
        timestamp: Date.now()
      });

      // FIXED: Broadcast to connected clients using correct method
      if (global.sseClients.has(uploadId)) {
        const clients = global.sseClients.get(uploadId);
        const message = JSON.stringify(progressData);
        const encoder = new TextEncoder();
        
        clients.forEach(client => {
          try {
            // FIXED: Use enqueue for Next.js App Router controllers
            client.enqueue(encoder.encode(`data: ${message}\n\n`));
          } catch (error) {
            console.error('❌ Error sending manual update to client:', error);
            // Remove failed client
            clients.delete(client);
          }
        });
      }

      return NextResponse.json({
        success: true,
        message: 'Progress updated successfully',
        clientCount: global.sseClients.has(uploadId) ? global.sseClients.get(uploadId).size : 0
      });
    }

    if (body.action === 'complete') {
      // Mark upload as completed
      const { finalUrl, metadata } = body;
      
      const completionData = {
        type: 'completed',
        uploadId,
        finalUrl,
        metadata,
        timestamp: Date.now()
      };

      // Update progress store
      global.uploadProgressStore.set(uploadId, completionData);

      // FIXED: Broadcast completion to all clients
      if (global.sseClients.has(uploadId)) {
        const clients = global.sseClients.get(uploadId);
        const message = JSON.stringify(completionData);
        const encoder = new TextEncoder();
        
        clients.forEach(client => {
          try {
            client.enqueue(encoder.encode(`data: ${message}\n\n`));
          } catch (error) {
            console.error('❌ Error sending completion to client:', error);
          }
        });

        // Clean up clients after completion
        setTimeout(() => {
          global.sseClients.delete(uploadId);
          console.log('🧹 Cleaned up completed upload clients:', uploadId);
        }, 5000); // Wait 5 seconds before cleanup
      }

      return NextResponse.json({
        success: true,
        message: 'Upload marked as completed'
      });
    }

    if (body.action === 'fail') {
      // Mark upload as failed
      const { error: errorMessage, phase } = body;
      
      const failureData = {
        type: 'failed',
        uploadId,
        error: errorMessage,
        phase,
        timestamp: Date.now()
      };

      // Update progress store
      global.uploadProgressStore.set(uploadId, failureData);

      // FIXED: Broadcast failure to all clients
      if (global.sseClients.has(uploadId)) {
        const clients = global.sseClients.get(uploadId);
        const message = JSON.stringify(failureData);
        const encoder = new TextEncoder();
        
        clients.forEach(client => {
          try {
            client.enqueue(encoder.encode(`data: ${message}\n\n`));
          } catch (error) {
            console.error('❌ Error sending failure to client:', error);
          }
        });

        // Clean up clients after failure
        setTimeout(() => {
          global.sseClients.delete(uploadId);
          console.log('🧹 Cleaned up failed upload clients:', uploadId);
        }, 5000);
      }

      return NextResponse.json({
        success: true,
        message: 'Upload marked as failed'
      });
    }

    return NextResponse.json({
      success: false,
      error: 'Invalid action'
    }, { status: 400 });

  } catch (error) {
    console.error('❌ Error in enhanced progress POST handler:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to process request'
    }, { status: 500 });
  }
}

// FIXED: Enhanced progress update function (to be imported by other modules)
export const updateUploadProgress = (uploadId, progressData) => {
  try {
    // Ensure progress store exists
    global.uploadProgressStore = global.uploadProgressStore || new Map();
    global.sseClients = global.sseClients || new Map();

    // Store progress data
    global.uploadProgressStore.set(uploadId, {
      ...progressData,
      timestamp: Date.now()
    });

    // FIXED: Broadcast to connected SSE clients using correct method
    if (global.sseClients.has(uploadId)) {
      const clients = global.sseClients.get(uploadId);
      const message = JSON.stringify(progressData);
      const encoder = new TextEncoder();
      
      // Use Set to avoid issues with concurrent modifications
      const clientsArray = Array.from(clients);
      
      clientsArray.forEach(client => {
        try {
          // FIXED: Use enqueue for Next.js App Router controllers
          client.enqueue(encoder.encode(`data: ${message}\n\n`));
        } catch (error) {
          console.error('❌ Error broadcasting to SSE client:', error);
          // Remove failed client from the set
          clients.delete(client);
        }
      });

      console.log(`📡 Broadcasted progress to ${clientsArray.length} clients for upload: ${uploadId}`);
    } else {
      console.log(`📡 No active SSE clients for upload: ${uploadId}`);
    }

    return true;
  } catch (error) {
    console.error('❌ Error updating upload progress:', error);
    return false;
  }
};

// Cleanup function for expired progress data
setInterval(() => {
  const now = Date.now();
  const maxAge = 2 * 60 * 60 * 1000; // 2 hours

  if (global.uploadProgressStore) {
    for (const [uploadId, progressData] of global.uploadProgressStore.entries()) {
      if (now - progressData.timestamp > maxAge) {
        global.uploadProgressStore.delete(uploadId);
        
        // Also cleanup any orphaned SSE clients
        if (global.sseClients && global.sseClients.has(uploadId)) {
          global.sseClients.delete(uploadId);
        }
        
        console.log('🧹 Cleaned up expired progress data for upload:', uploadId);
      }
    }
  }
}, 30 * 60 * 1000); // Run every 30 minutes