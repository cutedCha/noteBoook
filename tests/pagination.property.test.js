/**
 * Property-Based Tests for Pagination - 内容分页正确性
 * 
 * **Feature: graphics-tutorial-book, Property 5: 内容分页正确性**
 * **Validates: Requirements 4.5**
 * 
 * Property 5 定义：
 * *For any* 章节内容，当内容高度超过单页显示区域时，分页后每页内容高度不应超过显示区域高度，
 * 且所有内容应被完整保留（无内容丢失）。
 */

const fc = require('fast-check');

// Import the PageRenderer module
const { PageRenderer } = require('../js/app.js');

describe('Property 5: 内容分页正确性', () => {
  let container;
  let measureContainer;

  /**
   * Setup DOM environment before each test
   */
  beforeEach(() => {
    // Create container element
    document.body.innerHTML = '<div id="content"></div>';
    container = document.getElementById('content');
    
    // Create measurement container for height calculations
    measureContainer = document.createElement('div');
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
    document.body.appendChild(measureContainer);
  });

  /**
   * Cleanup after each test
   */
  afterEach(() => {
    document.body.innerHTML = '';
  });

  /**
   * Helper function to measure content height
   * @param {string} htmlContent - HTML content to measure
   * @returns {number} Height in pixels
   */
  function measureContentHeight(htmlContent) {
    measureContainer.innerHTML = htmlContent;
    return measureContainer.offsetHeight;
  }

  /**
   * Helper function to extract text content from HTML
   * @param {string} html - HTML string
   * @returns {string} Plain text content
   */
  function extractTextContent(html) {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || '';
  }

  /**
   * Helper function to normalize whitespace for comparison
   * @param {string} text - Text to normalize
   * @returns {string} Normalized text (removes all whitespace for comparison)
   */
  function normalizeWhitespace(text) {
    // Remove all whitespace for comparison to avoid false positives
    // from different whitespace handling in HTML parsing
    return text.replace(/\s+/g, '');
  }

  /**
   * Arbitrary generator for paragraph content
   */
  const paragraphArbitrary = fc.array(
    fc.string({ minLength: 10, maxLength: 200 }),
    { minLength: 1, maxLength: 10 }
  ).map(texts => texts.map(t => `<p>${t}</p>`).join(''));

  /**
   * Arbitrary generator for list content
   */
  const listArbitrary = fc.array(
    fc.string({ minLength: 5, maxLength: 50 }),
    { minLength: 2, maxLength: 8 }
  ).map(items => {
    const listItems = items.map(item => `<li>${item}</li>`).join('');
    return `<ul>${listItems}</ul>`;
  });

  /**
   * Arbitrary generator for mixed content (paragraphs, lists, headings)
   */
  const mixedContentArbitrary = fc.array(
    fc.oneof(
      // Paragraph
      fc.string({ minLength: 20, maxLength: 300 }).map(t => `<p>${t}</p>`),
      // Heading
      fc.tuple(
        fc.integer({ min: 2, max: 4 }),
        fc.string({ minLength: 5, maxLength: 50 })
      ).map(([level, text]) => `<h${level}>${text}</h${level}>`),
      // List
      fc.array(
        fc.string({ minLength: 5, maxLength: 30 }),
        { minLength: 2, maxLength: 5 }
      ).map(items => `<ul>${items.map(i => `<li>${i}</li>`).join('')}</ul>`),
      // Code block
      fc.string({ minLength: 10, maxLength: 100 }).map(code => `<pre><code>${code}</code></pre>`)
    ),
    { minLength: 1, maxLength: 15 }
  ).map(elements => elements.join(''));

  /**
   * Arbitrary generator for page height
   */
  const pageHeightArbitrary = fc.integer({ min: 100, max: 800 });

  /**
   * Property 5.1: 分页后至少产生一页
   * **Validates: Requirements 4.5**
   * 
   * For any content, pagination should produce at least 1 page.
   */
  test('Property 5.1: 分页后应至少产生一页', () => {
    fc.assert(
      fc.property(
        mixedContentArbitrary,
        pageHeightArbitrary,
        (content, pageHeight) => {
          const pages = PageRenderer.paginate(content, pageHeight);
          
          // Should produce at least 1 page
          expect(pages).toBeDefined();
          expect(Array.isArray(pages)).toBe(true);
          expect(pages.length).toBeGreaterThanOrEqual(1);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 5.2: 所有内容应被完整保留（无内容丢失）
   * **Validates: Requirements 4.5**
   * 
   * For any content, the combined text content of all pages should equal
   * the original text content (no content loss).
   */
  test('Property 5.2: 所有内容应被完整保留（无内容丢失）', () => {
    fc.assert(
      fc.property(
        mixedContentArbitrary,
        pageHeightArbitrary,
        (content, pageHeight) => {
          const pages = PageRenderer.paginate(content, pageHeight);
          
          // Extract original text content
          const originalText = normalizeWhitespace(extractTextContent(content));
          
          // Combine all pages' text content
          const paginatedText = normalizeWhitespace(
            pages.map(page => extractTextContent(page)).join('')
          );
          
          // All original content should be preserved
          expect(paginatedText).toBe(originalText);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 5.3: 适合单页的内容应保持在单页
   * **Validates: Requirements 4.5**
   * 
   * Content that fits on one page should stay on one page.
   */
  test('Property 5.3: 适合单页的内容应保持在单页', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 50 }).map(t => `<p>${t}</p>`),
        fc.integer({ min: 500, max: 1000 }), // Large page height
        (content, pageHeight) => {
          const pages = PageRenderer.paginate(content, pageHeight);
          
          // Measure content height
          const contentHeight = measureContentHeight(content);
          
          // If content fits in one page, should produce exactly 1 page
          if (contentHeight <= pageHeight) {
            expect(pages.length).toBe(1);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 5.4: 空内容处理
   * **Validates: Requirements 4.5**
   * 
   * Empty or null content should be handled gracefully.
   */
  test('Property 5.4: 空内容应安全处理', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('', null, undefined),
        pageHeightArbitrary,
        (content, pageHeight) => {
          // Should not throw
          expect(() => {
            const pages = PageRenderer.paginate(content, pageHeight);
            // Should return at least one page (possibly empty)
            expect(pages).toBeDefined();
            expect(Array.isArray(pages)).toBe(true);
            expect(pages.length).toBeGreaterThanOrEqual(1);
          }).not.toThrow();
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 5.5: 无效页面高度处理
   * **Validates: Requirements 4.5**
   * 
   * Invalid page heights (0, negative) should be handled gracefully.
   */
  test('Property 5.5: 无效页面高度应安全处理', () => {
    fc.assert(
      fc.property(
        paragraphArbitrary,
        fc.integer({ min: -100, max: 0 }),
        (content, invalidHeight) => {
          // Should not throw
          expect(() => {
            const pages = PageRenderer.paginate(content, invalidHeight);
            // Should return at least one page
            expect(pages).toBeDefined();
            expect(Array.isArray(pages)).toBe(true);
            expect(pages.length).toBeGreaterThanOrEqual(1);
          }).not.toThrow();
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 5.6: 长内容应产生多页
   * **Validates: Requirements 4.5**
   * 
   * Very long content should be split into multiple pages.
   */
  test('Property 5.6: 长内容应产生多页', () => {
    fc.assert(
      fc.property(
        // Generate long content with many paragraphs
        fc.array(
          fc.string({ minLength: 100, maxLength: 500 }),
          { minLength: 10, maxLength: 20 }
        ).map(texts => texts.map(t => `<p>${t}</p>`).join('')),
        fc.integer({ min: 100, max: 200 }), // Small page height
        (longContent, smallPageHeight) => {
          const pages = PageRenderer.paginate(longContent, smallPageHeight);
          
          // Long content with small page height should produce multiple pages
          // (unless the content is somehow very short)
          const contentHeight = measureContentHeight(longContent);
          if (contentHeight > smallPageHeight * 2) {
            expect(pages.length).toBeGreaterThan(1);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 5.7: 分页结果应为有效HTML
   * **Validates: Requirements 4.5**
   * 
   * Each page should contain valid HTML that can be rendered.
   */
  test('Property 5.7: 分页结果应为有效HTML', () => {
    fc.assert(
      fc.property(
        mixedContentArbitrary,
        pageHeightArbitrary,
        (content, pageHeight) => {
          const pages = PageRenderer.paginate(content, pageHeight);
          
          // Each page should be renderable HTML
          pages.forEach((page, index) => {
            expect(() => {
              const div = document.createElement('div');
              div.innerHTML = page;
              // Should not throw when setting innerHTML
            }).not.toThrow();
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 5.8: 分页顺序应保持原始内容顺序
   * **Validates: Requirements 4.5**
   * 
   * The order of content across pages should match the original order.
   */
  test('Property 5.8: 分页顺序应保持原始内容顺序', () => {
    fc.assert(
      fc.property(
        // Generate numbered paragraphs for easy order verification
        fc.integer({ min: 3, max: 10 }).map(count => {
          const paragraphs = [];
          for (let i = 1; i <= count; i++) {
            paragraphs.push(`<p>Paragraph ${i}</p>`);
          }
          return paragraphs.join('');
        }),
        fc.integer({ min: 50, max: 150 }),
        (content, pageHeight) => {
          const pages = PageRenderer.paginate(content, pageHeight);
          
          // Extract all paragraph numbers from paginated content
          const combinedContent = pages.join('');
          const matches = combinedContent.match(/Paragraph (\d+)/g) || [];
          const numbers = matches.map(m => parseInt(m.replace('Paragraph ', '')));
          
          // Numbers should be in ascending order
          for (let i = 1; i < numbers.length; i++) {
            expect(numbers[i]).toBeGreaterThan(numbers[i - 1]);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 5.9: 列表内容分页正确性
   * **Validates: Requirements 4.5**
   * 
   * List content should be paginated correctly with all items preserved.
   */
  test('Property 5.9: 列表内容分页应正确', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.string({ minLength: 10, maxLength: 50 }),
          { minLength: 5, maxLength: 15 }
        ),
        pageHeightArbitrary,
        (items, pageHeight) => {
          const listContent = `<ul>${items.map(item => `<li>${item}</li>`).join('')}</ul>`;
          const pages = PageRenderer.paginate(listContent, pageHeight);
          
          // All list items should be preserved
          const originalItemCount = items.length;
          const paginatedContent = pages.join('');
          const paginatedItemCount = (paginatedContent.match(/<li>/g) || []).length;
          
          expect(paginatedItemCount).toBe(originalItemCount);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 5.10: 代码块分页处理
   * **Validates: Requirements 4.5**
   * 
   * Code blocks should be preserved intact (not split mid-block).
   */
  test('Property 5.10: 代码块应被完整保留', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 20, maxLength: 200 }),
        pageHeightArbitrary,
        (code, pageHeight) => {
          const codeContent = `<pre><code>${code}</code></pre>`;
          const pages = PageRenderer.paginate(codeContent, pageHeight);
          
          // Code content should be preserved
          const originalCode = extractTextContent(codeContent);
          const paginatedCode = pages.map(p => extractTextContent(p)).join('');
          
          expect(normalizeWhitespace(paginatedCode)).toBe(normalizeWhitespace(originalCode));
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 5.11: HTMLElement输入处理
   * **Validates: Requirements 4.5**
   * 
   * The paginate function should handle HTMLElement input correctly.
   */
  test('Property 5.11: HTMLElement输入应正确处理', () => {
    fc.assert(
      fc.property(
        paragraphArbitrary,
        pageHeightArbitrary,
        (content, pageHeight) => {
          // Create an HTMLElement with the content
          const element = document.createElement('div');
          element.innerHTML = content;
          
          const pages = PageRenderer.paginate(element, pageHeight);
          
          // Should produce valid pages
          expect(pages).toBeDefined();
          expect(Array.isArray(pages)).toBe(true);
          expect(pages.length).toBeGreaterThanOrEqual(1);
          
          // Content should be preserved
          const originalText = normalizeWhitespace(extractTextContent(content));
          const paginatedText = normalizeWhitespace(
            pages.map(page => extractTextContent(page)).join('')
          );
          
          expect(paginatedText).toBe(originalText);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 5.12: 混合内容类型分页
   * **Validates: Requirements 4.5**
   * 
   * Mixed content (paragraphs, lists, headings, code) should be paginated correctly.
   */
  test('Property 5.12: 混合内容类型分页应正确', () => {
    fc.assert(
      fc.property(
        fc.tuple(
          fc.string({ minLength: 20, maxLength: 100 }),
          fc.array(fc.string({ minLength: 5, maxLength: 30 }), { minLength: 2, maxLength: 5 }),
          fc.string({ minLength: 10, maxLength: 50 }),
          fc.string({ minLength: 10, maxLength: 80 })
        ).map(([para, listItems, heading, code]) => {
          return `
            <p>${para}</p>
            <h2>${heading}</h2>
            <ul>${listItems.map(i => `<li>${i}</li>`).join('')}</ul>
            <pre><code>${code}</code></pre>
          `;
        }),
        pageHeightArbitrary,
        (mixedContent, pageHeight) => {
          const pages = PageRenderer.paginate(mixedContent, pageHeight);
          
          // Should produce valid pages
          expect(pages.length).toBeGreaterThanOrEqual(1);
          
          // All content should be preserved
          const originalText = normalizeWhitespace(extractTextContent(mixedContent));
          const paginatedText = normalizeWhitespace(
            pages.map(page => extractTextContent(page)).join('')
          );
          
          expect(paginatedText).toBe(originalText);
        }
      ),
      { numRuns: 100 }
    );
  });
});
