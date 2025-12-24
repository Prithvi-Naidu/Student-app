"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Circle, FileText, CreditCard, Home, GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface DocumentItem {
  id: string;
  label: string;
  required: boolean;
  icon?: React.ReactNode;
  description?: string;
}

interface RequiredDocumentsChecklistProps {
  className?: string;
}

export function RequiredDocumentsChecklist({ className }: RequiredDocumentsChecklistProps) {
  const [checked, setChecked] = useState<Set<string>>(new Set());

  const primaryDocuments: DocumentItem[] = [
    {
      id: "passport",
      label: "Valid Passport",
      required: true,
      icon: <FileText className="h-5 w-5" />,
      description: "Must not be expired",
    },
    {
      id: "i20",
      label: "I-20 Form (F-1 students)",
      required: true,
      icon: <FileText className="h-5 w-5" />,
      description: "Current and signed by DSO",
    },
    {
      id: "ds2019",
      label: "DS-2019 Form (J-1 students)",
      required: true,
      icon: <FileText className="h-5 w-5" />,
      description: "For exchange visitors",
    },
    {
      id: "visa",
      label: "U.S. Visa Documentation",
      required: true,
      icon: <CreditCard className="h-5 w-5" />,
      description: "Valid visa stamp in passport",
    },
    {
      id: "i94",
      label: "I-94 Arrival/Departure Record",
      required: true,
      icon: <FileText className="h-5 w-5" />,
      description: "Print from i94.cbp.gov",
    },
  ];

  const secondaryDocuments: DocumentItem[] = [
    {
      id: "address",
      label: "Proof of Address",
      required: false,
      icon: <Home className="h-5 w-5" />,
      description: "Utility bill, lease, or university housing confirmation",
    },
    {
      id: "enrollment",
      label: "Proof of Enrollment",
      required: false,
      icon: <GraduationCap className="h-5 w-5" />,
      description: "Student ID, acceptance letter, or class schedule",
    },
    {
      id: "income",
      label: "Proof of Income (if applicable)",
      required: false,
      icon: <FileText className="h-5 w-5" />,
      description: "Scholarship letter or assistantship confirmation",
    },
  ];

  const toggleItem = (id: string) => {
    const newChecked = new Set(checked);
    if (newChecked.has(id)) {
      newChecked.delete(id);
    } else {
      newChecked.add(id);
    }
    setChecked(newChecked);
  };

  const allRequired = primaryDocuments.filter(item => item.required);
  const requiredChecked = allRequired.filter(item => checked.has(item.id)).length;
  const totalChecked = checked.size;
  const totalItems = [...primaryDocuments, ...secondaryDocuments].length;
  const progress = (totalChecked / totalItems) * 100;
  const requiredProgress = (requiredChecked / allRequired.length) * 100;

  return (
    <div className={cn("space-y-6 my-8", className)}>
      <Card className="border-2 border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl flex items-center gap-2">
              <FileText className="h-6 w-6 text-primary" />
              Required Documents Checklist
            </CardTitle>
            <div className="text-sm text-muted-foreground">
              {totalChecked} of {totalItems} completed
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Overall Progress</span>
              <span className="font-medium">{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2.5">
              <div
                className="bg-primary h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            
            <div className="flex items-center justify-between text-sm mt-3">
              <span className="text-muted-foreground">
                Required Items: <strong className="text-foreground">{requiredChecked} / {allRequired.length}</strong>
              </span>
              <Badge variant={requiredChecked === allRequired.length ? "default" : "secondary"}>
                {requiredChecked === allRequired.length ? "Complete" : "Incomplete"}
              </Badge>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className={cn(
                  "h-2 rounded-full transition-all duration-300",
                  requiredChecked === allRequired.length ? "bg-green-600" : "bg-yellow-600"
                )}
                style={{ width: `${requiredProgress}%` }}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Primary Documents */}
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                1
              </span>
              Primary Documents (Required)
            </h3>
            <div className="space-y-3">
              {primaryDocuments.map((item) => (
                <label
                  key={item.id}
                  className={cn(
                    "flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all",
                    checked.has(item.id)
                      ? "bg-primary/5 border-primary shadow-sm"
                      : "hover:bg-muted/50 border-border",
                    item.required && "border-l-4 border-l-primary"
                  )}
                >
                  <div className="flex-shrink-0 mt-0.5">
                    {checked.has(item.id) ? (
                      <CheckCircle2 className="h-6 w-6 text-primary" />
                    ) : (
                      <Circle className="h-6 w-6 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {item.icon && <span className="text-primary">{item.icon}</span>}
                      <span className="font-semibold text-base">{item.label}</span>
                      {item.required && (
                        <Badge variant="destructive" className="text-xs">Required</Badge>
                      )}
                    </div>
                    {item.description && (
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    )}
                  </div>
                  <input
                    type="checkbox"
                    checked={checked.has(item.id)}
                    onChange={() => toggleItem(item.id)}
                    className="sr-only"
                  />
                </label>
              ))}
            </div>
          </div>

          {/* Secondary Documents */}
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center text-sm font-bold">
                2
              </span>
              Secondary Documents (May be Required)
            </h3>
            <div className="space-y-3">
              {secondaryDocuments.map((item) => (
                <label
                  key={item.id}
                  className={cn(
                    "flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-all",
                    checked.has(item.id)
                      ? "bg-secondary/5 border-secondary shadow-sm"
                      : "hover:bg-muted/50 border-border"
                  )}
                >
                  <div className="flex-shrink-0 mt-0.5">
                    {checked.has(item.id) ? (
                      <CheckCircle2 className="h-6 w-6 text-secondary-foreground" />
                    ) : (
                      <Circle className="h-6 w-6 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {item.icon && <span className="text-muted-foreground">{item.icon}</span>}
                      <span className="font-medium text-base">{item.label}</span>
                      <Badge variant="outline" className="text-xs">Optional</Badge>
                    </div>
                    {item.description && (
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    )}
                  </div>
                  <input
                    type="checkbox"
                    checked={checked.has(item.id)}
                    onChange={() => toggleItem(item.id)}
                    className="sr-only"
                  />
                </label>
              ))}
            </div>
          </div>

          {/* Completion Message */}
          {requiredChecked === allRequired.length && (
            <div className="mt-4 p-4 bg-green-50 dark:bg-green-950 border-2 border-green-500 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <p className="text-sm font-medium text-green-900 dark:text-green-100">
                  Great! You have all required documents. You&apos;re ready to visit the bank!
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

