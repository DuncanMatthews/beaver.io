import { NextRequest, NextResponse } from "next/server"
import ytdl from "ytdl-core"
import fs from "fs"
import path from "path"
import { pipeline } from "stream"
export async function GET(
  request: NextRequest,
  context: { params: { url: string } }
) {
  const youtubeUrl = `https://www.youtube.com/watch?v=${context?.params?.url}`
  const url = context?.params?.url

  function sanitizeFileName(input: string) {
    return input
      .replace(/[^a-zA-Z0-9 -]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with -
      .slice(0, 100); // Limit to 100 characters to avoid path length issues
  }


  try {
    const info = await ytdl.getBasicInfo(youtubeUrl)
    const title = sanitizeFileName(info.videoDetails.title);

    console.log("title", title)

    const videoPath = path.resolve("./public/mp3", title + ".mp3")
   
    console.log("videoPath", videoPath)

    const downloadStream = ytdl(youtubeUrl, { filter: "audioonly" })
    const writeStream = fs.createWriteStream(videoPath)


    await new Promise((resolve, reject) => {
      pipeline(downloadStream, writeStream, (error) => {
        if (error) {
          reject(error)
        } else {
          resolve(title)
        }
      })
    })



    return NextResponse.json({
      title: title,
      name: info.videoDetails.title,
      videoPath: videoPath,
      id: url,
    })
  } catch (error: any) {
    return new Response(JSON.stringify(error.response?.data?.error), {
      status: error.response?.status,
    })
  }
}
