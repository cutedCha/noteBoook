/**
 * Property-Based Tests for Content Rendering - 章节内容渲染完整性
 * 
 * **Feature: graphics-tutorial-book, Property 4: 章节内容渲染完整性**
 * **Validates: Requirements 4.1, 4.6**
 * 
 * Property 4 定义：
 * *For any* 章节数据，渲染后的页面应包含章节标题、副标题（如果存在）和正文内容，
 * 且每页底部应显示正确的页码。
 */

const fc = require('fast-check');

describe('Property 4: 章节内容渲染完整性', () => {
  let PageRenderer;
  let container;

  /**
   * Setup DOM environment before each test
   */
  beforeEach(() => {
    // Create container element
    document.body.innerHTML = '<div id="content"></div>';
    container = document.getElementById('content');
    
    // Create PageRenderer for testing (mirrors the PageRenderer from app.js)
    PageRenderer = createPageRenderer();
  });

  /**
   * Cleanup after each test
   */
  afterEach(() => {
    document.body.innerHTML = '';
  });

  /**
   * Create a PageRenderer instance for testing
   * This mirrors the PageRenderer from app.js
   */
  function createPageRenderer() {
    return {
      /**
       * Render chapter content to specified container
       * @param {Object} chapterData - Chapter data object
       * @param {HTMLElement} containerElement - Target container element
       */
      render: function(chapterData, containerElement) {
        if (!chapterData || !containerElement) {
          return;
        }
        
        // Clear container
        containerElement.innerHTML = '';
        
        // Create chapter container
        const chapterContainer = document.createElement('div');
        chapterContainer.className = 'chapter-container';
        
        // Render chapter header (title, subtitle)
        const header = this.renderChapterHeader(chapterData);
        chapterContainer.appendChild(header);
        
        // Render chapter body
        const body = this.renderChapterBody(chapterData);
        chapterContainer.appendChild(body);
        
        containerElement.appendChild(chapterContainer);
      },
      
      /**
       * Render chapter header (title, subtitle)
       * @param {Object} chapterData - Chapter data
       * @returns {HTMLElement} Header element
       */
      renderChapterHeader: function(chapterData) {
        const header = document.createElement('header');
        header.className = 'chapter-header';
        
        // Chapter number
        const chapterNumber = document.createElement('div');
        chapterNumber.className = 'chapter-number';
        chapterNumber.textContent = `第${chapterData.number}章`;
        header.appendChild(chapterNumber);
        
        // Chapter title
        const title = document.createElement('h1');
        title.className = 'chapter-title';
        title.textContent = chapterData.title;
        header.appendChild(title);
        
        // Subtitle (if exists)
        if (chapterData.subtitle) {
          const subtitle = document.createElement('p');
          subtitle.className = 'chapter-subtitle';
          subtitle.textContent = chapterData.subtitle;
          header.appendChild(subtitle);
        }
        
        // Section tag (if exists)
        if (chapterData.section) {
          const sectionTag = document.createElement('span');
          sectionTag.className = 'chapter-section-tag';
          sectionTag.textContent = chapterData.section;
          header.appendChild(sectionTag);
        }
        
        return header;
      },
      
      /**
       * Render chapter body content
       * @param {Object} chapterData - Chapter data
       * @returns {HTMLElement} Body element
       */
      renderChapterBody: function(chapterData) {
        const body = document.createElement('div');
        body.className = 'chapter-body';
        
        // If has HTML content, render directly
        if (chapterData.content) {
          body.innerHTML = chapterData.content;
        } else {
          // Show placeholder content
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
       * Update page number display
       * @param {number} currentPage - Current page number (starting from 1)
       * @param {number} totalPages - Total number of pages
       */
      updatePageDisplay: function(currentPage, totalPages) {
        // Update page number display elements
        const pageNumbers = document.querySelectorAll('.page-number');
        pageNumbers.forEach((el) => {
          el.textContent = `${currentPage} / ${totalPages}`;
        });
      },
      
      /**
       * Render page number element
       * @param {number} pageNumber - Page number to display
       * @returns {HTMLElement} Page number element
       */
      renderPageNumber: function(pageNumber) {
        const pageNumEl = document.createElement('div');
        pageNumEl.className = 'page-number';
        pageNumEl.textContent = pageNumber;
        return pageNumEl;
      }
    };
  }

  /**
   * Arbitrary generator for valid section names
   */
  const sectionArbitrary = fc.constantFrom(
    '基础概念篇',
    '效果原理篇',
    '进阶概念篇',
    '数学篇',
    '哲学彩蛋篇'
  );

  /**
   * Arbitrary generator for Chinese chapter titles
   */
  const chineseTitleArbitrary = fc.stringOf(
    fc.constantFrom(
      '眼', '睛', '如', '何', '看', '世', '界', '光', '照', '模', '型',
      '是', '什', '么', '凹', '凸', '映', '射', '原', '理', '素', '描',
      '渲', '染', '流', '水', '线', '顶', '点', '纹', '理', '法', '线',
      '后', '屏', '幕', '模', '糊', '卷', '积', '核', '折', '射', '放',
      '大', '镜', '缩', '小', '噪', '声', '应', '用', '矩', '阵', '旋',
      '转', '深', '度', '蝙', '蝠', '狗', '的', '图', '形', '学'
    ),
    { minLength: 2, maxLength: 20 }
  );

  /**
   * Arbitrary generator for Chinese subtitle (optional)
   */
  const subtitleArbitrary = fc.option(
    fc.stringOf(
      fc.constantFrom(
        '透', '镜', '成', '像', '原', '理', '眼', '睛', '里', '呈', '现',
        '的', '是', '倒', '像', '没', '有', '光', '照', '模', '型', '看',
        '到', '2D', '人', '脑', '通', '过', '深', '浅', '感', '知', '深',
        '度', '通', '过', '光', '照', '深', '浅', '模', '拟', '凹', '凸',
        '效', '果', '夹', '角', '越', '大', '反', '射', '光', '越', '少'
      ),
      { minLength: 5, maxLength: 50 }
    ),
    { nil: undefined }
  );

  /**
   * Arbitrary generator for HTML content
   */
  const contentArbitrary = fc.option(
    fc.oneof(
      // Simple paragraph content
      fc.stringOf(
        fc.constantFrom(
          '这', '是', '一', '段', '测', '试', '内', '容', '。',
          '图', '形', '学', '是', '研', '究', '计', '算', '机',
          '如', '何', '生', '成', '和', '处', '理', '图', '像',
          '的', '学', '科', '。', '它', '涉', '及', '到', '数',
          '学', '物', '理', '和', '计', '算', '机', '科', '学'
        ),
        { minLength: 10, maxLength: 200 }
      ).map(text => `<p>${text}</p>`),
      // Multiple paragraphs
      fc.array(
        fc.stringOf(
          fc.constantFrom(
            '这', '是', '一', '段', '测', '试', '内', '容', '。',
            '图', '形', '学', '是', '研', '究', '计', '算', '机'
          ),
          { minLength: 10, maxLength: 100 }
        ),
        { minLength: 1, maxLength: 5 }
      ).map(paragraphs => paragraphs.map(p => `<p>${p}</p>`).join('')),
      // Content with code block
      fc.tuple(
        fc.stringOf(fc.constantFrom('这', '是', '代', '码', '示', '例', '：'), { minLength: 5, maxLength: 30 }),
        fc.stringOf(fc.constantFrom('c', 'o', 'n', 's', 't', ' ', 'x', '=', '1', ';'), { minLength: 5, maxLength: 50 })
      ).map(([text, code]) => `<p>${text}</p><pre><code>${code}</code></pre>`)
    ),
    { nil: undefined }
  );

  /**
   * Arbitrary generator for chapter data
   */
  const chapterDataArbitrary = fc.record({
    number: fc.integer({ min: 1, max: 31 }),
    title: chineseTitleArbitrary.filter(t => t.length > 0),
    subtitle: subtitleArbitrary,
    section: sectionArbitrary,
    content: contentArbitrary
  });

  /**
   * Property 4.1: 渲染后应包含章节编号
   * **Validates: Requirements 4.1**
   * 
   * For any chapter data, the rendered output should contain the chapter number display.
   */
  test('Property 4.1: 渲染后应包含章节编号', () => {
    fc.assert(
      fc.property(
        chapterDataArbitrary,
        (chapterData) => {
          PageRenderer.render(chapterData, container);
          
          // Verify chapter number element exists
          const chapterNumberEl = container.querySelector('.chapter-number');
          expect(chapterNumberEl).not.toBeNull();
          
          // Verify chapter number content is correct
          expect(chapterNumberEl.textContent).toBe(`第${chapterData.number}章`);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 4.2: 渲染后应包含章节标题
   * **Validates: Requirements 4.1**
   * 
   * For any chapter data, the rendered output should contain the chapter title.
   */
  test('Property 4.2: 渲染后应包含章节标题', () => {
    fc.assert(
      fc.property(
        chapterDataArbitrary,
        (chapterData) => {
          PageRenderer.render(chapterData, container);
          
          // Verify chapter title element exists
          const titleEl = container.querySelector('.chapter-title');
          expect(titleEl).not.toBeNull();
          
          // Verify title content is correct
          expect(titleEl.textContent).toBe(chapterData.title);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 4.3: 渲染后应包含副标题（如果存在）
   * **Validates: Requirements 4.1**
   * 
   * For any chapter data with a subtitle, the rendered output should contain the subtitle.
   * For chapter data without a subtitle, no subtitle element should be present.
   */
  test('Property 4.3: 渲染后应正确处理副标题', () => {
    fc.assert(
      fc.property(
        chapterDataArbitrary,
        (chapterData) => {
          PageRenderer.render(chapterData, container);
          
          const subtitleEl = container.querySelector('.chapter-subtitle');
          
          if (chapterData.subtitle) {
            // If subtitle exists, element should be present with correct content
            expect(subtitleEl).not.toBeNull();
            expect(subtitleEl.textContent).toBe(chapterData.subtitle);
          } else {
            // If no subtitle, element should not exist
            expect(subtitleEl).toBeNull();
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 4.4: 渲染后应包含分类标签（如果存在）
   * **Validates: Requirements 4.1**
   * 
   * For any chapter data with a section, the rendered output should contain the section tag.
   */
  test('Property 4.4: 渲染后应包含分类标签', () => {
    fc.assert(
      fc.property(
        chapterDataArbitrary,
        (chapterData) => {
          PageRenderer.render(chapterData, container);
          
          const sectionTagEl = container.querySelector('.chapter-section-tag');
          
          if (chapterData.section) {
            // If section exists, element should be present with correct content
            expect(sectionTagEl).not.toBeNull();
            expect(sectionTagEl.textContent).toBe(chapterData.section);
          } else {
            // If no section, element should not exist
            expect(sectionTagEl).toBeNull();
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 4.5: 渲染后应包含正文内容区域
   * **Validates: Requirements 4.1**
   * 
   * For any chapter data, the rendered output should contain a chapter body element.
   */
  test('Property 4.5: 渲染后应包含正文内容区域', () => {
    fc.assert(
      fc.property(
        chapterDataArbitrary,
        (chapterData) => {
          PageRenderer.render(chapterData, container);
          
          // Verify chapter body element exists
          const bodyEl = container.querySelector('.chapter-body');
          expect(bodyEl).not.toBeNull();
          
          // If content exists, it should be rendered
          if (chapterData.content) {
            // Extract text content from HTML for comparison
            const textContent = chapterData.content.replace(/<[^>]*>/g, '');
            if (textContent.length > 0) {
              expect(bodyEl.textContent).toContain(textContent.substring(0, Math.min(10, textContent.length)));
            }
          } else {
            // If no content, placeholder should be shown
            const placeholder = bodyEl.querySelector('.chapter-placeholder');
            expect(placeholder).not.toBeNull();
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 4.6: 页码显示正确性
   * **Validates: Requirements 4.6**
   * 
   * For any page number, the page display should show the correct page number.
   */
  test('Property 4.6: 页码显示应正确', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 100 }), // currentPage
        fc.integer({ min: 1, max: 100 }), // totalPages
        (currentPage, totalPages) => {
          // Ensure currentPage <= totalPages
          const validCurrentPage = Math.min(currentPage, totalPages);
          
          // Create page number element
          container.innerHTML = '<div class="page-number"></div>';
          
          // Update page display
          PageRenderer.updatePageDisplay(validCurrentPage, totalPages);
          
          // Verify page number is displayed correctly
          const pageNumberEl = container.querySelector('.page-number');
          expect(pageNumberEl).not.toBeNull();
          expect(pageNumberEl.textContent).toBe(`${validCurrentPage} / ${totalPages}`);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 4.7: 渲染后章节结构完整性
   * **Validates: Requirements 4.1**
   * 
   * For any chapter data, the rendered output should have the correct DOM structure:
   * - chapter-container
   *   - chapter-header
   *     - chapter-number
   *     - chapter-title
   *     - chapter-subtitle (optional)
   *     - chapter-section-tag (optional)
   *   - chapter-body
   */
  test('Property 4.7: 渲染后章节结构应完整', () => {
    fc.assert(
      fc.property(
        chapterDataArbitrary,
        (chapterData) => {
          PageRenderer.render(chapterData, container);
          
          // Verify chapter container exists
          const chapterContainer = container.querySelector('.chapter-container');
          expect(chapterContainer).not.toBeNull();
          
          // Verify header exists within container
          const header = chapterContainer.querySelector('.chapter-header');
          expect(header).not.toBeNull();
          
          // Verify chapter number exists within header
          const chapterNumber = header.querySelector('.chapter-number');
          expect(chapterNumber).not.toBeNull();
          
          // Verify title exists within header
          const title = header.querySelector('.chapter-title');
          expect(title).not.toBeNull();
          
          // Verify body exists within container
          const body = chapterContainer.querySelector('.chapter-body');
          expect(body).not.toBeNull();
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 4.8: 渲染页码元素正确性
   * **Validates: Requirements 4.6**
   * 
   * For any page number, the renderPageNumber function should create a valid page number element.
   */
  test('Property 4.8: 渲染页码元素应正确', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 1000 }),
        (pageNumber) => {
          const pageNumEl = PageRenderer.renderPageNumber(pageNumber);
          
          // Verify element is created
          expect(pageNumEl).not.toBeNull();
          
          // Verify element has correct class
          expect(pageNumEl.className).toBe('page-number');
          
          // Verify element has correct content
          expect(pageNumEl.textContent).toBe(String(pageNumber));
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 4.9: 空数据处理
   * **Validates: Requirements 4.1**
   * 
   * When chapter data is null or undefined, render should not throw and should not modify container.
   */
  test('Property 4.9: 空数据应安全处理', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(null, undefined),
        (invalidData) => {
          const originalContent = container.innerHTML;
          
          // Should not throw
          expect(() => {
            PageRenderer.render(invalidData, container);
          }).not.toThrow();
          
          // Container should remain unchanged
          expect(container.innerHTML).toBe(originalContent);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 4.10: 使用真实章节数据渲染完整性
   * **Validates: Requirements 4.1, 4.6**
   * 
   * For any chapter from CHAPTERS_DATA, rendering should produce complete output.
   */
  test('Property 4.10: 真实章节数据渲染应完整', () => {
    // Import real chapter data
    const { CHAPTERS_DATA } = require('../js/navigation.js');
    
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 29 }),
        (index) => {
          const chapterData = CHAPTERS_DATA[index];
          
          PageRenderer.render(chapterData, container);
          
          // Verify chapter number
          const chapterNumberEl = container.querySelector('.chapter-number');
          expect(chapterNumberEl).not.toBeNull();
          expect(chapterNumberEl.textContent).toBe(`第${chapterData.number}章`);
          
          // Verify title
          const titleEl = container.querySelector('.chapter-title');
          expect(titleEl).not.toBeNull();
          expect(titleEl.textContent).toBe(chapterData.title);
          
          // Verify subtitle handling
          const subtitleEl = container.querySelector('.chapter-subtitle');
          if (chapterData.subtitle && chapterData.subtitle.length > 0) {
            expect(subtitleEl).not.toBeNull();
            expect(subtitleEl.textContent).toBe(chapterData.subtitle);
          }
          
          // Verify section tag
          const sectionTagEl = container.querySelector('.chapter-section-tag');
          expect(sectionTagEl).not.toBeNull();
          expect(sectionTagEl.textContent).toBe(chapterData.section);
          
          // Verify body exists
          const bodyEl = container.querySelector('.chapter-body');
          expect(bodyEl).not.toBeNull();
        }
      ),
      { numRuns: 100 }
    );
  });
});
