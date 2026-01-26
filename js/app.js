/**
 * app.js - 主应用逻辑
 * 负责应用初始化和页面状态管理
 * Requirements: 1.2, 1.5, 4.1, 4.2, 4.3, 4.4, 4.5, 4.6
 */

// 应用状态
const AppState = {
  currentView: 'cover',  // 'cover' | 'toc' | 'chapter'
  currentChapter: null,
  currentPage: 1,
  totalPages: 1,
  paginatedContent: [], // 分页后的内容数组
  isAnimating: false,
  isLoaded: false
};

/**
 * PageRenderer - 页面内容渲染器
 * 负责章节内容的渲染和分页
 * Requirements: 4.1, 4.2, 4.3, 4.4
 */
const PageRenderer = {
  /**
   * 渲染章节内容到指定容器
   * @param {Object} chapterData - 章节数据对象
   * @param {HTMLElement} containerElement - 目标容器元素
   * Requirements: 4.1, 4.4
   */
  render: function(chapterData, containerElement) {
    if (!chapterData || !containerElement) {
      console.warn('PageRenderer.render: 缺少章节数据或容器元素');
      return;
    }
    
    // 清空容器
    containerElement.innerHTML = '';
    
    // 创建章节容器
    const chapterContainer = document.createElement('div');
    chapterContainer.className = 'chapter-container';
    
    // 渲染章节头部（标题、副标题）
    const header = this.renderChapterHeader(chapterData);
    chapterContainer.appendChild(header);
    
    // 渲染章节正文
    const body = this.renderChapterBody(chapterData);
    chapterContainer.appendChild(body);
    
    containerElement.appendChild(chapterContainer);
  },
  
  /**
   * 渲染章节头部（标题、副标题）
   * @param {Object} chapterData - 章节数据
   * @returns {HTMLElement} 头部元素
   * Requirements: 4.1
   */
  renderChapterHeader: function(chapterData) {
    const header = document.createElement('header');
    header.className = 'chapter-header';
    
    // 章节编号
    const chapterNumber = document.createElement('div');
    chapterNumber.className = 'chapter-number';
    chapterNumber.textContent = `第${chapterData.number}章`;
    header.appendChild(chapterNumber);
    
    // 章节标题
    const title = document.createElement('h1');
    title.className = 'chapter-title';
    title.textContent = chapterData.title;
    header.appendChild(title);
    
    // 副标题（如果存在）
    if (chapterData.subtitle) {
      const subtitle = document.createElement('p');
      subtitle.className = 'chapter-subtitle';
      subtitle.textContent = chapterData.subtitle;
      header.appendChild(subtitle);
    }
    
    // 分类标签
    if (chapterData.section) {
      const sectionTag = document.createElement('span');
      sectionTag.className = 'chapter-section-tag';
      sectionTag.textContent = chapterData.section;
      header.appendChild(sectionTag);
    }
    
    return header;
  },
  
  /**
   * 渲染章节正文内容
   * @param {Object} chapterData - 章节数据
   * @returns {HTMLElement} 正文元素
   * Requirements: 4.1, 4.4
   */
  renderChapterBody: function(chapterData) {
    const body = document.createElement('div');
    body.className = 'chapter-body';
    
    // 如果有 HTML 内容，直接渲染
    if (chapterData.content) {
      body.innerHTML = chapterData.content;
      // 处理内容中的代码块和图片
      this.processCodeBlocks(body);
      this.processImages(body);
    } else {
      // 显示占位内容
      const placeholder = document.createElement('div');
      placeholder.className = 'chapter-placeholder';
      placeholder.innerHTML = `
        <p class="placeholder-text">本章内容正在编写中...</p>
        <p class="placeholder-hint">敬请期待！</p>
      `;
      body.appendChild(placeholder);
    }
    
    return body;
  },
  
  /**
   * 渲染代码块
   * @param {string} code - 代码内容
   * @param {string} language - 编程语言（可选）
   * @returns {HTMLElement} 代码块元素
   * Requirements: 4.2
   */
  renderCodeBlock: function(code, language) {
    const container = document.createElement('div');
    container.className = 'code-block-container';
    
    // 语言标签（如果指定）
    if (language) {
      const langLabel = document.createElement('span');
      langLabel.className = 'code-language-label';
      langLabel.textContent = language;
      container.appendChild(langLabel);
    }
    
    // 代码块
    const pre = document.createElement('pre');
    pre.className = 'code-block';
    
    const codeEl = document.createElement('code');
    codeEl.className = language ? `language-${language}` : '';
    codeEl.textContent = code;
    
    pre.appendChild(codeEl);
    container.appendChild(pre);
    
    return container;
  },
  
  /**
   * 处理内容中的代码块，应用等宽字体样式
   * @param {HTMLElement} container - 包含代码块的容器
   * Requirements: 4.2
   */
  processCodeBlocks: function(container) {
    // 处理 pre > code 结构
    const codeBlocks = container.querySelectorAll('pre code');
    codeBlocks.forEach(codeEl => {
      const pre = codeEl.parentElement;
      if (pre && !pre.classList.contains('code-block')) {
        pre.classList.add('code-block');
      }
      
      // 检测语言类
      const langClass = Array.from(codeEl.classList).find(c => c.startsWith('language-'));
      if (langClass) {
        const language = langClass.replace('language-', '');
        // 添加语言标签
        if (!pre.parentElement.classList.contains('code-block-container')) {
          const wrapper = document.createElement('div');
          wrapper.className = 'code-block-container';
          
          const langLabel = document.createElement('span');
          langLabel.className = 'code-language-label';
          langLabel.textContent = language;
          
          pre.parentNode.insertBefore(wrapper, pre);
          wrapper.appendChild(langLabel);
          wrapper.appendChild(pre);
        }
      }
    });
    
    // 处理独立的 pre 元素
    const preTags = container.querySelectorAll('pre:not(.code-block)');
    preTags.forEach(pre => {
      pre.classList.add('code-block');
    });
    
    // 处理行内代码
    const inlineCodes = container.querySelectorAll('code:not(pre code)');
    inlineCodes.forEach(code => {
      code.classList.add('inline-code');
    });
  },
  
  /**
   * 渲染图片
   * @param {string} src - 图片路径
   * @param {string} alt - 替代文本
   * @param {string} caption - 图片说明（可选）
   * @returns {HTMLElement} 图片容器元素
   * Requirements: 4.3
   */
  renderImage: function(src, alt, caption) {
    const figure = document.createElement('figure');
    figure.className = 'chapter-figure';
    
    const img = document.createElement('img');
    img.src = src;
    img.alt = alt || '';
    img.className = 'chapter-image';
    img.loading = 'lazy'; // 懒加载
    
    // 图片加载错误处理
    img.onerror = function() {
      this.classList.add('image-error');
      this.alt = '图片加载失败';
    };
    
    figure.appendChild(img);
    
    // 图片说明
    if (caption) {
      const figcaption = document.createElement('figcaption');
      figcaption.className = 'chapter-figcaption';
      figcaption.textContent = caption;
      figure.appendChild(figcaption);
    }
    
    return figure;
  },
  
  /**
   * 处理内容中的图片，添加样式和懒加载
   * @param {HTMLElement} container - 包含图片的容器
   * Requirements: 4.3
   */
  processImages: function(container) {
    const images = container.querySelectorAll('img');
    images.forEach(img => {
      // 添加样式类
      if (!img.classList.contains('chapter-image')) {
        img.classList.add('chapter-image');
      }
      
      // 添加懒加载
      if (!img.loading) {
        img.loading = 'lazy';
      }
      
      // 如果图片不在 figure 中，包装它
      if (img.parentElement.tagName !== 'FIGURE') {
        const figure = document.createElement('figure');
        figure.className = 'chapter-figure';
        
        // 检查是否有 title 属性作为说明
        const caption = img.getAttribute('title') || img.getAttribute('data-caption');
        
        img.parentNode.insertBefore(figure, img);
        figure.appendChild(img);
        
        if (caption) {
          const figcaption = document.createElement('figcaption');
          figcaption.className = 'chapter-figcaption';
          figcaption.textContent = caption;
          figure.appendChild(figcaption);
        }
      }
      
      // 错误处理
      img.onerror = function() {
        this.classList.add('image-error');
        if (!this.alt) {
          this.alt = '图片加载失败';
        }
      };
    });
  },
  
  /**
   * 渲染段落内容
   * @param {string} text - 段落文本
   * @returns {HTMLElement} 段落元素
   */
  renderParagraph: function(text) {
    const p = document.createElement('p');
    p.className = 'chapter-paragraph';
    p.innerHTML = text;
    return p;
  },
  
  /**
   * 渲染小节标题
   * @param {string} text - 标题文本
   * @param {number} level - 标题级别 (2-6)
   * @returns {HTMLElement} 标题元素
   * Requirements: 4.4
   */
  renderSectionTitle: function(text, level) {
    const validLevel = Math.max(2, Math.min(6, level || 2));
    const heading = document.createElement(`h${validLevel}`);
    heading.className = `chapter-section-title chapter-h${validLevel}`;
    heading.textContent = text;
    return heading;
  },
  
  /**
   * 渲染提示框/注释框
   * @param {string} content - 提示内容
   * @param {string} type - 类型 ('tip' | 'note' | 'warning' | 'example')
   * @returns {HTMLElement} 提示框元素
   */
  renderNote: function(content, type) {
    const note = document.createElement('div');
    note.className = `chapter-note chapter-note-${type || 'tip'}`;
    
    const typeLabels = {
      tip: '💡 提示',
      note: '📝 注释',
      warning: '⚠️ 注意',
      example: '📌 示例'
    };
    
    const label = document.createElement('span');
    label.className = 'note-label';
    label.textContent = typeLabels[type] || typeLabels.tip;
    
    const text = document.createElement('div');
    text.className = 'note-content';
    text.innerHTML = content;
    
    note.appendChild(label);
    note.appendChild(text);
    
    return note;
  },
  
  /**
   * 渲染列表
   * @param {Array} items - 列表项数组
   * @param {boolean} ordered - 是否为有序列表
   * @returns {HTMLElement} 列表元素
   */
  renderList: function(items, ordered) {
    const list = document.createElement(ordered ? 'ol' : 'ul');
    list.className = 'chapter-list';
    
    items.forEach(item => {
      const li = document.createElement('li');
      li.className = 'chapter-list-item';
      li.innerHTML = item;
      list.appendChild(li);
    });
    
    return list;
  },
  
  /**
   * 渲染引用块
   * @param {string} text - 引用文本
   * @param {string} source - 来源（可选）
   * @returns {HTMLElement} 引用块元素
   */
  renderBlockquote: function(text, source) {
    const blockquote = document.createElement('blockquote');
    blockquote.className = 'chapter-blockquote';
    
    const quoteText = document.createElement('p');
    quoteText.className = 'blockquote-text';
    quoteText.innerHTML = text;
    blockquote.appendChild(quoteText);
    
    if (source) {
      const cite = document.createElement('cite');
      cite.className = 'blockquote-source';
      cite.textContent = `— ${source}`;
      blockquote.appendChild(cite);
    }
    
    return blockquote;
  },
  
  /**
   * 计算页面可用高度
   * @param {HTMLElement} containerElement - 页面容器元素
   * @returns {number} 可用高度（像素）
   * Requirements: 4.5
   */
  calculateAvailableHeight: function(containerElement) {
    if (!containerElement) {
      // 默认高度（基于 CSS 变量 --book-height: 600px 减去内边距和页脚）
      return 480;
    }
    
    // 获取容器的计算样式
    const computedStyle = window.getComputedStyle(containerElement);
    const containerHeight = containerElement.clientHeight;
    
    // 获取内边距
    const paddingTop = parseFloat(computedStyle.paddingTop) || 0;
    const paddingBottom = parseFloat(computedStyle.paddingBottom) || 0;
    
    // 预留页脚空间（页码显示区域，约 40px）
    const footerHeight = 40;
    
    // 计算可用高度
    const availableHeight = containerHeight - paddingTop - paddingBottom - footerHeight;
    
    // 确保返回合理的最小高度
    return Math.max(availableHeight, 200);
  },
  
  /**
   * 内容自动分页算法
   * 将内容分割成多个页面，确保每页不超过指定高度
   * @param {string|HTMLElement} content - 要分页的内容（HTML字符串或DOM元素）
   * @param {number} pageHeight - 每页可用高度（像素）
   * @returns {Array<string>} 分页后的内容数组，每个元素是一页的HTML内容
   * Requirements: 4.5
   * Property 5: 内容分页正确性 - 分页后每页内容高度不应超过显示区域高度，且所有内容应被完整保留
   */
  paginate: function(content, pageHeight) {
    // 参数验证
    if (!content) {
      return [''];
    }
    
    if (!pageHeight || pageHeight <= 0) {
      pageHeight = 480; // 默认高度
    }
    
    // 创建临时测量容器
    const measureContainer = document.createElement('div');
    measureContainer.className = 'chapter-container pagination-measure';
    measureContainer.style.cssText = `
      position: absolute;
      visibility: hidden;
      width: 100%;
      max-width: 400px;
      padding: 0;
      margin: 0;
      left: -9999px;
      top: 0;
    `;
    
    // 将内容放入测量容器
    if (typeof content === 'string') {
      measureContainer.innerHTML = content;
    } else if (content instanceof HTMLElement) {
      measureContainer.innerHTML = content.innerHTML;
    } else {
      return [''];
    }
    
    document.body.appendChild(measureContainer);
    
    // 获取所有顶级子元素
    const children = Array.from(measureContainer.children);
    
    // 如果没有子元素，直接返回原内容
    if (children.length === 0) {
      document.body.removeChild(measureContainer);
      return [typeof content === 'string' ? content : content.innerHTML];
    }
    
    const pages = [];
    let currentPageContent = [];
    let currentPageHeight = 0;
    
    // 遍历每个子元素
    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      const childHeight = child.offsetHeight;
      const childMargin = this.getElementMargin(child);
      const totalChildHeight = childHeight + childMargin;
      
      // 检查是否需要开始新页
      if (currentPageHeight + totalChildHeight > pageHeight && currentPageContent.length > 0) {
        // 保存当前页
        pages.push(currentPageContent.join(''));
        currentPageContent = [];
        currentPageHeight = 0;
      }
      
      // 处理超大元素（单个元素超过页面高度）
      if (totalChildHeight > pageHeight && currentPageContent.length === 0) {
        // 尝试分割大元素
        const splitContent = this.splitLargeElement(child, pageHeight);
        if (splitContent.length > 1) {
          // 成功分割，添加分割后的内容
          for (let j = 0; j < splitContent.length; j++) {
            if (j === splitContent.length - 1) {
              // 最后一部分可能可以和后续内容合并
              currentPageContent.push(splitContent[j]);
              currentPageHeight = this.measureContentHeight(splitContent[j], measureContainer);
            } else {
              pages.push(splitContent[j]);
            }
          }
        } else {
          // 无法分割，强制放入当前页
          currentPageContent.push(child.outerHTML);
          currentPageHeight = totalChildHeight;
        }
      } else {
        // 正常添加元素到当前页
        currentPageContent.push(child.outerHTML);
        currentPageHeight += totalChildHeight;
      }
    }
    
    // 保存最后一页
    if (currentPageContent.length > 0) {
      pages.push(currentPageContent.join(''));
    }
    
    // 清理测量容器
    document.body.removeChild(measureContainer);
    
    // 确保至少返回一页
    if (pages.length === 0) {
      return [typeof content === 'string' ? content : content.innerHTML];
    }
    
    return pages;
  },
  
  /**
   * 获取元素的外边距
   * @param {HTMLElement} element - DOM元素
   * @returns {number} 上下外边距之和
   */
  getElementMargin: function(element) {
    const style = window.getComputedStyle(element);
    const marginTop = parseFloat(style.marginTop) || 0;
    const marginBottom = parseFloat(style.marginBottom) || 0;
    return marginTop + marginBottom;
  },
  
  /**
   * 测量内容高度
   * @param {string} htmlContent - HTML内容字符串
   * @param {HTMLElement} measureContainer - 测量容器
   * @returns {number} 内容高度
   */
  measureContentHeight: function(htmlContent, measureContainer) {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;
    measureContainer.innerHTML = '';
    measureContainer.appendChild(tempDiv);
    return tempDiv.offsetHeight;
  },
  
  /**
   * 分割超大元素
   * @param {HTMLElement} element - 要分割的元素
   * @param {number} pageHeight - 页面高度
   * @returns {Array<string>} 分割后的HTML内容数组
   */
  splitLargeElement: function(element, pageHeight) {
    const tagName = element.tagName.toLowerCase();
    
    // 对于段落和div，尝试按文本分割
    if (tagName === 'p' || tagName === 'div') {
      return this.splitTextElement(element, pageHeight);
    }
    
    // 对于列表，按列表项分割
    if (tagName === 'ul' || tagName === 'ol') {
      return this.splitListElement(element, pageHeight);
    }
    
    // 对于代码块，保持完整（不分割）
    if (tagName === 'pre' || element.classList.contains('code-block-container')) {
      return [element.outerHTML];
    }
    
    // 其他元素尝试按子元素分割
    if (element.children.length > 0) {
      return this.splitByChildren(element, pageHeight);
    }
    
    // 无法分割，返回原元素
    return [element.outerHTML];
  },
  
  /**
   * 按文本分割元素
   * @param {HTMLElement} element - 要分割的元素
   * @param {number} pageHeight - 页面高度
   * @returns {Array<string>} 分割后的HTML内容数组
   */
  splitTextElement: function(element, pageHeight) {
    const text = element.innerHTML;
    const className = element.className;
    const tagName = element.tagName.toLowerCase();
    
    // 按句子分割（中文句号、问号、感叹号）
    const sentences = text.split(/(?<=[。！？.!?])/);
    
    if (sentences.length <= 1) {
      return [element.outerHTML];
    }
    
    const parts = [];
    let currentPart = '';
    
    // 创建测量元素
    const measureEl = document.createElement(tagName);
    measureEl.className = className;
    measureEl.style.cssText = `
      position: absolute;
      visibility: hidden;
      width: 100%;
      max-width: 400px;
      left: -9999px;
    `;
    document.body.appendChild(measureEl);
    
    for (const sentence of sentences) {
      measureEl.innerHTML = currentPart + sentence;
      
      if (measureEl.offsetHeight > pageHeight && currentPart) {
        // 当前部分已满，保存并开始新部分
        const partEl = document.createElement(tagName);
        partEl.className = className;
        partEl.innerHTML = currentPart;
        parts.push(partEl.outerHTML);
        currentPart = sentence;
      } else {
        currentPart += sentence;
      }
    }
    
    // 保存最后一部分
    if (currentPart) {
      const partEl = document.createElement(tagName);
      partEl.className = className;
      partEl.innerHTML = currentPart;
      parts.push(partEl.outerHTML);
    }
    
    document.body.removeChild(measureEl);
    
    return parts.length > 0 ? parts : [element.outerHTML];
  },
  
  /**
   * 按列表项分割列表
   * @param {HTMLElement} element - 列表元素
   * @param {number} pageHeight - 页面高度
   * @returns {Array<string>} 分割后的HTML内容数组
   */
  splitListElement: function(element, pageHeight) {
    const items = Array.from(element.children);
    const tagName = element.tagName.toLowerCase();
    const className = element.className;
    
    if (items.length <= 1) {
      return [element.outerHTML];
    }
    
    const parts = [];
    let currentItems = [];
    let currentHeight = 0;
    
    // 创建测量元素
    const measureEl = document.createElement(tagName);
    measureEl.className = className;
    measureEl.style.cssText = `
      position: absolute;
      visibility: hidden;
      width: 100%;
      max-width: 400px;
      left: -9999px;
    `;
    document.body.appendChild(measureEl);
    
    for (const item of items) {
      measureEl.innerHTML = '';
      measureEl.appendChild(item.cloneNode(true));
      const itemHeight = measureEl.offsetHeight;
      
      if (currentHeight + itemHeight > pageHeight && currentItems.length > 0) {
        // 保存当前部分
        const partEl = document.createElement(tagName);
        partEl.className = className;
        currentItems.forEach(i => partEl.appendChild(i.cloneNode(true)));
        parts.push(partEl.outerHTML);
        currentItems = [];
        currentHeight = 0;
      }
      
      currentItems.push(item);
      currentHeight += itemHeight;
    }
    
    // 保存最后一部分
    if (currentItems.length > 0) {
      const partEl = document.createElement(tagName);
      partEl.className = className;
      currentItems.forEach(i => partEl.appendChild(i.cloneNode(true)));
      parts.push(partEl.outerHTML);
    }
    
    document.body.removeChild(measureEl);
    
    return parts.length > 0 ? parts : [element.outerHTML];
  },
  
  /**
   * 按子元素分割
   * @param {HTMLElement} element - 要分割的元素
   * @param {number} pageHeight - 页面高度
   * @returns {Array<string>} 分割后的HTML内容数组
   */
  splitByChildren: function(element, pageHeight) {
    const children = Array.from(element.children);
    const tagName = element.tagName.toLowerCase();
    const className = element.className;
    
    if (children.length <= 1) {
      return [element.outerHTML];
    }
    
    const parts = [];
    let currentChildren = [];
    let currentHeight = 0;
    
    for (const child of children) {
      const childHeight = child.offsetHeight + this.getElementMargin(child);
      
      if (currentHeight + childHeight > pageHeight && currentChildren.length > 0) {
        // 保存当前部分
        const partEl = document.createElement(tagName);
        partEl.className = className;
        currentChildren.forEach(c => partEl.appendChild(c.cloneNode(true)));
        parts.push(partEl.outerHTML);
        currentChildren = [];
        currentHeight = 0;
      }
      
      currentChildren.push(child);
      currentHeight += childHeight;
    }
    
    // 保存最后一部分
    if (currentChildren.length > 0) {
      const partEl = document.createElement(tagName);
      partEl.className = className;
      currentChildren.forEach(c => partEl.appendChild(c.cloneNode(true)));
      parts.push(partEl.outerHTML);
    }
    
    return parts.length > 0 ? parts : [element.outerHTML];
  },
  
  /**
   * 渲染分页内容到指定页面
   * @param {number} pageIndex - 页面索引（从0开始）
   * @param {HTMLElement} containerElement - 目标容器元素
   * Requirements: 4.5, 4.6
   */
  renderPage: function(pageIndex, containerElement) {
    if (!containerElement || !AppState.paginatedContent) {
      return;
    }
    
    const pages = AppState.paginatedContent;
    if (pageIndex < 0 || pageIndex >= pages.length) {
      return;
    }
    
    // 渲染页面内容
    containerElement.innerHTML = pages[pageIndex];
    
    // 处理代码块和图片
    this.processCodeBlocks(containerElement);
    this.processImages(containerElement);
  },
  
  /**
   * 更新页码显示
   * @param {number} currentPage - 当前页码（从1开始）
   * @param {number} totalPages - 总页数
   * Requirements: 4.6
   */
  updatePageDisplay: function(currentPage, totalPages) {
    // 更新应用状态
    AppState.currentPage = currentPage;
    AppState.totalPages = totalPages;
    
    // 更新页码显示元素
    const pageNumbers = document.querySelectorAll('.page-number');
    const viewMode = typeof BookUI !== 'undefined' ? BookUI.viewMode : 'double';
    
    pageNumbers.forEach((el, index) => {
      if (viewMode === 'double') {
        // 双页视图：左页显示偶数页，右页显示奇数页
        const pageNum = (currentPage - 1) * 2 + index + 1;
        if (pageNum <= totalPages * 2) {
          el.textContent = pageNum;
        } else {
          el.textContent = '';
        }
      } else {
        // 单页视图
        el.textContent = `${currentPage} / ${totalPages}`;
      }
    });
    
    // 同步更新 BookUI 状态
    if (typeof BookUI !== 'undefined') {
      BookUI.currentPage = currentPage;
      BookUI.totalPages = totalPages;
      BookUI.updateNavigationState();
    }
  },
  
  /**
   * 执行完整的分页渲染流程
   * @param {Object} chapterData - 章节数据
   * @param {HTMLElement} containerElement - 目标容器元素
   * Requirements: 4.5, 4.6
   */
  renderWithPagination: function(chapterData, containerElement) {
    if (!chapterData || !containerElement) {
      return;
    }
    
    // 先渲染完整内容以获取HTML
    this.render(chapterData, containerElement);
    
    // 计算可用高度
    const pageHeight = this.calculateAvailableHeight(containerElement);
    
    // 获取渲染后的内容
    const renderedContent = containerElement.innerHTML;
    
    // 执行分页
    const pages = this.paginate(renderedContent, pageHeight);
    
    // 保存分页结果
    AppState.paginatedContent = pages;
    AppState.currentPage = 1;
    AppState.totalPages = pages.length;
    
    // 渲染第一页
    this.renderPage(0, containerElement);
    
    // 更新页码显示
    this.updatePageDisplay(1, pages.length);
  },
  
  /**
   * 跳转到指定页
   * @param {number} pageNumber - 目标页码（从1开始）
   * @param {HTMLElement} containerElement - 目标容器元素
   * Requirements: 4.5, 4.6
   */
  goToPage: function(pageNumber, containerElement) {
    const pages = AppState.paginatedContent;
    if (!pages || pages.length === 0) {
      return;
    }
    
    // 边界检查
    const targetPage = Math.max(1, Math.min(pageNumber, pages.length));
    
    // 渲染目标页
    if (containerElement) {
      this.renderPage(targetPage - 1, containerElement);
    }
    
    // 更新页码显示
    this.updatePageDisplay(targetPage, pages.length);
  },
  
  /**
   * 下一页
   * @param {HTMLElement} containerElement - 目标容器元素
   * @returns {boolean} 是否成功翻页
   * Requirements: 4.5
   */
  nextPage: function(containerElement) {
    if (AppState.currentPage >= AppState.totalPages) {
      return false;
    }
    this.goToPage(AppState.currentPage + 1, containerElement);
    return true;
  },
  
  /**
   * 上一页
   * @param {HTMLElement} containerElement - 目标容器元素
   * @returns {boolean} 是否成功翻页
   * Requirements: 4.5
   */
  prevPage: function(containerElement) {
    if (AppState.currentPage <= 1) {
      return false;
    }
    this.goToPage(AppState.currentPage - 1, containerElement);
    return true;
  }
};

// DOM 元素缓存
const Elements = {
  loading: null,
  app: null,
  book: null,
  cover: null,
  toc: null,
  content: null,
  navigation: null,
  enterBtn: null,
  tocCloseBtn: null,
  continueReadingModal: null
};

/**
 * 初始化应用
 */
function initApp() {
  // 缓存 DOM 元素
  cacheElements();
  
  // 绑定事件
  bindEvents();
  
  // 隐藏加载动画
  hideLoading();
  
  // 标记应用已加载
  AppState.isLoaded = true;
  
  // 检查是否有保存的阅读进度，显示继续阅读提示
  checkAndShowContinueReading();
  
  console.log('图形学教程应用已初始化');
}

/**
 * 缓存 DOM 元素
 */
function cacheElements() {
  Elements.loading = document.getElementById('loading');
  Elements.app = document.getElementById('app');
  Elements.book = document.getElementById('book');
  Elements.cover = document.getElementById('cover');
  Elements.toc = document.getElementById('toc');
  Elements.content = document.getElementById('content');
  Elements.navigation = document.getElementById('navigation');
  Elements.enterBtn = document.getElementById('enter-btn');
  Elements.tocCloseBtn = document.getElementById('toc-close-btn');
  Elements.continueReadingModal = document.getElementById('continue-reading');
}

/**
 * 绑定事件监听器
 */
function bindEvents() {
  // 封面进入按钮点击事件
  if (Elements.enterBtn) {
    Elements.enterBtn.addEventListener('click', handleEnterClick);
  }
  
  // 目录关闭按钮点击事件
  if (Elements.tocCloseBtn) {
    Elements.tocCloseBtn.addEventListener('click', handleTocCloseClick);
  }
  
  // 继续阅读弹窗按钮事件
  bindContinueReadingEvents();
}

/**
 * 绑定继续阅读弹窗事件
 * Requirements: 7.2, 7.3
 */
function bindContinueReadingEvents() {
  const continueYesBtn = document.getElementById('continue-yes');
  const continueNoBtn = document.getElementById('continue-no');
  
  if (continueYesBtn) {
    continueYesBtn.addEventListener('click', handleContinueReading);
  }
  
  if (continueNoBtn) {
    continueNoBtn.addEventListener('click', handleStartFromBeginning);
  }
}

/**
 * 处理封面"开始阅读"按钮点击
 */
function handleEnterClick() {
  if (AppState.isAnimating) return;
  
  // 切换到目录视图
  showTableOfContents();
}

/**
 * 处理目录"返回封面"按钮点击
 */
function handleTocCloseClick() {
  if (AppState.isAnimating) return;
  
  // 切换回封面视图
  showCover();
}

/**
 * 检查是否有保存的阅读进度，并显示继续阅读提示
 * Requirements: 7.2, 7.3
 */
function checkAndShowContinueReading() {
  // 检查 StorageManager 是否可用
  if (typeof StorageManager === 'undefined') {
    console.warn('StorageManager 未定义，无法检查阅读进度');
    return;
  }
  
  // 检查是否有保存的阅读进度
  if (!StorageManager.hasProgress()) {
    return;
  }
  
  // 获取阅读进度
  const progress = StorageManager.getProgress();
  if (!progress || !progress.chapter) {
    return;
  }
  
  // 获取章节信息
  const chapter = getChapterInfo(progress.chapter);
  if (!chapter) {
    return;
  }
  
  // 更新弹窗中的章节信息
  updateContinueReadingModal(chapter, progress.page);
  
  // 显示继续阅读弹窗
  showContinueReadingModal();
}

/**
 * 获取章节信息
 * @param {number} chapterNumber - 章节编号
 * @returns {Object|null} 章节信息对象
 */
function getChapterInfo(chapterNumber) {
  // 优先使用 NavigationSystem
  if (typeof NavigationSystem !== 'undefined' && NavigationSystem.getChapterByNumber) {
    return NavigationSystem.getChapterByNumber(chapterNumber);
  }
  
  // 备用：直接从 CHAPTERS_DATA 获取
  if (typeof CHAPTERS_DATA !== 'undefined') {
    return CHAPTERS_DATA.find(ch => ch.number === chapterNumber) || null;
  }
  
  return null;
}

/**
 * 更新继续阅读弹窗中的章节信息
 * @param {Object} chapter - 章节信息对象
 * @param {number} pageNumber - 页码
 * Requirements: 7.2
 */
function updateContinueReadingModal(chapter, pageNumber) {
  const modalChapter = document.querySelector('.continue-reading-modal .modal-chapter');
  if (modalChapter) {
    let text = `第${chapter.number}章：${chapter.title}`;
    if (pageNumber && pageNumber > 1) {
      text += ` (第${pageNumber}页)`;
    }
    modalChapter.textContent = text;
  }
}

/**
 * 显示继续阅读弹窗
 * Requirements: 7.2
 */
function showContinueReadingModal() {
  if (Elements.continueReadingModal) {
    Elements.continueReadingModal.classList.remove('hidden');
  }
}

/**
 * 隐藏继续阅读弹窗
 */
function hideContinueReadingModal() {
  if (Elements.continueReadingModal) {
    Elements.continueReadingModal.classList.add('hidden');
  }
}

/**
 * 处理"继续阅读"按钮点击
 * 跳转到上次阅读的位置
 * Requirements: 7.3
 */
function handleContinueReading() {
  // 隐藏弹窗
  hideContinueReadingModal();
  
  // 获取保存的阅读进度
  if (typeof StorageManager === 'undefined') {
    return;
  }
  
  const progress = StorageManager.getProgress();
  if (!progress || !progress.chapter) {
    // 如果没有进度，显示目录
    showTableOfContents();
    return;
  }
  
  // 跳转到保存的章节
  if (typeof NavigationSystem !== 'undefined' && NavigationSystem.goToChapter) {
    NavigationSystem.goToChapter(progress.chapter);
    
    // 如果有保存的页码，跳转到对应页
    if (progress.page && progress.page > 1) {
      // 延迟执行，等待章节内容加载完成
      setTimeout(() => {
        if (typeof PageRenderer !== 'undefined' && PageRenderer.goToPage) {
          const contentContainer = document.querySelector('.page-content');
          PageRenderer.goToPage(progress.page, contentContainer);
        }
      }, 100);
    }
  } else {
    // 备用方案：显示目录
    showTableOfContents();
  }
}

/**
 * 处理"从头开始"按钮点击
 * 关闭弹窗，显示封面
 * Requirements: 7.2
 */
function handleStartFromBeginning() {
  // 隐藏弹窗
  hideContinueReadingModal();
  
  // 保持在封面页面，用户可以自行选择开始阅读
  // 不清除阅读进度，以便用户下次还可以选择继续
}

/**
 * 显示封面
 */
function showCover() {
  AppState.currentView = 'cover';
  
  // 显示封面，隐藏其他视图
  if (Elements.cover) {
    Elements.cover.classList.remove('hidden');
  }
  if (Elements.toc) {
    Elements.toc.classList.add('hidden');
  }
  if (Elements.content) {
    Elements.content.classList.add('hidden');
  }
  if (Elements.navigation) {
    Elements.navigation.classList.add('hidden');
  }
}

/**
 * 显示目录
 */
function showTableOfContents() {
  AppState.currentView = 'toc';
  
  // 隐藏封面，显示目录
  if (Elements.cover) {
    Elements.cover.classList.add('hidden');
  }
  if (Elements.toc) {
    Elements.toc.classList.remove('hidden');
    // 渲染目录内容（如果尚未渲染）
    renderTableOfContents();
  }
  if (Elements.content) {
    Elements.content.classList.add('hidden');
  }
  if (Elements.navigation) {
    Elements.navigation.classList.add('hidden');
  }
}

/**
 * 渲染目录内容
 */
function renderTableOfContents() {
  const tocContent = document.querySelector('.toc-content');
  if (!tocContent || tocContent.children.length > 0) {
    // 目录已渲染，只需更新已读状态
    updateTocReadMarkers();
    return;
  }
  
  // 检查是否有 CHAPTERS_DATA（由 navigation.js 提供）
  if (typeof CHAPTERS_DATA === 'undefined') {
    console.warn('CHAPTERS_DATA 未定义，目录无法渲染');
    return;
  }
  
  // 按分类组织章节
  const sections = {};
  CHAPTERS_DATA.forEach(chapter => {
    if (!sections[chapter.section]) {
      sections[chapter.section] = [];
    }
    sections[chapter.section].push(chapter);
  });
  
  // 定义分类顺序
  const sectionOrder = [
    '基础概念篇',
    '效果原理篇',
    '进阶概念篇',
    '数学篇',
    '哲学彩蛋篇'
  ];
  
  // 渲染各分类
  sectionOrder.forEach(sectionName => {
    const chapters = sections[sectionName];
    if (!chapters) return;
    
    const sectionEl = document.createElement('div');
    sectionEl.className = 'toc-section';
    
    const titleEl = document.createElement('h3');
    titleEl.className = 'toc-section-title';
    titleEl.textContent = sectionName;
    sectionEl.appendChild(titleEl);
    
    const listEl = document.createElement('ul');
    listEl.className = 'toc-chapter-list';
    
    chapters.forEach(chapter => {
      const itemEl = document.createElement('li');
      itemEl.className = 'toc-chapter-item';
      
      const linkEl = document.createElement('a');
      linkEl.className = 'toc-chapter-link';
      linkEl.href = '#';
      linkEl.dataset.chapter = chapter.number;
      
      // 检查是否已读
      if (typeof StorageManager !== 'undefined') {
        const readChapters = StorageManager.getReadChapters();
        if (readChapters.includes(chapter.number)) {
          linkEl.classList.add('is-read');
        }
      }
      
      linkEl.innerHTML = `
        <span class="toc-chapter-number">第${chapter.number}章</span>
        <span class="toc-chapter-title">${chapter.title}</span>
        ${chapter.subtitle ? `<span class="toc-chapter-subtitle">${chapter.subtitle}</span>` : ''}
      `;
      
      // 点击章节跳转
      linkEl.addEventListener('click', (e) => {
        e.preventDefault();
        if (typeof NavigationSystem !== 'undefined') {
          NavigationSystem.goToChapter(chapter.number);
        }
      });
      
      itemEl.appendChild(linkEl);
      listEl.appendChild(itemEl);
    });
    
    sectionEl.appendChild(listEl);
    tocContent.appendChild(sectionEl);
  });
}

/**
 * 更新目录中的已读标记
 * 在目录已渲染后，根据最新的已读状态更新视觉反馈
 * Requirements: 7.4
 */
function updateTocReadMarkers() {
  // 检查 StorageManager 是否可用
  if (typeof StorageManager === 'undefined') {
    return;
  }
  
  // 获取已读章节列表
  const readChapters = StorageManager.getReadChapters();
  
  // 获取所有目录章节链接
  const chapterLinks = document.querySelectorAll('.toc-chapter-link');
  
  chapterLinks.forEach(link => {
    const chapterNumber = parseInt(link.dataset.chapter, 10);
    
    if (readChapters.includes(chapterNumber)) {
      // 添加已读标记
      if (!link.classList.contains('is-read')) {
        link.classList.add('is-read');
      }
    } else {
      // 移除已读标记（以防状态被清除）
      link.classList.remove('is-read');
    }
  });
}

/**
 * 隐藏加载动画
 * 实现平滑的过渡效果从加载动画到内容
 * Requirements: 8.5
 */
function hideLoading() {
  if (Elements.loading) {
    // 先完成进度条动画
    const progressBar = Elements.loading.querySelector('.loading-progress-bar');
    if (progressBar) {
      progressBar.style.animation = 'none';
      progressBar.style.width = '100%';
    }
    
    // 短暂延迟后开始淡出，让用户看到进度完成
    setTimeout(() => {
      // 添加淡出动画类
      Elements.loading.classList.add('fade-out');
      
      // 动画结束后完全隐藏
      setTimeout(() => {
        Elements.loading.classList.add('hidden');
        // 触发内容显示动画
        if (Elements.app) {
          Elements.app.classList.add('content-ready');
        }
      }, 800); // 与CSS过渡时间匹配
    }, 300);
  }
}

/**
 * 显示加载动画
 * Requirements: 8.5
 */
function showLoading() {
  if (Elements.loading) {
    // 重置进度条
    const progressBar = Elements.loading.querySelector('.loading-progress-bar');
    if (progressBar) {
      progressBar.style.animation = '';
      progressBar.style.width = '';
    }
    
    // 移除隐藏和淡出类
    Elements.loading.classList.remove('hidden');
    Elements.loading.classList.remove('fade-out');
    
    // 移除内容就绪类
    if (Elements.app) {
      Elements.app.classList.remove('content-ready');
    }
  }
}

/**
 * 获取当前视图状态
 * @returns {string} 当前视图 ('cover' | 'toc' | 'chapter')
 */
function getCurrentView() {
  return AppState.currentView;
}

/**
 * 设置当前视图状态
 * @param {string} view - 视图名称
 */
function setCurrentView(view) {
  AppState.currentView = view;
}

// DOM 加载完成后初始化应用
document.addEventListener('DOMContentLoaded', initApp);

// 导出供其他模块使用
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    AppState,
    Elements,
    PageRenderer,
    initApp,
    showCover,
    showTableOfContents,
    updateTocReadMarkers,
    getCurrentView,
    setCurrentView,
    hideLoading,
    showLoading,
    checkAndShowContinueReading,
    showContinueReadingModal,
    hideContinueReadingModal,
    handleContinueReading,
    handleStartFromBeginning
  };
}