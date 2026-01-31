/**
 * navigation.js - 导航系统模块
 * 管理章节导航和目录功能
 * Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 6.1-6.7
 */

// 完整章节目录数据
const CHAPTERS_DATA = [
  // 基础概念篇 (第1-11章)
  { number: 1, title: "眼睛如何看世界", subtitle: "透镜成像原理，眼睛里呈现的是倒像", section: "基础概念篇" },
  { number: 2, title: "光照模型是什么", subtitle: "没有光照模型看到的是2D，人脑通过深浅感知深度", section: "基础概念篇" },
  { number: 3, title: "凹凸映射原理", subtitle: "通过光照深浅模拟凹凸效果", section: "基础概念篇" },
  { number: 4, title: "素描的原理", subtitle: "夹角越大反射光越少", section: "基础概念篇" },
  { number: 5, title: "渲染流水线是什么", subtitle: "完整流程讲解", section: "基础概念篇" },
  { number: 6, title: "DC是什么", subtitle: "DrawElement命令，简单示例", section: "基础概念篇" },
  { number: 7, title: "渲染一张图的流程", subtitle: "不一定要变换顶点，简化版本", section: "基础概念篇" },
  { number: 8, title: "顶点是什么", subtitle: "", section: "基础概念篇" },
  { number: 9, title: "纹理是什么", subtitle: "", section: "基础概念篇" },
  { number: 10, title: "法线是什么", subtitle: "", section: "基础概念篇" },
  { number: 11, title: "后屏幕渲染是什么", subtitle: "在眼睛前面蒙个shader去骗你眼睛，荷塘月色圆形水波效果", section: "基础概念篇" },
  
  // 效果原理篇 (第12-22章)
  { number: 12, title: "模糊原理", subtitle: "像素周围的颜色'串门'了，现实中的毛玻璃、近视眼看世界", section: "效果原理篇" },
  { number: 13, title: "卷积核是什么", subtitle: "周围像素通用处理，深度学习也用", section: "效果原理篇" },
  { number: 14, title: "折射原理", subtitle: "光在不同介质传播速度不同产生折射", section: "效果原理篇" },
  { number: 15, title: "放大镜原理", subtitle: "向外扭曲，现实中的放大镜、鱼眼镜头", section: "效果原理篇" },
  { number: 16, title: "缩小镜原理", subtitle: "向内扭曲，现实中的门镜、广角镜", section: "效果原理篇" },
  { number: 17, title: "噪声是什么", subtitle: "噪声函数生成，模拟随机", section: "效果原理篇" },
  { number: 18, title: "噪声的应用", subtitle: "", section: "效果原理篇" },
  { number: 19, title: "UV是什么", subtitle: "纹理的地图", section: "效果原理篇" },
  { number: 20, title: "Bloom光晕原理", subtitle: "感光细胞超阈值，提取高亮度像素", section: "效果原理篇" },
  { number: 21, title: "RenderTexture是什么", subtitle: "拿到摄像机的渲染结果，做镜子、做倒影", section: "效果原理篇" },
  { number: 22, title: "描边原理", subtitle: "化学置换反应的启示，只和外层发生反应", section: "效果原理篇" },
  
  // 进阶概念篇 (第23-26章)
  { number: 23, title: "纹理传递的不一定是图片", subtitle: "法线纹理、噪声扭曲UV等", section: "进阶概念篇" },
  { number: 24, title: "渲染流水线不是固定的", subtitle: "前向渲染vs延迟渲染", section: "进阶概念篇" },
  { number: 25, title: "合并DC原理", subtitle: "相同材质一起绘制", section: "进阶概念篇" },
  { number: 26, title: "深度纹理", subtitle: "用于raycast探测", section: "进阶概念篇" },
  
  // 数学篇 (第27-29章)
  { number: 27, title: "矩阵的用途", subtitle: "空间变换，当函数用", section: "数学篇" },
  { number: 28, title: "旋转矩阵", subtitle: "旋转×平移×原点", section: "数学篇" },
  { number: 29, title: "MVP矩阵", subtitle: "Model View Projection详解", section: "数学篇" },
  
  // 哲学彩蛋篇 (第30-31章)
  { number: 30, title: "蝙蝠的图形学", subtitle: "如果蝙蝠有文明，超声波学？", section: "哲学彩蛋篇" },
  { number: 31, title: "一生二，二生三，三生万物", subtitle: "效果叠加的哲学，复杂皆由简单构成", section: "哲学彩蛋篇" },
  
  // 附录
  { number: 32, title: "推荐书籍", subtitle: "继续深入图形学的学习资源", section: "附录" }
];

// 分类顺序
const SECTION_ORDER = [
  '基础概念篇',
  '效果原理篇',
  '进阶概念篇',
  '数学篇',
  '哲学彩蛋篇',
  '附录'
];

// 导航系统
const NavigationSystem = {
  currentChapter: null,
  
  /**
   * 初始化导航系统
   */
  init: function() {
    this.bindNavigationEvents();
    console.log('导航系统已初始化');
  },
  
  /**
   * 绑定导航事件
   */
  bindNavigationEvents: function() {
    // 上一章按钮
    const prevBtn = document.getElementById('nav-prev');
    if (prevBtn) {
      prevBtn.addEventListener('click', () => this.prevChapter());
    }
    
    // 下一章按钮
    const nextBtn = document.getElementById('nav-next');
    if (nextBtn) {
      nextBtn.addEventListener('click', () => this.nextChapter());
    }
    
    // 返回目录按钮
    const tocBtn = document.getElementById('nav-toc');
    if (tocBtn) {
      tocBtn.addEventListener('click', () => {
        if (typeof showTableOfContents === 'function') {
          showTableOfContents();
        }
      });
    }
  },
  
  /**
   * 跳转到指定章节
   * @param {number} chapterNumber - 章节编号 (1-30)
   */
  goToChapter: function(chapterNumber) {
    // 验证章节编号
    if (chapterNumber < 1 || chapterNumber > 32) {
      console.warn(`无效的章节编号: ${chapterNumber}`);
      return;
    }
    
    const chapter = this.getChapterByNumber(chapterNumber);
    if (!chapter) {
      console.warn(`未找到章节: ${chapterNumber}`);
      return;
    }
    
    this.currentChapter = chapter;
    
    // 更新导航信息
    this.updateNavigationInfo();
    
    // 更新导航按钮状态
    this.updateNavigationButtons();
    
    // 显示章节内容（由 book.js 处理）
    if (typeof BookUI !== 'undefined' && BookUI.showChapter) {
      BookUI.showChapter(chapterNumber);
    }
    
    // 保存阅读进度
    if (typeof StorageManager !== 'undefined') {
      StorageManager.saveProgress(chapterNumber, 1);
    }
    
    console.log(`跳转到第${chapterNumber}章: ${chapter.title}`);
  },
  
  /**
   * 上一章
   */
  prevChapter: function() {
    if (!this.currentChapter) return;
    
    const prevNumber = this.currentChapter.number - 1;
    if (prevNumber >= 1) {
      this.goToChapter(prevNumber);
    }
  },
  
  /**
   * 下一章
   */
  nextChapter: function() {
    if (!this.currentChapter) return;
    
    const nextNumber = this.currentChapter.number + 1;
    if (nextNumber <= 32) {
      this.goToChapter(nextNumber);
    }
  },
  
  /**
   * 获取当前章节信息
   * @returns {Object|null} 当前章节对象
   */
  getCurrentChapter: function() {
    return this.currentChapter;
  },
  
  /**
   * 根据编号获取章节
   * @param {number} number - 章节编号
   * @returns {Object|null} 章节对象
   */
  getChapterByNumber: function(number) {
    return CHAPTERS_DATA.find(ch => ch.number === number) || null;
  },
  
  /**
   * 获取目录数据
   * @returns {Array} 章节数据数组
   */
  getTableOfContents: function() {
    return CHAPTERS_DATA;
  },
  
  /**
   * 获取分类顺序
   * @returns {Array} 分类名称数组
   */
  getSectionOrder: function() {
    return SECTION_ORDER;
  },
  
  /**
   * 标记章节为已读
   * @param {number} chapterNumber - 章节编号
   */
  markAsRead: function(chapterNumber) {
    if (typeof StorageManager !== 'undefined') {
      const readChapters = StorageManager.getReadChapters();
      if (!readChapters.includes(chapterNumber)) {
        readChapters.push(chapterNumber);
        StorageManager.saveReadChapters(readChapters);
        
        // 更新目录中的已读标记
        this.updateTocReadStatus(chapterNumber);
      }
    }
  },
  
  /**
   * 更新目录中的已读状态
   * @param {number} chapterNumber - 章节编号
   */
  updateTocReadStatus: function(chapterNumber) {
    const tocLink = document.querySelector(`.toc-chapter-link[data-chapter="${chapterNumber}"]`);
    if (tocLink) {
      tocLink.classList.add('is-read');
    }
  },
  
  /**
   * 更新导航信息显示
   */
  updateNavigationInfo: function() {
    const navChapter = document.getElementById('nav-chapter');
    if (navChapter && this.currentChapter) {
      navChapter.textContent = `第${this.currentChapter.number}章 ${this.currentChapter.title}`;
    }
  },
  
  /**
   * 更新导航按钮状态
   */
  updateNavigationButtons: function() {
    const prevBtn = document.getElementById('nav-prev');
    const nextBtn = document.getElementById('nav-next');
    
    if (!this.currentChapter) return;
    
    // 第一章禁用上一章按钮
    if (prevBtn) {
      prevBtn.disabled = this.currentChapter.number <= 1;
    }
    
    // 最后一章禁用下一章按钮
    if (nextBtn) {
      nextBtn.disabled = this.currentChapter.number >= 32;
    }
  }
};

// DOM 加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
  NavigationSystem.init();
});

// 导出供其他模块使用
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    CHAPTERS_DATA,
    SECTION_ORDER,
    NavigationSystem
  };
}
