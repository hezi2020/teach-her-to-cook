/* 三道菜的手把手操作节点。每个节点 = 一个小游戏 + 她的一句话 + 完成后的锅内状态。 */

const DISHES = [
  {
    id: 'soup',
    name: '番茄蛋花汤',
    sub: 'トマトと卵のスープ',
    difficulty: '新手',
    minutes: 10,
    vessel: 'pot',
    thumb: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Japanese%20tomato%20egg%20drop%20soup%20in%20white%20ceramic%20bowl%20top%20view%20watercolor%20flat%20illustration%20soft%20mint%20cream%20background&image_size=square',
    ingredients: [
      { icon: 'egg', label: '鸡蛋', count: 2 },
      { icon: 'tomato', label: '番茄', count: 2 },
      { icon: 'scallion', label: '小葱', count: 1 },
      { icon: 'salt', label: '盐', count: 1 }
    ],
    nodes: [
      {
        type: 'chop', label: '切番茄', ingredient: 'tomato', hint: '按住刀，来回划过番茄 8 次',
        count: 8, duration: 24, visual: 'tomato',
        doing: '她握着刀，等你带她下刀',
        her: '番茄要切多大块？你来带我。',
        perfect: '切得真整齐，我记住了。',
        good: '差不多，再稳一点就更好了。',
        miss: '……大小差好多，我是不是手抖了。',
        auto: '她自己切了几刀，块大小不太一样。'
      },
      {
        type: 'stir', label: '打蛋', hint: '按住筷子在碗里画圈，转速保持在环里',
        vessel: 'bowl', base: 'egg', hold: 3.0, speed: [120, 360], duration: 17, visual: 'egg',
        doing: '她把碗端稳，筷子等你握住',
        her: '蛋要怎么打？转快一点还是慢一点？',
        perfect: '蛋液很顺，一点筋都没有。',
        good: '可以了，应该能打散。',
        miss: '还有些蛋白没散开……',
        auto: '她自己搅了几下，碗边溅出来一点。'
      },
      {
        type: 'pour', label: '倒油', hint: '按住油瓶，让油量停在绿区再松手',
        base: 'oil', target: 0.44, band: 0.10, duration: 17, visual: 'oil',
        doing: '她拎着油瓶，等你带她倾斜',
        her: '油要倒多少？我怕倒多了。',
        perfect: '刚好一层，不腻。',
        good: '差不多，稍微多了一点点。',
        miss: '……好像倒多了。',
        auto: '她凭感觉倒了一圈，油有点多。'
      },
      {
        type: 'stir', label: '翻炒番茄', hint: '按住锅铲画圈，别让番茄粘底',
        vessel: 'pot', base: 'tomato', hold: 3.4, speed: [120, 360], duration: 17, visual: 'tomatoSoup',
        doing: '她握着锅铲，手腕有点僵',
        her: '番茄下锅了，要一直翻吗？',
        perfect: '都翻到了，汁也出来了。',
        good: '差不多了，边上有点贴着锅。',
        miss: '糟了，有一块粘住了。',
        auto: '她自己翻了两下，没翻匀。'
      },
      {
        type: 'drizzle', label: '淋蛋液', hint: '按住碗，沿虚线从外向内匀速转两圈',
        base: 'tomatoSoup', turns: 2.2, duration: 19, visual: 'egg',
        doing: '她举高碗，手悬在锅上方',
        her: '这样倒下去，会变成蛋花吗？',
        perfect: '好细的蛋花，像云一样。',
        good: '成花了，有几块稍微厚一点。',
        miss: '……结成块了。',
        auto: '她一下倒下去，蛋花有点粗。'
      },
      {
        type: 'plate', label: '盛碗', hint: '按住锅里的汤，拖到碗里再松手',
        base: 'egg', duration: 14, visual: 'egg',
        doing: '她端着锅，等着最后的动作',
        her: '直接倒进碗里吗？',
        perfect: '一滴都没洒。',
        good: '洒了一点点在边上。',
        miss: '……洒出来了。',
        auto: '她小心地倒进去，还是溅了一点。'
      }
    ]
  },

  {
    id: 'tamago',
    name: '出汁玉子烧',
    sub: 'だし巻き玉子',
    difficulty: '技巧',
    minutes: 12,
    vessel: 'pan',
    thumb: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Japanese%20tamagoyaki%20rolled%20omelette%20on%20small%20ceramic%20plate%20top%20view%20watercolor%20flat%20illustration%20soft%20mint%20cream%20background&image_size=square',
    ingredients: [
      { icon: 'egg', label: '鸡蛋', count: 3 },
      { icon: 'sauce', label: '出汁', count: 1 },
      { icon: 'sauce', label: '味醂', count: 1 },
      { icon: 'salt', label: '盐', count: 1 }
    ],
    nodes: [
      {
        type: 'stir', label: '调蛋液', hint: '按住筷子画圈，让蛋液均匀',
        vessel: 'bowl', base: 'egg', hold: 3.2, speed: [120, 360], duration: 17, visual: 'egg',
        doing: '她打着蛋，筷子在碗里画「之」字',
        her: '出汁要现在加吗？',
        perfect: '蛋液很顺，出汁也融进去了。',
        good: '可以了，还有点小泡。',
        miss: '……好像没打匀。',
        auto: '她随便搅了两下，蛋白还挂着。'
      },
      {
        type: 'pour', label: '倒第一层', hint: '按住碗，薄薄一层就停',
        base: 'empty', target: 0.23, band: 0.07, duration: 15, visual: 'sheet',
        doing: '她端着蛋液碗，手腕悬着',
        her: '第一层倒多少？铺满就行吗？',
        perfect: '薄得刚好，能透光。',
        good: '稍微厚了一点。',
        miss: '太厚了，中间会不熟。',
        auto: '她倒了小半碗下去，厚薄不太匀。'
      },
      {
        type: 'roll', label: '卷起', hint: '按住蛋皮，慢慢向右推卷',
        duration: 16, visual: 'roll',
        doing: '她用铲子抵住蛋皮边缘',
        her: '卷的时候有点粘……要用力吗？',
        perfect: '卷得很紧，一点没破。',
        good: '卷起来了，边上有点裂。',
        miss: '……破了。',
        auto: '她急着卷，蛋皮裂开了一道。'
      },
      {
        type: 'pour', label: '倒第二层', hint: '再倒薄薄一层，接在卷边',
        base: 'roll', target: 0.22, band: 0.06, duration: 15, visual: 'roll',
        doing: '她把蛋卷推到锅边，空出位置',
        her: '再倒一层，会粘在一起吗？',
        perfect: '接得很顺。',
        good: '可以，边上有点厚。',
        miss: '倒多了，卷要散了。',
        auto: '她凭感觉倒了，量没控制住。'
      },
      {
        type: 'press', label: '定型', hint: '按住卷，上下移动控制力度停在绿区',
        hold: 1.8, duration: 14, visual: 'sliced',
        doing: '她用铲子压住蛋卷',
        her: '要压多久？我怕压扁了。',
        perfect: '形状定住了，很挺。',
        good: '差不多了。',
        miss: '压得太用力，扁了。',
        auto: '她压了两下就松手，形状还软。'
      },
      {
        type: 'chop', label: '切段', hint: '按住刀，横着切 5 段',
        ingredient: 'eggroll', count: 5, duration: 18, visual: 'sliced',
        doing: '她把蛋卷放到砧板上',
        her: '切多宽？一节一节那样？',
        perfect: '断面很漂亮，一层一层的。',
        good: '切得还行，有一段斜了。',
        miss: '……切碎了。',
        auto: '她切得大大小小，断面也没对齐。'
      },
      {
        type: 'plate', label: '摆盘', hint: '按住蛋卷，拖到盘子上再松手',
        base: 'sliced', duration: 14, visual: 'sliced',
        doing: '她捧着切好的蛋卷',
        her: '要摆成一排吗？',
        perfect: '摆得很整齐。',
        good: '稍微有点歪。',
        miss: '倒下来了。',
        auto: '她随手一放，有几段倒了。'
      }
    ]
  },

  {
    id: 'oyakodon',
    name: '亲子丼',
    sub: '親子丼',
    difficulty: '家常',
    minutes: 20,
    vessel: 'pan',
    thumb: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Japanese%20oyakodon%20chicken%20and%20egg%20rice%20bowl%20top%20view%20watercolor%20flat%20illustration%20soft%20mint%20cream%20background&image_size=square',
    ingredients: [
      { icon: 'chicken', label: '鸡腿', count: 1 },
      { icon: 'onion', label: '洋葱', count: 1 },
      { icon: 'egg', label: '鸡蛋', count: 2 },
      { icon: 'rice', label: '米饭', count: 1 }
    ],
    nodes: [
      {
        type: 'chop', label: '切洋葱', hint: '按住刀，横向划过洋葱 6 次',
        ingredient: 'onion', count: 6, duration: 20, visual: 'onion',
        doing: '她按住洋葱，眼睛已经开始发酸',
        her: '要切多细？我会尽量不揉眼睛。',
        perfect: '切得很匀，我居然没哭。',
        good: '粗细有点不一样。',
        miss: '……眼睛好酸，切歪了。',
        auto: '她一边眨眼一边切，粗细差很多。'
      },
      {
        type: 'pour', label: '倒汁', hint: '按住瓶子，让汁停在绿区',
        base: 'empty', target: 0.48, band: 0.10, duration: 16, visual: 'sauce',
        doing: '她把出汁、酱油、味醂排在锅边',
        her: '酱汁要倒多少？我怕太咸。',
        perfect: '汤汁刚好，甜咸正合适。',
        good: '稍微咸了一点点。',
        miss: '……好像太多了。',
        auto: '她凭习惯倒了一遍，味道偏重。'
      },
      {
        type: 'stir', label: '炒洋葱', hint: '按住锅铲画圈，把洋葱炒到透明',
        vessel: 'pan', base: 'onion', hold: 3.6, speed: [120, 360], duration: 17, visual: 'sauce',
        doing: '她用筷子拨着洋葱丝',
        her: '要炒到什么时候？',
        perfect: '都软了，也甜了。',
        good: '差不多了，有几根还硬。',
        miss: '……有点焦边。',
        auto: '她翻得不太匀，边上糊了一点。'
      },
      {
        type: 'pour', label: '淋蛋液', hint: '按住碗，分两次绕圈倒',
        base: 'sauce', target: 0.40, band: 0.08, duration: 15, visual: 'egg',
        doing: '她端着蛋液碗，手停在锅上方',
        her: '一次倒完吗？',
        perfect: '分得很匀，刚好盖住。',
        good: '盖住了，有一边薄一点。',
        miss: '倒太快，蛋液沉下去了。',
        auto: '她一次倒了大半碗。'
      },
      {
        type: 'drizzle', label: '补蛋花', hint: '沿虚线绕一圈，让蛋液铺开',
        base: 'egg', turns: 1.8, duration: 17, visual: 'egg',
        doing: '她把剩下的蛋液举高',
        her: '最后一点，也要绕圈吗？',
        perfect: '蛋花很嫩，还带着汤汁。',
        good: '可以了，有些地方熟了。',
        miss: '……全熟了。',
        auto: '她随手一浇，蛋有点老。'
      },
      {
        type: 'plate', label: '盖饭', hint: '按住锅里的蛋，慢慢滑到饭上',
        base: 'rice', duration: 15, visual: 'rice',
        doing: '她端起锅，对准饭碗',
        her: '直接扣过去吗？',
        perfect: '完整地滑上去了。',
        good: '盖住了，边上洒了一点。',
        miss: '……散了。',
        auto: '她快倒下去，蛋散了一半。'
      }
    ]
  }
];

const IDLE_LINES = [
  '我在呢，想好了叫我。',
  '今天的番茄看起来不错。',
  '你上次说少盐，我记着的。',
  '要是糊了……你会不会说我？',
  '锅热了，我手都不敢贴太近。'
];

const EXPRESSIONS = {
  calm:  { label: '平静', index: 0, fallbackFilter: 'none' },
  focus: { label: '专注', index: 1, fallbackFilter: 'contrast(1.04) saturate(1.02)' },
  panic: { label: '慌张', index: 3, fallbackFilter: 'saturate(1.12) hue-rotate(-6deg)' },
  proud: { label: '得意', index: 5, fallbackFilter: 'saturate(1.1) brightness(1.03)' },
  sad:   { label: '委屈', index: 7, fallbackFilter: 'grayscale(.35) brightness(.98)' }
};

const GRADES = {
  perfect: { label: '完美', value: 1.0, mood: 'proud' },
  good:    { label: '还行', value: 0.75, mood: 'focus' },
  miss:    { label: '糟糕', value: 0.4, mood: 'sad' }
};
