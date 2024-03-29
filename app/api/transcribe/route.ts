import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import OpenAI from "openai";


// Ensure OPENAI_API_KEY is set in your environment variables
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    console.log("data", data);
    const filePath = data.videoPath; // Assuming the file path is passed in the request body
    const response = await fetch(filePath);

    if (!response.ok) throw new Error(`Failed to fetch the file: ${response.statusText}`);
    const buffer = response; // Get the file content as a buffer

    if(response.ok) {
      return NextResponse.json({ message: 'File fetched successfully' });
    }


    console.log('this is the file path', filePath);

    // Perform the transcription. This assumes the file exists and is accessible
    const transcription = await openai.audio.transcriptions.create({
      file: buffer,
      model: "whisper-1",
    });

    


    // Assuming the API's response object correctly maps to your usage
    return NextResponse.json({ transcription: transcription.text
    });

  } catch (error) {
    console.error(error); // Log the error for debugging
    // Adjust error handling as needed based on OpenAI's error response structure
    return new Response(JSON.stringify({ error: 'An error occurred' }), {
      status: 500, // Fallback error status
    });
  }
}
