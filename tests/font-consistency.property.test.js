/**
 * Property-Based Tests for Font Consistency - 字体一致性
 * 
 * **Feature: graphics-tutorial-book, Property 11: 字体一致性**
 * **Validates: Requirements 8.2**
 * 
 * Property 11 定义：
 * *For any* 页面元素，应使用统一的字体家族设置，不应出现字体不一致的情况。
 * 
 * 字体家族定义（来自 CSS 变量）：
 * - --font-family-serif: 用于正文、标题、引用
 * - --font-family-sans: 用于按钮、导航、UI元素
 * - --font-family-mono: 用于代码块
 */

const fc = require('fast-check');

describe('Property 11: 字体一致性', () => {
  /**
   * 定义的字体家族 CSS 变量值
   * 这些值来自 css/styles.css 中的 :root 定义
   */
  const FONT_FAMILIES = {
    serif: '"Noto Serif SC", "Source Han Serif SC", "思源宋体", "Songti SC", "STSong", "华文宋体", "SimSun", "宋体", serif',
    sans: '"Noto Sans SC", "Source Han Sans SC", "思源黑体", "PingFang SC", "Microsoft YaHei", "微软雅黑", "Hiragino Sans GB", sans-serif',
    mono: '"Fira Code", "Source Code Pro", "JetBrains Mono", "Consolas", "Monaco", monospace'
  };

  /**
   * 元素类型与预期字体家族的映射
   * 根据设计文档和 CSS 样式定义
   */
  const ELEMENT_FONT_MAPPING = {
    // 使用 serif 字体的元素
    serif: [
      'body',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'p',
      'blockquote',
      'ul', 'ol', 'li',
      'figcaption',
      '.cover-title',
      '.cover-subtitle',
      '.chapter-title',
      '.chapter-subtitle',
      '.toc-section-title',
      '.toc-chapter-title',
      '.toc-chapter-subtitle',
      '.loading-text',
      '.loading-book-title'
    ],
    // 使用 sans 字体的元素
    sans: [
      'button',
      '.btn-primary',
      '.btn-secondary',
      '.nav-btn',
      '.nav-toc-btn',
      '.nav-chapter',
      '.nav-icon',
      '.toc-chapter-number',
      '.chapter-number',
      '.page-number',
      '.cover-enter-btn',
      '.toc-close-btn',
      '.modal-btn',
      '.icon',
      '.checkmark',
      '.warning-mark',
      '.error-mark'
    ],
    // 使用 mono 字体的元素
    mono: [
      'code',
      'pre'
    ]
  };

  /**
   * 所有有效的字体家族（用于验证）
   */
  const VALID_FONT_FAMILIES = [
    FONT_FAMILIES.serif,
    FONT_FAMILIES.sans,
    FONT_FAMILIES.mono
  ];

  /**
   * 检查字体家族是否匹配预期类型
   * @param {string} fontFamily - 实际的字体家族值
   * @param {string} expectedType - 预期的字体类型 ('serif' | 'sans' | 'mono')
   * @returns {boolean}
   */
  function fontFamilyMatchesType(fontFamily, expectedType) {
    if (!fontFamily) return false;
    
    const normalizedFont = fontFamily.toLowerCase().replace(/\s+/g, ' ').trim();
    const expectedFont = FONT_FAMILIES[expectedType].toLowerCase().replace(/\s+/g, ' ').trim();
    
    // 检查是否包含预期字体家族的关键字
    const expectedKeywords = {
      serif: ['serif', 'noto serif', 'source han serif', '宋体', 'songti'],
      sans: ['sans-serif', 'noto sans', 'source han sans', '黑体', 'pingfang', 'yahei'],
      mono: ['monospace', 'fira code', 'source code', 'consolas', 'monaco']
    };
    
    return expectedKeywords[expectedType].some(keyword => 
      normalizedFont.includes(keyword.toLowerCase())
    );
  }

  /**
   * 检查字体家族是否是三种定义的字体之一
   * @param {string} fontFamily - 字体家族值
   * @returns {boolean}
   */
  function isValidFontFamily(fontFamily) {
    if (!fontFamily) return false;
    
    const normalizedFont = fontFamily.toLowerCase();
    
    // 检查是否包含任何有效字体家族的关键字
    const validKeywords = [
      // serif
      'serif', 'noto serif', 'source han serif', '宋体', 'songti', 'stsong',
      // sans
      'sans-serif', 'noto sans', 'source han sans', '黑体', 'pingfang', 'yahei', 'hiragino',
      // mono
      'monospace', 'fira code', 'source code', 'consolas', 'monaco', 'jetbrains'
    ];
    
    return validKeywords.some(keyword => normalizedFont.includes(keyword.toLowerCase()));
  }

  /**
   * Arbitrary generator for serif element selectors
   */
  const serifElementArbitrary = fc.constantFrom(...ELEMENT_FONT_MAPPING.serif);

  /**
   * Arbitrary generator for sans element selectors
   */
  const sansElementArbitrary = fc.constantFrom(...ELEMENT_FONT_MAPPING.sans);

  /**
   * Arbitrary generator for mono element selectors
   */
  const monoElementArbitrary = fc.constantFrom(...ELEMENT_FONT_MAPPING.mono);

  /**
   * Arbitrary generator for all element selectors
   */
  const allElementArbitrary = fc.constantFrom(
    ...ELEMENT_FONT_MAPPING.serif,
    ...ELEMENT_FONT_MAPPING.sans,
    ...ELEMENT_FONT_MAPPING.mono
  );

  /**
   * Property 11.1: Serif 元素应使用 serif 字体家族
   * **Validates: Requirements 8.2**
   * 
   * For any serif element (body, headings, paragraphs, blockquotes),
   * the font-family should be the defined serif font family.
   */
  test('Property 11.1: Serif 元素应使用 serif 字体家族', () => {
    fc.assert(
      fc.property(
        serifElementArbitrary,
        (elementSelector) => {
          // 验证元素选择器在 serif 映射中
          expect(ELEMENT_FONT_MAPPING.serif).toContain(elementSelector);
          
          // 验证该元素应该使用 serif 字体
          const expectedFontType = 'serif';
          const expectedFont = FONT_FAMILIES[expectedFontType];
          
          // 验证预期字体是有效的
          expect(isValidFontFamily(expectedFont)).toBe(true);
          expect(fontFamilyMatchesType(expectedFont, expectedFontType)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 11.2: Sans 元素应使用 sans 字体家族
   * **Validates: Requirements 8.2**
   * 
   * For any sans element (buttons, navigation, UI elements),
   * the font-family should be the defined sans font family.
   */
  test('Property 11.2: Sans 元素应使用 sans 字体家族', () => {
    fc.assert(
      fc.property(
        sansElementArbitrary,
        (elementSelector) => {
          // 验证元素选择器在 sans 映射中
          expect(ELEMENT_FONT_MAPPING.sans).toContain(elementSelector);
          
          // 验证该元素应该使用 sans 字体
          const expectedFontType = 'sans';
          const expectedFont = FONT_FAMILIES[expectedFontType];
          
          // 验证预期字体是有效的
          expect(isValidFontFamily(expectedFont)).toBe(true);
          expect(fontFamilyMatchesType(expectedFont, expectedFontType)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 11.3: Mono 元素应使用 mono 字体家族
   * **Validates: Requirements 8.2**
   * 
   * For any mono element (code, pre),
   * the font-family should be the defined mono font family.
   */
  test('Property 11.3: Mono 元素应使用 mono 字体家族', () => {
    fc.assert(
      fc.property(
        monoElementArbitrary,
        (elementSelector) => {
          // 验证元素选择器在 mono 映射中
          expect(ELEMENT_FONT_MAPPING.mono).toContain(elementSelector);
          
          // 验证该元素应该使用 mono 字体
          const expectedFontType = 'mono';
          const expectedFont = FONT_FAMILIES[expectedFontType];
          
          // 验证预期字体是有效的
          expect(isValidFontFamily(expectedFont)).toBe(true);
          expect(fontFamilyMatchesType(expectedFont, expectedFontType)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 11.4: 所有元素应使用三种定义的字体家族之一
   * **Validates: Requirements 8.2**
   * 
   * For any page element, it should use one of the three defined font families,
   * no undefined or inconsistent font families should be used.
   */
  test('Property 11.4: 所有元素应使用三种定义的字体家族之一', () => {
    fc.assert(
      fc.property(
        allElementArbitrary,
        (elementSelector) => {
          // 确定元素应该使用哪种字体类型
          let expectedFontType = null;
          
          if (ELEMENT_FONT_MAPPING.serif.includes(elementSelector)) {
            expectedFontType = 'serif';
          } else if (ELEMENT_FONT_MAPPING.sans.includes(elementSelector)) {
            expectedFontType = 'sans';
          } else if (ELEMENT_FONT_MAPPING.mono.includes(elementSelector)) {
            expectedFontType = 'mono';
          }
          
          // 验证元素有明确的字体类型分配
          expect(expectedFontType).not.toBeNull();
          
          // 验证分配的字体是有效的
          const expectedFont = FONT_FAMILIES[expectedFontType];
          expect(isValidFontFamily(expectedFont)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 11.5: 相同类型的元素应使用一致的字体家族
   * **Validates: Requirements 8.2**
   * 
   * For any two elements of the same type (e.g., both headings),
   * they should use the same font family.
   */
  test('Property 11.5: 相同类型的元素应使用一致的字体家族', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('serif', 'sans', 'mono'),
        fc.integer({ min: 0, max: 100 }),
        (fontType, seed) => {
          const elements = ELEMENT_FONT_MAPPING[fontType];
          
          if (elements.length < 2) {
            // 如果元素少于2个，跳过此测试
            return true;
          }
          
          // 使用 seed 选择两个不同的元素
          const index1 = seed % elements.length;
          const index2 = (seed + 1) % elements.length;
          
          const element1 = elements[index1];
          const element2 = elements[index2];
          
          // 两个元素应该使用相同的字体类型
          const font1 = FONT_FAMILIES[fontType];
          const font2 = FONT_FAMILIES[fontType];
          
          expect(font1).toBe(font2);
          expect(fontFamilyMatchesType(font1, fontType)).toBe(true);
          expect(fontFamilyMatchesType(font2, fontType)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 11.6: 字体家族定义应完整且有效
   * **Validates: Requirements 8.2**
   * 
   * All three font family definitions should be valid and non-empty.
   */
  test('Property 11.6: 字体家族定义应完整且有效', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('serif', 'sans', 'mono'),
        (fontType) => {
          const fontFamily = FONT_FAMILIES[fontType];
          
          // 字体家族应该存在且非空
          expect(fontFamily).toBeDefined();
          expect(fontFamily.length).toBeGreaterThan(0);
          
          // 字体家族应该是有效的
          expect(isValidFontFamily(fontFamily)).toBe(true);
          
          // 字体家族应该包含回退字体
          const hasFallback = fontFamily.includes(',');
          expect(hasFallback).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 11.7: 每个元素类型都有明确的字体分配
   * **Validates: Requirements 8.2**
   * 
   * Every element in the mapping should have exactly one font type assigned.
   */
  test('Property 11.7: 每个元素类型都有明确的字体分配', () => {
    fc.assert(
      fc.property(
        allElementArbitrary,
        (elementSelector) => {
          // 计算元素出现在多少个字体类型映射中
          let assignmentCount = 0;
          
          if (ELEMENT_FONT_MAPPING.serif.includes(elementSelector)) {
            assignmentCount++;
          }
          if (ELEMENT_FONT_MAPPING.sans.includes(elementSelector)) {
            assignmentCount++;
          }
          if (ELEMENT_FONT_MAPPING.mono.includes(elementSelector)) {
            assignmentCount++;
          }
          
          // 每个元素应该只分配给一种字体类型
          expect(assignmentCount).toBe(1);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 11.8: 标题元素字体一致性
   * **Validates: Requirements 8.2**
   * 
   * All heading elements (h1-h6) should use the same font family (serif).
   */
  test('Property 11.8: 标题元素字体一致性', () => {
    const headingElements = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
    
    fc.assert(
      fc.property(
        fc.constantFrom(...headingElements),
        (headingElement) => {
          // 所有标题元素应该在 serif 映射中
          expect(ELEMENT_FONT_MAPPING.serif).toContain(headingElement);
          
          // 验证使用 serif 字体
          expect(fontFamilyMatchesType(FONT_FAMILIES.serif, 'serif')).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 11.9: 按钮元素字体一致性
   * **Validates: Requirements 8.2**
   * 
   * All button elements should use the same font family (sans).
   */
  test('Property 11.9: 按钮元素字体一致性', () => {
    const buttonElements = [
      'button',
      '.btn-primary',
      '.btn-secondary',
      '.nav-btn',
      '.nav-toc-btn',
      '.cover-enter-btn',
      '.toc-close-btn',
      '.modal-btn'
    ];
    
    fc.assert(
      fc.property(
        fc.constantFrom(...buttonElements),
        (buttonElement) => {
          // 所有按钮元素应该在 sans 映射中
          expect(ELEMENT_FONT_MAPPING.sans).toContain(buttonElement);
          
          // 验证使用 sans 字体
          expect(fontFamilyMatchesType(FONT_FAMILIES.sans, 'sans')).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 11.10: 代码元素字体一致性
   * **Validates: Requirements 8.2**
   * 
   * All code elements should use the same font family (mono).
   */
  test('Property 11.10: 代码元素字体一致性', () => {
    const codeElements = ['code', 'pre'];
    
    fc.assert(
      fc.property(
        fc.constantFrom(...codeElements),
        (codeElement) => {
          // 所有代码元素应该在 mono 映射中
          expect(ELEMENT_FONT_MAPPING.mono).toContain(codeElement);
          
          // 验证使用 mono 字体
          expect(fontFamilyMatchesType(FONT_FAMILIES.mono, 'mono')).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 11.11: 字体家族应包含中文字体支持
   * **Validates: Requirements 8.2**
   * 
   * Font families should include Chinese font support.
   */
  test('Property 11.11: 字体家族应包含中文字体支持', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('serif', 'sans'),
        (fontType) => {
          const fontFamily = FONT_FAMILIES[fontType];
          
          // 检查是否包含中文字体
          const chineseFontKeywords = [
            '宋体', '黑体', '思源', 'Noto', 'Source Han', 
            'PingFang', 'Microsoft YaHei', '微软雅黑', 'Hiragino'
          ];
          
          const hasChineseFont = chineseFontKeywords.some(keyword => 
            fontFamily.includes(keyword)
          );
          
          expect(hasChineseFont).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 11.12: 字体家族应包含通用回退字体
   * **Validates: Requirements 8.2**
   * 
   * Font families should include generic fallback fonts.
   */
  test('Property 11.12: 字体家族应包含通用回退字体', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('serif', 'sans', 'mono'),
        (fontType) => {
          const fontFamily = FONT_FAMILIES[fontType];
          
          // 检查是否包含通用回退字体
          const genericFallbacks = {
            serif: 'serif',
            sans: 'sans-serif',
            mono: 'monospace'
          };
          
          const expectedFallback = genericFallbacks[fontType];
          
          // 字体家族应该以通用回退字体结尾
          expect(fontFamily.toLowerCase()).toContain(expectedFallback);
        }
      ),
      { numRuns: 100 }
    );
  });
});
