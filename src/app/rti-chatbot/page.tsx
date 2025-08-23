
"use client";

import { useState, useRef, useEffect, type FormEvent, useCallback } from "react";
import { getRtiChatbotResponse } from "./actions";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bot, FileText, Send, User, Download, Save, Mic, Volume2 } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import { Textarea } from "@/components/ui/textarea";
import { jsPDF } from "jspdf";

type Message = {
  id: string;
  text: string;
  sender: "user" | "bot";
  translatedText?: string;
};

type ChatState = {
  currentStep: string;
  rtiDraft: string;
  isDraftComplete: boolean;
  translatedRtiDraft?: string;
};

export default function RtiChatbotPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [chatState, setChatState] = useState<ChatState>({
    currentStep: "Introduction",
    rtiDraft: "",
    isDraftComplete: false,
  });
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { t, language, translateDynamicText } = useTranslation();
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

  const translateRtiDraft = useCallback(async (draft: string) => {
    if (draft) {
      const translated = await translateDynamicText(draft);
      setChatState(prev => ({ ...prev, translatedRtiDraft: translated }));
    }
  }, [translateDynamicText]);
  
  useEffect(() => {
    translateMessages(messages);
  }, [language, messages, translateMessages]);

  useEffect(() => {
    if (language === 'malayalam') {
      translateRtiDraft(chatState.rtiDraft);
    }
  }, [language, chatState.rtiDraft, translateRtiDraft]);


  useEffect(() => {
    // Initial message from the bot
    const fetchInitialMessage = async () => {
      setIsLoading(true);
      try {
        const initialResponse = await getRtiChatbotResponse({
          currentStep: "Introduction",
          userInput: "",
        });
        setMessages([{ id: "init", text: initialResponse.response, sender: "bot" }]);
        setChatState(prev => ({ ...prev, currentStep: initialResponse.nextStep }));
      } catch (error) {
        setMessages([{ id: "init-error", text: "Error starting chat.", sender: "bot" }]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchInitialMessage();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  const handleExport = () => {
    const doc = new jsPDF();
    const textToExport = language === 'malayalam' && chatState.translatedRtiDraft ? chatState.translatedRtiDraft : chatState.rtiDraft;
    // jsPDF doesn't handle Malayalam font well by default, this will likely render incorrectly without font embedding.
    // This is a limitation of the library without extra configuration.
    doc.text(textToExport, 10, 10);
    doc.save("rti-application.pdf");
  };
  
  const handleSave = () => {
    // In a real app, this would save to a database.
    localStorage.setItem("rtiDraft", chatState.rtiDraft);
    alert("Draft saved locally!");
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() || isLoading || chatState.isDraftComplete) return;

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
      const botResponse = await getRtiChatbotResponse({
        currentStep: chatState.currentStep,
        userInput: currentInput,
        rtiDraft: chatState.rtiDraft,
      });
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: botResponse.response,
        sender: "bot",
      };
      setMessages((prev) => [...prev, botMessage]);
      setChatState({
        ...chatState,
        currentStep: botResponse.nextStep,
        rtiDraft: botResponse.updatedDraft ?? chatState.rtiDraft,
        isDraftComplete: botResponse.isDraftComplete,
      });
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

  return (
    <div className="flex flex-col md:flex-row gap-6 h-[calc(100vh-8rem)]">
      <Card className="flex flex-col flex-1">
        <CardHeader className="border-b">
          <div className="flex items-center gap-3">
            <Bot className="h-6 w-6 text-primary" />
            <div>
              <CardTitle>{t("rti_chatbot_title")}</CardTitle>
              <CardDescription>{t("rti_chatbot_desc")}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-1 p-0">
          <ScrollArea className="h-[calc(100vh-23rem)] md:h-[calc(100vh-18rem)]" ref={scrollAreaRef}>
            <div className="p-6 space-y-6">
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
                    <p className="text-sm whitespace-pre-wrap">{language === 'malayalam' && message.translatedText ? message.translatedText : message.text}</p>
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
              placeholder={t("rti_chatbot_input_placeholder")}
              disabled={isLoading || chatState.isDraftComplete}
              autoComplete="off"
            />
             <Button type="button" size="icon" variant={isListening ? "destructive" : "outline"} onClick={toggleListen} disabled={!recognitionRef.current}>
                <Mic className="h-4 w-4" />
                <span className="sr-only">Speak</span>
            </Button>
            <Button type="submit" disabled={isLoading || !input.trim() || chatState.isDraftComplete}>
              <Send className="h-4 w-4" />
              <span className="sr-only">{t("send")}</span>
            </Button>
          </form>
        </CardFooter>
      </Card>

      <Card className="w-full md:w-1/3 flex flex-col">
        <CardHeader>
            <CardTitle>{t("rti_draft_preview")}</CardTitle>
            <CardDescription>{t("rti_draft_preview_desc")}</CardDescription>
        </CardHeader>
        <CardContent className="flex-1">
            <Textarea
                className="h-full resize-none"
                value={language === 'malayalam' && chatState.translatedRtiDraft ? chatState.translatedRtiDraft : chatState.rtiDraft}
                readOnly
                placeholder={t("rti_draft_placeholder")}
            />
        </CardContent>
         <CardFooter className="flex-col sm:flex-row gap-2">
            <Button onClick={handleExport} disabled={!chatState.isDraftComplete} className="w-full">
                <Download className="mr-2 h-4 w-4" />
                {t("export_pdf")}
            </Button>
            <Button onClick={handleSave} disabled={!chatState.isDraftComplete} variant="outline" className="w-full">
                <Save className="mr-2 h-4 w-4" />
                {t("save_draft")}
            </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
