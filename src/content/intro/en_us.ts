import type { IntroData } from './zh_cn';

export const intro: IntroData = {
  greeting: "Hi~, I'm NAPH130",
  education: 'Junior studying Software Engineering at Beijing Jiaotong University',
  research: 'Current research focuses on LLM memory, with an interest in multimodal learning',
  hobby: 'Casual competitive programmer (ACM), though still learning',
  paragraphs: [
    "Hi~, I'm NAPH130",
    'Junior studying Software Engineering at Beijing Jiaotong University',
    'Current research focuses on LLM memory, with an interest in multimodal learning',
    'Casual competitive programmer (ACM), though still learning',
  ],
  raw: "Hi~, I'm NAPH130\nJunior studying Software Engineering at Beijing Jiaotong University\nCurrent research focuses on LLM memory, with an interest in multimodal learning\nCasual competitive programmer (ACM), though still learning",
};

export const content = intro.raw;
export default intro;
