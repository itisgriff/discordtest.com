interface MetaTagsProps {
  title: string;
  description?: string;
}

export function MetaTags({ title, description }: MetaTagsProps) {
  const baseTitle = 'DiscordTest';
  const fullTitle = title === 'Home' ? baseTitle : `${title} | ${baseTitle}`;
  const defaultDescription = 'Powerful utilities to enhance your Discord server management experience.';

  // Update document title
  document.title = fullTitle;

  // Update meta description
  const metaDescription = document.querySelector('meta[name="description"]');
  if (metaDescription) {
    metaDescription.setAttribute('content', description || defaultDescription);
  }

  return null;
} 