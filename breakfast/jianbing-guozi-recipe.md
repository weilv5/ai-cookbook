# 🥞 程序员版正宗煎饼果子实战教程 - 从环境配置到出锅一键运行

> 「给我一勺面糊，我就能摊出整个世界」—— 某匿名煎饼码农

如果你也和我一样，是个煎饼果子深度爱好者，又喜欢写代码，那今天这个项目你一定喜欢。本文用程序员的思维方式，一步步教你在家摊出正宗街头风味煎饼果子。

---

## 项目简介

**项目名称**: JianBingGuoZi  
**版本**: 1.0.0  
**难度**: 入门级 ⭐⭐  
**耗时**: 约 20 分钟  
**依赖**: 面粉 + 绿豆面 + 鸡蛋 + 平底锅  
**测试环境**: 我家厨房 ✅

![成品展示](https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=1000&q=80)

*成品效果图：刚出锅的煎饼果子，外软内脆，酱香浓郁*

---

## 环境准备 (Ingredients)

### 基础依赖 (2-3人份)

| 食材 | 版本要求 | 用量 | 说明 |
|------|----------|------|------|
| 中筋面粉 | Any | 100g | 普通面粉也能向下兼容 |
| 绿豆面 | 推荐 | 50g | **灵魂依赖**，没有会缺味 |
| 饮用水 | Any | 280ml | ±20ml 自行调参 |
| 鸡蛋 | 新鲜 | 2-3个 | 一个煎饼一个蛋 |
| 油条/薄脆 | Any | 2根 | 油条是家庭最佳备选 |
| 葱花 | 可选 | 10g | 不吃可以跳过依赖 |
| 甜面酱 | Any | 2勺 | 基础酱料 |
| 辣椒酱 | 可选 | 1勺 | 能吃辣建议加上 |
| 生菜 | 新鲜 | 4片 | 增加爽脆感 |

### 硬件要求

- 平底锅/煎饼鏊子 → 推荐不粘平底锅，降低入门门槛
- 硅胶刮刀/木刮板 → 摊面糊用
- 燃气灶/电磁炉 → 都行，中小火即可

---

## 核心算法实现 (制作流程)

```python
# -*- coding: utf-8 -*-
# @Author: 煎饼果子爱好者
# @Description: 正宗街头风味煎饼果子实现

import time

class JianBingGuoZi:
    """煎饼果子核心类"""
    
    # 配置常量 - 可根据口味自行修改
    INGREDIENTS = {
        "flour":       {"amount": 100, "unit": "g"},
        "mung_bean_flour": {"amount": 50, "unit": "g"},
        "water":       {"amount": 280, "unit": "ml"},
        "eggs":        {"amount": 2, "unit": "pcs"},
        "youtiao":     {"amount": 2, "unit": "pcs"},
    }
    
    def __init__(self):
        self.batter = None
        self.pan_temp = 0
        self.log = print  # 日志输出
    
    def prepare_batter(self) -> bool:
        """[Step 1] 面糊初始化"""
        self.log("[1/5] 🧹 开始调制面糊...")
        
        try:
            # 干料混合
            flour = self.INGREDIENTS["flour"]["amount"]
            mung_bean = self.INGREDIENTS["mung_bean_flour"]["amount"]
            
            # 分批加水，防结块设计
            total_water = self.INGREDIENTS["water"]["amount"]
            batches = [total_water//2, total_water//4, total_water//4]
            
            batter = []
            for batch in batches:
                batter.append(batch)
                # 这里模拟搅拌，实际操作要搅拌均匀
                if self._has_clumps(batter):
                    self.log("WARN: ⚠️  发现结块，请打散后继续")
                    return False
            
            # 醒面 - 让面粉充分吸水，相当于模型预热
            self.log(f"INFO: 面糊配制完成，开始醒面 10min...")
            time.sleep(60 * 10)
            
            self.batter = batter
            self.log("INFO: ✅ 面糊制备完成")
            return True
        
        except Exception as e:
            self.log(f"ERROR: ❌ 制备失败: {str(e)}")
            return False
    
    def heat_pan(self, target_temp: int = 160) -> None:
        """[Step 2] 预热锅子"""
        self.log(f"[2/5] 🔥 预热锅子到 {target_temp}°C...")
        
        # 测试温度：滴水成珠法
        def test_ready():
            """验证锅温是否达标"""
            return "滴水立即蒸发"
        
        while not test_ready():
            if self._current_temp() > target_temp + 20:
                self.log("WARN: ⚠️  锅子过热，请调小火")
                time.sleep(2)
        
        self.pan_temp = target_temp
        self.log("INFO: ✅ 锅子预热完成")
    
    def spread_batter(self) -> bool:
        """[Step 3] 摊面糊"""
        self.log("[3/5] 🥣 开始摊饼...")
        
        # 取一勺面糊，80ml左右看锅大小调整
        ladle = 80  # ml
        
        # 核心操作：从圆心向外转圈摊开
        # 技巧：端起锅转圈圈，离心力帮你摊均匀
        success = self._do_spread(
            thickness=1.5,  # 目标厚度 1-2mm 最佳
            uniform=True
        )
        
        if not success:
            self.log("ERROR: ❌ 摊失败了，别怕，第一次都这样，刮掉重来")
            return False
        
        # 等面糊半凝固再加鸡蛋
        while self._get_humidity() > 30:
            time.sleep(0.5)
        
        # 打入鸡蛋，抹匀
        egg = self._take_egg()
        egg.break_into_center()
        egg.spread()
        egg.sprinkle_spring_onion()
        
        self.log("INFO: ✅ 面糊摊制完成")
        return True
    
    def add_toppings(self) -> bool:
        """[Step 4] 加料"""
        self.log("[4/5] 🥓 开始加料...")
        
        # 翻面，刷酱
        self._flip()
        
        # 酱料配比 甜面酱:辣椒酱 = 3:1 黄金比例
        sauce_map = [
            ("sweet_bean", 3),
            ("chili", 1)
        ]
        for sauce, ratio in sauce_map:
            self._brush_sauce(sauce, ratio)
        
        # 放入主角油条/薄脆
        youtiao = self._take_youtiao()
        youtiao.put_in_center()
        
        # 生菜包起来
        for _ in range(2):
            lettuce = self._take_lettuce()
            lettuce.wrap()
        
        # 扩展接口：可以加火腿、肉松、辣条...
        # if config.add_ham: self.add_ham()
        # if config.add_sausage: self.add_sausage()
        
        self.log("INFO: ✅ 加料完成")
        return True
    
    def roll_and_serve(self) -> bool:
        """[Step 5] 出锅装盘"""
        self.log("[5/5] 🍽️  出锅装盘...")
        
        # 卷起来
        self._roll()
        # 对半切开，符合人类食用习惯
        self._cut()
        
        self.log("\n🎉 SUCCESS: 煎饼果子制作完成！趁热吃！")
        return True
    
    def build(self) -> bool:
        """主构建流程"""
        pipeline = [
            self.prepare_batter,
            lambda: self.heat_pan(160),
            self.spread_batter,
            self.add_toppings,
            self.roll_and_serve
        ]
        
        for step in pipeline:
            if not step():
                self.log(f"\n❌ 流程中断，建议重试，积累经验参数")
                return False
        
        return True
    
    # ============ 内部辅助方法 ============
    def _has_clumps(self, batter):
        return False  # 你搅拌好了就是False
    def _current_temp(self):
        return self.pan_temp
    def _get_humidity(self):
        return 20  # 大概看看就行
    def _do_spread(self, thickness, uniform):
        return True  # 多练几次就都是True了


if __name__ == "__main__":
    print("===== 开始构建煎饼果子 =====")
    jianbing = JianBingGuoZi()
    success = jianbing.build()
    
    if success:
        print("\n✅ 构建成功！enjoy your meal!")
    else:
        print("\n❌ 构建失败，git pull 一下配方再试一次")
```

---

## 运行效果展示

### 步骤分解图

**第一步：醒好的面糊**
> 状态：能顺畅流动，提起来拉线不断就ok

**第二步：摊好面糊加鸡蛋**
> 技巧：葱花撒在鸡蛋上，香气更足

**第三步：刷酱放油条**
> 提示：酱别刷太多边缘，不然卷的时候会漏

**第四步：卷好出锅**
> 提醒：趁热吃！凉了油条就不脆了。

---

## ⚠️ 常见问题 Debug

| 问题 | 原因分析 | 解决方案 |
|------|----------|----------|
| 面糊粘锅 | 锅没烧热 | ➡️ 烧热到滴水成珠再下面糊 |
| 摊不薄 | 面糊太稠 | ➡️ 再加一点水调稀 |
| 没绿豆面 | 依赖缺失 | ➡️ 网购或全用面粉，风味打点折 |
| 翻面烂了 | 翻太早 | ➡️ 等鸡蛋凝固了再翻 |
| 太咸了 | 酱刷多了 | ➡️ 酱刷匀就行，边缘少刷 |

---

## 📝 进阶优化

### 自制薄脆 (可选扩展功能)

```python
def make_bingcui():
    """家庭自制薄脆"""
    # 面粉 + 一点盐 + 小苏打，和成硬面团
    # 醒30分钟，擀成非常薄的面片
    # 切成小块，六成热油炸到金黄捞出
    # 放凉就脆了，可以一次多做点存着
    return bingcui
```

### 口味定制 (分支切换)

- **天津原版** → 只放油条/薄脆 + 酱
- **加肠版** → checkout 到 add-ham 分支
- **辣条版** → 放一片辣条，暗黑但好吃
- **健身版** → 换成鸡胸肉，少刷酱

---

## 🎯 总结

摊煎饼其实和写代码一样：

1. **依赖要装对** → 绿豆面真的很重要
2. **参数要调对** → 面糊稀稠是关键
3. **失败要重试** → 坏几张就找到手感了
4. **方便最重要** → 家庭做不用追求完全和路边一样，好吃就行

如果你做成功了，欢迎提 PR 上来分享你的配方！

---

**License**: MIT  
**Author**: 阿尼亚 @ ai-cookbook  
**最后更新**: 2026-04-09
