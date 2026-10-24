# 素材清单与生成提示词

给「まいにち食堂」做饭小游戏用的美术素材。目标是中间操作区能按状态分层显示，锅、食材、火焰、蒸汽互相独立。

## 一、统一风格

每条提示词都拼上这段前缀，保证同一套画风：

```
flat vector illustration, Japanese minimal cozy style, muted pastel palette
(cream #FBF6EA, sage #A8C3B0, mint #BFDCCB, warm oak #D9B98C, soft coral #D98B76),
no outlines, soft ambient light from upper left, clean simple shapes,
subtle paper grain, no text, no people, no harsh shadows
```

参考图（用户提供）里的大白锅、木台面、暖灰绿背景就是这套风格的基准。

## 二、导出规范

| 项 | 要求 |
| --- | --- |
| 背景 | 1920×1080，PNG/JPG，正面平视 |
| 道具 | 1024×1024，PNG，**透明底** |
| 锅内内容物 | 1024×1024，PNG，透明底，与锅口同心 |
| 视角 | 道具统一 30° 俯视；背景平视 |
| 光源 | 左上，柔和，无硬投影 |
| 命名 | 全小写，连字符，例：`pot-body.png` |

多数生成器不支持透明底。遇到这种情况：用纯色底（`#FBFAF5`）生成，我再统一抠图。

## 三、第一批（能直接开工，14 项）

### 场景

1. `bg-kitchen-day.png` — 白天厨房全景
```
[风格前缀], cozy Japanese home kitchen interior, front view, eye-level,
wooden counter across the lower third, pale tiled wall, hanging ladles and
pans on the right, a small window with morning light at upper left,
empty center space reserved for gameplay, wide composition
```

2. `bg-kitchen-evening.png` — 傍晚版，同一构图，暖光
```
[风格前缀], same cozy Japanese kitchen, evening warm lamp light,
deeper sage shadows, subtle orange glow from the stove area,
empty center, wide composition
```

### 灶台与锅具

3. `stove-base.png` — 灶台
```
[风格前缀], simple Japanese gas stove top, two burners, cream enamel body,
soft cast iron grate, three-quarter top view, transparent background, game asset
```

4. `pot-body.png` — 白陶瓷深锅（参考图里那只）
```
[风格前缀], white ceramic donabe cooking pot with two small side handles,
round deep body, three-quarter top view, empty inside, transparent background,
centered game asset, soft highlight on the left rim
```

5. `pan-body.png` — 平底锅
```
[风格前缀], light grey non-stick frying pan, long wooden handle to the right,
three-quarter top view, empty inside, transparent background, centered game asset
```

6. `pot-lid.png` — 锅盖
```
[风格前缀], matching white ceramic lid with a small wooden knob,
three-quarter top view, transparent background, game asset
```

7. `cutting-board.png` — 砧板
```
[风格前缀], oval wooden cutting board, warm oak, thin rounded edge,
three-quarter top view, transparent background, game asset
```

### 锅内状态（叠在 pot-body 上）

8. `contents-empty.png`
```
[风格前缀], empty pot interior seen from above, cream ceramic inner wall,
soft inner shadow, transparent background, perfectly round, centered
```

9. `contents-oil.png`
```
[风格前缀], thin layer of golden cooking oil inside a round pot seen from above,
soft glossy highlight arc on the left, transparent background, centered
```

10. `contents-tomato-raw.png`
```
[风格前缀], chopped tomato chunks with light amber broth inside a round pot
seen from above, soft coral pieces, gentle steam, transparent background, centered
```

11. `contents-egg-swirl.png`
```
[风格前缀], wispy egg ribbons swirling in tomato broth, round pot seen from above,
pale yellow streaks, light steam, transparent background, centered
```

12. `contents-onion.png`
```
[风格前缀], sliced onion rings simmering in pale amber sauce, round pan seen
from above, translucent white onion arcs, transparent background, centered
```

### 火焰与蒸汽

13. `flame-mid.png`
```
[风格前缀], small soft gas flame ring, mint-teal flame tips, low opacity,
top view, transparent background, game asset
```

14. `steam-sheet.png` — 4 帧横向序列，每帧 512×512
```
[风格前缀], four-frame sprite sheet of soft white steam wisps rising,
evenly spaced frames on transparent background, subtle and low contrast
```

### 食材

15. `tomato-whole.png` / `tomato-cut.png`
```
[风格前缀], single ripe tomato, whole / cut into wedges, three-quarter top view,
transparent background, game asset
```

16. `egg-whole.png` / `egg-cracked.png` / `egg-bowl.png`
```
[风格前缀], brown chicken egg intact / cracked open with shell halves /
raw egg beaten in a small cream bowl, three-quarter top view,
transparent background, game asset
```

## 四、第二批（补完三道菜，12 项）

| 文件名 | 提示词要点 |
| --- | --- |
| `flame-low.png` / `flame-high.png` | 同 flame-mid，火焰大小与颜色分别是 0.6 倍文火、1.4 倍大火 |
| `contents-sauce.png` | 琥珀色酱汁，无食材，表面有一圈油光 |
| `contents-tamago-sheet.png` | 平底锅里一层薄蛋皮，淡黄，边缘微卷 |
| `contents-tamago-roll.png` | 蛋皮卷成圆柱，靠锅边，表面有层次 |
| `contents-tamago-sliced.png` | 切段的玉子烧并排，切面可见层层蛋皮 |
| `contents-rice.png` | 白饭上盖着半熟蛋液与洋葱，碗装，俯视 |
| `contents-burnt.png` | 锅底焦黑斑块 + 灰烟，半透明叠加层 |
| `onion-whole.png` / `onion-sliced.png` | 整颗洋葱 / 切好的洋葱丝 |
| `chicken-raw.png` | 切块鸡腿肉，粉白，几块一组 |
| `scallion.png` | 一小把小葱，切段 |
| `bottle-oil.png` / `bottle-soy.png` / `bottle-dashi.png` / `jar-salt.png` | 油瓶、酱油瓶、出汁瓶、盐罐，统一矮胖瓶型，木塞或布盖 |
| `plate.png` / `bowl.png` | 白瓷盘 / 汤碗，俯视 |

## 五、交互与 UI（第三批）

| 文件名 | 说明 |
| --- | --- |
| `cursor-hand.png` | 一只扁平化的手，指尖朝左上，用于「手把手」操作的可见光标 |
| `gesture-ring.png` | 虚线圆环，操作时提示画圈范围 |
| `timing-ring.png` | 圆环 + 高亮扇区，翻面/关火的时机判定 |
| `pour-gauge.png` | 长条流量计，绿区在中间 |

## 六、已有素材

- 图标：`assets/icons/svg/` 下 20 个 Game-icons 线稿图标，CC BY 3.0，署名见 `ATTRIBUTION.md`
- 音效：`assets/audio/Audio/` 下 100 个 Kenney 界面音效，CC0
- 还缺的烹饪音效（切菜、油锅、沸腾、装盘）从 Freesound 取 CC0 条目，或先用 Web Audio 合成占位
