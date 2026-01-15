"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, ExternalLink, ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

export function DigiLockerIntegration() {
  const [isOpen, setIsOpen] = useState(false);

  const handleRedirectToDigiLocker = () => {
    // Redirect to DigiLocker website for user to sign in
    window.open("https://www.digilocker.gov.in/", "_blank", "noopener,noreferrer");
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-green-600" />
                <div className="text-left">
                  <CardTitle className="text-lg">DigiLocker (for Indian Students)</CardTitle>
                  <CardDescription>
                    Access your official Indian documents from DigiLocker
                  </CardDescription>
                </div>
              </div>
              {isOpen ? (
                <ChevronUp className="h-5 w-5 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-5 w-5 text-muted-foreground" />
              )}
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="space-y-4 pt-0">
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                DigiLocker is a secure cloud-based platform by the Government of India that stores your verified digital documents.
              </p>
              
              <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                <h4 className="font-semibold text-sm">How it works:</h4>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Sign in to your DigiLocker account on the official website</li>
                  <li>Access your verified documents (Aadhaar, Driving License, Educational certificates, etc.)</li>
                  <li>Download and upload documents to your vault as needed</li>
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <Button onClick={handleRedirectToDigiLocker} className="flex-1">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Go to DigiLocker Website
                </Button>
                <Button asChild variant="outline" className="flex-1">
                  <Link href="https://www.digilocker.gov.in/" target="_blank" rel="noopener noreferrer">
                    Learn More
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
