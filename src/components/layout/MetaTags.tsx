import { memo, useEffect } from 'react';

interface MetaTagsProps {
  title: string;
  description?: string;
}

const BASE_TITLE = 'DiscordTest';
const DEFAULT_DESCRIPTION = 'Powerful utilities to enhance your Discord server management experience.';

// Memoized meta tags component to prevent unnecessary updates
export const MetaTags = memo(function MetaTags({ 
  title, 
  description = DEFAULT_DESCRIPTION 
}: MetaTagsProps) {
  const fullTitle = title === 'Home' ? BASE_TITLE : `${title} | ${BASE_TITLE}`;

  useEffect(() => {
    // Update document title
    document.title = fullTitle;

    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', description);
    }

    // Update Open Graph meta tags
    updateOpenGraphTags(fullTitle, description);

    // Update Twitter Card meta tags
    updateTwitterTags(fullTitle, description);

    // Cleanup function to reset title on unmount
    return () => {
      document.title = BASE_TITLE;
    };
  }, [fullTitle, description]);

  return null;
});

// Helper functions for updating meta tags
function updateOpenGraphTags(title: string, description: string) {
  updateMetaTag('og:title', title);
  updateMetaTag('og:description', description);
  updateMetaTag('og:type', 'website');
  updateMetaTag('og:site_name', BASE_TITLE);
}

function updateTwitterTags(title: string, description: string) {
  updateMetaTag('twitter:title', title);
  updateMetaTag('twitter:description', description);
  updateMetaTag('twitter:card', 'summary');
}

function updateMetaTag(name: string, content: string) {
  let meta = document.querySelector(`meta[property="${name}"]`) ||
             document.querySelector(`meta[name="${name}"]`);
             
  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute(name.includes(':') ? 'property' : 'name', name);
    document.head.appendChild(meta);
  }
  
  meta.setAttribute('content', content);
} 