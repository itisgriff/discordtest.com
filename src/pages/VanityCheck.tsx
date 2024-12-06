import { useState } from 'react';
import { CheckCircle, XCircle, Copy, Check, ExternalLink } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { checkVanityUrl } from '@/lib/api';
import { toast } from '@/components/ui/toast';
import { MetaTags } from '@/components/layout/MetaTags';
import type { VanityUrlResponse } from '@/types/discord';

export function VanityCheck() {
  const [code, setCode] = useState('');
  const [result, setResult] = useState<VanityUrlResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCheck = async () => {
    setLoading(true);
    setResult(null);
    try {
      const response = await checkVanityUrl(code);
      setResult(response);
    } catch (error) {
      toast.error("Failed to check vanity URL. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      toast.success("Vanity URL copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("Failed to copy to clipboard");
    }
  };

  return (
    <>
      <MetaTags 
        title="Vanity URL Checker"
        description="Check if your desired vanity URL is available for your Discord server."
      />
      <div className="w-full max-w-2xl mx-auto">
        <div className="text-center">
          <h1 className="mb-6 text-4xl font-bold tracking-tight">
            <span className="bg-gradient-to-r from-accent to-indigo-500 bg-clip-text text-transparent">
              Discord Vanity URL Checker
            </span>
          </h1>
          <p className="mb-8 text-muted-foreground">
            Check if your desired vanity URL is available for your Discord server.
          </p>
        </div>

        <Card className="p-6 border-accent/20 shadow-lg shadow-accent/10">
          <div className="flex gap-4">
            <Input
              placeholder="Enter vanity URL"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="flex-1 bg-background/50"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && code && !loading) {
                  handleCheck();
                }
              }}
            />
            <Button 
              onClick={handleCheck} 
              disabled={loading || !code}
              className="bg-accent hover:bg-accent/90 transition-all duration-200"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                "Check"
              )}
            </Button>
          </div>

          {result && (
            <div className="mt-6 animate-fadeIn">
              {result.error ? (
                <div className="flex items-center justify-center gap-2 text-destructive animate-slideIn">
                  <XCircle className="h-5 w-5" />
                  <span>{result.error}</span>
                </div>
              ) : result.available ? (
                <div className="space-y-4">
                  <div className="flex flex-col items-center justify-center gap-3 text-green-500 animate-success">
                    <CheckCircle className="h-12 w-12" />
                    <span className="text-lg font-semibold">Vanity URL Available!</span>
                  </div>
                  <div className="flex justify-center">
                    <Button
                      onClick={handleCopy}
                      variant="outline"
                      className="group relative transition-all duration-200 hover:border-green-500/50"
                    >
                      <span className="flex items-center gap-2">
                        {copied ? (
                          <>
                            <Check className="h-4 w-4" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="h-4 w-4" />
                            Copy Vanity URL
                          </>
                        )}
                      </span>
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 animate-slideIn">
                  <div className="flex items-center justify-center gap-2 text-destructive">
                    <XCircle className="h-5 w-5" />
                    <span>Already taken by {result.guildInfo?.name}</span>
                  </div>
                  {result.guildInfo && (
                    <div className="flex items-center justify-center gap-4 p-4 bg-background/50 rounded-lg">
                      {result.guildInfo.icon && (
                        <img
                          src={result.guildInfo.icon}
                          alt="Server icon"
                          className="w-12 h-12 rounded-full"
                        />
                      )}
                      <div className="text-sm">
                        <p className="font-medium">{result.guildInfo.name}</p>
                        {result.guildInfo.memberCount && (
                          <p className="text-muted-foreground">
                            {result.guildInfo.memberCount.toLocaleString()} members
                          </p>
                        )}
                      </div>
                      {result.guildInfo.inviteCode && (
                        <Button
                          variant="outline"
                          className="ml-auto hover:border-accent/50"
                          onClick={() => window.open(`https://discord.gg/${result.guildInfo?.inviteCode}`, '_blank')}
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Join Server
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </Card>
      </div>
    </>
  );
}