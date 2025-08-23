
"use client";

import { useState, useRef, useEffect, type FormEvent, useCallback } from "react";
import { getGeneralChatbotResponse } from "./actions";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bot, HelpCircle, Send, User, Mic, Volume2 } from "lucide-react";
import Link from 'next/link';
import { useTranslation } from "@/hooks/use-translation";

type Message = {
  id: string;
  text: string;
  sender: "user" | "bot";
  links?: string[];
  translatedText?: string;
};

export default function GeneralChatbotPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { t, translateDynamicText, language } = useTranslation();
  const recognitionRef = useRef<any>(null);


  useEffect(() => {
    // SpeechRecognition setup
    if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = language === 'malayalam' ? 'ml-IN' : 'en-US';
      
      recognitionRef.current.onresult = (event: any) => {
        const transcript = Array.from(event.results)
            .map((result: any) => result[0])
            .map((result) => result.transcript)
            .join('');
        setInput(transcript);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
      };
       recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, [language]);


  const translateMessages = useCallback(async (msgs: Message[]) => {
    const promises = msgs.map(async (msg) => {
        if (msg.sender === 'bot' && !msg.translatedText) {
            const translated = await translateDynamicText(msg.text);
            return { ...msg, translatedText: translated };
        }
        return msg;
    });
    const newMessages = await Promise.all(promises);
    setMessages(newMessages);
  }, [translateDynamicText]);

  useEffect(() => {
    translateMessages(messages);
  }, [language, messages, translateMessages]);


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
      const botResponse = await getGeneralChatbotResponse(currentInput);
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: botResponse.answer,
        sender: "bot",
        links: botResponse.relevantLinks,
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: t("chatbot_error"),
        sender: "bot",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSpeak = (text: string) => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = language === 'malayalam' ? 'ml-IN' : 'en-US';
        speechSynthesis.speak(utterance);
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

  const renderMessageText = (text: string, translatedText?: string) => {
    const textToRender = language === 'malayalam' && translatedText ? translatedText : text;
    const parts = textToRender.split(/(\[.*?\]\(.*?\))/g);
    return parts.map((part, index) => {
      const match = part.match(/\[(.*?)\]\((.*?)\)/);
      if (match) {
        const linkText = match[1];
        const linkUrl = match[2];
        return (
          <Link key={index} href={linkUrl} className="text-primary underline hover:text-primary/80">
            {t(linkText)}
          </Link>
        );
      }
      return <span key={index}>{part}</span>;
    });
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <Card className="flex flex-col flex-1">
        <CardHeader className="border-b">
          <div className="flex items-center gap-3">
            <HelpCircle className="h-6 w-6 text-primary" />
            <div>
              <CardTitle>{t("general_chatbot_title")}</CardTitle>
              <CardDescription>{t("general_chatbot_desc")}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-1 p-0">
          <ScrollArea className="h-[calc(100vh-18rem)]" ref={scrollAreaRef}>
            <div className="p-6 space-y-6">
              {messages.length === 0 && (
                <div className="text-center text-muted-foreground">
                  <HelpCircle className="mx-auto h-12 w-12 mb-4" />
                  <p>{t("general_chatbot_placeholder")}</p>
                </div>
              )}
              {messages.map((message) => (
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
                    className={`max-w-md rounded-lg p-3 relative group ${
                      message.sender === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    <div className="text-sm whitespace-pre-wrap">{renderMessageText(message.text, message.translatedText)}</div>
                     {message.sender === "bot" && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute -top-2 -right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => handleSpeak(language === 'malayalam' && message.translatedText ? message.translatedText : message.text)}
                        >
                            <Volume2 className="h-4 w-4" />
                        </Button>
                    )}
                  </div>
                  {message.sender === "user" && (
                     <Avatar className="h-9 w-9 border">
                      <AvatarFallback><User className="h-5 w-5" /></AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
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
              placeholder={t("general_chatbot_input_placeholder")}
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
    </div>
  );
}
