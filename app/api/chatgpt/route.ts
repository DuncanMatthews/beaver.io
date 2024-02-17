import { NextRequest, NextResponse } from "next/server"
import fs from "fs";
import OpenAI from "openai";


const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });


export async function POST(request: NextRequest) {
  const data = await request.json()

console.log("this is data", data)

  try {
    let promptTh = ""
    let promptEn = ""
    let systemPromptTh = ""
    let systemPromptEn = ""
    if (data.isYoutube) {
      promptTh = data.text

      promptEn = data.text

      systemPromptTh =
        'คุณจะให้ขั้นตอนทั้งหมดมา และ งานของคุณคือ ช่วยสรุป และให้คำแนะนำในการทำอาหาร ทีละขั้นตอนแบบละเอียด หรือ เป็นหัวข้อย่อย พร้อมบอกสิ่งที่ต้องไปซื้อ เพื่อง่ายต่อการทำตาม และให้คำตอบเป็น json format ตามนี้ {title: "", steps: [], ingredients, conclusion: ""}'
      systemPromptEn =
        'Given a transcription of a YouTube video, create a concise summary that captures the main points, insights, or instructions presented in the video. The summary should be structured to include a list of key points or steps (if applicable), and a concluding statement.'
    } else {
      promptTh = data.text

      promptEn = data.text

      systemPromptTh =
        'คุณจะให้เมนู หรือชื่อ อาหารมา งานของคุณคือ บอกขั้นตอน และให้คำแนะนำในการทำอาหาร ทีละขั้นตอนแบบละเอียด หรือ เป็นหัวข้อย่อย พร้อมบอกสิ่งที่ต้องไปซื้อ เพื่อง่ายต่อการทำตาม และให้คำตอบเป็น json format ตามนี้ {title: "", steps: [], ingredients, conclusion: ""}'

      systemPromptEn =
        'Given a transcription of a YouTube video, create a concise summary that captures the main points, insights, or instructions presented in the video. The summary should be structured to include a list of key points or steps (if applicable), and a concluding statement.'
    }

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: data.language === "th" ? systemPromptTh : systemPromptEn,
          },
          {
            role: "user",
            content: data.language === "th" ? promptTh : promptEn,
          },
        ],
        n: 1,
        stream: false,
        stop: null,
        temperature: 0.7,
        top_p: 1,
      })
      const answer =
        response.choices[0].message.content || "Sorry I don't know"

        console.log("this is answer", answer)


        return NextResponse.json({
          summarize: answer,
        });
        
    } catch (error) {
      throw error
    }
  } catch (error: any) {
    return new Response(JSON.stringify(error.response?.data?.error), {
      status: error.response?.status,
    })
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
