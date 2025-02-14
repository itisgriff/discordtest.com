import { useState, useCallback, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { lookupUser } from '@/lib/api/user';
import { toast } from '@/components/ui/toast';
import { MetaTags } from '@/components/layout/MetaTags';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import type { DiscordUser } from '@/types/discord';
import { Skeleton } from '@/components/ui/skeleton';
import { getUserFlags } from '@/lib/utils/userFlags';
import { JsonViewer } from '@/components/ui/JsonViewer';

function UserLookupContent() {
  const { userId: urlUserId } = useParams<{ userId?: string }>();
  const navigate = useNavigate();
  const [userId, setUserId] = useState(urlUserId || '');
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<DiscordUser | null>(null);
  const [showRawData, setShowRawData] = useState(false);

  // Effect to handle URL parameter changes
  useEffect(() => {
    if (urlUserId && urlUserId !== userId) {
      setUserId(urlUserId);
      handleLookup(urlUserId);
    }
  }, [urlUserId]);

  const handleLookup = useCallback(async (id?: string) => {
    const lookupId = id || userId;
    if (!lookupId) {
      toast.error("Please enter a user ID");
      return;
    }

    // Only update URL if we're not already on this user's page
    if (!id && lookupId !== urlUserId) {
      navigate(`/lookup/${lookupId}`);
      return; // Let the useEffect handle the actual lookup
    }

    setLoading(true);
    try {
      const result = await lookupUser(lookupId);
      if (result) {
        setUser(result);
      }
    } finally {
      setLoading(false);
    }
  }, [userId, urlUserId, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setUserId(value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !loading) {
      handleLookup();
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
    </div>
  );

  return (
    <div className="container max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center mb-6 bg-gradient-to-r from-indigo-400 to-purple-400 text-transparent bg-clip-text leading-relaxed py-1">
        Discord User Lookup
      </h1>
      
      <p className="text-muted-foreground text-center mb-8">
        Look up a Discord user by their ID.
      </p>

      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Enter user ID"
              value={userId}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              disabled={loading}
              className="flex-1"
              aria-label="User ID input"
              minLength={17}
              maxLength={20}
              autoComplete="off"
              data-form-type="other"
              data-lpignore="true"
            />
            <Button 
              onClick={() => handleLookup()}
              disabled={loading || !userId}
              className="bg-accent hover:bg-accent/90 min-w-[120px]"
              aria-label={loading ? "Looking up..." : "Look up user"}
            >
              {loading ? "Looking up..." : "Look up"}
            </Button>
          </div>

          {loading && <LoadingSkeleton />}

          {!loading && user && (
            <>
              <div className="flex flex-col gap-6 animate-in fade-in-50">
                {/* User Banner */}
                {user.banner && (
                  <div className="relative w-full h-32 rounded-lg overflow-hidden">
                    <img 
                      src={user.banner}
                      alt={`${user.username}'s banner`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                )}

                {/* User Profile */}
                <div className={`flex items-start gap-4 p-4 bg-card rounded-lg border ${
                  user.accent_color ? `border-[#${user.accent_color.toString(16)}]/20` : ''
                }`}>
                  <div className="relative">
                    {user.avatar ? (
                      <img 
                        src={user.avatar}
                        alt={`${user.username}'s avatar`}
                        className={`w-20 h-20 rounded-full ${
                          user.accent_color ? `ring-2 ring-[#${user.accent_color.toString(16)}]/50` : ''
                        }`}
                        loading="lazy"
                      />
                    ) : (
                      <div className={`w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center text-2xl font-bold ${
                        user.accent_color ? `ring-2 ring-[#${user.accent_color.toString(16)}]/50` : ''
                      }`}>
                        {user.username.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-xl font-semibold">{user.username}</h3>
                      {user.bot && (
                        <span 
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-500/10 text-blue-500 cursor-pointer hover:bg-blue-500/20"
                          onClick={() => handlePillClick("Bot Account", "account type")}
                        >
                          Bot
                        </span>
                      )}
                      {user.verified && (
                        <span 
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-500/10 text-green-500 cursor-pointer hover:bg-green-500/20"
                          onClick={() => handlePillClick("Verified Bot", "verification status")}
                        >
                          Verified
                        </span>
                      )}
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground flex items-center gap-2">
                        <span className="font-medium">ID:</span> 
                        <code 
                          className="bg-muted px-2 py-0.5 rounded text-xs cursor-pointer hover:bg-muted/80"
                          onClick={() => handlePillClick(user.id, "user ID")}
                        >
                          {user.id}
                        </code>
                      </p>
                    </div>
                  </div>
                </div>

                {/* User Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Left Column */}
                  <div className="space-y-4">
                    {/* Account Type */}
                    <div className="p-4 bg-card rounded-lg border">
                      <h4 className="text-sm font-medium mb-2 text-muted-foreground">Account Type</h4>
                      <div className="flex flex-wrap gap-2">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-accent/10 text-accent-foreground">
                          {user.bot ? 'Bot Account' : 'User Account'}
                        </span>
                        {user.verified && user.bot && (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-500/10 text-green-500">
                            Verified Bot
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Account Age */}
                    <div className="p-4 bg-card rounded-lg border">
                      <h4 className="text-sm font-medium mb-2 text-muted-foreground">Account Created</h4>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-accent/10 text-accent-foreground">
                        {new Date(Number(BigInt(user.id) >> 22n) + 1420070400000).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-4">
                    {/* Accent Color */}
                    {user.accent_color && (
                      <div className="p-4 bg-card rounded-lg border">
                        <h4 className="text-sm font-medium mb-2 text-muted-foreground">Profile Color</h4>
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-accent/10 text-accent-foreground gap-2">
                          <span 
                            className="w-4 h-4 rounded-full inline-block"
                            style={{ backgroundColor: `#${user.accent_color.toString(16)}` }}
                          />
                          #{user.accent_color.toString(16).toUpperCase()}
                        </span>
                      </div>
                    )}

                    {/* User Badges */}
                    {user.flags > 0 && (
                      <div className="p-4 bg-card rounded-lg border">
                        <h4 className="text-sm font-medium mb-2 text-muted-foreground">Badges</h4>
                        <div className="flex flex-wrap gap-2">
                          {getUserFlags(user.flags).map((flag) => (
                            <span 
                              key={flag} 
                              className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-accent/10 text-accent-foreground cursor-pointer hover:bg-accent/20"
                              onClick={() => handlePillClick(flag, "badge")}
                            >
                              {flag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

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
            data={user}
            title="Raw User Data"
            open={showRawData}
            onOpenChange={setShowRawData}
          />
        </div>
      </Card>
    </div>
  );
}

export default function UserLookup() {
  return (
    <>
      <MetaTags 
        title="Discord User Lookup"
        description="Look up Discord users by their ID."
        path="/users"
      />
      <ErrorBoundary>
        <UserLookupContent />
      </ErrorBoundary>
    </>
  );
}