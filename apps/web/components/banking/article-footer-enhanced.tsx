import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, AlertTriangle, CheckCircle2, ArrowRight, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface ArticleFooterProps {
  article: {
    id: string;
    title: string;
    category: string;
  };
  sourceUrls?: string[];
}

export function ArticleFooter({ article, sourceUrls = [] }: ArticleFooterProps) {
  const sources = sourceUrls.length > 0 ? sourceUrls : [];

  return (
    <footer className="mt-12 space-y-6 pt-8 border-t">
      {/* Sources Section */}
      {sources.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              Sources & References
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              This article is based on information from official bank websites and verified sources.
              Always verify current requirements directly with the bank before applying.
            </p>
            <ul className="space-y-2">
              {sources.map((url, index) => {
                try {
                  const hostname = new URL(url).hostname.replace("www.", "");
                  return (
                    <li key={index}>
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline inline-flex items-center gap-1 font-medium"
                      >
                        {hostname}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </li>
                  );
                } catch {
                  return (
                    <li key={index}>
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline inline-flex items-center gap-1"
                      >
                        {url}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </li>
                  );
                }
              })}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Disclaimer */}
      <Card className="border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-950">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-muted-foreground">
              <strong className="text-foreground">Disclaimer:</strong> Bank requirements and 
              policies may change. The information provided is for general guidance only. 
              Please verify all requirements directly with the bank before opening an account. 
              OneStop Student Ecosystem is not affiliated with any banks mentioned.
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex flex-col sm:flex-row gap-4 pt-4">
        <Button asChild variant="outline" className="flex-1">
          <Link href="/banking">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Banking Resources
          </Link>
        </Button>
        <Button asChild variant="outline" className="flex-1">
          <Link href="/banking/building-credit-international-student">
            Next: Building Credit
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </footer>
  );
}

