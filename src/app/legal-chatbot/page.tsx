
"use client";

import { useState, useRef, useEffect, type FormEvent, useCallback } from "react";
import { getLegalChatbotResponse, getSpokenAudio } from "./actions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bot, Gavel, Send, User, Files, Mic, Volume2, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "@/hooks/use-translation";

type Message = {
  id: string;
  text: string;
  sender: "user" | "bot";
};

type AudioState = {
  [messageId: string]: {
    isLoading: boolean;
    audioUrl?: string;
  };
};

export default function LegalChatbotPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [audioState, setAudioState] = useState<AudioState>({});
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const { t, language } = useTranslation();
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = language === 'malayalam' ? 'ml-IN' : 'en-US';

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(prev => prev ? `${prev} ${transcript}` : transcript);
        setIsListening(false);
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
      };
      recognition.onend = () => {
        setIsListening(false);
      };
      recognitionRef.current = recognition;
    }
  }, [language]);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: "user",
    };
    setMessages((prev) => [...prev, userMessage]);
    const currentInput = input;
    setInput("");
    setIsLoading(true);

    try {
      const botResponse = await getLegalChatbotResponse(currentInput, language);
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: botResponse.answer,
        sender: "bot",
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
       const errorMessageText = t("chatbot_error");
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: errorMessageText,
        sender: "bot",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSpeak = async (messageId: string, text: string) => {
    if (audioRef.current && !audioRef.current.paused) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      return;
    }
    
    if (audioState[messageId]?.audioUrl) {
      if(audioRef.current) {
        audioRef.current.src = audioState[messageId].audioUrl!;
        audioRef.current.play();
      }
      return;
    }

    setAudioState(prev => ({ ...prev, [messageId]: { isLoading: true } }));
    try {
      const response = await getSpokenAudio(text);
      setAudioState(prev => ({ ...prev, [messageId]: { isLoading: false, audioUrl: response.audio } }));
      if (audioRef.current) {
        audioRef.current.src = response.audio;
        audioRef.current.play();
      }
    } catch (error) {
       setAudioState(prev => ({ ...prev, [messageId]: { isLoading: false } }));
       console.error("Failed to play audio", error);
    }
  };

  const toggleListen = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <Card className="flex flex-col flex-1">
        <CardHeader className="border-b">
          <div className="flex items-center gap-3">
            <Gavel className="h-6 w-6 text-primary" />
            <div>
              <CardTitle>{t("legal_chatbot")}</CardTitle>
              <CardDescription>
                {t("legal_chatbot_desc")}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-1 p-0">
          <ScrollArea className="h-[calc(100vh-18rem)]" ref={scrollAreaRef}>
            <div className="p-6 space-y-6">
              {messages.length === 0 && (
                <div className="text-center text-muted-foreground">
                  <Gavel className="mx-auto h-12 w-12 mb-4" />
                  <p>{t("legal_chatbot_placeholder")}</p>
                </div>
              )}
              {messages.map((message) => {
                const isAudioLoading = audioState[message.id]?.isLoading;
                return (
                  <div
                    key={message.id}
                    className={`flex items-start gap-4 ${
                      message.sender === "user" ? "justify-end" : ""
                    }`}
                  >
                    {message.sender === "bot" && (
                      <Avatar className="h-9 w-9 border">
                        <AvatarFallback><Bot className="h-5 w-5" /></AvatarFallback>
                      </Avatar>
                    )}
                    <div
                      className={`max-w-xl w-full rounded-lg p-3 relative group ${
                        message.sender === "user"
                          ? "bg-primary text-primary-foreground max-w-md"
                          : "bg-muted"
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                      
                      {message.sender === "bot" && (
                          <Button
                              variant="ghost"
                              size="icon"
                              className="absolute -top-2 -right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => handleSpeak(message.id, message.text)}
                              disabled={isAudioLoading}
                          >
                            {isAudioLoading ? <Loader2 className="h-4 w-4 animate-spin"/> : <Volume2 className="h-4 w-4" />}
                          </Button>
                      )}
                    </div>
                    {message.sender === "user" && (
                       <Avatar className="h-9 w-9 border">
                        <AvatarFallback><User className="h-5 w-5" /></AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                )
              })}
               {isLoading && (
                <div className="flex items-start gap-4">
                  <Avatar className="h-9 w-9 border">
                    <AvatarFallback><Bot className="h-5 w-5" /></AvatarFallback>
                  </Avatar>
                  <div className="max-w-md rounded-lg p-3 bg-muted">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 bg-primary rounded-full animate-pulse [animation-delay:-0.3s]"></div>
                      <div className="h-2 w-2 bg-primary rounded-full animate-pulse [animation-delay:-0.15s]"></div>
                      <div className="h-2 w-2 bg-primary rounded-full animate-pulse"></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
        <CardFooter className="border-t pt-6">
          <form onSubmit={handleSubmit} className="flex w-full items-center gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t("legal_chatbot_input_placeholder")}
              disabled={isLoading}
              autoComplete="off"
            />
            <Button type="button" size="icon" variant={isListening ? "destructive" : "outline"} onClick={toggleListen} disabled={!recognitionRef.current}>
                <Mic className="h-4 w-4" />
                <span className="sr-only">Speak</span>
            </Button>
            <Button type="submit" disabled={isLoading || !input.trim()}>
              <Send className="h-4 w-4" />
              <span className="sr-only">{t("send")}</span>
            </Button>
          </form>
        </CardFooter>
      </Card>
      <audio ref={audioRef} className="hidden" />
    </div>
  );
}
