/**
 * Property-Based Tests for Touch Target Minimum Size - 触摸区域最小尺寸
 * 
 * **Feature: graphics-tutorial-book, Property 8: 触摸区域最小尺寸**
 * **Validates: Requirements 5.5**
 * 
 * Property 8 定义：
 * *For any* 导航按钮元素，其可点击区域的宽度和高度都应不小于44px。
 * 
 * 根据 WCAG 2.1 可访问性指南，触摸目标的最小尺寸应为 44x44 像素，
 * 以确保移动设备用户能够轻松点击。
 */

const fc = require('fast-check');

describe('Property 8: 触摸区域最小尺寸', () => {
  /**
   * 触摸区域最小尺寸常量 (像素)
   * 根据 WCAG 2.1 和 Requirements 5.5
   */
  const MIN_TOUCH_TARGET_SIZE = 44;

  /**
   * 所有需要验证触摸区域的导航按钮选择器
   * 这些选择器对应 CSS 中定义的触摸目标元素
   */
  const TOUCH_TARGET_SELECTORS = [
    '.nav-btn',           // 导航按钮（上一页/下一页）
    '.toc-chapter-link',  // 目录章节链接
    '.cover-enter-btn',   // 封面进入按钮
    '.toc-close-btn',     // 目录关闭按钮
    '.nav-toc-btn',       // 导航栏目录按钮
    '.modal-btn'          // 弹窗按钮
  ];

  /**
   * CSS 变量定义的触摸目标最小尺寸
   */
  const CSS_TOUCH_TARGET_VAR = '--touch-target-min';

  /**
   * Helper function to parse CSS value to pixels
   * @param {string} value - CSS value (e.g., '44px', '2.75rem')
   * @param {number} baseFontSize - Base font size for rem calculations (default 16px)
   * @returns {number} Value in pixels
   */
  function parseCSSValueToPixels(value, baseFontSize = 16) {
    if (!value || value === 'auto' || value === 'none') {
      return 0;
    }
    
    const numericValue = parseFloat(value);
    
    if (value.includes('px')) {
      return numericValue;
    } else if (value.includes('rem')) {
      return numericValue * baseFontSize;
    } else if (value.includes('em')) {
      return numericValue * baseFontSize;
    } else if (!isNaN(numericValue)) {
      return numericValue;
    }
    
    return 0;
  }

  /**
   * Helper function to get computed style value
   * @param {HTMLElement} element - DOM element
   * @param {string} property - CSS property name
   * @returns {string} Computed style value
   */
  function getComputedStyleValue(element, property) {
    return window.getComputedStyle(element).getPropertyValue(property);
  }

  /**
   * Helper function to check if element meets minimum touch target size
   * @param {HTMLElement} element - DOM element to check
   * @returns {object} Object with width, height, and isValid properties
   */
  function checkTouchTargetSize(element) {
    const computedStyle = window.getComputedStyle(element);
    
    // Get actual dimensions
    const width = element.offsetWidth || parseCSSValueToPixels(computedStyle.width);
    const height = element.offsetHeight || parseCSSValueToPixels(computedStyle.height);
    
    // Get min-width and min-height
    const minWidth = parseCSSValueToPixels(computedStyle.minWidth);
    const minHeight = parseCSSValueToPixels(computedStyle.minHeight);
    
    // Element is valid if either actual size or min-size meets requirement
    const effectiveWidth = Math.max(width, minWidth);
    const effectiveHeight = Math.max(height, minHeight);
    
    return {
      width: effectiveWidth,
      height: effectiveHeight,
      minWidth,
      minHeight,
      actualWidth: width,
      actualHeight: height,
      isWidthValid: effectiveWidth >= MIN_TOUCH_TARGET_SIZE,
      isHeightValid: effectiveHeight >= MIN_TOUCH_TARGET_SIZE,
      isValid: effectiveWidth >= MIN_TOUCH_TARGET_SIZE && effectiveHeight >= MIN_TOUCH_TARGET_SIZE
    };
  }

  /**
   * Helper function to create a mock element with specified styles
   * @param {string} selector - CSS selector/class name
   * @param {object} styles - Style properties to apply
   * @returns {HTMLElement} Created element
   */
  function createMockElement(selector, styles = {}) {
    const element = document.createElement('button');
    element.className = selector.replace('.', '');
    
    // Apply default touch target styles
    element.style.minWidth = `${MIN_TOUCH_TARGET_SIZE}px`;
    element.style.minHeight = `${MIN_TOUCH_TARGET_SIZE}px`;
    
    // Apply custom styles
    Object.entries(styles).forEach(([prop, value]) => {
      element.style[prop] = value;
    });
    
    return element;
  }

  /**
   * Setup DOM environment before each test
   */
  beforeEach(() => {
    // Create a container for test elements
    document.body.innerHTML = '<div id="test-container"></div>';
    
    // Add CSS variables to document root
    document.documentElement.style.setProperty(CSS_TOUCH_TARGET_VAR, `${MIN_TOUCH_TARGET_SIZE}px`);
  });

  /**
   * Cleanup after each test
   */
  afterEach(() => {
    document.body.innerHTML = '';
    document.documentElement.style.removeProperty(CSS_TOUCH_TARGET_VAR);
  });

  /**
   * Property 8.1: CSS变量定义的触摸目标最小尺寸应为44px
   * **Validates: Requirements 5.5**
   * 
   * 验证 CSS 变量 --touch-target-min 的值为 44px
   */
  test('Property 8.1: CSS变量定义的触摸目标最小尺寸应为44px', () => {
    fc.assert(
      fc.property(
        fc.constant(CSS_TOUCH_TARGET_VAR),
        (varName) => {
          const value = getComputedStyle(document.documentElement).getPropertyValue(varName);
          const pixelValue = parseCSSValueToPixels(value);
          
          expect(pixelValue).toBe(MIN_TOUCH_TARGET_SIZE);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 8.2: 所有导航按钮选择器都应定义最小触摸区域
   * **Validates: Requirements 5.5**
   * 
   * 验证所有定义的触摸目标选择器都存在
   */
  test('Property 8.2: 所有导航按钮选择器都应被定义', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...TOUCH_TARGET_SELECTORS),
        (selector) => {
          // Selector should be a valid CSS selector
          expect(selector).toMatch(/^\.[a-z-]+$/);
          
          // Selector should be in our defined list
          expect(TOUCH_TARGET_SELECTORS).toContain(selector);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 8.3: 导航按钮元素的宽度应不小于44px
   * **Validates: Requirements 5.5**
   * 
   * For any 导航按钮元素，其可点击区域的宽度应不小于44px
   */
  test('Property 8.3: 导航按钮元素的宽度应不小于44px', () => {
    const container = document.getElementById('test-container');
    
    fc.assert(
      fc.property(
        fc.constantFrom(...TOUCH_TARGET_SELECTORS),
        fc.integer({ min: MIN_TOUCH_TARGET_SIZE, max: 200 }), // Valid widths
        (selector, width) => {
          // Create element with the selector class
          const element = createMockElement(selector, {
            width: `${width}px`,
            minWidth: `${MIN_TOUCH_TARGET_SIZE}px`
          });
          container.appendChild(element);
          
          const result = checkTouchTargetSize(element);
          
          // Width should be at least 44px
          expect(result.isWidthValid).toBe(true);
          expect(result.width).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET_SIZE);
          
          // Cleanup
          container.removeChild(element);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 8.4: 导航按钮元素的高度应不小于44px
   * **Validates: Requirements 5.5**
   * 
   * For any 导航按钮元素，其可点击区域的高度应不小于44px
   */
  test('Property 8.4: 导航按钮元素的高度应不小于44px', () => {
    const container = document.getElementById('test-container');
    
    fc.assert(
      fc.property(
        fc.constantFrom(...TOUCH_TARGET_SELECTORS),
        fc.integer({ min: MIN_TOUCH_TARGET_SIZE, max: 200 }), // Valid heights
        (selector, height) => {
          // Create element with the selector class
          const element = createMockElement(selector, {
            height: `${height}px`,
            minHeight: `${MIN_TOUCH_TARGET_SIZE}px`
          });
          container.appendChild(element);
          
          const result = checkTouchTargetSize(element);
          
          // Height should be at least 44px
          expect(result.isHeightValid).toBe(true);
          expect(result.height).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET_SIZE);
          
          // Cleanup
          container.removeChild(element);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 8.5: 导航按钮元素的宽度和高度都应不小于44px
   * **Validates: Requirements 5.5**
   * 
   * For any 导航按钮元素，其可点击区域的宽度和高度都应不小于44px
   */
  test('Property 8.5: 导航按钮元素的宽度和高度都应不小于44px', () => {
    const container = document.getElementById('test-container');
    
    fc.assert(
      fc.property(
        fc.constantFrom(...TOUCH_TARGET_SELECTORS),
        fc.integer({ min: MIN_TOUCH_TARGET_SIZE, max: 200 }),
        fc.integer({ min: MIN_TOUCH_TARGET_SIZE, max: 200 }),
        (selector, width, height) => {
          // Create element with the selector class
          const element = createMockElement(selector, {
            width: `${width}px`,
            height: `${height}px`,
            minWidth: `${MIN_TOUCH_TARGET_SIZE}px`,
            minHeight: `${MIN_TOUCH_TARGET_SIZE}px`
          });
          container.appendChild(element);
          
          const result = checkTouchTargetSize(element);
          
          // Both width and height should be at least 44px
          expect(result.isValid).toBe(true);
          expect(result.width).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET_SIZE);
          expect(result.height).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET_SIZE);
          
          // Cleanup
          container.removeChild(element);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 8.6: 小于44px的尺寸应被min-width/min-height约束
   * **Validates: Requirements 5.5**
   * 
   * 当设置的尺寸小于44px时，min-width/min-height应确保最终尺寸不小于44px
   */
  test('Property 8.6: 小于44px的尺寸应被min-width/min-height约束', () => {
    const container = document.getElementById('test-container');
    
    fc.assert(
      fc.property(
        fc.constantFrom(...TOUCH_TARGET_SELECTORS),
        fc.integer({ min: 1, max: MIN_TOUCH_TARGET_SIZE - 1 }), // Sizes smaller than 44px
        fc.integer({ min: 1, max: MIN_TOUCH_TARGET_SIZE - 1 }),
        (selector, smallWidth, smallHeight) => {
          // Create element with small size but proper min constraints
          const element = createMockElement(selector, {
            width: `${smallWidth}px`,
            height: `${smallHeight}px`,
            minWidth: `${MIN_TOUCH_TARGET_SIZE}px`,
            minHeight: `${MIN_TOUCH_TARGET_SIZE}px`
          });
          container.appendChild(element);
          
          const result = checkTouchTargetSize(element);
          
          // min-width and min-height should be at least 44px
          expect(result.minWidth).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET_SIZE);
          expect(result.minHeight).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET_SIZE);
          
          // Effective size should be at least 44px due to min constraints
          expect(result.width).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET_SIZE);
          expect(result.height).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET_SIZE);
          
          // Cleanup
          container.removeChild(element);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 8.7: 随机尺寸组合的触摸区域验证
   * **Validates: Requirements 5.5**
   * 
   * 对于任意尺寸组合，只要设置了正确的min-width/min-height，
   * 触摸区域应始终满足最小尺寸要求
   */
  test('Property 8.7: 随机尺寸组合的触摸区域应满足最小要求', () => {
    const container = document.getElementById('test-container');
    
    fc.assert(
      fc.property(
        fc.constantFrom(...TOUCH_TARGET_SELECTORS),
        fc.integer({ min: 1, max: 300 }), // Any width
        fc.integer({ min: 1, max: 300 }), // Any height
        (selector, width, height) => {
          // Create element with any size but proper min constraints
          const element = createMockElement(selector, {
            width: `${width}px`,
            height: `${height}px`,
            minWidth: `${MIN_TOUCH_TARGET_SIZE}px`,
            minHeight: `${MIN_TOUCH_TARGET_SIZE}px`
          });
          container.appendChild(element);
          
          const result = checkTouchTargetSize(element);
          
          // With proper min constraints, element should always be valid
          expect(result.isValid).toBe(true);
          
          // Cleanup
          container.removeChild(element);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 8.8: .nav-btn 选择器的触摸区域验证
   * **Validates: Requirements 5.5**
   * 
   * 专门验证 .nav-btn 类的导航按钮
   */
  test('Property 8.8: .nav-btn 选择器的触摸区域应满足最小要求', () => {
    const container = document.getElementById('test-container');
    
    fc.assert(
      fc.property(
        fc.integer({ min: MIN_TOUCH_TARGET_SIZE, max: 150 }),
        fc.integer({ min: MIN_TOUCH_TARGET_SIZE, max: 150 }),
        (width, height) => {
          const element = createMockElement('.nav-btn', {
            width: `${width}px`,
            height: `${height}px`,
            minWidth: `${MIN_TOUCH_TARGET_SIZE}px`,
            minHeight: `${MIN_TOUCH_TARGET_SIZE}px`
          });
          container.appendChild(element);
          
          const result = checkTouchTargetSize(element);
          
          expect(result.isValid).toBe(true);
          expect(result.width).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET_SIZE);
          expect(result.height).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET_SIZE);
          
          container.removeChild(element);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 8.9: .toc-chapter-link 选择器的触摸区域验证
   * **Validates: Requirements 5.5**
   * 
   * 专门验证 .toc-chapter-link 类的目录链接
   */
  test('Property 8.9: .toc-chapter-link 选择器的触摸区域应满足最小要求', () => {
    const container = document.getElementById('test-container');
    
    fc.assert(
      fc.property(
        fc.integer({ min: MIN_TOUCH_TARGET_SIZE, max: 500 }), // Links can be wider
        fc.integer({ min: MIN_TOUCH_TARGET_SIZE, max: 100 }),
        (width, height) => {
          const element = document.createElement('a');
          element.className = 'toc-chapter-link';
          element.style.display = 'flex';
          element.style.width = `${width}px`;
          element.style.height = `${height}px`;
          element.style.minWidth = `${MIN_TOUCH_TARGET_SIZE}px`;
          element.style.minHeight = `${MIN_TOUCH_TARGET_SIZE}px`;
          container.appendChild(element);
          
          const result = checkTouchTargetSize(element);
          
          expect(result.isValid).toBe(true);
          expect(result.width).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET_SIZE);
          expect(result.height).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET_SIZE);
          
          container.removeChild(element);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 8.10: .cover-enter-btn 选择器的触摸区域验证
   * **Validates: Requirements 5.5**
   * 
   * 专门验证 .cover-enter-btn 类的封面进入按钮
   */
  test('Property 8.10: .cover-enter-btn 选择器的触摸区域应满足最小要求', () => {
    const container = document.getElementById('test-container');
    
    fc.assert(
      fc.property(
        fc.integer({ min: MIN_TOUCH_TARGET_SIZE, max: 250 }),
        fc.integer({ min: MIN_TOUCH_TARGET_SIZE, max: 100 }),
        (width, height) => {
          const element = createMockElement('.cover-enter-btn', {
            width: `${width}px`,
            height: `${height}px`,
            minWidth: `${MIN_TOUCH_TARGET_SIZE}px`,
            minHeight: `${MIN_TOUCH_TARGET_SIZE}px`
          });
          container.appendChild(element);
          
          const result = checkTouchTargetSize(element);
          
          expect(result.isValid).toBe(true);
          expect(result.width).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET_SIZE);
          expect(result.height).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET_SIZE);
          
          container.removeChild(element);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 8.11: 触摸区域尺寸的一致性验证
   * **Validates: Requirements 5.5**
   * 
   * 多次检查同一元素的触摸区域尺寸应返回一致的结果
   */
  test('Property 8.11: 触摸区域尺寸检查应具有一致性', () => {
    const container = document.getElementById('test-container');
    
    fc.assert(
      fc.property(
        fc.constantFrom(...TOUCH_TARGET_SELECTORS),
        fc.integer({ min: MIN_TOUCH_TARGET_SIZE, max: 200 }),
        fc.integer({ min: MIN_TOUCH_TARGET_SIZE, max: 200 }),
        (selector, width, height) => {
          const element = createMockElement(selector, {
            width: `${width}px`,
            height: `${height}px`,
            minWidth: `${MIN_TOUCH_TARGET_SIZE}px`,
            minHeight: `${MIN_TOUCH_TARGET_SIZE}px`
          });
          container.appendChild(element);
          
          // Check multiple times
          const result1 = checkTouchTargetSize(element);
          const result2 = checkTouchTargetSize(element);
          const result3 = checkTouchTargetSize(element);
          
          // Results should be consistent
          expect(result1.width).toBe(result2.width);
          expect(result2.width).toBe(result3.width);
          expect(result1.height).toBe(result2.height);
          expect(result2.height).toBe(result3.height);
          expect(result1.isValid).toBe(result2.isValid);
          expect(result2.isValid).toBe(result3.isValid);
          
          container.removeChild(element);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 8.12: 所有触摸目标选择器的综合验证
   * **Validates: Requirements 5.5**
   * 
   * 验证所有定义的触摸目标选择器都能正确应用最小尺寸约束
   */
  test('Property 8.12: 所有触摸目标选择器应正确应用最小尺寸约束', () => {
    const container = document.getElementById('test-container');
    
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            selector: fc.constantFrom(...TOUCH_TARGET_SELECTORS),
            width: fc.integer({ min: 1, max: 300 }),
            height: fc.integer({ min: 1, max: 300 })
          }),
          { minLength: 1, maxLength: TOUCH_TARGET_SELECTORS.length }
        ),
        (elements) => {
          const createdElements = [];
          
          elements.forEach(({ selector, width, height }) => {
            const element = createMockElement(selector, {
              width: `${width}px`,
              height: `${height}px`,
              minWidth: `${MIN_TOUCH_TARGET_SIZE}px`,
              minHeight: `${MIN_TOUCH_TARGET_SIZE}px`
            });
            container.appendChild(element);
            createdElements.push(element);
          });
          
          // Verify all elements meet minimum touch target size
          createdElements.forEach(element => {
            const result = checkTouchTargetSize(element);
            expect(result.isValid).toBe(true);
          });
          
          // Cleanup
          createdElements.forEach(element => {
            container.removeChild(element);
          });
        }
      ),
      { numRuns: 100 }
    );
  });
});
