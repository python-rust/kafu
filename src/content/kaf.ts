import heroKaihou from '../assets/kaf/hero-kaihou.jpg';
import visualFukakai from '../assets/kaf/visual-fukakai.jpg';
import visualWasureteShimae from '../assets/kaf/visual-wasurete-shimae.jpg';

export interface KafWork {
  title: string;
  releaseDate: string;
  kind: string;
  description: string;
  sourceUrl: string;
  featured?: boolean;
}

export interface KafVisual {
  title: string;
  image: string;
  alt: string;
  credit: string;
  sourceUrl: string;
}

export interface OfficialLink {
  label: string;
  note: string;
  href: string;
}

export const heroVisual: KafVisual = {
  title: '邂逅',
  image: heroKaihou,
  alt: '粉色短发的花譜正面肖像，画面右侧写有“邂逅”二字。',
  credit: 'Visual via 花譜 / piapro · non-commercial use',
  sourceUrl: 'https://piapro.jp/t/N-95',
};

export const visualArchive: KafVisual[] = [
  {
    title: '忘れてしまえ',
    image: visualWasureteShimae,
    alt: '花譜站在青绿色天空与城市风景前的视觉图。',
    credit: 'Character design: PALOW. · 3DCG: 川サキケンジ · via 花譜 / piapro',
    sourceUrl: 'https://piapro.jp/t/_tAG',
  },
  {
    title: '不可解',
    image: visualFukakai,
    alt: '黑色舞台上，花譜与现场乐队同台演出的“不可解”视觉图。',
    credit: 'Character design: PALOW. · 3DCG: 川サキケンジ · via 花譜 / piapro',
    sourceUrl: 'https://piapro.jp/t/ZGwt',
  },
];

export const selectedWorks: KafWork[] = [
  {
    title: '深愛',
    releaseDate: '2026.05.27',
    kind: '5TH ALBUM',
    description:
      '以音乐与故事彼此呼应为核心的第五张专辑，也是这一阶段最适合作为“现在进行时”观察入口的作品。',
    sourceUrl: 'https://kaf.kamitsubaki.jp/transcendent-love/',
    featured: true,
  },
  {
    title: '寓話',
    releaseDate: '2024.12.25',
    kind: '4TH ALBUM',
    description:
      '在创作体制变化后重新展开的第四张专辑，以“丧失与获得”连接新的叙事阶段。',
    sourceUrl: 'https://kamitsubaki.jp/discography/kaf/5114/',
  },
  {
    title: '魔法α',
    releaseDate: '2020.11.25',
    kind: '2ND ALBUM',
    description:
      '收录多首动画、影像与跨界企划相关作品，扩展了花譜早期声音与视觉的边界。',
    sourceUrl: 'https://kamitsubaki.jp/discography/kaf/366/',
  },
  {
    title: '観測α',
    releaseDate: '2019.09.11',
    kind: '1ST ALBUM',
    description:
      '汇集活动初期的重要歌曲，也是“KAF Observatory / 观测”这一粉丝站概念的历史原点。',
    sourceUrl: 'https://kamitsubaki.jp/discography/kaf/337/',
  },
];

export const officialLinks: OfficialLink[] = [
  {
    label: 'Official Website',
    note: '最新消息、日程与作品入口',
    href: 'https://kaf.kamitsubaki.jp/',
  },
  {
    label: 'YouTube',
    note: '原创曲、翻唱与影像作品',
    href: 'https://www.youtube.com/channel/UCQ1U65-CQdIoZ2_NA4Z4F7A',
  },
  {
    label: 'X / Twitter',
    note: '花譜本人账号',
    href: 'https://twitter.com/virtual_kaf',
  },
  {
    label: 'Instagram',
    note: '视觉与活动照片',
    href: 'https://www.instagram.com/virtual_kaf/',
  },
  {
    label: 'piapro',
    note: '官方投稿与可利用创作素材入口',
    href: 'https://piapro.jp/virtual_kaf',
  },
];
