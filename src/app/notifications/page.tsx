
"use client";

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useTranslation } from "@/hooks/use-translation";
import { useState } from "react";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const districtTopics = [
  "Thiruvananthapuram", "Kollam", "Pathanamthitta", "Alappuzha", "Kottayam", "Idukki",
  "Ernakulam", "Thrissur", "Palakkad", "Malappuram", "Kozhikode", "Wayanad", "Kannur", "Kasaragod"
];

const categoryTopics = ["Roads", "Waste", "Utilities", "Water", "Sanitation", "Health", "Education"];

export default function NotificationsPage() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [enableNotifications, setEnableNotifications] = useState(true);
  const [subscriptions, setSubscriptions] = useState<Record<string, boolean>>({
    "Thiruvananthapuram": true,
    "Roads": true,
    "new_budget_proposal": true,
  });

  const handleSubscriptionChange = (topic: string, checked: boolean) => {
    setSubscriptions(prev => ({...prev, [topic]: checked }));
  }
  
  const handleSave = () => {
    // In a real app, this would save the preferences to the user's profile in Firestore.
    console.log("Saving preferences:", { enableNotifications, subscriptions });
    toast({
        title: "Preferences Saved",
        description: "Your notification settings have been updated.",
    });
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-primary">{t("notifications")}</h1>
        <p className="text-muted-foreground mb-6">{t("notifications_desc")}</p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>{t("notification_settings")}</CardTitle>
          <CardDescription>{t("notification_settings_desc")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="flex items-center space-x-2">
                <Switch 
                    id="enable-notifications" 
                    checked={enableNotifications} 
                    onCheckedChange={setEnableNotifications}
                />
                <Label htmlFor="enable-notifications" className="text-lg font-medium">{t("enable_notifications")}</Label>
            </div>
            
            <Separator />

            <div className={`space-y-6 ${!enableNotifications ? 'opacity-50 pointer-events-none' : ''}`}>
              <div>
                  <h3 className="text-lg font-medium mb-2">{t("district_topics")}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{t("district_topics_desc")}</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {districtTopics.map(topic => (
                          <div key={topic} className="flex items-center space-x-2">
                              <Switch 
                                  id={topic} 
                                  checked={subscriptions[topic] ?? false}
                                  onCheckedChange={(checked) => handleSubscriptionChange(topic, checked)}
                                  disabled={!enableNotifications}
                               />
                              <Label htmlFor={topic}>{t(topic)}</Label>
                          </div>
                      ))}
                  </div>
              </div>

              <Separator />

               <div>
                  <h3 className="text-lg font-medium mb-2">{t("category_topics")}</h3>
                   <p className="text-sm text-muted-foreground mb-4">{t("category_topics_desc")}</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {categoryTopics.map(topic => (
                          <div key={topic} className="flex items-center space-x-2">
                              <Switch 
                                id={topic} 
                                checked={subscriptions[topic] ?? false}
                                onCheckedChange={(checked) => handleSubscriptionChange(topic, checked)}
                                disabled={!enableNotifications}
                              />
                              <Label htmlFor={topic}>{t(topic)}</Label>
                          </div>
                      ))}
                  </div>
              </div>
            </div>

        </CardContent>
        <CardFooter>
            <Button onClick={handleSave}>{t("save_preferences")}</Button>
        </CardFooter>
      </Card>
    </div>
  );
}

    