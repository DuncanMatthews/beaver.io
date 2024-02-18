"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCallback, useEffect, useState } from "react";
import { ReloadIcon, MagnifyingGlassIcon } from "@radix-ui/react-icons";
import AuthButton from "./components/AuthButton";
import { TypeAnimation } from "react-type-animation";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "./components/Header";

function extractYouTubeVideoId(url: string) {
  const regex =
    /(?:youtube\.com\/(?:watch\?.*v=|embed\/|v\/)|youtu\.be\/)([\w-]{11})/;
  const match = url.match(regex);
  if (match) {
    return match[1];
  }
  return null;
}

function isValidYouTubeUrl(url: string) {
  const youtubeUrlPattern =
    /^(https?:\/\/)?(www\.)?youtube\.com\/watch\?v=[A-Za-z0-9_-]{11}$/;
  return youtubeUrlPattern.test(url);
}

export default function Home() {
  const [url, setUrl] = useState("");
  const [detail, setDetail] = useState<any>(null);
  const [language, setLanguage] = useState<string>("th");
  const [mode, setMode] = useState<"search" | "flow">("search");
  const [isYoutube, setIsYoutube] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [youtubeLists, setYoutubeLists] = useState<string[]>([]);
  const [summarizeLoading, setSummarizeLoading] = useState<boolean>(false);
  const [selectedOption, setSelectedOption] = useState("");

  const descriptions = {
    summary:
      "Create a concise overview highlighting the key points of the video.",
    repurpose:
      "Using the transcript of a YouTube video, rewrite the content to create a new piece that conveys similar ideas and information but in a fresh and original manner",
    transcribe:
      "Convert the video dialogue into a comprehensive transcript, ready for use as textual content.",
    article:
      "Craft a well-structured article that captures the essence and details of the video's content.",
  };

  const [summarizeDetail, setSummarizeDetail] = useState<any>(null);

  const Transcribe = async (videoPath: string) => {
    const chatGPTResponse = await fetch(`/api/transcribe`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        videoPath: videoPath,
      }),
    });
    return chatGPTResponse;
  };

  const Summarize = async (transcription: string) => {
    const summarizeResponse = await fetch(`/api/chatgpt`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: transcription,
        isYoutube: true,
        language: language,
      }),
    });
    console.log("this is summarize", summarizeResponse);
    return summarizeResponse;
  };

  const HowToCook = async (menu: string) => {
    const summarizeResponse = await fetch(`/api/chatgpt`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: menu,
        isYoutube: false,
        language: language,
      }),
    });
    return summarizeResponse;
  };

  const YoutubeRelatedVideos = async (keywords: string, language: string) => {
    const searchYouTuberRsponse = await fetch(
      `/api/related/${keywords}/${language}`
    );
    return searchYouTuberRsponse;
  };
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault(); // Prevent default form submission behavior
    setLoading(true);
    setYoutubeLists([]);
    setIsYoutube(isValidYouTubeUrl(url));

    try {
      if (isValidYouTubeUrl(url)) {
        const youtubeId = extractYouTubeVideoId(url);
        const response = await fetch(`/api/youtube/${youtubeId}`);

        if (!response.ok) {
          throw new Error("Failed to fetch video details.");
        }

        const resultText = await response.text(); // Get text response
        const result = resultText ? JSON.parse(resultText) : {}; // Safely parse JSON
        setDetail(result);

        console.log(result);

        const chatGPTResponse = await Transcribe(result.videoPath);

        if (!chatGPTResponse.ok) {
          throw new Error("Failed to transcribe video.");
        }

        const chatGPTData = await chatGPTResponse.json();

        const summarizeResponse = await Summarize(chatGPTData.transcription);
        if (!summarizeResponse.ok) {
          throw new Error("Failed to summarize transcription.");
        }

        const summarizeData = await summarizeResponse.json();
        setSummarizeDetail(summarizeData.summarize); // Assuming summarizeData.summarize is already a stringified JSON

        console.log("this is summarizeData", summarizeData.summarize);
      } else {
        const summarizeResponse = await HowToCook(url);
        if (!summarizeResponse.ok) {
          throw new Error("Failed to get cooking instructions.");
        }

        const summarizeData = await summarizeResponse.json();
        setSummarizeDetail(summarizeData.summarize); // Assuming summarizeData.summarize is already a stringified JSON

        const searchYouTuberResponse = await YoutubeRelatedVideos(
          url,
          language
        );
        if (!searchYouTuberResponse.ok) {
          throw new Error("Failed to fetch related YouTube videos.");
        }

        const searchYouTuberResult = await searchYouTuberResponse.json();
        const mapVideoIds = searchYouTuberResult.videos.map((item: string) =>
          extractYouTubeVideoId(item)
        );
        setYoutubeLists(mapVideoIds);
      }
    } catch (error) {
      console.error(error);
      console.log("error", error);
    } finally {
      setLoading(false);
      setSummarizeLoading(false);
    }
  };

  const handleOnChange = (e: any) => {
    setLanguage(e);
    setSelectedOption(e);
  };

  const handleMode = (e: string) => {
    console.log(e);
  };
  return (
    <div className="flex  w-full items-center justify-center">
      {summarizeDetail ? (
        <div className="rounded-xl p-6 bg-white shadow-lg max-w-[800px] mx-auto">
          <h2 className="text-2xl font-bold text-center mb-4">Video Summary</h2>
          <p className="text-lg text-gray-800 leading-relaxed">
            {summarizeDetail}
          </p>
        </div>
      ) : (
        <div className="flex flex-col items-center space-y-8 rounded-lg p-12">
          <span>
            <h1 className="font-bold text-6xl bg-gradient-to-r from-violet-400 via-blue-600 to-violet-700 inline-block text-transparent bg-clip-text">
              Repurpose
            </h1>
          </span>

          <span>
            <h1 className="font-bold text-6xl">Popular Youtube Video&apos;s</h1>
          </span>
          {!selectedOption && (
            <TypeAnimation
              sequence={[
                // Same substring at the start will only be typed out once, initially
                "for Podcasts",
                1000, // wait 1s before replacing "Mice" with "Hamsters"
                "for Articles",
                1000,
                "for Video Transcripts",
                1000,
                "for Summaries",
                1000,
              ]}
              wrapper="span"
              speed={50}
              style={{ fontSize: "2em", display: "inline-block" }}
              repeat={Infinity}
            />
          )}
          {selectedOption && (
            <p className="text-lg text-black">
              {descriptions[selectedOption as keyof typeof descriptions]}
            </p>
          )}
          <form
            onSubmit={handleSubmit}
            className="flex w-full max-w-lg items-center space-x-4"
          >
            <Input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Enter YouTube video link"
              className="flex-grow"
            />
            <Select onValueChange={handleOnChange} defaultValue="">
              <SelectTrigger id="textOperation">
                <SelectValue placeholder="Choose Operation" />
              </SelectTrigger>
              <SelectContent position="popper">
                <SelectItem value="article">Generate Article</SelectItem>
                <SelectItem value="repurpose">Repurpose Content</SelectItem>
                <SelectItem value="summary">Summarize Video</SelectItem>
                <SelectItem value="transcribe">Transcribe Video</SelectItem>
                {/* Add other operations as needed */}
              </SelectContent>
            </Select>
            <Button disabled={loading} className="bg-gradient-to-r from-blue-600  to-violet-700 hover:from-violet-700 hover:to-blue-600">
              Analyze
              {loading && <ReloadIcon className="ml-2 h-4 w-4 animate-spin" />}
              {!loading && <MagnifyingGlassIcon className="ml-2 h-4 w-4" />}
            </Button>
          </form>
          {summarizeLoading && <div>Loading...</div>}
        </div>
      )}
    </div>
  );
}
