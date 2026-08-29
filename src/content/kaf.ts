import galleryToriPortrait from '../assets/kaf/gallery/kaf-tori-portrait.jpg';
import { generatedMediaVariants } from '../assets/kaf/generated/mediaVariants';
import heroKaihou from '../assets/kaf/hero-kaihou.jpg';
import journeyOriginIto from '../assets/kaf/journey/2018-origin-ito.jpg';
import journeyObservationPast from '../assets/kaf/journey/2019-observation-past.jpg';
import journeyMagicKeshiki from '../assets/kaf/journey/2020-magic-keshiki.jpg';
import journeyFableChewingDisco from '../assets/kaf/journey/2024-fable-chewing-disco.png';
import journeyTranscendentUfo from '../assets/kaf/journey/2025-transcendent-ufo.png';
import visualFukakai from '../assets/kaf/visual-fukakai.jpg';
import visualWasureteShimae from '../assets/kaf/visual-wasurete-shimae.jpg';

const PIAPRO_LICENSE_URL = 'https://piapro.jp/license/pc/icon';
const KAF_HISTORY_URL = 'https://kaf.kamitsubaki.jp/history/';

export interface KafWork {
  id: string;
  title: string;
  releaseDate: string;
  releaseDateTime?: string;
  kind: string;
  description: string;
  sourceUrl: string;
  featured?: boolean;
  visual?: KafMedia;
}

export interface KafPrimerBeat {
  readonly id: string;
  readonly title: string;
  readonly statement: string;
  readonly summary: string;
  readonly visual: KafMedia;
}

export interface KafReferenceSource {
  readonly id: string;
  readonly label: string;
  readonly note: string;
  readonly href: string;
}

export interface KafVisual {
  title: string;
  image: string;
  alt: string;
  credit: string;
  sourceUrl: string;
}

export interface KafMediaVariant {
  readonly src: string;
  readonly width: number;
  readonly height: number;
}

export interface KafMedia {
  readonly id: string;
  readonly title: string;
  readonly preview: KafMediaVariant;
  readonly display: KafMediaVariant;
  readonly highDensity: KafMediaVariant;
  readonly thumbnail: KafMediaVariant;
  readonly alt: string;
  readonly credit: string;
  readonly sourceUrl: string;
  readonly licenseSummary: string;
  readonly licenseUrl: string;
  readonly canModify: boolean;
  readonly retrievedAt: string;
}

export interface KafJourneyMilestone {
  readonly date: string;
  readonly label: string;
  readonly sourceUrl: string;
}

export type KafJourneyTheme =
  'origin' | 'observation' | 'rebuild' | 'expansion' | 'fable' | 'transcendent';

export interface KafJourneyChapter {
  readonly id: string;
  readonly period: string;
  readonly yearLabel: string;
  readonly titleZh: string;
  readonly originalTitle: string;
  readonly changeFrom: string;
  readonly changeTo: string;
  readonly summary: string;
  readonly theme: KafJourneyTheme;
  readonly milestones: readonly KafJourneyMilestone[];
  readonly primaryVisual: KafMedia;
  readonly secondaryVisual?: KafMedia;
}

export interface KafGalleryVisual {
  readonly id: string;
  readonly title: string;
  readonly display: KafMediaVariant;
  readonly highDensity: KafMediaVariant;
  readonly thumbnail: KafMediaVariant;
  readonly alt: string;
  readonly credit: string;
  readonly sourceUrl: string;
}

export interface OfficialLink {
  id: string;
  label: string;
  note: string;
  href: string;
}

const nonCommercialModifiable =
  'Piapro: non-commercial use only; modification is permitted because the work does not display the no-modification condition.';
const nonCommercialAttributedModifiable =
  'Piapro: non-commercial use only; creator-name credit required; modification is permitted because the work does not display the no-modification condition.';

const heroKaihouMedia: KafMedia = {
  id: 'kaihou',
  title: '邂逅',
  preview: { src: heroKaihou, width: 860, height: 484 },
  ...generatedMediaVariants.kaihou,
  alt: '粉色短发的花谱正面肖像，画面右侧写有“邂逅”二字。',
  credit: '花譜 / piapro',
  sourceUrl: 'https://piapro.jp/t/N-95',
  licenseSummary: nonCommercialModifiable,
  licenseUrl: PIAPRO_LICENSE_URL,
  canModify: true,
  retrievedAt: '2026-08-24',
};

const wasureteShimaeMedia: KafMedia = {
  id: 'wasurete-shimae',
  title: '忘れてしまえ',
  preview: { src: visualWasureteShimae, width: 860, height: 484 },
  ...generatedMediaVariants['wasurete-shimae'],
  alt: '花谱站在青绿色天空与城市风景前的视觉图。',
  credit: 'Character design: PALOW. · 3DCG: 川サキケンジ · via 花譜 / piapro',
  sourceUrl: 'https://piapro.jp/t/_tAG',
  licenseSummary: nonCommercialModifiable,
  licenseUrl: PIAPRO_LICENSE_URL,
  canModify: true,
  retrievedAt: '2026-08-24',
};

const fukakaiMedia: KafMedia = {
  id: 'fukakai',
  title: '不可解',
  preview: { src: visualFukakai, width: 860, height: 484 },
  ...generatedMediaVariants.fukakai,
  alt: '黑色舞台上，花谱与现场乐队同台演出的“不可解”视觉图。',
  credit: 'Character design: PALOW. · 3DCG: 川サキケンジ · via 花譜 / piapro',
  sourceUrl: 'https://piapro.jp/t/ZGwt',
  licenseSummary: nonCommercialModifiable,
  licenseUrl: PIAPRO_LICENSE_URL,
  canModify: true,
  retrievedAt: '2026-08-24',
};

const originItoMedia: KafMedia = {
  id: 'origin-ito',
  title: '糸',
  preview: { src: journeyOriginIto, width: 860, height: 484 },
  ...generatedMediaVariants['origin-ito'],
  alt: '早期造型的花谱戴着深色兜帽，身后漂浮着彩色几何碎片，画面写有“糸”。',
  credit:
    'Character design: PALOW · 3DCG design: 川サキケンジ · via 花譜 / piapro',
  sourceUrl: 'https://piapro.jp/t/e9Ho',
  licenseSummary: nonCommercialModifiable,
  licenseUrl: PIAPRO_LICENSE_URL,
  canModify: true,
  retrievedAt: '2026-08-25',
};

const observationPastMedia: KafMedia = {
  id: 'observation-past',
  title: '過去を喰らう',
  preview: { src: journeyObservationPast, width: 860, height: 484 },
  ...generatedMediaVariants['observation-past'],
  alt: '蓝色夜景前的花谱近景，黑色兜帽与粉色发梢被霓虹映亮，旁侧写有“過去を喰らう”。',
  credit:
    'Character design: PALOW · 3DCG design: 川サキケンジ · via 花譜 / piapro',
  sourceUrl: 'https://piapro.jp/t/M1dg',
  licenseSummary: nonCommercialModifiable,
  licenseUrl: PIAPRO_LICENSE_URL,
  canModify: true,
  retrievedAt: '2026-08-25',
};

const magicKeshikiMedia: KafMedia = {
  id: 'magic-keshiki',
  title: '景色',
  preview: { src: journeyMagicKeshiki, width: 860, height: 484 },
  ...generatedMediaVariants['magic-keshiki'],
  alt: '夕阳海面前的花谱半身剪影，画面右侧写有“景色”。',
  credit: '花譜 / piapro',
  sourceUrl: 'https://piapro.jp/t/1vdD',
  licenseSummary: nonCommercialModifiable,
  licenseUrl: PIAPRO_LICENSE_URL,
  canModify: true,
  retrievedAt: '2026-08-25',
};

const fableChewingDiscoMedia: KafMedia = {
  id: 'fable-chewing-disco',
  title: 'チューイン・ディスコ',
  preview: { src: journeyFableChewingDisco, width: 860, height: 484 },
  ...generatedMediaVariants['fable-chewing-disco'],
  alt: '高饱和霓虹背景与卡通角色组成的“チューイン・ディスコ”视觉图。',
  credit: '花譜 / piapro',
  sourceUrl: 'https://piapro.jp/t/PC68',
  licenseSummary: nonCommercialAttributedModifiable,
  licenseUrl: PIAPRO_LICENSE_URL,
  canModify: true,
  retrievedAt: '2026-08-25',
};

const transcendentUfoMedia: KafMedia = {
  id: 'transcendent-ufo',
  title: 'ユーフォーを見にいこう',
  preview: { src: journeyTranscendentUfo, width: 600, height: 600 },
  ...generatedMediaVariants['transcendent-ufo'],
  alt: '星空与蓝色文字之间，粉色短发的花谱伸手望向前方。',
  credit: '花譜 / piapro',
  sourceUrl: 'https://piapro.jp/t/RpJG',
  licenseSummary: nonCommercialAttributedModifiable,
  licenseUrl: PIAPRO_LICENSE_URL,
  canModify: true,
  retrievedAt: '2026-08-25',
};

const toriPortraitMedia: KafMedia = {
  id: 'tori-portrait',
  title: '花譜ちゃん',
  preview: { src: galleryToriPortrait, width: 428, height: 600 },
  ...generatedMediaVariants['tori-portrait'],
  alt: '白色背景上的花谱全身二次创作插画，身穿深蓝外套与白色裙装。',
  credit: 'とり / piapro',
  sourceUrl: 'https://piapro.jp/t/3Llh',
  licenseSummary: nonCommercialAttributedModifiable,
  licenseUrl: PIAPRO_LICENSE_URL,
  canModify: true,
  retrievedAt: '2026-08-25',
};

export const heroMedia: KafMedia = heroKaihouMedia;

export const kafMedia: readonly KafMedia[] = [
  heroKaihouMedia,
  wasureteShimaeMedia,
  fukakaiMedia,
  originItoMedia,
  observationPastMedia,
  magicKeshikiMedia,
  fableChewingDiscoMedia,
  transcendentUfoMedia,
  toriPortraitMedia,
];

export const galleryMedia: readonly KafMedia[] = [
  toriPortraitMedia,
  wasureteShimaeMedia,
  fukakaiMedia,
  originItoMedia,
  observationPastMedia,
  magicKeshikiMedia,
  fableChewingDiscoMedia,
  transcendentUfoMedia,
];

const toGalleryVisual = (media: KafMedia): KafGalleryVisual => ({
  id: media.id,
  title: media.title,
  display: media.display,
  highDensity: media.highDensity,
  thumbnail: media.thumbnail,
  alt: media.alt,
  credit: media.credit,
  sourceUrl: media.sourceUrl,
});

export const galleryVisuals: readonly KafGalleryVisual[] = [
  toGalleryVisual(toriPortraitMedia),
  toGalleryVisual(wasureteShimaeMedia),
  toGalleryVisual(fukakaiMedia),
  toGalleryVisual(originItoMedia),
  toGalleryVisual(observationPastMedia),
  toGalleryVisual(magicKeshikiMedia),
  toGalleryVisual(fableChewingDiscoMedia),
  toGalleryVisual(transcendentUfoMedia),
];

export const primerBeats: readonly KafPrimerBeat[] = [
  {
    id: 'identity',
    title: '她是谁',
    statement: '一个从网络深处被发现的声音。',
    summary:
      '花谱（日文名：花譜，KAF）是神椿工作室最初推出的虚拟歌手。2018年，14岁的她以3D形象开始活动，不公开真实面容。',
    visual: heroKaihouMedia,
  },
  {
    id: 'voice',
    title: '为什么特别',
    statement: '虚拟形象是入口，真正留下人的是声音。',
    summary:
      '她的作品把歌声、角色设计、影像和舞台编织成同一套世界观。理解花谱，更接近于理解一位以虚拟形象活动的歌手，而不只是认识一个角色。',
    visual: wasureteShimaeMedia,
  },
  {
    id: 'stage',
    title: '她走到了哪里',
    statement: '从屏幕里的歌，走进现实的大型舞台。',
    summary:
      '从第一次个人演唱会，到2022年的日本武道馆，再到2024年的代代木第一体育馆，她不断扩大虚拟歌手与现实现场之间的边界。',
    visual: fukakaiMedia,
  },
  {
    id: 'start',
    title: '从哪里开始',
    statement: '先听起点，再看现场，最后进入第二章。',
    summary:
      '可以从《観測α》理解早期声音，从《不可解》感受现场，再通过《寓話》和《深愛》进入她现在仍在继续的创作阶段。',
    visual: transcendentUfoMedia,
  },
];

export const referenceSources: readonly KafReferenceSource[] = [
  {
    id: 'kamitsubaki-profile',
    label: 'KAMITSUBAKI STUDIO 花谱艺人页',
    note: '身份、出道、武道馆与第二章概况',
    href: 'https://kamitsubaki.jp/artist/kaf/',
  },
  {
    id: 'kaf-about',
    label: '花谱官方网站：人物介绍',
    note: '官方人物介绍',
    href: 'https://kaf.kamitsubaki.jp/about/',
  },
  {
    id: 'kaf-history',
    label: '花谱官方网站：活动历程',
    note: '活动时间线与重要节点',
    href: KAF_HISTORY_URL,
  },
  {
    id: 'bilibili-profile',
    label: '花谱官方哔哩哔哩账号',
    note: '面向中文用户的官方账号与中文名称',
    href: 'https://space.bilibili.com/488970166/',
  },
];

export const journeyChapters: readonly KafJourneyChapter[] = [
  {
    id: 'origin-2018',
    period: '2018',
    yearLabel: '2018',
    titleZh: '被发现的声音',
    originalTitle: '起源 / 発見',
    changeFrom: '网络中的投稿',
    changeTo: '第一次被看见',
    summary:
      '十四岁时从虚拟世界向现实展开活动，翻唱与早期舞台让一个尚未被定义的声音开始被人“发现”。',
    theme: 'origin',
    milestones: [
      {
        date: '2018-10-18',
        label: '以花谱身份正式展开面向现实世界的活动',
        sourceUrl: KAF_HISTORY_URL,
      },
      {
        date: '2018-12-31',
        label: '在年末虚拟艺人活动《Count-0》中担任压轴出演',
        sourceUrl: KAF_HISTORY_URL,
      },
    ],
    primaryVisual: originItoMedia,
    secondaryVisual: toriPortraitMedia,
  },
  {
    id: 'observation-2019',
    period: '2019',
    yearLabel: '2019',
    titleZh: '从网络走向现场',
    originalTitle: '観測',
    changeFrom: '屏幕里的歌声',
    changeTo: '个人现场与首张专辑',
    summary:
      '从网络中的“被观测者”走向第一次个人现场与首张专辑，声音、角色与观众之间形成了可持续的现场关系。',
    theme: 'observation',
    milestones: [
      {
        date: '2019-08-01',
        label: '在 LIQUIDROOM 举办首次个人演唱会《不可解》',
        sourceUrl: KAF_HISTORY_URL,
      },
      {
        date: '2019-09-11',
        label: '发行首张专辑《観測α / 観測β》',
        sourceUrl: KAF_HISTORY_URL,
      },
    ],
    primaryVisual: observationPastMedia,
    secondaryVisual: fukakaiMedia,
  },
  {
    id: 'magic-rebuilding-2020-2021',
    period: '2020–2021',
    yearLabel: '2020–2021',
    titleZh: '在无法相聚时重构舞台',
    originalTitle: '魔法 / 再構築',
    changeFrom: '无法按计划相聚',
    changeTo: '线上现场与重返会场',
    summary:
      '无法按原计划相聚的时期，把“魔法”扩展为线上现场、群像合作与重返真实会场的重构过程，舞台边界因此被重新定义。',
    theme: 'rebuild',
    milestones: [
      {
        date: '2020-03-23',
        label: '在 Zepp DiverCity 以无观众网络直播形式举办《不可解(再)》',
        sourceUrl: 'https://kaf.kamitsubaki.jp/schedule/20200323/574/',
      },
      {
        date: '2020-11-25',
        label: '发行第 2 张专辑《魔法α / 魔法β》',
        sourceUrl: KAF_HISTORY_URL,
      },
      {
        date: '2021-03-13',
        label: '与神椿旗下四位歌手共同组成 V.W.P',
        sourceUrl: KAF_HISTORY_URL,
      },
      {
        date: '2021-06-11',
        label: '在豊洲 PIT 举办为期两天的《不可解弐 REBUILDING》',
        sourceUrl: KAF_HISTORY_URL,
      },
    ],
    primaryVisual: magicKeshikiMedia,
    secondaryVisual: wasureteShimaeMedia,
  },
  {
    id: 'expansion-2022-2023',
    period: '2022–2023',
    yearLabel: '2022–2023',
    titleZh: '把虚拟歌声带进武道馆',
    originalTitle: '拡張',
    changeFrom: '网络与小型会场',
    changeTo: '武道馆与更大的表达',
    summary:
      '武道馆、第三张专辑与新的形态变化，把此前累积的世界观推向更大的会场和更宽的表达尺度，也为下一章留下转向空间。',
    theme: 'expansion',
    milestones: [
      {
        date: '2022-05-11',
        label: '“组曲”第八弹：花谱 × MIYAVI《Beyond META》发行',
        sourceUrl: 'https://kaf.kamitsubaki.jp/suite/',
      },
      {
        date: '2022-08-24',
        label: '在日本武道馆举办第 3 场个人演唱会《不可解参(狂)》',
        sourceUrl: KAF_HISTORY_URL,
      },
      {
        date: '2023-03-08',
        label: '发行第 3 张专辑《狂想α / 狂想β》',
        sourceUrl: KAF_HISTORY_URL,
      },
    ],
    primaryVisual: heroKaihouMedia,
    secondaryVisual: observationPastMedia,
  },
  {
    id: 'fable-2024',
    period: '2024',
    yearLabel: '2024',
    titleZh: '进入创作的第二章',
    originalTitle: '寓話 / 第二章',
    changeFrom: '第一章的制作关系',
    changeTo: '新的创作体制与“廻花”',
    summary:
      '《怪歌》之后，创作体制和声音关系进入新的组合方式；第四张专辑《寓話》把这种变化沉淀成一段明确的第二章。',
    theme: 'fable',
    milestones: [
      {
        date: '2024-01-14',
        label: '在代代木第一体育馆举办第 4 场个人演唱会《怪歌》',
        sourceUrl: KAF_HISTORY_URL,
      },
      {
        date: '2024-01-14',
        label: '在《怪歌》公演中公布并启动虚拟创作歌手“廻花”项目',
        sourceUrl: 'https://kaf.kamitsubaki.jp/news/20240114/367/',
      },
      {
        date: '2024-12-25',
        label: '发行新制作体制下的第 4 张专辑《寓話》',
        sourceUrl: 'https://kaf.kamitsubaki.jp/discography/20241115/857/',
      },
    ],
    primaryVisual: fableChewingDiscoMedia,
    secondaryVisual: toriPortraitMedia,
  },
  {
    id: 'transcendent-love-2025-2026',
    period: '2025–2026',
    yearLabel: '2025–2026',
    titleZh: '走向更大的世界',
    originalTitle: '深愛',
    changeFrom: '日本国内的成长',
    changeTo: '海外活动与新的当下',
    summary:
      '海外活动、跨厂牌合作与第五次个人现场把视野继续向外打开，而《深愛》把音乐、故事与当下的花谱重新汇聚到同一条进行中的叙事线上。',
    theme: 'transcendent',
    milestones: [
      {
        date: '2025-10-18',
        label: '启动“KAF81 KAF × avex Overseas Mission”并公布主流出道计划',
        sourceUrl: 'https://kaf.kamitsubaki.jp/news/20251018/1113/',
      },
      {
        date: '2026-03-01',
        label: '在 PIA ARENA MM 举办第 5 场个人演唱会《宿声 / 深愛》',
        sourceUrl: 'https://kaf.kamitsubaki.jp/schedule/20260301/1147/',
      },
      {
        date: '2026-05-27',
        label: '发行第 5 张专辑《深愛》',
        sourceUrl: 'https://kaf.kamitsubaki.jp/discography/',
      },
    ],
    primaryVisual: transcendentUfoMedia,
    secondaryVisual: toriPortraitMedia,
  },
];

export const heroVisual: KafVisual = {
  title: '邂逅',
  image: heroKaihou,
  alt: heroKaihouMedia.alt,
  credit: heroKaihouMedia.credit,
  sourceUrl: heroKaihouMedia.sourceUrl,
};

export const visualArchive: KafVisual[] = [
  {
    title: '忘れてしまえ',
    image: visualWasureteShimae,
    alt: wasureteShimaeMedia.alt,
    credit: wasureteShimaeMedia.credit,
    sourceUrl: wasureteShimaeMedia.sourceUrl,
  },
  {
    title: '不可解',
    image: visualFukakai,
    alt: fukakaiMedia.alt,
    credit: fukakaiMedia.credit,
    sourceUrl: fukakaiMedia.sourceUrl,
  },
];

export const selectedWorks: KafWork[] = [
  {
    id: 'album-shinnai-2026',
    title: '深愛',
    releaseDate: '2026.05.27',
    releaseDateTime: '2026-05-27',
    kind: '第 5 张专辑',
    description:
      '以音乐与故事彼此呼应为核心的第五张专辑，也是这一阶段最适合作为“现在进行时”观察入口的作品。',
    sourceUrl: 'https://kaf.kamitsubaki.jp/transcendent-love/',
    featured: true,
    visual: transcendentUfoMedia,
  },
  {
    id: 'album-guuwa-2024',
    title: '寓話',
    releaseDate: '2024.12.25',
    releaseDateTime: '2024-12-25',
    kind: '第 4 张专辑',
    description:
      '在创作体制变化后重新展开的第四张专辑，以“丧失与获得”连接新的叙事阶段。',
    sourceUrl: 'https://kaf.kamitsubaki.jp/discography/20241115/857/',
    visual: fableChewingDiscoMedia,
  },
  {
    id: 'album-mahou-alpha-2020',
    title: '魔法α',
    releaseDate: '2020.11.25',
    releaseDateTime: '2020-11-25',
    kind: '第 2 张专辑',
    description:
      '收录多首动画、影像与跨界企划相关作品，扩展了花谱早期声音与视觉的边界。',
    sourceUrl: 'https://kamitsubaki.jp/discography/kaf/366/',
    visual: magicKeshikiMedia,
  },
  {
    id: 'album-kansoku-alpha-2019',
    title: '観測α',
    releaseDate: '2019.09.11',
    releaseDateTime: '2019-09-11',
    kind: '第 1 张专辑',
    description: '汇集活动初期的重要歌曲，也是“观察”这一站点概念的历史原点。',
    sourceUrl: 'https://kamitsubaki.jp/discography/kaf/337/',
    visual: observationPastMedia,
  },
];

export const officialLinks: OfficialLink[] = [
  {
    id: 'official-website',
    label: '官方网站',
    note: '最新消息、日程与作品入口',
    href: 'https://kaf.kamitsubaki.jp/',
  },
  {
    id: 'bilibili',
    label: '哔哩哔哩',
    note: '中文动态与官方影像',
    href: 'https://space.bilibili.com/488970166/',
  },
  {
    id: 'youtube',
    label: 'YouTube',
    note: '原创曲、翻唱与影像作品',
    href: 'https://www.youtube.com/channel/UCQ1U65-CQdIoZ2_NA4Z4F7A',
  },
  {
    id: 'x',
    label: 'X / Twitter',
    note: '花谱本人账号',
    href: 'https://twitter.com/virtual_kaf',
  },
  {
    id: 'instagram',
    label: 'Instagram',
    note: '视觉与活动照片',
    href: 'https://www.instagram.com/virtual_kaf/',
  },
  {
    id: 'piapro',
    label: 'piapro',
    note: '官方投稿与可利用创作素材入口',
    href: 'https://piapro.jp/virtual_kaf',
  },
];
