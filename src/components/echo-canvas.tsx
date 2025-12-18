"use client";

import { useState, useEffect, useRef } from "react";
import { Mic, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { handleGenerateResponse } from "@/app/actions";

export function EchoCanvas() {
  const [transcript, setTranscript] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let interimTranscript = "";
        let finalTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        setTranscript(
          (prev) => prev + finalTranscript
        );
      };
      
      recognition.onend = () => {
        setIsRecording(false);
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        toast({
          variant: "destructive",
          title: "Speech Recognition Error",
          description: event.error,
        });
      };

      recognitionRef.current = recognition;
    } else {
      toast({
        variant: "destructive",
        title: "Unsupported Browser",
        description: "Speech recognition is not supported in this browser.",
      });
    }
  }, [toast]);

  const generateAiResponse = async (text: string) => {
    setIsLoading(true);
    setAiResponse("");
    try {
      const result = await handleGenerateResponse(text);
      if (result.content) {
        setAiResponse(result.content);
      } else {
        throw new Error("The AI returned an empty response.");
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "AI Generation Failed",
        description:
          error instanceof Error ? error.message : "An unknown error occurred.",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleToggleRecording = () => {
    const recognition = recognitionRef.current;
    if (!recognition) return;

    if (isRecording) {
      recognition.stop();
      if(transcript) {
        generateAiResponse(transcript);
      }
    } else {
      setTranscript("");
      setAiResponse("");
      recognition.start();
      setIsRecording(true);
    }
  };

  return (
    <Card className="w-full max-w-3xl animate-in fade-in-0 zoom-in-95 duration-500">
      <CardHeader className="text-center">
        <CardTitle className="text-3xl lg:text-4xl font-headline">
          Unleash Your Voice
        </CardTitle>
        <CardDescription>
          Speak your thoughts, and let Echo craft a response.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="flex flex-col items-center justify-center gap-4">
          <Button
            onClick={handleToggleRecording}
            size="lg"
            variant={isRecording ? "destructive" : "default"}
            className="h-24 w-24 rounded-full shadow-lg transition-all duration-300 hover:scale-105 active:scale-95"
          >
            {isRecording ? (
              <Square className="h-10 w-10 animate-pulse" />
            ) : (
              <Mic className="h-10 w-10" />
            )}
          </Button>
          <p className="text-sm text-muted-foreground min-h-[20px]">
            {isRecording
              ? "Recording... Click to stop and generate."
              : transcript
              ? "Click to generate a new response."
              : "Click the mic to start speaking."}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <h3 className="font-headline text-xl font-semibold">Your Words</h3>
            <div className="mt-2 rounded-lg border bg-card p-4 min-h-[200px] max-h-[300px] overflow-y-auto text-sm">
              <p className="whitespace-pre-wrap">
                {transcript || (
                  <span className="text-muted-foreground">
                    Your transcribed text will appear here...
                  </span>
                )}
              </p>
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="font-headline text-xl font-semibold">
              Echo&apos;s Reply
            </h3>
            <div className="mt-2 rounded-lg border bg-card p-4 min-h-[200px] max-h-[300px] overflow-y-auto text-sm">
              {isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[80%]" />
                  <Skeleton className="h-4 w-[90%]" />
                  <Skeleton className="h-4 w-[85%]" />
                  <Skeleton className="h-4 w-[70%]" />
                </div>
              ) : aiResponse ? (
                <p className="whitespace-pre-wrap">{aiResponse}</p>
              ) : (
                <span className="text-muted-foreground">
                  The AI-generated response will appear here...
                </span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
