import { useState, useCallback, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { checkVanityUrl } from '@/lib/api';
import { toast } from '@/components/ui/toast';
import { MetaTags } from '@/components/layout/MetaTags';
import type { GuildInfo } from '@/types/discord';
import { buttonVariants } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { JsonViewer } from '@/components/ui/JsonViewer';
import { ExternalLink, Info, ShieldAlert, ShieldCheck, AlertTriangle, Shield, ShieldQuestion, ShieldOff } from 'lucide-react';
import { Popover } from '@/components/ui/popover';
import { SuccessBanner } from '@/components/ui/SuccessBanner';
import { ErrorDisplay } from '@/components/ui/ErrorDisplay';
import { TakenVanityInfo } from '@/components/ui/TakenVanityInfo';
import { VanityUrlResponse } from '@/types/discord';

export default function VanityCheck() {
  const { code: urlCode } = useParams<{ code?: string }>();
  const navigate = useNavigate();
  const [code, setCode] = useState(urlCode || '');
  const [loading, setLoading] = useState(false);
  const [guildInfo, setGuildInfo] = useState<GuildInfo | null>(null);
  const [isAvailable, setIsAvailable] = useState(false);
  const [showRawData, setShowRawData] = useState(false);
  const [rawApiResponse, setRawApiResponse] = useState<VanityUrlResponse | null>(null);

  useEffect(() => {
    if (urlCode && urlCode !== code) {
      setCode(urlCode);
      handleCheck(urlCode);
    }
  }, [urlCode]);

  const handleCheck = useCallback(async (checkCode?: string) => {
    const vanityCode = checkCode || code;
    if (!vanityCode) {
      toast.error("Please enter a vanity URL to check");
      return;
    }

    // Update URL if needed, but don't return early
    if (!checkCode && vanityCode !== urlCode) {
      navigate(`/vanity/${vanityCode}`);
    }

    setLoading(true);
    setIsAvailable(false);
    try {
      const result = await checkVanityUrl(vanityCode);
      setRawApiResponse(result);
      
      if (result.available) {
        setIsAvailable(true);
        setGuildInfo(null);
        return;
      }
      
      if (result.error && !result.guild) {
        toast.error(result.error);
        return;
      }

      if (result.guild) {
        setIsAvailable(false);
        setGuildInfo({
          ...result.guild,
          memberCount: result.guild.approximate_member_count,
          onlineCount: result.guild.approximate_presence_count,
          inviteChannel: result.guild.channel,
          boostCount: result.guild.premium_subscription_count,
          nsfwLevel: result.guild.nsfw_level,
          isNsfw: result.guild.nsfw,
          verificationLevel: result.guild.verification_level,
          splash: result.guild.splash
        });
      }
    } catch (error) {
      console.error('API Error:', error);
      toast.error('Failed to check vanity URL');
    } finally {
      setLoading(false);
    }
  }, [code, urlCode, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCode(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !loading) {
      handleCheck();
    }
  };

  const handlePillClick = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`Copied ${label}`);
  };

  const LoadingSkeleton = () => (
    <div className="space-y-4 animate-pulse">
      <div className="flex items-center gap-4">
        <Skeleton className="h-16 w-16 rounded-full" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-3 w-1/4" />
        </div>
      </div>
      <div className="space-y-2">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-2/3" />
      </div>
    </div>
  );

  const ContentRatingInfo = () => (
    <div className="space-y-3 text-sm">
      <h5 className="font-medium">Content Rating Explained</h5>
      <div className="space-y-2">
        <div className="flex items-start gap-2">
          <ShieldCheck className="h-4 w-4 text-green-500 mt-0.5" />
          <div>
            <p className="font-medium">Safe Content</p>
            <p className="text-xs text-muted-foreground">Content suitable for all audiences. No age restrictions or mature content.</p>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5" />
          <div>
            <p className="font-medium">NSFW Level</p>
            <p className="text-xs text-muted-foreground">Indicates the maturity level of server content. Higher levels mean more mature content.</p>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <ShieldAlert className="h-4 w-4 text-red-500 mt-0.5" />
          <div>
            <p className="font-medium">Age-Restricted</p>
            <p className="text-xs text-muted-foreground">Server contains adult content and requires age verification to join.</p>
          </div>
        </div>
      </div>
    </div>
  );

  const VerificationLevelInfo = () => (
    <div className="space-y-3 text-sm">
      <h5 className="font-medium">Verification Level Explained</h5>
      <div className="space-y-2">
        <div className="flex items-start gap-2">
          <ShieldOff className="h-4 w-4 text-green-500 mt-0.5" />
          <div>
            <p className="font-medium">None (Level 0)</p>
            <p className="text-xs text-muted-foreground">Unrestricted - Anyone can immediately message in the server.</p>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <ShieldQuestion className="h-4 w-4 text-blue-500 mt-0.5" />
          <div>
            <p className="font-medium">Low (Level 1)</p>
            <p className="text-xs text-muted-foreground">Must have a verified email on Discord account.</p>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <Shield className="h-4 w-4 text-yellow-500 mt-0.5" />
          <div>
            <p className="font-medium">Medium (Level 2)</p>
            <p className="text-xs text-muted-foreground">Must be registered on Discord for longer than 5 minutes.</p>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <ShieldAlert className="h-4 w-4 text-orange-500 mt-0.5" />
          <div>
            <p className="font-medium">High (Level 3)</p>
            <p className="text-xs text-muted-foreground">Must be a member of the server for longer than 10 minutes.</p>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <ShieldCheck className="h-4 w-4 text-red-500 mt-0.5" />
          <div>
            <p className="font-medium">Highest (Level 4)</p>
            <p className="text-xs text-muted-foreground">Must have a verified phone number on Discord account.</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="container max-w-2xl mx-auto px-4 py-8">
      <MetaTags 
        title="Discord Vanity URL Checker"
        description="Check if a custom Discord vanity URL is available for your server."
        path={`/vanity${urlCode ? `/${urlCode}` : ''}`}
      />
      
      <h1 className="text-4xl font-bold text-center mb-6 bg-gradient-to-r from-indigo-400 to-purple-400 text-transparent bg-clip-text leading-relaxed py-1">
        Discord Vanity URL Checker
      </h1>
      
      <p className="text-muted-foreground text-center mb-8">
        Check if a custom Discord vanity URL is available for your server.
      </p>

      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Enter vanity code"
              value={code}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              disabled={loading}
              className="flex-1"
            />
            <Button
              onClick={() => handleCheck()}
              disabled={loading}
              className="bg-accent hover:bg-accent/90"
            >
              {loading ? 'Checking...' : 'Check'}
            </Button>
          </div>

          <div className="text-sm text-muted-foreground">
            <p>Example: If you want to check <code>discord.gg/example</code>, just enter <code>example</code></p>
          </div>
        </div>
      </Card>

      {loading ? (
        <LoadingSkeleton />
      ) : (
        <>
          {isAvailable && rawApiResponse && (
            <SuccessBanner
              code={code}
              message={rawApiResponse.message || `Great news! discord.gg/${code} is available!`}
            />
          )}
          
          {!isAvailable && guildInfo && rawApiResponse && (
            <TakenVanityInfo 
              guild={guildInfo} 
              code={code} 
              message={rawApiResponse.message}
            />
          )}
          
          {!isAvailable && !guildInfo && rawApiResponse?.error && (
            <ErrorDisplay 
              error={rawApiResponse.error}
              retryAfter={rawApiResponse.retryAfter}
              onRetry={() => handleCheck()}
            />
          )}
          
          {rawApiResponse && (
            <div className="mt-8">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-medium">Advanced</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowRawData(!showRawData)}
                >
                  {showRawData ? 'Hide' : 'Show'} Raw Data
                </Button>
              </div>
              
              <JsonViewer 
                data={rawApiResponse} 
                title="Vanity URL API Response"
                open={showRawData}
                onOpenChange={setShowRawData}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}