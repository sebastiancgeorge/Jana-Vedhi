import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function GeneralChatbotPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight text-primary">General Chatbot</h1>
      <p className="text-muted-foreground mb-6">Ask questions about how to use the Jana Vedhi platform.</p>
      <Card>
        <CardHeader>
          <CardTitle>Jana Vedhi Assistant</CardTitle>
          <CardDescription>I can help you navigate the platform and find what you're looking for.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>A chat interface for the general platform chatbot will be implemented here.</p>
        </CardContent>
      </Card>
    </div>
  );
}
