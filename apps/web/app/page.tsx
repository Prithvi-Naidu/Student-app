import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { 
  Home, 
  Users, 
  CreditCard, 
  FileText, 
  MessageSquare, 
  Shield,
  CheckCircle2,
  ArrowRight
} from "lucide-react";

export default function LandingPage() {
  const features = [
    {
      icon: Home,
      title: "Housing Finder",
      description: "Find verified student accommodations and connect with roommates. Safe, affordable, and student-friendly options.",
    },
    {
      icon: MessageSquare,
      title: "Community Forum",
      description: "Connect with fellow students, ask questions, share experiences, and build your network.",
    },
    {
      icon: CreditCard,
      title: "Banking Guidance",
      description: "Expert resources on opening bank accounts, building credit, and managing finances in the U.S.",
    },
    {
      icon: FileText,
      title: "Document Vault",
      description: "Securely store and manage your important documents with automated expiration reminders.",
    },
    {
      icon: Users,
      title: "Buddy System",
      description: "Get matched with senior students or alumni for personalized guidance and support.",
    },
    {
      icon: Shield,
      title: "Secure & Private",
      description: "Your data is encrypted and secure. We take privacy seriously.",
    },
  ];

  const benefits = [
    "Verified housing listings",
    "Expert financial guidance",
    "24/7 community support",
    "Secure document storage",
    "Exclusive student discounts",
    "Career development resources",
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="container py-24 md:py-32 lg:py-40">
          <div className="flex flex-col items-center space-y-8 text-center">
            <Badge variant="secondary" className="mb-4">
              Your All-in-One Student Platform
            </Badge>
            <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
              Thrive as an{" "}
              <span className="text-primary">International Student</span> in the U.S.
            </h1>
            <p className="max-w-[700px] text-lg text-muted-foreground sm:text-xl md:text-2xl">
              One comprehensive platform that empowers you to smoothly transition, 
              integrate, and succeed. From housing to finance, we&apos;ve got you covered.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row">
              <Button asChild size="lg" className="text-lg px-8">
                <Link href="#get-started">
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-lg px-8">
                <Link href="#features">Learn More</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="container py-24 md:py-32 bg-muted/50">
          <div className="mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-4">
                Everything You Need, All in One Place
              </h2>
              <p className="text-xl text-muted-foreground max-w-[700px] mx-auto">
                Comprehensive services designed specifically for international students
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <Card key={index} className="border-2 hover:border-primary/50 transition-colors">
                    <CardHeader>
                      <div className="mb-4 h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <CardTitle>{feature.title}</CardTitle>
                      <CardDescription className="text-base">
                        {feature.description}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="container py-24 md:py-32">
          <div className="mx-auto max-w-6xl">
            <div className="grid gap-12 lg:grid-cols-2 items-center">
              <div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-6">
                  Why Choose OneStop?
                </h2>
                <p className="text-lg text-muted-foreground mb-8">
                  We understand the challenges you face as an international student. 
                  That&apos;s why we&apos;ve built a platform that addresses your unique needs.
                </p>
                <ul className="space-y-4">
                  {benefits.map((benefit, index) => (
                    <li key={index} className="flex items-center space-x-3">
                      <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0" />
                      <span className="text-lg">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <Card className="p-8">
                <CardContent className="pt-6">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-2xl font-bold mb-2">Trusted by Thousands</h3>
                      <p className="text-muted-foreground">
                        Join over 10,000+ international students who trust OneStop for their journey
                      </p>
                    </div>
                    <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                      <div>
                        <div className="text-3xl font-bold">10K+</div>
                        <div className="text-sm text-muted-foreground">Students</div>
                      </div>
                      <div>
                        <div className="text-3xl font-bold">50+</div>
                        <div className="text-sm text-muted-foreground">Universities</div>
                      </div>
                      <div>
                        <div className="text-3xl font-bold">5K+</div>
                        <div className="text-sm text-muted-foreground">Listings</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section id="get-started" className="container py-24 md:py-32 bg-primary text-primary-foreground">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-6">
              Ready to Get Started?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Join thousands of students who are already thriving with OneStop
            </p>
            <Button asChild size="lg" variant="secondary" className="text-lg px-8">
              <Link href="/signup">
                Create Your Account
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
