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
import { Label } from "@radix-ui/react-select";
import Link from "next/link";

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
  const [language, setLanguage] = useState<string>("Choose Audience");
  const [mode, setMode] = useState<"search" | "flow">("search");
  const [isYoutube, setIsYoutube] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [youtubeLists, setYoutubeLists] = useState<string[]>([]);
  const [summarizeLoading, setSummarizeLoading] = useState<boolean>(false);
  const [selectedOption, setSelectedOption] = useState("");
  const [contentLength, setContentLength] = useState("");

  const defaultValues = {
    url: "https://www.youtube.com/watch?v=YvzwrSCCu8A",
    language: "professionals", // Assuming this is the value that matches one of the SelectItem values
    contentLength: "1500",
  };

  const populateDefaults = () => {
    setUrl(defaultValues.url);
    setLanguage(defaultValues.language); // Assuming you have a setLanguage function
    setContentLength(defaultValues.contentLength);
  };

  const descriptions = {
    professionals:
      "Focused on industry-specific insights and practical applications, catering to individuals seeking to advance their professional skill sets and industry knowledge.",
    academics:
      "Tailored for the scholarly community, emphasizing rigorous analysis, theoretical frameworks, and contributions to academic discourse.",
    executives:
      "Designed for business leaders, highlighting strategic thinking, leadership insights, market trends, and corporate innovation.",
    tech: "Geared towards technology aficionados, covering the latest in tech innovations and trends, and providing in-depth technical knowledge.",
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
        contentLength: parseInt(contentLength),
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
    <div className="flex  items-center justify-center">
      {summarizeDetail ? (
        <div
          className="px-80 mt-5 mx-40"
          dangerouslySetInnerHTML={{ __html: summarizeDetail }}
        />
      ) : (
        <div className="flex flex-col items-center  rounded-lg p-12">
          <span>
            <h1 className="font-bold text-6xl bg-gradient-to-r from-violet-400 via-blue-600 to-violet-700 inline-block text-transparent bg-clip-text">
              Repurpose
            </h1>
          </span>

          <span>
            <h1 className="font-bold text-6xl">Your Video Content</h1>
          </span>
          {!selectedOption && (
            <div className="mb-10">
              <TypeAnimation
                sequence={[
                  // Same substring at the start will only be typed out once, initially
                  "Create SEO Optimized Content",
                  1000, // wait 1s before replacing "Mice" with "Hamsters"
                  "Re-engage Your Audience",
                  1000,
                  "Reuse Content for Blogs",
                  1000,
                  "Generate Video Summaries",
                ]}
                wrapper="span"
                speed={50}
                style={{ fontSize: "2em", display: "inline-block" }}
                repeat={Infinity}
              />
            </div>
          )}
          {selectedOption && (
            <p className="text-lg text-black">
              {descriptions[selectedOption as keyof typeof descriptions]}
            </p>
          )}
          <form
            onSubmit={handleSubmit}
            className="flex flex-col items-center justify-center space-x-3 space-y-4"
          >
            <div className="flex flex-wrap justify-center items-end space-x-4">
              <div className="flex flex-col space-y-1">
                <label
                  htmlFor="url"
                  className="block text-sm font-medium text-gray-700"
                >
                  URL
                </label>
                <input
                  type="text"
                  id="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="Enter YouTube video link"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>

              <div className="flex flex-col space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  Language
                </label>
                <Select onValueChange={handleOnChange} defaultValue="">
                  <SelectTrigger
                    id="textOperation"
                    className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  >
                    <SelectValue placeholder={language} />
                  </SelectTrigger>
                  <SelectContent position="popper" className="z-10">
                    <SelectItem value="professionals">Professionals</SelectItem>
                    <SelectItem value="academics">Academics</SelectItem>
                    <SelectItem value="executives">
                      Business Executives
                    </SelectItem>
                    <SelectItem value="tech">Tech Enthusiasts</SelectItem>
                    {/* Additional options can be uncommented or added here */}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col space-y-1">
                <label
                  htmlFor="contentLength"
                  className="block text-sm font-medium text-gray-700"
                >
                  Content Length
                </label>
                <input
                  type="number"
                  id="contentLength"
                  value={contentLength}
                  onChange={(e) => {
                    const newValue = Number(e.target.value);
                    if (newValue <= 1500) {
                      setContentLength(newValue.toString()); // Convert the newValue to a string before updating the state
                    }
                  }}
                  placeholder="500"
                  className="mt-1 block w-24 px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  max="1500" // This restricts the input to 1500 max
                />
              </div>

              <Button type="submit" disabled={loading} className="ml-5">
                Create
                {loading && (
                  <svg
                    className="ml-2 h-4 w-4 animate-spin"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                )}
                {!loading && <MagnifyingGlassIcon className="ml-2 h-4 w-4" />}
              </Button>
            </div>
            <button
              type="button"
              onClick={populateDefaults}
              className="px-4 py-2 text-sm text-blue-600 hover:text-blue-500 focus:outline-none focus:underline"
            >
              Click to populate fields with default values
            </button>
          </form>

          {summarizeLoading && <div>Loading...</div>}
        </div>
      )}
    </div>
  );
}
