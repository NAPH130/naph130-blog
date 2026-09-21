export interface SiteConfig {
  title: string;
  description: string;
  author: string;
  avatar: string;
  siteUrl: string;
  socials: {
    github?: string;
    twitter?: string;
    email?: string;
  };
}

export const siteConfig: SiteConfig = {
  title: 'naph130 - Blog',
  description: 'A personal tech blog focusing on frontend engineering and animations.',
  author: 'naph130',
  avatar: '/assets/avatar.jpg',
  siteUrl: 'https://naph130.github.io',
  socials: {
    github: 'https://github.com/naph130',
  },
};
