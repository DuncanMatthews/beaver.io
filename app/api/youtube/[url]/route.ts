import { NextRequest, NextResponse } from "next/server";
import ytdl from "ytdl-core";
import { createClient } from "@supabase/supabase-js";

// Assuming these are server-side operations and your variables are correctly set
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function GET(request: NextRequest, context: { params: { url: string } }) {
  const youtubeUrl = `https://www.youtube.com/watch?v=${context?.params?.url}`;


  function sanitizeFileName(input: string) {
    return input.replace(/[^a-zA-Z0-9 -]/g, '').replace(/\s+/g, '-').slice(0, 100);
  }

  try {
    const info = await ytdl.getBasicInfo(youtubeUrl);
    console.log("ths is ", info.videoDetails.title);
    const title = sanitizeFileName(info.videoDetails.title);
    const downloadStream = ytdl(youtubeUrl, { filter: "audioonly" });


    // Accumulate chunks from the stream
    const chunks = [];
    for await (let chunk of downloadStream) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);


    // Upload the buffer to Supabase Storage
    // Assuming videoBuffer is your video data as a Buffer
    const { data, error } = await supabase
      .storage
      .from('videos')
      .upload(`audio/${title}.mp3`, buffer, {
        contentType: 'audio/mpeg'
      });




    console.log("this is the data", data);

    // // Construct the public URL for the uploaded file
    // // Adjust the URL pattern according to your Supabase setup
    const response  = supabase.storage.from('videos').getPublicUrl(`audio/${title}.mp3`)

    const { data: { publicUrl } } = response;

    console.log("this is the public url", publicUrl);

 




    return NextResponse.json({
      title,
      name: info.videoDetails.title,
      videoPath: publicUrl, // This should be the accessible URL of the uploaded file
      id: context?.params?.url,
    });
  } catch (error) {
    console.error(error); // Log the error for debugging
    return new Response(JSON.stringify({ error: 'An error occurred' }), {
      status: 500,
    });
  }
}
