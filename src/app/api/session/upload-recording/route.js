// src/app/api/session/upload-recording/route.js
import { NextResponse } from 'next/server';
import { Storage } from '@google-cloud/storage';
import connectDB from '@/lib/mongodb';
import Course from '@/models/Course';

const initializeStorage = () => {
  const credentials = {
    type: "service_account",
    project_id: process.env.NEXT_PUBLIC_GCS_PROJECT_ID,
    private_key: process.env.NEXT_PUBLIC_GCS_PRIVATE_KEY.replace(/\\n/g, '\n'),
    client_email: process.env.NEXT_PUBLIC_GCS_CLIENT_EMAIL,
  };

  return new Storage({
    credentials,
    projectId: process.env.NEXT_PUBLIC_GCS_PROJECT_ID
  });
};

export async function POST(request) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json({
        error: 'Authentication required',
        success: false
      }, { status: 401 });
    }

    const formData = await request.formData();
    const videoFile = formData.get('video');
    const courseId = formData.get('courseId');
    const slotIndex = formData.get('slotIndex');

    if (!videoFile) {
      return NextResponse.json({
        success: false,
        error: 'No video file provided'
      }, { status: 400 });
    }

    const storage = initializeStorage();
    const bucketName = process.env.NEXT_PUBLIC_GCS_BUCKET_NAME;
    const bucket = storage.bucket(bucketName);

    const buffer = Buffer.from(await videoFile.arrayBuffer());
    const timestamp = Date.now();
    const filename = `recordings/${courseId}/session_${slotIndex}_${timestamp}.webm`;

    const blob = bucket.file(filename);
    const blobStream = blob.createWriteStream({
      resumable: false,
      metadata: {
        contentType: 'video/webm'
      }
    });

    await new Promise((resolve, reject) => {
      blobStream.on('error', reject);
      blobStream.on('finish', resolve);
      blobStream.end(buffer);
    });

    await blob.makePublic();
    const publicUrl = `https://storage.googleapis.com/${bucketName}/${filename}`;

    await connectDB();
    const course = await Course.findById(courseId);
    
    if (course && course.liveCourseMeta.timeSlots[slotIndex]) {
      course.liveCourseMeta.timeSlots[slotIndex].recordingUrl = publicUrl;
      await course.save();
    }

    console.log('✅ Recording uploaded:', publicUrl);

    return NextResponse.json({
      success: true,
      data: {
        url: publicUrl,
        filename
      }
    });

  } catch (error) {
    console.error('❌ Upload failed:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to upload recording'
    }, { status: 500 });
  }
}