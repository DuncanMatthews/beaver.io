import { NextRequest, NextResponse } from "next/server"
import fs from "fs";
import OpenAI from "openai";


const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });


export async function POST(request: NextRequest) {
  const data = await request.json();

  let prompt = data.text;
  let systemPrompt = "";

  // Define prompts for different operations using if-else
  if (data.language === "article") {
    systemPrompt =
      'I want you to act as a journalist. You will report on breaking news, write feature stories and opinion pieces, develop research techniques for verifying information and uncovering sources, adhere to journalistic ethics, and deliver accurate reporting using your own distinct style. The first suggestion request is: "I need help writing an article about air pollution in major cities around the world."';
  } else if (data.language === "repurpose") {
    systemPrompt =
      'Given a piece of content, creatively repurpose it into a different format that engages a new audience. This could involve converting a blog post into a script for a video, a video into an infographic, or an article into a podcast script. Be innovative and ensure the repurposed content is engaging and suitable for the target format.';
  } else if (data.language === "summary") {
    systemPrompt =
      'Given a transcription of a YouTube video, create a concise summary that captures the main points, insights, or instructions presented in the video. The summary should be structured to include a list of key points or steps (if applicable), and a concluding statement.';
  } else if (data.language === "transcribe") {
    systemPrompt =
      'Transcribe the provided video content into text, ensuring accuracy and attention to detail. Include timestamps if necessary, and format the transcription clearly to reflect different speakers or significant audio cues.';
  }
  // Add other operations as needed with additional else if statements

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      n: 1,
      stream: false,
      stop: null,
      temperature: 0.7,
      top_p: 1,
    });

    const answer = response.choices[0].message.content || "Sorry, I don't know";

    return NextResponse.json({
      summarize: answer,
    });
  } catch (error: any) {
    return new Response(JSON.stringify(error.response?.data?.error), {
      status: error.response?.status,
    });
  }
}


export async function GET(request: NextRequest) {
  try {
    const response = await openai.models.list()
    return NextResponse.json({
      models: response.data,
    })
  } catch (error: any) {
    return new Response(JSON.stringify(error.response?.data?.error), {
      status: error.response?.status,
    })
  }
}
