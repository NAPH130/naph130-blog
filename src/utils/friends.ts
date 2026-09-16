import { getCollection } from 'astro:content';

export interface FriendItem {
  id: string;
  title: string;
  avatar: string;
  description: string;
  url: string;
  tags: string[];
  category: string;
  locale: string;
}

/**
 * 依据 locale 获取对应语言子目录下的所有友链条目
 */
export async function getFriendsByLocale(locale: string = 'zh_cn'): Promise<FriendItem[]> {
  const all = await getCollection('friends');
  const isEn = locale.toLowerCase().startsWith('en');
  const targetPrefix = isEn ? 'en_us/' : 'zh_cn/';

  return all
    .filter((item) => item.id.startsWith(targetPrefix))
    .map((item) => {
      const cleanId = item.id.replace(/^[^/]+\//, '').replace(/\.mdx?$/, '');
      return {
        id: item.data.id || cleanId,
        title: item.data.title || item.data.name || cleanId,
        avatar: item.data.avatar || '',
        description: item.data.description || item.data.bio || '',
        url: item.data.url,
        tags: item.data.tags || [],
        category: item.data.category || 'tech',
        locale: isEn ? 'en_us' : 'zh_cn',
      };
    });
}

/**
 * 获取所有语言包下的友链数据字典
 */
export async function getAllLocaleFriends(): Promise<Record<string, FriendItem[]>> {
  const all = await getCollection('friends');
  const result: Record<string, FriendItem[]> = {
    zh_cn: [],
    en_us: [],
  };

  for (const item of all) {
    const isEn = item.id.startsWith('en_us');
    const loc = isEn ? 'en_us' : 'zh_cn';
    const cleanId = item.id.replace(/^[^/]+\//, '').replace(/\.mdx?$/, '');
    result[loc].push({
      id: item.data.id || cleanId,
      title: item.data.title || item.data.name || cleanId,
      avatar: item.data.avatar || '',
      description: item.data.description || item.data.bio || '',
      url: item.data.url,
      tags: item.data.tags || [],
      category: item.data.category || 'tech',
      locale: loc,
    });
  }

  return result;
}
