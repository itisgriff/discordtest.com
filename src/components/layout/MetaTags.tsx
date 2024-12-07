import { memo } from 'react';

const BASE_TITLE = 'DiscordTest - Discord Server Management & Utility Tools';
const BASE_DESCRIPTION = 'Check Discord vanity URLs and lookup user information with our powerful server management tools. Fast, reliable, and easy-to-use utilities for Discord admins.';
const BASE_URL = 'https://discordtest.com';

interface MetaTagsProps {
  title?: string;
  description?: string;
  path?: string;
}

export const MetaTags = memo(function MetaTags({ 
  title = 'Home',
  description = BASE_DESCRIPTION,
  path = ''
}: MetaTagsProps) {
  const fullTitle = title === 'Home' ? BASE_TITLE : `${title} | ${BASE_TITLE}`;
  const canonicalUrl = `${BASE_URL}${path}`;
  
  return (
    <>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta charSet="UTF-8" />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={`${BASE_URL}/og-image.png`} />
      
      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={canonicalUrl} />
      <meta property="twitter:title" content={fullTitle} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={`${BASE_URL}/og-image.png`} />
      
      {/* Canonical URL */}
      <link rel="canonical" href={canonicalUrl} />
      
      {/* Additional SEO Tags */}
      <meta name="robots" content="index, follow" />
      <meta name="theme-color" content="#5865F2" />
      <meta name="keywords" content="Discord, vanity URL, user lookup, server management, Discord tools, Discord utilities" />
      <meta name="author" content="DiscordTest" />
      
      {/* PWA Tags */}
      <link rel="manifest" href="/manifest.json" />
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      <meta name="apple-mobile-web-app-title" content={BASE_TITLE} />
      
      {/* Mobile Theme */}
      <meta name="theme-color" content="#5865F2" media="(prefers-color-scheme: light)" />
      <meta name="theme-color" content="#020817" media="(prefers-color-scheme: dark)" />
    </>
  );
}); 