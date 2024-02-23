import { NextRequest, NextResponse } from "next/server"
import fs from "fs";
import OpenAI from "openai";


const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });


export async function POST(request: NextRequest) {
  const data = await request.json();


    console.log(data);

  const contentLength = data.contentLength;

  if (contentLength > 1500) {
    return NextResponse.json({
      error: "Content length should be less than 2000 words",
    });
  }




  let systemPrompt = "";

  // Define prompts for different operations using if-else
 
    systemPrompt =
      `Context: Below is a transcript provided as data.text. 

      Transcript:
     ${data.text}
     
      
      Objective: Your task is to rewrite the provided transcript into a create a, conciseness natural-sounding, engaging article. 
      
      Target Audience: The article is intended for a ${data.language} audience. While the readers may have some interest in the subject, assume they have no specialized knowledge. The language should be accessible, avoiding jargon as much as possible, or providing explanations for any technical terms that are essential to the content.
      
      Word Count: Aim for a word count of approximately ${data.contentLength} words. This length should provide enough space to cover the key points in the transcript while maintaining reader engagement.

      Instructions:
      
      Introduction: Begin with a brief introduction that sets the context for the article, highlighting the significance of the discussion and introducing the main participants if the transcript is an interview.

      Body: Structure the content to flow logically, breaking it into sections or themes as needed with corresponding headings. The article should comprehensively address the key points from the provided transcript and elaborate on them, offering additional context or explanations to clarify and enhance the reader's understanding. Each subheading should have atleast 2 paragraphs.
      
      Rely on the content from the transcript for all information, ensuring not to introduce any new facts or data that were not originally mentioned. Compose paragraphs with a natural length, allowing each to fully develop ideas without being constrained by an arbitrary word count. This will create a more organic reading experience, akin to traditional, well-researched articles

      Conclusion: Wrap up the article with a conclusion that summarizes the main insights or takeaways from the discussion. If appropriate, suggest implications for the future or actions readers might consider based on the information presented.
      
      Tone and Style: Maintain a professional yet engaging tone throughout the article. The goal is to inform and possibly educate the reader without overwhelming them with overly technical details.

      Output the article in html format with appropriate headings, subheadings, and lists to make the content easy to read and navigate. Prioritize the word count of ${data.contentLength} words.

     
      
      `;

  

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: systemPrompt,
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
