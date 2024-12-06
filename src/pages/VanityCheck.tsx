import { useState } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { checkVanityUrl } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import type { VanityUrlResponse } from '@/types/discord';

export function VanityCheck() {
  const [code, setCode] = useState('');
  const [result, setResult] = useState<VanityUrlResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleCheck = async () => {
    setLoading(true);
    setResult(null);
    try {
      const response = await checkVanityUrl(code);
      setResult(response);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to check vanity URL. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4">
      <h1 className="mb-6 text-4xl font-bold tracking-tight">
        <span className="bg-gradient-to-r from-accent to-indigo-500 bg-clip-text text-transparent">
          Discord Vanity URL Checker
        </span>
      </h1>
      <p className="mb-8 text-muted-foreground">
        Check if your desired vanity URL is available for your Discord server.
      </p>

      <Card className="p-6 border-accent/20 shadow-lg shadow-accent/10">
        <div className="flex gap-4">
          <Input
            placeholder="Enter vanity URL"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="flex-1 bg-background/50"
          />
          <Button 
            onClick={handleCheck} 
            disabled={loading || !code}
            className="bg-accent hover:bg-accent/90"
          >
            Check
          </Button>
        </div>

        {result && (
          <div className="mt-6">
            {result.error ? (
              <div className="flex items-center gap-2 text-destructive">
                <XCircle className="h-5 w-5" />
                <span>{result.error}</span>
              </div>
            ) : result.available ? (
              <div className="flex items-center gap-2 text-green-500">
                <CheckCircle className="h-5 w-5" />
                <span>Available!</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-destructive">
                <XCircle className="h-5 w-5" />
                <span>Already taken</span>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}