import { Button } from "@/components/ui/button";
import { Check, Copy } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { cn } from "@/lib/utils";

interface JsonViewerProps {
  data: unknown;
  title: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function syntaxHighlight(json: string): { __html: string } {
  const syntaxColors = {
    string: 'text-green-500 dark:text-green-400',
    number: 'text-blue-500 dark:text-blue-400',
    boolean: 'text-purple-500 dark:text-purple-400',
    null: 'text-red-500 dark:text-red-400',
    key: 'text-pink-500 dark:text-pink-400',
  };

  const highlighted = json.replace(
    /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
    (match) => {
      let cls = syntaxColors.number;
      if (/^"/.test(match)) {
        if (/:$/.test(match)) {
          cls = syntaxColors.key;
          match = match.slice(0, -1) + '<span class="text-white dark:text-white">:</span>';
        } else {
          cls = syntaxColors.string;
        }
      } else if (/true|false/.test(match)) {
        cls = syntaxColors.boolean;
      } else if (/null/.test(match)) {
        cls = syntaxColors.null;
      }
      return `<span class="${cls}">${match}</span>`;
    }
  );

  return { __html: highlighted };
}

export function JsonViewer({ data, title, open, onOpenChange }: JsonViewerProps) {
  const [copied, setCopied] = useState(false);

  // Memoize the JSON string and syntax highlighting to avoid expensive recalculation
  const jsonString = useMemo(() => JSON.stringify(data, null, 2), [data]);
  const highlightedJson = useMemo(() => syntaxHighlight(jsonString), [jsonString]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [open]);

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div className="bg-background rounded-lg shadow-lg w-full max-w-3xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">{title}</h2>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleCopyToClipboard}
              className={cn(
                "gap-2 transition-colors",
                copied && "bg-green-500/10 text-green-500 hover:bg-green-500/20 hover:text-green-500"
              )}
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  Copy JSON
                </>
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="hover:bg-muted"
            >
              ×
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-auto p-4 flex-1">
          <pre className="bg-muted/50 p-4 rounded-lg overflow-auto">
            <code 
              className="text-sm font-mono"
              dangerouslySetInnerHTML={highlightedJson}
            />
          </pre>
        </div>
      </div>
    </div>
  );
} 