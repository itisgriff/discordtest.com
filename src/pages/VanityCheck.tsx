import { useState, useCallback, useEffect, useMemo, memo } from 'react';
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
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ExternalLink, Info, ShieldAlert, ShieldCheck, AlertTriangle, Shield, ShieldQuestion, ShieldOff, X, RefreshCw } from 'lucide-react';
import { Popover } from '@/components/ui/popover';
import { useDebounce } from '@/lib/hooks/useDebounce';
import { useRetry } from '@/lib/hooks/useRetry';
import { useLocalStorage } from '@/lib/hooks/useLocalStorage';
import { validateVanityUrl, getValidationHint } from '@/lib/validation';

export default function VanityCheck() {
  const { code: urlCode } = useParams<{ code?: string }>();
  const navigate = useNavigate();
  const [code, setCode] = useState(urlCode || '');
  const [loading, setLoading] = useState(false);
  const [guildInfo, setGuildInfo] = useState<GuildInfo | null>(null);
  const [isAvailable, setIsAvailable] = useState(false);
  const [showRawData, setShowRawData] = useState(false);
  const [rawApiResponse, setRawApiResponse] = useState<unknown>(null);
  const [validationError, setValidationError] = useState<string>('');
  const [recentSearches, setRecentSearches] = useLocalStorage<string[]>('vanity-recent-searches', []);
  
  // Debounced validation
  const debouncedCode = useDebounce(code, 300);
  
  // Retry mechanism
  const { executeWithRetry, isRetrying, attemptCount } = useRetry(checkVanityUrl);

  // Memoize processed features to avoid recalculation on every render
  const processedFeatures = useMemo(() => {
    if (!guildInfo?.features) return [];
    return guildInfo.features.map(feature => ({
      key: feature,
      displayName: feature.split('_').map(word => 
        word.charAt(0) + word.slice(1).toLowerCase()).join(' ')
    }));
  }, [guildInfo?.features]);

  useEffect(() => {
    if (urlCode && urlCode !== code) {
      setCode(urlCode);
      handleCheck(urlCode);
    }
  }, [urlCode]);
  
  // Real-time validation
  useEffect(() => {
    if (debouncedCode) {
      const validation = validateVanityUrl(debouncedCode);
      setValidationError(validation.isValid ? '' : validation.error || '');
    } else {
      setValidationError('');
    }
  }, [debouncedCode]);

  const handleCheck = useCallback(async (checkCode?: string) => {
    const vanityCode = checkCode || code;
    if (!vanityCode) {
      toast.error("Please enter a vanity URL to check");
      return;
    }
    
    // Validate input
    const validation = validateVanityUrl(vanityCode);
    if (!validation.isValid) {
      toast.error(validation.error || 'Invalid vanity URL');
      return;
    }

    // Update URL if needed, but don't return early
    if (!checkCode && vanityCode !== urlCode) {
      navigate(`/vanity/${vanityCode}`);
    }
    
    // Add to recent searches
    if (!recentSearches.includes(vanityCode)) {
      const newSearches = [vanityCode, ...recentSearches.slice(0, 4)];
      setRecentSearches(newSearches);
    }

    setLoading(true);
    setIsAvailable(false);
    try {
      const result = await executeWithRetry(vanityCode);
      setRawApiResponse(result);
      
      // Handle null response (rate limited or error)
      if (!result) {
        return;
      }
      
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
        const profile = (result as any).profile;
        
        setGuildInfo({
          ...result.guild,
          type: result.type,
          code: result.code || vanityCode,
          expires_at: result.expires_at,
          flags: result.flags,
          guild_id: result.guild_id || result.guild.id,
          inviteChannel: result.guild.channel || (result as any).channel,
          boostCount: result.guild.premium_subscription_count,
          premiumTier: result.guild.premium_tier,
          nsfwLevel: result.guild.nsfw_level,
          isNsfw: result.guild.nsfw,
          verificationLevel: result.guild.verification_level,
          splash: result.guild.splash,
          banner: result.guild.banner,
          // Profile data (should be available now)
          memberCount: profile?.member_count || (result as any).approximate_member_count,
          onlineCount: profile?.online_count || (result as any).approximate_presence_count,
          tag: profile?.tag,
          badge: profile?.badge,
          badgeColorPrimary: profile?.badge_color_primary,
          badgeColorSecondary: profile?.badge_color_secondary,
          badgeHash: profile?.badge_hash,
          traits: profile?.traits || [],
          visibility: profile?.visibility,
          customBannerHash: profile?.custom_banner_hash
        });
      }
    } catch (error) {
      console.error('API Error:', error);
      if (error && typeof error === 'object' && 'status' in error) {
        const status = (error as any).status;
        if (status === 429) {
          toast.error('Rate limit exceeded. Please try again later.');
        } else if (status === 404) {
          toast.error('Vanity URL not found or invalid');
        } else {
          toast.error('Failed to check vanity URL');
        }
      } else {
        toast.error('Network error occurred');
      }
    } finally {
      setLoading(false);
    }
  }, [code, urlCode, navigate, executeWithRetry, recentSearches, setRecentSearches]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '');
    setCode(value);
  };
  
  const handleClearInput = () => {
    setCode('');
    setValidationError('');
    setGuildInfo(null);
    setIsAvailable(false);
    setRawApiResponse(null);
  };
  
  const handleRecentSearchClick = (searchCode: string) => {
    setCode(searchCode);
    handleCheck(searchCode);
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

  // Memoized loading skeleton component
  const LoadingSkeleton = memo(() => (
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
  ));

  // Memoized content rating info component
  const ContentRatingInfo = memo(() => (
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
  ));

  // Memoized verification level info component
  const VerificationLevelInfo = memo(() => (
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
  ));

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
            <div className="space-y-2">
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Input
                    placeholder="Enter vanity URL"
                    value={code}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    disabled={loading}
                    className={`pr-8 ${validationError ? 'border-red-500' : ''}`}
                    aria-label="Vanity URL input"
                    minLength={2}
                    maxLength={32}
                  />
                  {code && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleClearInput}
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0 hover:bg-transparent"
                      aria-label="Clear input"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>
                <Button 
                  onClick={() => handleCheck()}
                  disabled={loading || !code || !!validationError}
                  className="bg-accent hover:bg-accent/90 min-w-[120px]"
                  aria-label={loading ? "Checking..." : "Check availability"}
                >
                  {loading ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      {isRetrying ? `Retry ${attemptCount}...` : 'Checking...'}
                    </>
                  ) : (
                    'Check'
                  )}
                </Button>
              </div>
              
              {/* Validation Error */}
              {validationError && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  {validationError}
                </p>
              )}
              
              {/* Input Hint */}
              {!validationError && (
                <p className="text-xs text-muted-foreground">
                  {getValidationHint('vanity-url')}
                </p>
              )}
              
              {/* Recent Searches */}
              {recentSearches.length > 0 && !loading && (
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">Recent searches:</p>
                  <div className="flex flex-wrap gap-1">
                    {recentSearches.map((search) => (
                      <Button
                        key={search}
                        variant="outline"
                        size="sm"
                        onClick={() => handleRecentSearchClick(search)}
                        className="h-6 px-2 text-xs"
                      >
                        {search}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
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

                {!loading && !isAvailable && guildInfo && (
                  <div className="space-y-4">
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
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-semibold">{guildInfo.name}</h3>
                          {guildInfo.tag && (
                            <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-500/10 text-blue-500 border border-blue-500/20">
                              {guildInfo.tag}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {guildInfo.features.includes("VERIFIED") ? "Verified Server" : "Discord Server"}
                        </p>
                        {(guildInfo.memberCount || guildInfo.onlineCount) && (
                          <div className="flex gap-4 text-xs text-muted-foreground mt-1">
                            {guildInfo.memberCount && (
                              <span>{guildInfo.memberCount.toLocaleString()} members</span>
                            )}
                            {guildInfo.onlineCount && (
                              <span>{guildInfo.onlineCount.toLocaleString()} online</span>
                            )}
                          </div>
                        )}
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

                    {guildInfo.description && (
                      <div className="bg-muted/50 p-3 rounded-md">
                        <p className="text-sm">{guildInfo.description}</p>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-4">
                        {guildInfo?.boostCount !== undefined && (
                          <div>
                            <h4 className="text-sm font-medium mb-2 text-muted-foreground">Server Boost Status</h4>
                            <div className="flex flex-wrap gap-2">
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-500/10 text-purple-500">
                                {guildInfo.boostCount} Boost{guildInfo.boostCount !== 1 ? 's' : ''}
                              </span>
                              {guildInfo.premiumTier !== undefined && (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-500/10 text-yellow-500">
                                  Tier {guildInfo.premiumTier}
                                </span>
                              )}
                            </div>
                          </div>
                        )}

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

                      <div className="space-y-4">
                        {guildInfo.inviteChannel && (
                          <div>
                            <h4 className="text-sm font-medium mb-2 text-muted-foreground">Invite Channel</h4>
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-accent/10 text-accent-foreground">
                              #{guildInfo.inviteChannel.name}
                            </span>
                          </div>
                        )}

                        {processedFeatures.length > 0 && (
                          <div>
                            <h4 className="text-sm font-medium mb-2 text-muted-foreground">Server Features</h4>
                            <div className="flex flex-wrap gap-2">
                              {processedFeatures.map(feature => (
                                <span 
                                  key={feature.key} 
                                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-accent/10 text-accent-foreground cursor-pointer hover:bg-accent/20"
                                  onClick={() => handlePillClick(feature.key, "feature")}
                                  title={feature.key}
                                >
                                  {feature.displayName}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {guildInfo.badge !== undefined && guildInfo.badge > 0 && (
                          <div>
                            <h4 className="text-sm font-medium mb-2 text-muted-foreground">Server Badge</h4>
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                                style={{ 
                                  background: guildInfo.badgeColorPrimary ? `linear-gradient(135deg, ${guildInfo.badgeColorPrimary}, ${guildInfo.badgeColorSecondary || guildInfo.badgeColorPrimary})` : '#5865f2'
                                }}
                              >
                                {guildInfo.badge}
                              </div>
                              <span className="text-sm text-muted-foreground">Badge Level {guildInfo.badge}</span>
                            </div>
                          </div>
                        )}

                        {guildInfo.traits && guildInfo.traits.length > 0 && (
                          <div>
                            <h4 className="text-sm font-medium mb-2 text-muted-foreground">Server Traits</h4>
                            <div className="flex flex-wrap gap-2">
                              {guildInfo.traits.map((trait, index) => (
                                <span 
                                  key={index}
                                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-500/10 text-green-500 cursor-pointer hover:bg-green-500/20"
                                  onClick={() => handlePillClick(typeof trait === 'string' ? trait : String(trait), "trait")}
                                >
                                  {typeof trait === 'string' ? trait : String(trait)}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {guildInfo.visibility !== undefined && (
                          <div>
                            <h4 className="text-sm font-medium mb-2 text-muted-foreground">Visibility</h4>
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-500/10 text-blue-500">
                              {guildInfo.visibility === 1 ? 'Public' : guildInfo.visibility === 0 ? 'Private' : `Level ${guildInfo.visibility}`}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

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

                    {guildInfo.customBannerHash && (
                      <div>
                        <h4 className="text-sm font-medium mb-2 text-muted-foreground">Custom Banner</h4>
                        <img 
                          src={`https://cdn.discordapp.com/banners/${guildInfo.id}/${guildInfo.customBannerHash}.png?size=1024`}
                          alt="Custom Server Banner"
                          className="w-full h-40 object-cover rounded-lg"
                          loading="lazy"
                        />
                      </div>
                    )}

                    {guildInfo.flags !== undefined && (
                      <div className="flex gap-2 items-center text-xs text-muted-foreground">
                        <span>Flags:</span>
                        <code>{guildInfo.flags}</code>
                      </div>
                    )}
                    
                    {guildInfo.expires_at && (
                      <div className="flex gap-2 items-center text-xs text-muted-foreground">
                        <span>Expires:</span>
                        <time>{new Date(guildInfo.expires_at).toLocaleString()}</time>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex justify-center gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowRawData(true)}
                  >
                    View Raw Data
                  </Button>
                  {(guildInfo || isAvailable) && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCheck()}
                      disabled={loading}
                      className="gap-1"
                    >
                      <RefreshCw className="h-3 w-3" />
                      Refresh
                    </Button>
                  )}
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