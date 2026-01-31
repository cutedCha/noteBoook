/**
 * book.js - 图书翻页控制模块
 * 负责图书视觉效果的渲染和翻页动画
 * Requirements: 1.1, 1.2, 1.3, 1.4, 3.1, 3.2, 3.3, 3.4, 3.5, 3.6
 */

// 图书UI控制器
const BookUI = {
  // 视图模式: 'single' | 'double'
  viewMode: 'double',
  
  // 是否正在播放动画
  isAnimating: false,
  
  // 当前显示的章节
  currentChapter: null,
  
  // 当前页码
  currentPage: 1,
  
  // 总页数
  totalPages: 1,
  
  /**
   * 初始化图书界面
   */
  init: function() {
    // 检测视图模式
    this.detectViewMode();
    
    // 监听窗口大小变化
    window.addEventListener('resize', () => this.detectViewMode());
    
    // 初始化触摸手势
    this.initTouchGestures();
    
    console.log('图书UI已初始化');
  },
  
  /**
   * 检测并设置视图模式
   * 始终使用单页模式，全屏显示
   */
  detectViewMode: function() {
    // 始终使用单页模式
    const newMode = 'single';
    
    // 只有模式变化时才更新
    if (this.viewMode !== newMode) {
      this.setViewMode(newMode);
    } else if (!document.body.hasAttribute('data-view-mode')) {
      // 首次初始化时也需要设置
      this.setViewMode(newMode);
    }
  },
  
  /**
   * 显示封面
   */
  showCover: function() {
    if (typeof showCover === 'function') {
      showCover();
    }
  },
  
  /**
   * 显示目录
   */
  showTableOfContents: function() {
    if (typeof showTableOfContents === 'function') {
      showTableOfContents();
    }
  },
  
  /**
   * 显示指定章节
   * @param {number} chapterNumber - 章节编号
   */
  showChapter: function(chapterNumber) {
    // 先设置当前章节编号（在异步加载之前）
    this.currentChapter = chapterNumber;
    this.currentPage = 1;
    
    // 更新当前视图状态
    if (typeof setCurrentView === 'function') {
      setCurrentView('chapter');
    }
    
    // 隐藏封面和目录
    const cover = document.getElementById('cover');
    const toc = document.getElementById('toc');
    const content = document.getElementById('content');
    const navigation = document.getElementById('navigation');
    
    if (cover) cover.classList.add('hidden');
    if (toc) toc.classList.add('hidden');
    if (content) content.classList.remove('hidden');
    if (navigation) navigation.classList.remove('hidden');
    
    // 立即更新导航按钮状态
    this.updateNavigationState();
    
    // 加载章节内容
    this.loadChapterContent(chapterNumber);
  },
  
  /**
   * 加载章节内容
   * @param {number} chapterNumber - 章节编号
   * Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6
   */
  loadChapterContent: function(chapterNumber) {
    // 获取章节数据
    const chapter = typeof NavigationSystem !== 'undefined' 
      ? NavigationSystem.getChapterByNumber(chapterNumber)
      : null;
    
    if (!chapter) {
      console.warn(`未找到章节 ${chapterNumber}`);
      return;
    }
    
    // 获取页面内容容器
    const pageContent = document.querySelector('.page-right .page-content');
    if (!pageContent) {
      console.warn('未找到页面内容容器');
      return;
    }
    
    // 尝试加载章节 HTML 文件
    const chapterFile = `chapters/chapter-${String(chapterNumber).padStart(2, '0')}.html`;
    
    fetch(chapterFile)
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        return response.text();
      })
      .then(htmlContent => {
        // 章节文件存在，使用文件内容
        const chapterData = {
          ...chapter,
          content: htmlContent
        };
        
        // 直接渲染内容（不分页，使用滚动）
        if (typeof PageRenderer !== 'undefined') {
          PageRenderer.render(chapterData, pageContent);
        } else {
          // 降级处理：直接渲染
          this.renderChapterFallback(chapterData, pageContent);
        }
        
        // 滚动到顶部
        pageContent.scrollTop = 0;
        
        // 初始化交互演示
        this.initInteractiveDemos();
        
        // 设置页数为1（滚动模式不需要分页）
        this.totalPages = 1;
        this.currentPage = 1;
        
        // 更新页码显示
        this.updatePageNumber(this.currentPage, this.totalPages);
      })
      .catch(() => {
        // 章节文件不存在或加载失败，使用占位内容
        console.log(`章节文件 ${chapterFile} 未找到，使用占位内容`);
        
        // 直接渲染（无内容）
        if (typeof PageRenderer !== 'undefined') {
          PageRenderer.render(chapter, pageContent);
        } else {
          this.renderChapterFallback(chapter, pageContent);
        }
        
        // 滚动到顶部
        pageContent.scrollTop = 0;
        
        // 设置页数为1
        this.totalPages = 1;
        this.currentPage = 1;
        
        // 更新页码
        this.updatePageNumber(this.currentPage, this.totalPages);
      });
  },
  
  /**
   * 降级渲染章节内容（当 PageRenderer 不可用时）
   * @param {Object} chapter - 章节数据
   * @param {HTMLElement} container - 容器元素
   */
  renderChapterFallback: function(chapter, container) {
    container.innerHTML = `
      <div class="chapter-container">
        <header class="chapter-header">
          <div class="chapter-number">第${chapter.number}章</div>
          <h1 class="chapter-title">${chapter.title}</h1>
          ${chapter.subtitle ? `<p class="chapter-subtitle">${chapter.subtitle}</p>` : ''}
          ${chapter.section ? `<span class="chapter-section-tag">${chapter.section}</span>` : ''}
        </header>
        <div class="chapter-body">
          ${chapter.content || `
            <div class="chapter-placeholder">
              <p class="placeholder-text">本章内容正在编写中...</p>
              <p class="placeholder-hint">敬请期待！</p>
            </div>
          `}
        </div>
      </div>
    `;
  },
  
  /**
   * 翻页/切换章节
   * @param {string} direction - 方向 'next' | 'prev'
   * Requirements: 3.1, 3.2, 3.5, 3.6
   * - 3.1: 点击下一页按钮或向左滑动切换到下一章
   * - 3.2: 点击上一页按钮或向右滑动切换到上一章
   * - 3.5: 第一章时禁用向前
   * - 3.6: 最后一章时禁用向后
   */
  flipPage: function(direction) {
    // 防止动画重叠
    if (this.isAnimating) return;
    
    // 使用 NavigationSystem 进行章节导航
    if (typeof NavigationSystem !== 'undefined') {
      if (direction === 'next') {
        NavigationSystem.nextChapter();
      } else if (direction === 'prev') {
        NavigationSystem.prevChapter();
      }
    }
  },
  
  /**
   * 播放翻页动画（桌面端）
   * @param {string} direction - 翻页方向 'next' | 'prev'
   * Requirements: 3.1, 3.2, 3.3, 3.4
   */
  playFlipAnimation: function(direction) {
    const content = document.getElementById('content');
    if (!content) {
      this.isAnimating = false;
      return;
    }
    
    // 创建翻页容器
    const flipContainer = document.createElement('div');
    flipContainer.className = 'page-flip-container';
    
    // 创建翻页页面 - 正面
    const flippingPage = document.createElement('div');
    flippingPage.className = 'page-flipping page-flipping-front';
    
    // 复制当前页面内容到翻页页面（增强视觉效果）
    const currentPageContent = document.querySelector('.page-right .page-content');
    if (currentPageContent && direction === 'next') {
      const contentClone = currentPageContent.cloneNode(true);
      contentClone.style.padding = 'var(--padding-page)';
      contentClone.style.height = '100%';
      contentClone.style.overflow = 'hidden';
      flippingPage.appendChild(contentClone);
    }
    
    // 添加弯曲效果层
    const curl = document.createElement('div');
    curl.className = 'page-curl';
    flippingPage.appendChild(curl);
    
    // 创建页面背面
    const backPage = document.createElement('div');
    backPage.className = 'page-flipping-back';
    flippingPage.appendChild(backPage);
    
    flipContainer.appendChild(flippingPage);
    content.appendChild(flipContainer);
    
    // 添加弯曲效果类
    flippingPage.classList.add('curling');
    
    // 添加动画类
    const animationClass = direction === 'next' ? 'flip-to-left' : 'flip-to-right';
    flipContainer.classList.add(animationClass);
    
    // 获取动画持续时间
    const animationDuration = 600; // 与 CSS --transition-page-flip 保持一致
    
    // 动画结束后清理
    setTimeout(() => {
      flipContainer.remove();
      this.isAnimating = false;
      
      // 更新页码
      if (direction === 'next') {
        this.currentPage++;
      } else {
        this.currentPage--;
      }
      this.updatePageNumber(this.currentPage, this.totalPages);
      
      // 触发翻页完成事件
      this.onFlipComplete(direction);
    }, animationDuration);
  },
  
  /**
   * 翻页完成回调
   * @param {string} direction - 翻页方向
   * Requirements: 3.4, 4.5, 4.6
   */
  onFlipComplete: function(direction) {
    // 更新分页内容显示
    const pageContent = document.querySelector('.page-right .page-content');
    if (pageContent && typeof PageRenderer !== 'undefined') {
      PageRenderer.renderPage(this.currentPage - 1, pageContent);
    }
    
    console.log(`翻页完成: ${direction === 'next' ? '下一页' : '上一页'}, 当前页: ${this.currentPage}/${this.totalPages}`);
  },
  
  /**
   * 播放滑动动画（移动端）
   * @param {string} direction - 翻页方向 'next' | 'prev'
   * Requirements: 3.1, 3.2, 3.4, 5.4
   */
  playSlideAnimation: function(direction) {
    const pageRight = document.querySelector('.page-right');
    if (!pageRight) {
      this.isAnimating = false;
      return;
    }
    
    // 滑出动画
    const slideOutClass = direction === 'next' ? 'page-slide-left' : 'page-slide-right';
    pageRight.classList.add(slideOutClass);
    
    setTimeout(() => {
      pageRight.classList.remove(slideOutClass);
      
      // 更新页码
      if (direction === 'next') {
        this.currentPage++;
      } else {
        this.currentPage--;
      }
      this.updatePageNumber(this.currentPage, this.totalPages);
      
      // 滑入动画
      const slideInClass = direction === 'next' ? 'page-slide-in-left' : 'page-slide-in-right';
      pageRight.classList.add(slideInClass);
      
      setTimeout(() => {
        pageRight.classList.remove(slideInClass);
        this.isAnimating = false;
        
        // 触发翻页完成事件
        this.onFlipComplete(direction);
      }, 300);
    }, 300);
  },
  
  /**
   * 更新页码显示
   * @param {number} current - 当前页码
   * @param {number} total - 总页数
   */
  updatePageNumber: function(current, total) {
    this.currentPage = current;
    this.totalPages = total;
    
    const pageNumbers = document.querySelectorAll('.page-number');
    pageNumbers.forEach((el, index) => {
      if (this.viewMode === 'double') {
        // 双页视图：左页显示偶数页，右页显示奇数页
        const pageNum = current * 2 - 1 + index;
        el.textContent = pageNum <= total * 2 ? pageNum : '';
      } else {
        // 单页视图
        el.textContent = current;
      }
    });
    
    // 更新导航按钮状态
    this.updateNavigationState();
  },
  
  /**
   * 初始化交互演示
   * 检测页面中的demo元素并初始化对应的演示脚本
   */
  initInteractiveDemos: function() {
    // 检查是否有凸透镜演示
    const lensDemo = document.getElementById('lens-demo');
    if (lensDemo && typeof LensDemo !== 'undefined') {
      setTimeout(function() {
        LensDemo.init();
      }, 50);
    }
    
    // 检查是否有透镜折射演示
    const refractionDemoNew = document.getElementById('refraction-demo-new');
    if (refractionDemoNew && typeof LensRefractionDemo !== 'undefined') {
      setTimeout(function() {
        LensRefractionDemo.init();
      }, 50);
    }
    
    // 检查是否有光照模型演示
    const lightingDemo = document.getElementById('lighting-demo');
    if (lightingDemo && typeof LightingDemo !== 'undefined') {
      setTimeout(function() {
        LightingDemo.init();
      }, 50);
    }
    
    // 检查是否有凹凸映射演示
    const bumpDemo = document.getElementById('bump-demo');
    if (bumpDemo && typeof BumpDemo !== 'undefined') {
      setTimeout(function() {
        BumpDemo.init();
      }, 50);
    }
    
    // 检查是否有素描演示
    const sketchDemo = document.getElementById('sketch-demo');
    if (sketchDemo && typeof SketchDemo !== 'undefined') {
      setTimeout(function() {
        SketchDemo.init();
      }, 50);
    }
    
    // 检查是否有模糊演示
    const blurDemo = document.getElementById('blur-demo');
    if (blurDemo && typeof BlurDemo !== 'undefined') {
      setTimeout(function() {
        BlurDemo.init();
      }, 50);
    }
    
    // 检查是否有折射演示
    const refractionDemo = document.getElementById('refraction-demo');
    if (refractionDemo && typeof RefractionDemo !== 'undefined') {
      setTimeout(function() {
        RefractionDemo.init();
      }, 50);
    }
    
    // 检查是否有放大镜演示
    const magnifyDemo = document.getElementById('magnify-demo');
    if (magnifyDemo && typeof MagnifyDemo !== 'undefined') {
      setTimeout(function() {
        MagnifyDemo.init();
      }, 50);
    }
    
    // 检查是否有缩小镜演示
    const minifyDemo = document.getElementById('minify-demo');
    if (minifyDemo && typeof MinifyDemo !== 'undefined') {
      setTimeout(function() {
        MinifyDemo.init();
      }, 50);
    }
    
    // 检查是否有剑特效演示
    const swordDemo = document.getElementById('sword-demo');
    if (swordDemo && typeof SwordDemo !== 'undefined') {
      setTimeout(function() {
        SwordDemo.init();
      }, 50);
    }
    
    // 检查是否有MVP矩阵演示
    const mvpDemo = document.getElementById('mvp-demo');
    if (mvpDemo && typeof MVPDemo !== 'undefined') {
      setTimeout(function() {
        MVPDemo.init();
      }, 50);
    }
    
    // 检查是否有噪声演示
    const noiseDemo = document.getElementById('noise-demo');
    if (noiseDemo && typeof NoiseDemo !== 'undefined') {
      setTimeout(function() {
        NoiseDemo.init();
      }, 50);
    }
    
    // 检查是否有海底演示
    const seaDemo = document.getElementById('sea-demo');
    if (seaDemo && typeof SeaDemo !== 'undefined') {
      setTimeout(function() {
        SeaDemo.init();
      }, 50);
    }
    
    // 检查是否有UV演示
    const uvDemo = document.getElementById('uv-demo');
    if (uvDemo && typeof UVDemo !== 'undefined') {
      setTimeout(function() {
        UVDemo.init();
      }, 50);
    }
    
    // 检查是否有Bloom演示
    const bloomDemo = document.getElementById('bloom-demo');
    if (bloomDemo && typeof BloomDemo !== 'undefined') {
      setTimeout(function() {
        BloomDemo.init();
      }, 50);
    }
    
    // 检查是否有描边演示
    const outlineDemo = document.getElementById('outline-demo');
    if (outlineDemo && typeof OutlineDemo !== 'undefined') {
      setTimeout(function() {
        OutlineDemo.init();
      }, 50);
    }
    
    // 检查是否有深度纹理演示
    const depthDemo = document.getElementById('depth-demo');
    if (depthDemo && typeof DepthDemo !== 'undefined') {
      setTimeout(function() {
        DepthDemo.init();
      }, 50);
    }
    
    // 检查是否有四元数演示
    const quaternionDemo = document.getElementById('quaternion-demo');
    if (quaternionDemo && typeof QuaternionDemo !== 'undefined') {
      setTimeout(function() {
        QuaternionDemo.init();
      }, 50);
    }
    
    // 检查是否有后屏幕渲染演示
    const postprocessDemo = document.getElementById('postprocess-demo');
    if (postprocessDemo && typeof PostProcessDemo !== 'undefined') {
      setTimeout(function() {
        PostProcessDemo.init();
      }, 50);
    }
  },
  
  /**
   * 更新导航按钮状态
   * 基于当前章节编号来控制按钮状态（用于章节导航）
   */
  updateNavigationState: function() {
    const prevBtn = document.getElementById('nav-prev');
    const nextBtn = document.getElementById('nav-next');
    
    // 使用章节编号来控制按钮状态
    const currentChapterNumber = this.currentChapter || 1;
    
    if (prevBtn) {
      // 第一章禁用上一章按钮
      prevBtn.disabled = currentChapterNumber <= 1;
    }
    if (nextBtn) {
      // 最后一章禁用下一章按钮
      nextBtn.disabled = currentChapterNumber >= 32;
    }
  },
  
  /**
   * 初始化触摸手势
   * Requirements: 3.1, 3.2, 5.4, 5.5
   * - 向左滑动触发下一页 (Requirement 3.1)
   * - 向右滑动触发上一页 (Requirement 3.2)
   * - 支持触摸滑动翻页手势 (Requirement 5.4)
   * - 确保导航按钮触摸区域≥44px (Requirement 5.5)
   */
  initTouchGestures: function() {
    const content = document.getElementById('content');
    if (!content) return;
    
    // 触摸状态跟踪
    let touchStartX = 0;
    let touchStartY = 0;
    let touchEndX = 0;
    let touchEndY = 0;
    let touchStartTime = 0;
    let isSwiping = false;
    
    // 滑动配置
    const minSwipeDistance = 50;    // 最小滑动距离 (px)
    const maxSwipeTime = 500;       // 最大滑动时间 (ms)
    const maxVerticalRatio = 0.75;  // 最大垂直/水平比例（防止垂直滚动误触发）
    
    // 触摸开始
    content.addEventListener('touchstart', (e) => {
      if (this.isAnimating) return;
      
      const touch = e.changedTouches[0];
      touchStartX = touch.screenX;
      touchStartY = touch.screenY;
      touchStartTime = Date.now();
      isSwiping = true;
      
      // 添加触摸反馈类
      content.classList.add('touch-active');
    }, { passive: true });
    
    // 触摸移动 - 提供视觉反馈
    content.addEventListener('touchmove', (e) => {
      if (!isSwiping || this.isAnimating) return;
      
      const touch = e.changedTouches[0];
      const deltaX = touch.screenX - touchStartX;
      const deltaY = touch.screenY - touchStartY;
      
      // 检查是否为水平滑动（而非垂直滚动）
      if (Math.abs(deltaY) > Math.abs(deltaX) * maxVerticalRatio) {
        // 垂直滑动，取消翻页手势
        isSwiping = false;
        content.classList.remove('touch-active');
        return;
      }
      
      // 可选：添加滑动预览效果（轻微位移）
      if (Math.abs(deltaX) > 10) {
        const pageRight = document.querySelector('.page-right');
        if (pageRight && this.viewMode === 'single') {
          const translateX = Math.min(Math.max(deltaX * 0.1, -20), 20);
          pageRight.style.transform = `translateX(${translateX}px)`;
        }
      }
    }, { passive: true });
    
    // 触摸结束
    content.addEventListener('touchend', (e) => {
      content.classList.remove('touch-active');
      
      // 重置页面位移
      const pageRight = document.querySelector('.page-right');
      if (pageRight) {
        pageRight.style.transform = '';
      }
      
      if (!isSwiping || this.isAnimating) {
        isSwiping = false;
        return;
      }
      
      const touch = e.changedTouches[0];
      touchEndX = touch.screenX;
      touchEndY = touch.screenY;
      
      const swipeDistance = touchEndX - touchStartX;
      const swipeTime = Date.now() - touchStartTime;
      const verticalDistance = Math.abs(touchEndY - touchStartY);
      
      // 验证滑动有效性
      const isValidSwipe = 
        Math.abs(swipeDistance) >= minSwipeDistance &&
        swipeTime <= maxSwipeTime &&
        verticalDistance < Math.abs(swipeDistance) * maxVerticalRatio;
      
      if (isValidSwipe) {
        if (swipeDistance > 0) {
          // 向右滑动 - 上一页 (Requirement 3.2, 5.4)
          this.flipPage('prev');
        } else {
          // 向左滑动 - 下一页 (Requirement 3.1, 5.4)
          this.flipPage('next');
        }
      }
      
      isSwiping = false;
    }, { passive: true });
    
    // 触摸取消
    content.addEventListener('touchcancel', () => {
      isSwiping = false;
      content.classList.remove('touch-active');
      
      // 重置页面位移
      const pageRight = document.querySelector('.page-right');
      if (pageRight) {
        pageRight.style.transform = '';
      }
    }, { passive: true });
    
    console.log('触摸手势已初始化');
  },
  
  /**
   * 设置视图模式
   * @param {string} mode - 'single' | 'double'
   * Requirements: 5.1, 5.2
   * - 5.1: 单页视图模式 - 隐藏左页，只显示右页
   * - 5.2: 双页视图模式 - 显示左右两页
   */
  setViewMode: function(mode) {
    const previousMode = this.viewMode;
    this.viewMode = mode;
    
    // 设置 body 的 data-view-mode 属性，供 CSS 使用
    document.body.setAttribute('data-view-mode', mode);
    
    // 更新左页显示状态
    const pageLeft = document.querySelector('.page-left');
    if (pageLeft) {
      if (mode === 'single') {
        pageLeft.style.display = 'none';
      } else {
        pageLeft.style.display = 'block';
      }
    }
    
    // 更新页码显示
    if (this.currentPage && this.totalPages) {
      this.updatePageNumber(this.currentPage, this.totalPages);
    }
    
    // 触发视图模式变化事件
    if (previousMode !== mode) {
      const event = new CustomEvent('viewModeChange', {
        detail: { mode: mode, previousMode: previousMode }
      });
      document.dispatchEvent(event);
      console.log(`视图模式切换: ${previousMode} -> ${mode}`);
    }
  }
};

// DOM 加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
  BookUI.init();
});

// 导出供其他模块使用
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { BookUI };
}
