import type { TranslationSchema } from '../i18nKeys';

export const en_us: TranslationSchema = {
  nav: {
    home: 'Home',
    intro: 'Intro',
    posts: 'Posts',
    moments: 'Moments',
    friends: 'Friends',
  },
  sidebar: {
    siteStats: 'Site Stats',
    posts: 'Posts',
    tags: 'Tags',
    moments: 'Moments',
    running: 'Uptime',
    daysUnit: 'd',
  },
  pages: {
    postsTitle: 'Posts',
    momentsTitle: 'Moments',
    totalPrefix: 'Total ',
    postsTotalSuffix: ' posts',
    momentsTotalSuffix: ' moments',
    postsEmptyTitle: 'No posts recorded',
    momentsEmptyTitle: 'No moments recorded',
  },
  common: {
    search: 'Search',
    themeToggle: 'Toggle Theme',
    language: 'Language',
    backToTop: 'Back to Top',
    readingTime: 'Reading Time',
    wordCount: 'Word Count',
    minute: 'min',
    words: 'words',
    all: 'All',
    none: 'None',
  },
  post: {
    publishedAt: 'Published',
    updatedAt: 'Updated',
    tableOfContents: 'Table of Contents',
    prevPost: 'Previous Post',
    nextPost: 'Next Post',
    relatedPosts: 'Related Posts',
  },
  footer: {
    poweredBy: 'Powered by Astro',
    copyright: 'All Rights Reserved',
  },
};

export default en_us;
