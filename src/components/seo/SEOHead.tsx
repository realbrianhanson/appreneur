import { useEffect } from 'react';

interface SEOHeadProps {
  title?: string;
  description?: string;
  noindex?: boolean;
  ogImage?: string;
  canonicalUrl?: string;
}

/**
 * SEO component for managing document head metadata
 * Updates document title and meta tags dynamically
 */
export const SEOHead = ({
  title = "Free 5-Day AI Website & App Challenge for Beginners · Appreneur",
  description = "Build your first website or app with AI in 5 days—even if technology has always intimidated you. Free, self-paced, start anytime, with no coding or developer required.",
  noindex = false,
  ogImage = "/og-image.png",
  canonicalUrl,
}: SEOHeadProps) => {
  useEffect(() => {
    // Update document title
    document.title = title;

    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', description);
    }

    // Handle robots meta tag for noindex
    let robotsMeta = document.querySelector('meta[name="robots"]');
    if (noindex) {
      if (!robotsMeta) {
        robotsMeta = document.createElement('meta');
        robotsMeta.setAttribute('name', 'robots');
        document.head.appendChild(robotsMeta);
      }
      robotsMeta.setAttribute('content', 'noindex, nofollow');
    } else if (robotsMeta) {
      robotsMeta.remove();
    }

    // Update OG tags
    const ogTitleMeta = document.querySelector('meta[property="og:title"]');
    const ogDescMeta = document.querySelector('meta[property="og:description"]');
    const ogImageMeta = document.querySelector('meta[property="og:image"]');
    
    if (ogTitleMeta) ogTitleMeta.setAttribute('content', title);
    if (ogDescMeta) ogDescMeta.setAttribute('content', description);
    if (ogImageMeta && ogImage) ogImageMeta.setAttribute('content', ogImage);

    // Update Twitter tags
    const twitterTitleMeta = document.querySelector('meta[name="twitter:title"]');
    const twitterDescMeta = document.querySelector('meta[name="twitter:description"]');
    const twitterImageMeta = document.querySelector('meta[name="twitter:image"]');
    
    if (twitterTitleMeta) twitterTitleMeta.setAttribute('content', title);
    if (twitterDescMeta) twitterDescMeta.setAttribute('content', description);
    if (twitterImageMeta && ogImage) twitterImageMeta.setAttribute('content', ogImage);

    // Handle canonical URL
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (canonicalUrl) {
      if (!canonicalLink) {
        canonicalLink = document.createElement('link');
        canonicalLink.setAttribute('rel', 'canonical');
        document.head.appendChild(canonicalLink);
      }
      canonicalLink.setAttribute('href', canonicalUrl);
    } else if (canonicalLink) {
      canonicalLink.remove();
    }

    // Cleanup function
    return () => {
      if (noindex && robotsMeta) {
        robotsMeta.remove();
      }
    };
  }, [title, description, noindex, ogImage, canonicalUrl]);

  return null;
};

export default SEOHead;
