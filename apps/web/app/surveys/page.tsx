import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Gift, Clock, TrendingUp } from "lucide-react";

export default function SurveysPage() {
  // Sample surveys - will be replaced with API data
  const sampleSurveys = [
    {
      id: "1",
      provider: "Survey Provider A",
      title: "Student Lifestyle Survey",
      description: "Share your experience as an international student",
      reward_points: 500,
      estimated_time: "10 minutes",
    },
    {
      id: "2",
      provider: "Survey Provider B",
      title: "Campus Life Feedback",
      description: "Help improve campus services for students",
      reward_points: 300,
      estimated_time: "5 minutes",
    },
    {
      id: "3",
      provider: "Survey Provider C",
      title: "Financial Habits Study",
      description: "Participate in research about student financial behaviors",
      reward_points: 750,
      estimated_time: "15 minutes",
    },
  ];

  const totalPoints = 1250; // Will be fetched from API

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold mb-2">Survey Rewards</h1>
          <p className="text-muted-foreground text-lg">
            Earn rewards by participating in surveys and research studies
          </p>
        </div>

        {/* Points Summary */}
        <Card className="bg-gradient-to-r from-primary/10 to-primary/5">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Your Reward Points</p>
                <p className="text-4xl font-bold">{totalPoints.toLocaleString()}</p>
              </div>
              <div className="p-4 rounded-full bg-primary/20">
                <Gift className="h-8 w-8 text-primary" />
              </div>
            </div>
            <div className="mt-4 flex gap-4">
              <Button variant="outline">Redeem Points</Button>
              <Button variant="outline">View History</Button>
            </div>
          </CardContent>
        </Card>

        {/* Available Surveys */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold">Available Surveys</h2>
            <Badge variant="secondary">{sampleSurveys.length} Available</Badge>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {sampleSurveys.map((survey) => (
              <Card key={survey.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <Badge variant="outline">{survey.provider}</Badge>
                    <div className="flex items-center gap-1 text-primary font-semibold">
                      <Gift className="h-4 w-4" />
                      {survey.reward_points}
                    </div>
                  </div>
                  <CardTitle className="text-xl">{survey.title}</CardTitle>
                  <CardDescription>{survey.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    {survey.estimated_time}
                  </div>
                  <Button className="w-full">
                    Start Survey
                    <TrendingUp className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* How It Works */}
        <Card>
          <CardHeader>
            <CardTitle>How It Works</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-3">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                  1
                </div>
                <h3 className="font-semibold">Complete Surveys</h3>
                <p className="text-sm text-muted-foreground">
                  Participate in surveys that match your profile and interests
                </p>
              </div>
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                  2
                </div>
                <h3 className="font-semibold">Earn Points</h3>
                <p className="text-sm text-muted-foreground">
                  Receive reward points for each completed survey
                </p>
              </div>
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                  3
                </div>
                <h3 className="font-semibold">Redeem Rewards</h3>
                <p className="text-sm text-muted-foreground">
                  Exchange points for gift cards, discounts, or platform credits
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

