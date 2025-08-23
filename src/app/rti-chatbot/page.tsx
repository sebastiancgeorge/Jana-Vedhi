import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function RtiChatbotPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight text-primary">RTI Drafting Assistant</h1>
      <p className="text-muted-foreground mb-6">A multi-step chatbot to help you draft an RTI application.</p>
      <Card>
        <CardHeader>
          <CardTitle>Draft your RTI</CardTitle>
          <CardDescription>I will guide you through the process step-by-step.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>A multi-step chat interface for drafting RTI applications will be implemented here.</p>
        </CardContent>
      </Card>
    </div>
  );
}
