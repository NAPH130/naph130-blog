export interface IntroData {
  greeting: string;
  education: string;
  research: string;
  hobby?: string;
  paragraphs: string[];
  raw: string;
}

export const intro: IntroData = {
  greeting: 'Hi~,我是NAPH130',
  education: '北京交通大学软件工程大三在读',
  research: '当前研究方向为大模型记忆，对多模态感兴趣',
  hobby: '平常打打ACM，但是比较菜',
  paragraphs: [
    'Hi~,我是NAPH130',
    '北京交通大学软件工程大三在读',
    '当前研究方向为大模型记忆，对多模态感兴趣',
    '平常打打ACM，但是比较菜',
  ],
  raw: 'Hi~,我是NAPH130\n北京交通大学软件工程大三在读\n当前研究方向为大模型记忆，对多模态感兴趣\n平常打打ACM，但是比较菜',
};

export const content = intro.raw;
export default intro;
