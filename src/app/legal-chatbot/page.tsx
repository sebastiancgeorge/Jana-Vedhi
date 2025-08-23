
"use client";

import { useState, useRef, useEffect, type FormEvent, useCallback } from "react";
import { getLegalChatbotResponse } from "./actions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bot, Gavel, Send, User, Files } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "@/hooks/use-translation";

type Message = {
  id: string;
  text: string;
  sender: "user" | "bot";
  source?: string;
  translatedText?: string;
};

export default function LegalChatbotPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { t, language, translateDynamicText } = useTranslation();

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
      const botResponse = await getLegalChatbotResponse(currentInput);
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: botResponse.answer,
        sender: "bot",
        source: botResponse.source,
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "Sorry, something went wrong. Please try again.",
        sender: "bot",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
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
                    className={`max-w-md rounded-lg p-3 ${
                      message.sender === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{language === 'malayalam' && message.translatedText ? message.translatedText : message.text}</p>
                    {message.source && (
                      <Badge variant="secondary" className="mt-2">
                        <Files className="mr-1 h-3 w-3" />
                        {t("source")}: {t(message.source)}
                      </Badge>
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
              placeholder={t("legal_chatbot_input_placeholder")}
              disabled={isLoading}
              autoComplete="off"
            />
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
