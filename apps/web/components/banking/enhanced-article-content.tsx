"use client";

import { useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, AlertCircle, Info, ExternalLink, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { RequiredDocumentsChecklist } from "./required-documents-checklist";
import { createRoot } from "react-dom/client";

interface ArticleContentProps {
  content: string;
  showChecklist?: boolean;
}

export function ArticleContent({ content, showChecklist = false }: ArticleContentProps) {
  // Parse and enhance HTML content
  let enhancedContent = enhanceHTMLContent(content);
  
  // Insert checklist after Step-by-Step Process section if needed
  if (showChecklist) {
    // Find the Step-by-Step Process section and insert checklist after it
    // Look for the section that ends before the next h2 heading
    const stepByStepRegex = /(<h2[^>]*>Step-by-Step Process<\/h2>[\s\S]*?)(?=<h2[^>]*>|$)/gi;
    const match = stepByStepRegex.exec(enhancedContent);
    
    if (match) {
      const stepSectionEnd = match.index + match[0].length;
      
      // Insert checklist placeholder right after Step-by-Step Process section
      enhancedContent = 
        enhancedContent.substring(0, stepSectionEnd) +
        '<div id="required-documents-checklist-placeholder"></div>' +
        enhancedContent.substring(stepSectionEnd);
    }
  }

  useEffect(() => {
    if (showChecklist) {
      // Find the placeholder and render the checklist component
      const placeholder = document.getElementById('required-documents-checklist-placeholder');
      if (placeholder) {
        const root = createRoot(placeholder);
        root.render(<RequiredDocumentsChecklist />);
        return () => root.unmount();
      }
    }
  }, [showChecklist]);

  return (
    <article 
      className="prose max-w-none
        prose-headings:font-bold prose-headings:text-foreground
        prose-headings:mt-8 prose-headings:mb-4
        prose-h1:text-2xl prose-h1:border-b prose-h1:pb-3 prose-h1:mb-6
        prose-h2:text-xl prose-h2:mt-10 prose-h2:mb-4 prose-h2:text-foreground
        prose-h3:text-lg prose-h3:mt-6 prose-h3:mb-3 prose-h3:text-foreground
        prose-p:text-foreground prose-p:leading-relaxed prose-p:mb-4 prose-p:text-base
        prose-a:text-primary prose-a:no-underline hover:prose-a:underline
        prose-a:font-medium prose-a:inline-flex prose-a:items-center prose-a:gap-1
        prose-strong:text-foreground prose-strong:font-semibold
        prose-ul:text-foreground prose-ol:text-foreground
        prose-li:text-foreground prose-li:my-2
        prose-blockquote:border-l-4 prose-blockquote:border-primary 
        prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:my-6
        prose-blockquote:text-muted-foreground prose-blockquote:bg-muted/50
        prose-blockquote:py-2 prose-blockquote:rounded-r
        prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded 
        prose-code:text-sm prose-code:font-mono prose-code:text-foreground
        prose-pre:bg-muted prose-pre:p-4 prose-pre:rounded-lg prose-pre:overflow-x-auto
        prose-img:rounded-lg prose-img:shadow-md prose-img:my-6
        prose-table:w-full prose-table:border-collapse prose-table:my-6
        prose-th:border prose-th:border-border prose-th:bg-muted 
        prose-th:px-4 prose-th:py-3 prose-th:text-left prose-th:font-semibold
        prose-td:border prose-td:border-border prose-td:px-4 prose-td:py-3
        prose-hr:border-t prose-hr:border-border prose-hr:my-8"
      dangerouslySetInnerHTML={{ __html: enhancedContent }}
    />
  );
}

// Enhance HTML content with better styling and components
function enhanceHTMLContent(html: string): string {
  let enhanced = html;

  // Remove duplicate H1 heading if it matches the article title (already shown in header)
  enhanced = enhanced.replace(/<h1[^>]*>.*?<\/h1>/gi, '');
  
  // Remove the introduction paragraph if it's the first paragraph (we show it separately)
  enhanced = enhanced.replace(/^<p>As an international student arriving in the United States[^<]*<\/p>/i, '');
  
  // Remove the "Required Documents" heading and its content since we show the interactive checklist
  // The checklist will be inserted after Step-by-Step Process section
  enhanced = enhanced.replace(
    /<h2[^>]*>Required Documents<\/h2>[\s\S]*?(?=<h2|<h3|$)/gi,
    ''
  );

  // Compact step indicators with blue gradient and hover effects
  enhanced = enhanced.replace(
    /<h3>(Step \d+[^<]*)<\/h3>\s*<p>([^<]+)<\/p>/gi,
    (_match: string, stepText: string, stepDescription: string) => {
      const stepNum = stepText.match(/\d+/)?.[0] || '';
      const stepTitle = stepText.replace(/Step \d+:\s*/i, '');
      return `
        <div class="step-compact my-1.5">
          <div class="flex items-start gap-2 p-2 rounded-lg border border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10 hover:from-primary/10 hover:to-primary/15 transition-all hover:shadow-sm">
            <div class="flex-shrink-0 w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold text-xs">
              ${stepNum}
            </div>
            <div class="flex-1">
              <h3 class="!mt-0 text-sm font-semibold mb-0.5 text-foreground leading-tight">${stepTitle}</h3>
              <p class="text-foreground text-xs leading-snug mb-0">${stepDescription}</p>
            </div>
          </div>
        </div>
      `;
    }
  );
  
  // Also handle steps without immediate paragraph
  enhanced = enhanced.replace(
    /<h3>(Step \d+[^<]*)<\/h3>/gi,
    (_match: string, stepText: string) => {
      const stepNum = stepText.match(/\d+/)?.[0] || '';
      const stepTitle = stepText.replace(/Step \d+:\s*/i, '');
      return `
        <div class="step-compact my-1.5">
          <div class="flex items-start gap-2 p-2 rounded-lg border border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10 hover:from-primary/10 hover:to-primary/15 transition-all hover:shadow-sm">
            <div class="flex-shrink-0 w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold text-xs">
              ${stepNum}
            </div>
            <div class="flex-1">
              <h3 class="!mt-0 text-sm font-semibold mb-0 text-foreground leading-tight">${stepTitle}</h3>
            </div>
          </div>
        </div>
      `;
    }
  );

  // Enhance lists with better styling
  enhanced = enhanced.replace(
    /<ul>([\s\S]*?)<\/ul>/gi,
    (_match: string, content: string) => {
      if (content.includes('<li>')) {
        return `<ul class="space-y-2 my-4">${content}</ul>`;
      }
      return _match;
    }
  );

  // Enhance lists with better styling (keep simple for now)
  enhanced = enhanced.replace(
    /<li><strong>([^<]+)<\/strong>/gi,
    '<li class="flex items-start gap-2"><span class="text-primary mr-2">✓</span><span><strong>$1</strong></span>'
  );

  // Add info box styling to blockquotes
  enhanced = enhanced.replace(
    /<blockquote>([\s\S]*?)<\/blockquote>/gi,
    '<div class="info-box bg-blue-50 dark:bg-blue-950 border-l-4 border-blue-500 p-4 my-6 rounded-r">$1</div>'
  );

  // Enhance Bank-Specific Information section (under Bank-Specific Information h2)
  enhanced = enhanced.replace(
    /<h2[^>]*>Bank-Specific Information<\/h2>([\s\S]*?)(?=<h2|$)/gi,
    (_match: string, bankSection: string) => {
      // Process each bank entry
      const enhancedBanks = bankSection.replace(
        /<h3>([^<]+)<\/h3>([\s\S]*?)(?=<h3>|<h2>|$)/gi,
        (_bankMatch: string, bankName: string, bankContent: string) => {
          // Extract key information with more flexible regex
          const requirementsMatch = bankContent.match(/<p><strong>Requirements:<\/strong>\s*([^<]+)<\/p>/i);
          const feesMatch = bankContent.match(/<p><strong>Fees:<\/strong>\s*([^<]+)<\/p>/i);
          const depositMatch = bankContent.match(/<p><strong>Minimum Deposit:<\/strong>\s*([^<]+)<\/p>/i);
          const linkMatch = bankContent.match(/<a[^>]+href="([^"]+)"[^>]*>([^<]+)<\/a>/i);
          
          const requirements = requirementsMatch?.[1]?.trim() || '';
          const fees = feesMatch?.[1]?.trim() || '';
          const deposit = depositMatch?.[1]?.trim() || '';
          const linkUrl = linkMatch?.[1] || '';
          const linkText = linkMatch?.[2] || '';
          
          return `
            <div class="bank-card my-3 p-3 rounded-lg border border-border bg-card hover:shadow-md transition-shadow">
              <h3 class="text-base font-semibold mb-2 text-foreground">${bankName}</h3>
              <div class="space-y-1.5 text-sm">
                ${requirements ? `<div><span class="font-medium text-foreground">Requirements:</span> <span class="text-muted-foreground">${requirements}</span></div>` : ''}
                ${fees ? `<div><span class="font-medium text-foreground">Fees:</span> <span class="text-muted-foreground">${fees}</span></div>` : ''}
                ${deposit ? `<div><span class="font-medium text-foreground">Minimum Deposit:</span> <span class="text-muted-foreground">${deposit}</span></div>` : ''}
                ${linkUrl ? `<div class="mt-2"><a href="${linkUrl}" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline font-medium text-xs inline-flex items-center gap-1">${linkText} <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg></a></div>` : ''}
              </div>
            </div>
          `;
        }
      );
      return `<h2 class="text-xl font-bold mt-8 mb-4">Bank-Specific Information</h2>${enhancedBanks}`;
    }
  );

  // Enhance Common Challenges section
  enhanced = enhanced.replace(
    /<h2[^>]*>Common Challenges and Solutions<\/h2>([\s\S]*?)(?=<h2|$)/gi,
    (_match: string, challengesContent: string) => {
      const enhancedChallenges = challengesContent.replace(
        /<h3>Challenge: ([^<]+)<\/h3>\s*<p><strong>Solution:<\/strong>\s*([^<]+)<\/p>/gi,
        (_challengeMatch: string, challenge: string, solution: string) => {
          return `
            <div class="challenge-card my-2.5 p-3 rounded-lg border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20">
              <div class="font-semibold text-sm text-foreground mb-1">Challenge: ${challenge}</div>
              <div class="text-sm text-muted-foreground"><strong class="text-foreground">Solution:</strong> ${solution}</div>
            </div>
          `;
        }
      );
      return `<h2 class="text-xl font-bold mt-8 mb-4">Common Challenges and Solutions</h2>${enhancedChallenges}`;
    }
  );

  // Enhance Tips for Success section
  enhanced = enhanced.replace(
    /<h2[^>]*>Tips for Success<\/h2>([\s\S]*?)(?=<h2|$)/gi,
    (_match: string, tipsContent: string) => {
      // Enhance list items with checkmarks
      const enhancedTips = tipsContent.replace(
        /<li>([^<]+)<\/li>/gi,
        '<li class="flex items-start gap-2 my-1.5 text-sm"><span class="text-primary mt-0.5 flex-shrink-0">✓</span><span class="text-foreground">$1</span></li>'
      );
      return `<h2 class="text-xl font-bold mt-8 mb-4">Tips for Success</h2><ul class="space-y-1 my-3">${enhancedTips.match(/<li[^>]*>[\s\S]*?<\/li>/gi)?.join('') || ''}</ul>`;
    }
  );

  // Enhance FAQ section (only within Frequently Asked Questions h2)
  enhanced = enhanced.replace(
    /<h2[^>]*>Frequently Asked Questions<\/h2>([\s\S]*?)(?=<h2|$)/gi,
    (_match: string, faqContent: string) => {
      const enhancedFAQ = faqContent.replace(
        /<h3>([^<]+\?)<\/h3>\s*<p>([^<]+)<\/p>/gi,
        (_faqMatch: string, question: string, answer: string) => {
          return `
            <div class="faq-item my-3 p-3 rounded-lg border border-border bg-muted/30 hover:bg-muted/50 transition-colors">
              <h3 class="text-base font-semibold mb-1.5 text-foreground">${question}</h3>
              <p class="text-sm text-muted-foreground leading-relaxed mb-0">${answer}</p>
            </div>
          `;
        }
      );
      return `<h2 class="text-xl font-bold mt-8 mb-4">Frequently Asked Questions</h2>${enhancedFAQ}`;
    }
  );

  return enhanced;
}

// Info Box Component
export function InfoBox({
  type = "info",
  children,
}: {
  type?: "info" | "warning" | "success" | "tip";
  children: React.ReactNode;
}) {
  const styles = {
    info: "bg-blue-50 dark:bg-blue-950 border-blue-500 text-blue-900 dark:text-blue-100",
    warning: "bg-yellow-50 dark:bg-yellow-950 border-yellow-500 text-yellow-900 dark:text-yellow-100",
    success: "bg-green-50 dark:bg-green-950 border-green-500 text-green-900 dark:text-green-100",
    tip: "bg-purple-50 dark:bg-purple-950 border-purple-500 text-purple-900 dark:text-purple-100",
  };

  const icons = {
    info: <Info className="h-5 w-5" />,
    warning: <AlertCircle className="h-5 w-5" />,
    success: <CheckCircle2 className="h-5 w-5" />,
    tip: <Info className="h-5 w-5" />,
  };

  return (
    <Card className={cn("border-l-4 my-6", styles[type])}>
      <CardContent className="pt-6">
        <div className="flex gap-3">
          <div className="flex-shrink-0">{icons[type]}</div>
          <div className="flex-1">{children}</div>
        </div>
      </CardContent>
    </Card>
  );
}

