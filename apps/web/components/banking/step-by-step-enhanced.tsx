"use client";

import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, ArrowDown, Search, CreditCard, FileText, Building2, ClipboardCheck, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface Step {
  number: number;
  title: string;
  description: string;
  icon?: React.ReactNode;
  details?: string[];
}

interface StepByStepEnhancedProps {
  steps: Step[];
  className?: string;
}

export function StepByStepEnhanced({ steps, className }: StepByStepEnhancedProps) {
  const stepIcons = [
    <Search key="search" className="h-6 w-6" />,
    <CreditCard key="credit-card" className="h-6 w-6" />,
    <FileText key="file-text" className="h-6 w-6" />,
    <Building2 key="building" className="h-6 w-6" />,
    <ClipboardCheck key="clipboard" className="h-6 w-6" />,
    <CheckCircle key="check-circle" className="h-6 w-6" />,
  ];

  return (
    <div className={cn("my-12 space-y-6", className)}>
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-2">Step-by-Step Process</h2>
        <p className="text-muted-foreground text-lg">
          Follow these steps to successfully open your bank account
        </p>
      </div>

      <div className="relative">
        {/* Connecting Line (Desktop only) */}
        <div className="hidden lg:block absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-primary/50 to-primary" 
             style={{ top: '2rem', bottom: '2rem' }} />

        <div className="space-y-8">
          {steps.map((step, index) => {
            const isLast = index === steps.length - 1;
            const Icon = stepIcons[index] || <CheckCircle2 className="h-6 w-6" />;

            return (
              <div key={step.number} className="relative">
                <Card className={cn(
                  "border-2 transition-all hover:shadow-lg",
                  "lg:ml-16",
                  index % 2 === 0 
                    ? "border-primary/20 bg-primary/5" 
                    : "border-secondary/20 bg-secondary/5"
                )}>
                  <CardContent className="p-6">
                    <div className="flex gap-6">
                      {/* Step Number Badge */}
                      <div className="flex-shrink-0">
                        <div className={cn(
                          "w-16 h-16 rounded-full flex items-center justify-center font-bold text-xl shadow-md",
                          "bg-primary text-primary-foreground",
                          "relative z-10"
                        )}>
                          {step.number}
                        </div>
                        {/* Icon inside or next to number */}
                        <div className="mt-3 flex justify-center">
                          <div className="p-2 rounded-lg bg-background border border-border">
                            {Icon}
                          </div>
                        </div>
                      </div>

                      {/* Step Content */}
                      <div className="flex-1 space-y-3">
                        <div>
                          <h3 className="text-xl font-bold text-foreground mb-2">
                            {step.title}
                          </h3>
                          <p className="text-foreground leading-relaxed">
                            {step.description}
                          </p>
                        </div>

                        {step.details && step.details.length > 0 && (
                          <ul className="space-y-2 mt-4">
                            {step.details.map((detail, detailIndex) => (
                              <li key={detailIndex} className="flex items-start gap-2 text-sm">
                                <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                                <span className="text-muted-foreground">{detail}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Arrow between steps (Mobile only) */}
                {!isLast && (
                  <div className="lg:hidden flex justify-center my-4">
                    <ArrowDown className="h-6 w-6 text-primary" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
