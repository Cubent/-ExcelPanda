import merge from 'lodash.merge';
import type { Metadata } from 'next';

type MetadataGenerator = Omit<Metadata, 'description' | 'title'> & {
  title: string;
  description: string;
  image?: string;
  path?: string;
  noSuffix?: boolean;
};

const defaultImage = '/og-image.png';

const applicationName = 'ExcelPanda';
const author: Metadata['authors'] = {
  name: 'ExcelPanda',
  url: 'https://www.excelpanda.org/',
};
const publisher = 'ExcelPanda';
const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
const productionUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL;

export const createMetadata = ({
  title,
  description,
  image,
  path,
  noSuffix = false,
  ...properties
}: MetadataGenerator): Metadata => {
  const parsedTitle = noSuffix ? title : `${title} | ${applicationName}`;
  const resolvedImage = image ?? defaultImage;
  const defaultMetadata: Metadata = {
    title: parsedTitle,
    description,
    applicationName,
    metadataBase: productionUrl
      ? new URL(`${protocol}://${productionUrl}`)
      : undefined,
    authors: [author],
    creator: author.name,
    formatDetection: {
      telephone: false,
    },
    alternates: path ? { canonical: path } : undefined,
    appleWebApp: {
      capable: true,
      statusBarStyle: 'default',
      title: parsedTitle,
    },
    openGraph: {
      title: parsedTitle,
      description,
      type: 'website',
      siteName: applicationName,
      locale: 'en_US',
      images: [
        {
          url: resolvedImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    publisher,
    twitter: {
      card: 'summary_large_image',
      images: [resolvedImage],
    },
  };

  const metadata: Metadata = merge(defaultMetadata, properties);

  if (image && metadata.openGraph) {
    metadata.openGraph.images = [
      {
        url: image,
        width: 1200,
        height: 630,
        alt: title,
      },
    ];
  }

  return metadata;
};
