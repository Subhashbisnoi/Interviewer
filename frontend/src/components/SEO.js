import React from 'react';
import { Helmet } from 'react-helmet';

const SEO = ({ title, description, keywords, image, url }) => {
    const siteTitle = 'InterviewForge - AI Interviewer';
    const defaultDescription = 'InterviewForge is the #1 AI-powered interview practice platform. Master technical, system design, and behavioral interviews with real-time AI feedback. Get personalized roadmaps, detailed analysis, and unlimited mock interviews to land your dream job at top tech companies.';
    const defaultKeywords = 'InterviewForge, AI Interviewer, AI mock interview, technical interview practice, coding interview prep, system design interview, behavioral interview questions, interview feedback, soft skills analysis, tech interview roadmap, Google interview prep, Amazon interview prep';
    const defaultImage = 'https://interviewforge.live/og-image.png';
    const siteUrl = 'https://interviewforge.live';

    const fullTitle = title ? `${title} | ${siteTitle}` : siteTitle;
    const metaDescription = description || defaultDescription;
    const metaKeywords = keywords || defaultKeywords;
    const metaImage = image || defaultImage;
    const metaUrl = url ? `${siteUrl}${url}` : siteUrl;

    const jsonLd = [
        {
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "InterviewForge",
            "url": siteUrl,
            "alternateName": ["AI Interviewer", "Interview Forge"]
        },
        {
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "InterviewForge",
            "url": siteUrl,
            "logo": defaultImage,
            "sameAs": [
                "https://twitter.com/interviewforge",
                "https://www.linkedin.com/company/interviewforge",
                "https://github.com/interviewforge"
            ]
        },
        {
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "InterviewForge AI Interviewer",
            "applicationCategory": "EducationalApplication",
            "operatingSystem": "Web",
            "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
            },
            "description": defaultDescription,
            "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": "4.8",
                "ratingCount": "15000"
            }
        }
    ];

    return (
        <Helmet>
            <title>{fullTitle}</title>
            <meta name="description" content={metaDescription} />
            <meta name="keywords" content={metaKeywords} />

            {/* Open Graph / Facebook */}
            <meta property="og:type" content="website" />
            <meta property="og:url" content={metaUrl} />
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={metaDescription} />
            <meta property="og:image" content={metaImage} />

            {/* Twitter */}
            <meta property="twitter:card" content="summary_large_image" />
            <meta property="twitter:url" content={metaUrl} />
            <meta property="twitter:title" content={fullTitle} />
            <meta property="twitter:description" content={metaDescription} />
            <meta property="twitter:image" content={metaImage} />

            {/* JSON-LD Structured Data */}
            <script type="application/ld+json">
                {JSON.stringify(jsonLd)}
            </script>
        </Helmet>
    );
};

export default SEO;
