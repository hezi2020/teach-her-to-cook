# 素材清单与提示词 · 手把手做饭 demo

日期：2026-10-24  
用途：替换中间操作区的美术，让「锅里的变化」和「工具跟随手」看起来是真的。

---

## 一、风格总则（每张图都带上这段）

**正向提示词**

```
soft flat vector illustration, Japanese home kitchen, cozy evening light,
muted pastel palette: cream #FBF7EE, warm wood #DCC8AC, sage green #A8B7A0,
terracotta #C98B6B, low saturation, gentle ambient occlusion,
no hard outlines, subtle paper grain, clean minimal shapes, warm and calm,
soft diffused lighting from upper left
```

**负向提示词**

```
text, lettering, logo, watermark, harsh shadows, high contrast, neon colors,
photorealistic, glossy plastic, cluttered details, busy patterns, people,
hands, faces
```

**统一约定**

- 视角：所有锅内/盘内素材统一为 **俯视 40°**，与用户提供的参考图一致。
- 构图：内容物图必须 **中心对齐、同一缩放**，保证状态之间切换不跳。
- 光：左上方柔光，阴影极淡，不要烘焙到透明边缘。
- 描边：不描边，或用比本体深 8% 的同色系细边（≤2px）。
- 底色：透明优先（PNG-24）。若生成器只能输出 JPG，请统一用 `#F1EAD9` 平背景，我按同色底做合成。

---

## 二、场景（3 项）

| 编号 | 文件名 | 尺寸 | 说明 |
| --- | --- | --- | --- |
| S1 | `assets/scene/kitchen_bg.png` | 1920×1080 | 厨房全景，中间留空给锅 |
| S2 | `assets/scene/counter_fg.png` | 1920×360 透明 | 前景木质台面边缘，压住画面下缘 |
| S3 | `assets/scene/props_shelf.png` | 512×512 透明 | 陶罐、木勺筒、香草盆栽（可拆三张） |

**S1 提示词**

```
wide cozy Japanese kitchen interior, wooden counter in the middle,
open shelf with ceramic jars and hanging wooden utensils, soft evening light,
empty center space for a large pot, flat illustration, muted cream and sage palette,
no people, no text
```

**S2 提示词**

```
foreground edge of a warm wooden kitchen countertop, seen from slightly above,
flat illustration, soft grain, transparent background, only the counter surface
```

---

## 三、锅具（4 项，核心）

| 编号 | 文件名 | 尺寸 | 说明 |
| --- | --- | --- | --- |
| P1 | `assets/pot/pot_body.png` | 1024×1024 透明 | 奶油色陶锅，空锅，侧 3/4 视角 |
| P2 | `assets/pot/pot_rim.png` | 1024×1024 透明 | 锅沿高光层，叠在 P1 上 |
| P3 | `assets/pot/pan_body.png` | 1024×1024 透明 | 浅木柄平底锅，空锅 |
| P4 | `assets/pot/pot_top_empty.png` | 1024×1024 透明 | 俯视空锅内胆，用于叠内容物 |

**P1 提示词**

```
large cream ceramic Japanese donabe pot, three-quarter side view, empty inside,
soft rounded silhouette, subtle warm shading, flat illustration,
transparent background, centered, no handles sticking out of frame
```

**P3 提示词**

```
light Japanese frying pan with pale wooden handle, three-quarter side view, empty,
flat illustration, cream and beige tones, transparent background, centered
```

---

## 四、锅内状态（每道菜 6 张，共 18 张）

规格统一：**1024×1024 透明，俯视 40°，内容物中心对齐**。

### 番茄蛋花汤

```
01 pot_top_empty       空锅，内壁微暖
02 pot_oil            一层薄油，柔和反光
03 pot_tomato         番茄块散落，边缘微微出汁
04 pot_simmer         番茄软化，汤色浅红，细蒸汽
05 pot_egg_ribbons    蛋花成絮状浮起，乳白与浅黄
06 pot_soup_done      完成态，汤面平静，葱花点缀
```

单张提示词模板：

```
top-down 40 degree view of a cream ceramic pot interior, {内容描述},
flat illustration, soft muted colors, centered composition,
transparent background, no text
```

### 出汁玉子烧

```
01 pan_empty          空平底锅，锅面微亮
02 pan_sheet          薄薄一层蛋液，边缘先凝固
03 pan_halfroll       蛋皮卷到一半，层次可见
04 pan_roll           完整蛋卷，表面微亮
05 pan_sliced         切段后的小排，断面露出层次
06 plated_tamago      装盘态，旁侧一点萝卜泥
```

### 亲子丼

```
01 pan_empty          空平底锅
02 pan_onion          洋葱丝散开，半透明
03 pan_sauce          琥珀色汤汁，洋葱浸在其中
04 pan_egg_ribbons    蛋液半凝固，覆盖表面
05 pan_donburi        连汁带蛋的一整块，准备滑到饭上
06 plated_oyakodon    盖在米饭上，撒葱花
```

---

## 五、工具（12 项）

| 文件名 | 尺寸 | 提示词要点 |
| --- | --- | --- |
| `tool_spatula.png` | 512 透明 | 浅木柄不锈钢铲，扁平、微侧视角 |
| `tool_wood_spatula.png` | 512 透明 | 整木铲，圆头，暖木色 |
| `tool_ladle.png` | 512 透明 | 小汤勺，浅色陶瓷 |
| `tool_oil_bottle.png` | 512 透明 | 细口玻璃油瓶，半透明，暖黄液体 |
| `tool_egg_bowl.png` | 512 透明 | 白瓷碗，内装打散的蛋液 |
| `tool_knife.png` | 512 透明 | 日式三德刀，木柄 |
| `tool_cutting_board.png` | 1024×640 透明 | 浅木砧板，俯视，木纹清晰 |
| `tool_salt_jar.png` | 512 透明 | 小陶盐罐，木勺插着 |
| `tool_plate.png` | 1024×1024 透明 | 白瓷浅盘，俯视 |
| `tool_rice_bowl.png` | 1024×1024 透明 | 白瓷饭碗，俯视，装白饭 |
| `tool_chopsticks.png` | 512 透明 | 一双木筷，斜放 |
| `tool_sauce_bottle.png` | 512 透明 | 酱油瓶，深琥珀液体 |

工具统一提示词后缀：

```
flat illustration, cream and warm wood tones, soft shading,
transparent background, centered, slight top-down angle, no text
```

---

## 六、食材（每项三态，共 12 组）

规格：**256×256 透明**，单体居中，留 12% 边距。

| 食材 | 三态命名 | 提示词要点 |
| --- | --- | --- |
| 番茄 | `tomato_whole` / `tomato_sliced` / `tomato_chunks` | 圆润红番茄，切片成半圆，切块成不规则块 |
| 鸡蛋 | `egg_whole` / `egg_cracked` / `egg_beaten` | 整蛋、碗中破壳、蛋液 |
| 洋葱 | `onion_whole` / `onion_sliced` | 带皮整颗 / 细丝成堆 |
| 鸡腿肉 | `chicken_whole` / `chicken_cubes` | 带皮整块 / 切块 |
| 小葱 | `scallion_whole` / `scallion_chopped` | 几根青葱 / 葱花 |
| 豆腐 | `tofu_block` / `tofu_cubes` | 白豆腐块 / 小方丁 |
| 米饭 | `rice_bowl` | 一碗白饭，米粒可辨 |
| 出汁 | `dashi_bowl` | 浅金色高汤，小碗 |

单张提示词模板：

```
{食材描述}, single item, centered, soft flat illustration,
muted natural colors, transparent background, no text, no plate unless specified
```

---

## 七、操作反馈（5 组）

| 编号 | 文件名 | 尺寸 | 说明 |
| --- | --- | --- | --- |
| F1 | `assets/fx/grade_perfect.png` | 256 透明 | 薄荷绿印章，圆角方框，空白内可叠字 |
| F2 | `assets/fx/grade_good.png` | 256 透明 | 奶油色印章 |
| F3 | `assets/fx/grade_miss.png` | 256 透明 | 陶土色印章 |
| F4 | `assets/fx/cursor_hand.png` | 128 透明 | 柔和的小手/指示光点 |
| F5 | `assets/fx/flame.png` | 256 透明 | 扁平火焰，可调色相做文/中/大三档 |

**F1-F3 提示词**

```
rounded square badge, blank center, thin border, {颜色} tint,
flat illustration, subtle paper texture, transparent background, no text, no icon
```

**F5 提示词**

```
simple flat flame shape, two overlapping soft curves, warm amber and mint variants,
transparent background, no text
```

蒸汽、油花、焦糊烟建议用代码动画做，不必生成。

---

## 八、结算成品图（3 张）

规格：**1024×1024**，俯视 40°，浅奶油底或透明。

| 文件名 | 提示词要点 |
| --- | --- |
| `result_soup.png` | 白瓷碗中的番茄蛋花汤，葱花点缀，蒸汽极淡 |
| `result_tamago.png` | 木盘上的玉子烧切段，旁侧萝卜泥与绿叶 |
| `result_oyakodon.png` | 亲子丼盖饭，蛋液半熟，葱花 |

模板：

```
top-down 40 degree view of {菜品}, on {器皿}, soft flat illustration,
muted cream and sage palette, gentle steam, centered, warm cozy mood, no text
```

---

## 九、优先级

1. **第一批（决定能不能动起来）**：P1 锅体、P4 俯视空锅、锅内状态 18 张、工具 12 件。
2. **第二批**：食材三态 12 组、F1-F4 反馈素材。
3. **第三批**：场景 S1/S2、结算图 3 张、火焰。

---

## 十、不用生成

- Live2D 模型（保持现有 Haru，不动）。
- UI 图标、时机环、流量条、虚线轨迹（代码内联 SVG 绘制）。
- 字体与排版（用系统字体）。
