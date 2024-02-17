"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCallback, useEffect, useState } from "react";
import { ReloadIcon, MagnifyingGlassIcon } from "@radix-ui/react-icons";
import AuthButton from "./components/AuthButton";


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
    console.log("this is chat", chatGPTResponse);
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
  
   
        console.log(result)

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
  };

  const handleMode = (e: string) => {
    console.log(e);
  };
  return (
    <div className="flex h-screen w-full items-center justify-center ">

      <div className="flex flex-col items-center space-y-8 rounded-lg  p-12">
        <span>
          <h1 className=" font-bold text-6xl bg-gradient-to-r from-violet-400 via-blue-600 to-violet-700 inline-block text-transparent bg-clip-text">
            Summarize
          </h1>
        </span>{" "}
        <span>
          {" "}
          <h1 className="font-bold text-6xl">Youtube Video</h1>
        </span>
        <p className="text-lg text-black">
          Enter a YouTube video link to get its summary.
        </p>
        <form
          onSubmit={(e) => handleSubmit(e)}
          className="flex w-full max-w-md items-center space-x-4"
        >
          <Input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Enter YouTube video link"
            className="flex-grow"
          />
          <Select
            onValueChange={(e) => handleOnChange(e)}
            defaultValue={language}
          >
            <SelectTrigger id="language">
              <SelectValue placeholder="Select Language" />
            </SelectTrigger>
            <SelectContent position="popper">
              <SelectItem value="th">Thai</SelectItem>
              <SelectItem value="en">English</SelectItem>
              {/* Add other languages as needed */}
            </SelectContent>
          </Select>
          <Button disabled={loading} className="bg-[#0d6efd]">
            Analyze
            {loading && <ReloadIcon className="ml-2 h-4 w-4 animate-spin" />}
            {!loading && <MagnifyingGlassIcon className="ml-2 h-4 w-4" />}
          </Button>
        </form>
        {summarizeLoading && <div>Loading...</div>}
        <div className="text-center text-white max-w-2xl">
          {summarizeDetail && !summarizeLoading && (
            <div className="rounded-xl p-6 text-sm">
              <h2 className="text-2xl font-bold text-center mb-4">
                Video Summary
              </h2>
              <p className="text-lg text-black">{summarizeDetail}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
