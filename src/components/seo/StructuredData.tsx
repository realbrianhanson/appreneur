import { useEffect } from 'react';

interface OrganizationData {
  name: string;
  url: string;
  logo?: string;
  sameAs?: string[];
}

interface CourseData {
  name: string;
  description: string;
  provider: string;
  url: string;
}

interface EventData {
  name: string;
  description: string;
  startDate: string;
  endDate?: string;
  location?: string;
  url: string;
  organizer: string;
}

interface StructuredDataProps {
  organization?: OrganizationData;
  course?: CourseData;
  event?: EventData;
}

/**
 * Component for adding JSON-LD structured data to the page
 */
export const StructuredData = ({ organization, course, event }: StructuredDataProps) => {
  useEffect(() => {
    const scripts: HTMLScriptElement[] = [];

    // Organization schema
    if (organization) {
      const orgSchema = {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": organization.name,
        "url": organization.url,
        ...(organization.logo && { "logo": organization.logo }),
        ...(organization.sameAs && { "sameAs": organization.sameAs }),
      };

      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.textContent = JSON.stringify(orgSchema);
      document.head.appendChild(script);
      scripts.push(script);
    }

    // Course schema
    if (course) {
      const courseSchema = {
        "@context": "https://schema.org",
        "@type": "Course",
        "name": course.name,
        "description": course.description,
        "provider": {
          "@type": "Organization",
          "name": course.provider,
        },
        "url": course.url,
        "courseMode": "online",
        "isAccessibleForFree": true,
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD",
          "availability": "https://schema.org/InStock",
        },
      };

      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.textContent = JSON.stringify(courseSchema);
      document.head.appendChild(script);
      scripts.push(script);
    }

    // Event schema
    if (event) {
      const eventSchema = {
        "@context": "https://schema.org",
        "@type": "Event",
        "name": event.name,
        "description": event.description,
        "startDate": event.startDate,
        ...(event.endDate && { "endDate": event.endDate }),
        "eventAttendanceMode": "https://schema.org/OnlineEventAttendanceMode",
        "eventStatus": "https://schema.org/EventScheduled",
        "location": {
          "@type": "VirtualLocation",
          "url": event.url,
        },
        "organizer": {
          "@type": "Organization",
          "name": event.organizer,
          "url": event.url,
        },
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD",
          "availability": "https://schema.org/InStock",
          "url": event.url,
        },
      };

      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.textContent = JSON.stringify(eventSchema);
      document.head.appendChild(script);
      scripts.push(script);
    }

    // Cleanup
    return () => {
      scripts.forEach(script => script.remove());
    };
  }, [organization, course, event]);

  return null;
};

export default StructuredData;
