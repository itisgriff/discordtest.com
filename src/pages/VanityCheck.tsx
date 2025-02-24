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

export default function VanityCheck() {
  const { code: urlCode } = useParams<{ code?: string }>();
  const navigate = useNavigate();
  const [code, setCode] = useState(urlCode || '');
  const [loading, setLoading] = useState(false);
  const [guildInfo, setGuildInfo] = useState<GuildInfo | null>(null);
  const [isAvailable, setIsAvailable] = useState(false);
  const [showRawData, setShowRawData] = useState(false);
  const [rawApiResponse, setRawApiResponse] = useState<unknown>(null);

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
    <>
      <MetaTags 
        title="Vanity URL Checker"
        description="Check if your desired vanity URL is available for your Discord server."
        path={urlCode ? `/vanity/${urlCode}` : "/vanity"}
      />
      
      <div className="container max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-6 bg-gradient-to-r from-indigo-400 to-purple-400 text-transparent bg-clip-text leading-relaxed py-1">
          Vanity URL Checker
        </h1>
        
        <p className="text-muted-foreground text-center mb-8">
          Check if your desired vanity URL is available for your Discord server.
        </p>

        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Enter vanity URL"
                value={code}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                disabled={loading}
                className="flex-1"
                aria-label="Vanity URL input"
                minLength={2}
                maxLength={32}
              />
              <Button 
                onClick={() => handleCheck()}
                disabled={loading || !code}
                className="bg-accent hover:bg-accent/90 min-w-[120px]"
                aria-label={loading ? "Checking..." : "Check availability"}
              >
                {loading ? "Checking..." : "Check"}
              </Button>
            </div>

            {loading && <LoadingSkeleton />}

            {!loading && (isAvailable || guildInfo) && (
              <>
                {isAvailable && (
                  <div className="flex items-center gap-4 p-4 bg-card rounded-lg border border-green-500/20 bg-green-500/10 animate-in fade-in-50">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-green-500">Available!</h3>
                      <p className="text-sm text-muted-foreground">
                        The vanity URL "discord.gg/{code}" is available for your server.
                      </p>
                      <p className="text-xs mt-1 text-muted-foreground">
                        You can claim this vanity URL for your server in Server Settings {'>'}  Server Boost.
                      </p>
                    </div>
                    <Button
                      onClick={() => {
                        navigator.clipboard.writeText(code);
                        toast.success('Copied to clipboard!');
                      }}
                      className="bg-green-500 hover:bg-green-600 text-white min-w-[120px]"
                    >
                      Copy URL
                    </Button>
                  </div>
                )}

                {guildInfo && (
                  <div className="space-y-6 p-4 bg-card rounded-lg border animate-in fade-in-50">
                    {/* Header with Icon and Basic Info */}
                    <div className="flex items-center gap-4">
                      {guildInfo.icon && (
                        <img 
                          src={guildInfo.icon} 
                          alt={`${guildInfo.name} icon`}
                          className="w-16 h-16 rounded-full"
                          loading="lazy"
                        />
                      )}
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold">{guildInfo.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {(guildInfo.onlineCount || 0).toLocaleString()} Online · {(guildInfo.memberCount || 0).toLocaleString()} Members
                        </p>
                      </div>
                      <a
                        href={`https://discord.com/invite/${guildInfo.inviteCode}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={buttonVariants({
                          variant: "default",
                          className: "bg-green-600 hover:bg-green-700 text-white gap-2"
                        })}
                      >
                        Join Server
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </div>

                    {/* Description */}
                    {guildInfo.description && (
                      <div className="bg-muted/50 p-3 rounded-md">
                        <p className="text-sm">{guildInfo.description}</p>
                      </div>
                    )}

                    {/* Server Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Left Column */}
                      <div className="space-y-4">
                        {/* Boost Status */}
                        {guildInfo?.boostCount !== undefined && (
                          <div>
                            <h4 className="text-sm font-medium mb-2 text-muted-foreground">Server Boost Status</h4>
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-500/10 text-purple-500">
                              {guildInfo.boostCount} Boost{guildInfo.boostCount !== 1 ? 's' : ''}
                            </span>
                          </div>
                        )}

                        {/* Verification Level */}
                        {guildInfo.verificationLevel !== undefined && (
                          <div>
                            <div className="flex items-center gap-1.5 mb-2">
                              <h4 className="text-sm font-medium text-muted-foreground">Verification Level</h4>
                              <Popover content={<VerificationLevelInfo />}>
                                <div className="cursor-help">
                                  <Info className="h-3.5 w-3.5 text-muted-foreground/70 hover:text-muted-foreground" />
                                </div>
                              </Popover>
                            </div>
                            <span 
                              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium cursor-pointer hover:bg-opacity-20 ${
                                guildInfo.verificationLevel === 0 ? "bg-green-500/10 text-green-500 hover:bg-green-500/20" :
                                guildInfo.verificationLevel === 1 ? "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20" :
                                guildInfo.verificationLevel === 2 ? "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20" :
                                guildInfo.verificationLevel === 3 ? "bg-orange-500/10 text-orange-500 hover:bg-orange-500/20" :
                                "bg-red-500/10 text-red-500 hover:bg-red-500/20"
                              }`}
                              onClick={() => handlePillClick(
                                guildInfo.verificationLevel === 0 ? "None" :
                                guildInfo.verificationLevel === 1 ? "Low" :
                                guildInfo.verificationLevel === 2 ? "Medium" :
                                guildInfo.verificationLevel === 3 ? "High" :
                                "Highest",
                                "verification level"
                              )}
                            >
                              {guildInfo.verificationLevel === 0 ? (
                                <ShieldOff className="h-4 w-4" />
                              ) : guildInfo.verificationLevel === 1 ? (
                                <ShieldQuestion className="h-4 w-4" />
                              ) : guildInfo.verificationLevel === 2 ? (
                                <Shield className="h-4 w-4" />
                              ) : guildInfo.verificationLevel === 3 ? (
                                <ShieldAlert className="h-4 w-4" />
                              ) : (
                                <ShieldCheck className="h-4 w-4" />
                              )}
                              {guildInfo.verificationLevel === 0 ? "None" :
                               guildInfo.verificationLevel === 1 ? "Low" :
                               guildInfo.verificationLevel === 2 ? "Medium" :
                               guildInfo.verificationLevel === 3 ? "High" :
                               "Highest"}
                            </span>
                          </div>
                        )}

                        {/* NSFW Status */}
                        {(guildInfo.nsfwLevel !== undefined || guildInfo.isNsfw !== undefined) && (
                          <div>
                            <div className="flex items-center gap-1.5 mb-2">
                              <h4 className="text-sm font-medium text-muted-foreground">Content Rating</h4>
                              <Popover content={<ContentRatingInfo />}>
                                <div className="cursor-help">
                                  <Info className="h-3.5 w-3.5 text-muted-foreground/70 hover:text-muted-foreground" />
                                </div>
                              </Popover>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {guildInfo.nsfwLevel > 0 || guildInfo.isNsfw ? (
                                <span 
                                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-red-500/10 text-red-500 cursor-pointer hover:bg-red-500/20"
                                  onClick={() => handlePillClick(
                                    guildInfo.nsfwLevel > 0 ? `NSFW Level ${guildInfo.nsfwLevel}` : "Age-Restricted",
                                    "content rating"
                                  )}
                                >
                                  <ShieldAlert className="h-4 w-4" />
                                  {guildInfo.nsfwLevel > 0 ? `NSFW Level ${guildInfo.nsfwLevel}` : "Age-Restricted"}
                                </span>
                              ) : (
                                <span 
                                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-green-500/10 text-green-500 cursor-pointer hover:bg-green-500/20"
                                  onClick={() => handlePillClick("Safe Content", "content rating")}
                                >
                                  <ShieldCheck className="h-4 w-4" />
                                  Safe Content
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Right Column */}
                      <div className="space-y-4">
                        {/* Invite Channel */}
                        {guildInfo.inviteChannel && (
                          <div>
                            <h4 className="text-sm font-medium mb-2 text-muted-foreground">Invite Channel</h4>
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-accent/10 text-accent-foreground">
                              #{guildInfo.inviteChannel.name}
                            </span>
                          </div>
                        )}

                        {/* Server Features */}
                        {guildInfo.features.length > 0 && (
                          <div>
                            <h4 className="text-sm font-medium mb-2 text-muted-foreground">Server Features</h4>
                            <div className="flex flex-wrap gap-2">
                              {guildInfo.features.map(feature => (
                                <span 
                                  key={feature} 
                                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-accent/10 text-accent-foreground cursor-pointer hover:bg-accent/20"
                                  onClick={() => handlePillClick(feature, "feature")}
                                  title={feature}
                                >
                                  {feature.split('_').map(word => word.charAt(0) + word.slice(1).toLowerCase()).join(' ')}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Server Banner */}
                    {guildInfo.banner && (
                      <div>
                        <h4 className="text-sm font-medium mb-2 text-muted-foreground">Server Banner</h4>
                        <img 
                          src={guildInfo.banner} 
                          alt="Server Banner"
                          className="w-full h-40 object-cover rounded-lg"
                          loading="lazy"
                        />
                      </div>
                    )}

                    {/* Server Splash */}
                    {guildInfo.splash && (
                      <div>
                        <h4 className="text-sm font-medium mb-2 text-muted-foreground">Invite Splash</h4>
                        <img 
                          src={guildInfo.splash} 
                          alt="Server Splash"
                          className="w-full h-40 object-cover rounded-lg"
                          loading="lazy"
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* Raw Data Button */}
                <div className="flex justify-center mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowRawData(true)}
                  >
                    View Raw Data
                  </Button>
                </div>
              </>
            )}

            <JsonViewer
              data={rawApiResponse}
              title="Raw API Response"
              open={showRawData}
              onOpenChange={setShowRawData}
            />
          </div>
        </Card>
      </div>
    </>
  );
}