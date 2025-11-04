import React from 'react';
import { Helmet } from 'react-helmet-async';

/**
 * SEO Component with React Helmet Async for optimized meta tags
 *
 * @param {Object} props - Component props
 * @param {string} props.title - Page title
 * @param {string} props.description - Page description
 * @param {string} props.keywords - SEO keywords
 * @param {string} props.canonical - Canonical URL
 * @param {string} props.ogImage - Open Graph image URL
 * @param {string} props.ogType - Open Graph type (website, article, etc.)
 * @param {string} props.author - Content author
 */
const SEO = ({
  title = 'TOUR - Best Travel Booking Platform | Hotels, Flights, Cruises & More',
  description = 'Book hotels, flights, cruises, and car rentals at the best prices. Explore the world with TOUR - your trusted travel companion. Get up to 25% off on first booking!',
  keywords = 'travel booking, hotels, flights, cruises, car rental, vacation packages, tourism, best travel deals, travel agency, book flights online',
  canonical = '',
  ogImage = '/og-image.jpg',
  ogType = 'website',
  twitterCard = 'summary_large_image',
  author = 'TOUR',
}) => {
  const siteUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const fullCanonical = canonical ? `${siteUrl}${canonical}` : siteUrl;
  const fullImageUrl = ogImage.startsWith('http') ? ogImage : `${siteUrl}${ogImage}`;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <html lang="en" />
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content={author} />
      <link rel="canonical" href={fullCanonical} />

      {/* Open Graph Meta Tags */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={fullCanonical} />
      <meta property="og:image" content={fullImageUrl} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content="TOUR" />
      <meta property="og:locale" content="en_US" />

      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImageUrl} />
      <meta name="twitter:image:alt" content={title} />
      <meta name="twitter:site" content="@tour" />
      <meta name="twitter:creator" content="@tour" />

      {/* Additional SEO Meta Tags */}
      <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      <meta name="googlebot" content="index, follow" />
      <meta name="bingbot" content="index, follow" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0" />
      <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
      <meta name="language" content="English" />
      <meta name="revisit-after" content="3 days" />
      <meta name="theme-color" content="#06b6d4" />
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />

      {/* Geo Tags */}
      <meta name="geo.region" content="US" />
      <meta name="geo.placename" content="United States" />

      {/* Schema.org markup for Google */}
      <script type="application/ld+json">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'TravelAgency',
          name: 'TOUR',
          description: description,
          url: siteUrl,
          logo: `${siteUrl}/logo.png`,
          image: fullImageUrl,
          telephone: '+1-800-TOUR-NOW',
          email: 'contact@tour.com',
          address: {
            '@type': 'PostalAddress',
            addressCountry: 'US',
          },
          sameAs: [
            'https://facebook.com/tour',
            'https://twitter.com/tour',
            'https://instagram.com/tour',
            'https://linkedin.com/company/tour',
          ],
          contactPoint: {
            '@type': 'ContactPoint',
            telephone: '+1-800-TOUR-NOW',
            contactType: 'Customer Service',
            availableLanguage: ['English'],
            areaServed: 'Worldwide',
          },
          potentialAction: {
            '@type': 'SearchAction',
            target: `${siteUrl}/search?q={search_term_string}`,
            'query-input': 'required name=search_term_string',
          },
        })}
      </script>

      {/* Breadcrumb Schema */}
      <script type="application/ld+json">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            {
              '@type': 'ListItem',
              position: 1,
              name: 'Home',
              item: siteUrl,
            },
          ],
        })}
      </script>
    </Helmet>
  );
};

export default SEO;
