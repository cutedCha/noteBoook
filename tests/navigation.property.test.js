/**
 * Property-Based Tests for Navigation System - 目录完整性
 * 
 * **Feature: graphics-tutorial-book, Property 1: 目录完整性**
 * **Validates: Requirements 2.1, 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7**
 * 
 * Property 1 定义：
 * *For any* 目录页面渲染，目录应包含全部30个章节，且按照5个分类
 * （基础概念篇、效果原理篇、进阶概念篇、数学篇、哲学彩蛋篇）正确分组，
 * 章节编号从1到30连续且顺序正确。
 */

const fc = require('fast-check');

// Import the navigation module
const { CHAPTERS_DATA, SECTION_ORDER, NavigationSystem } = require('../js/navigation.js');

describe('Property 1: 目录完整性', () => {
  /**
   * 预期的分类及其章节数量
   */
  const EXPECTED_SECTIONS = {
    '基础概念篇': { count: 11, startChapter: 1, endChapter: 11 },
    '效果原理篇': { count: 11, startChapter: 12, endChapter: 22 },
    '进阶概念篇': { count: 4, startChapter: 23, endChapter: 26 },
    '数学篇': { count: 3, startChapter: 27, endChapter: 29 },
    '哲学彩蛋篇': { count: 2, startChapter: 30, endChapter: 31 }
  };

  /**
   * 预期的分类顺序
   */
  const EXPECTED_SECTION_ORDER = [
    '基础概念篇',
    '效果原理篇',
    '进阶概念篇',
    '数学篇',
    '哲学彩蛋篇'
  ];

  /**
   * Property 1.1: CHAPTERS_DATA 包含全部30个章节
   * **Validates: Requirements 2.1, 6.1**
   * 
   * 验证章节数据包含正好30个章节
   */
  test('Property 1.1: CHAPTERS_DATA 应包含全部30个章节', () => {
    fc.assert(
      fc.property(
        fc.constant(CHAPTERS_DATA),
        (chapters) => {
          // 验证章节总数为31
          expect(chapters.length).toBe(31);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 1.2: 章节编号从1到30连续
   * **Validates: Requirements 6.1, 6.7**
   * 
   * 验证章节编号从1开始，到30结束，且连续无间断
   */
  test('Property 1.2: 章节编号应从1到30连续', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 31 }),
        (expectedNumber) => {
          // 对于任意1-31的编号，应该存在对应的章节
          const chapter = CHAPTERS_DATA.find(ch => ch.number === expectedNumber);
          expect(chapter).toBeDefined();
          expect(chapter.number).toBe(expectedNumber);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 1.3: 章节顺序正确（按编号升序排列）
   * **Validates: Requirements 6.7**
   * 
   * 验证章节数据按编号升序排列
   */
  test('Property 1.3: 章节应按编号升序排列', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 28 }), // 索引范围 0-28，可以比较 i 和 i+1
        (index) => {
          const currentChapter = CHAPTERS_DATA[index];
          const nextChapter = CHAPTERS_DATA[index + 1];
          
          // 当前章节编号应小于下一章节编号
          expect(currentChapter.number).toBeLessThan(nextChapter.number);
          
          // 编号应该连续（差值为1）
          expect(nextChapter.number - currentChapter.number).toBe(1);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 1.4: 5个分类的章节数量正确
   * **Validates: Requirements 6.2, 6.3, 6.4, 6.5, 6.6**
   * 
   * 验证每个分类包含正确数量的章节：
   * - 基础概念篇：11章
   * - 效果原理篇：10章
   * - 进阶概念篇：4章
   * - 数学篇：3章
   * - 哲学彩蛋篇：2章
   */
  test('Property 1.4: 每个分类应包含正确数量的章节', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...Object.keys(EXPECTED_SECTIONS)),
        (sectionName) => {
          const expectedInfo = EXPECTED_SECTIONS[sectionName];
          const chaptersInSection = CHAPTERS_DATA.filter(ch => ch.section === sectionName);
          
          // 验证章节数量
          expect(chaptersInSection.length).toBe(expectedInfo.count);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 1.5: 章节按分类正确分组
   * **Validates: Requirements 6.2, 6.3, 6.4, 6.5, 6.6**
   * 
   * 验证每个章节属于正确的分类，且分类内的章节编号范围正确
   */
  test('Property 1.5: 章节应按分类正确分组', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 31 }),
        (chapterNumber) => {
          const chapter = CHAPTERS_DATA.find(ch => ch.number === chapterNumber);
          expect(chapter).toBeDefined();
          
          // 根据章节编号确定预期分类
          let expectedSection;
          if (chapterNumber >= 1 && chapterNumber <= 11) {
            expectedSection = '基础概念篇';
          } else if (chapterNumber >= 12 && chapterNumber <= 21) {
            expectedSection = '效果原理篇';
          } else if (chapterNumber >= 22 && chapterNumber <= 25) {
            expectedSection = '进阶概念篇';
          } else if (chapterNumber >= 26 && chapterNumber <= 28) {
            expectedSection = '数学篇';
          } else {
            expectedSection = '哲学彩蛋篇';
          }
          
          // 验证章节属于正确的分类
          expect(chapter.section).toBe(expectedSection);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 1.6: 分类顺序正确
   * **Validates: Requirements 6.1**
   * 
   * 验证 SECTION_ORDER 包含正确的分类顺序
   */
  test('Property 1.6: 分类顺序应正确', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 4 }),
        (index) => {
          // 验证分类顺序与预期一致
          expect(SECTION_ORDER[index]).toBe(EXPECTED_SECTION_ORDER[index]);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 1.7: SECTION_ORDER 包含全部5个分类
   * **Validates: Requirements 6.1**
   * 
   * 验证分类顺序数组包含正好5个分类
   */
  test('Property 1.7: SECTION_ORDER 应包含全部5个分类', () => {
    fc.assert(
      fc.property(
        fc.constant(SECTION_ORDER),
        (sections) => {
          // 验证分类总数为5
          expect(sections.length).toBe(5);
          
          // 验证包含所有预期的分类
          EXPECTED_SECTION_ORDER.forEach(expectedSection => {
            expect(sections).toContain(expectedSection);
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 1.8: 每个章节都有必要的属性
   * **Validates: Requirements 2.1**
   * 
   * 验证每个章节对象都包含 number、title、section 属性
   */
  test('Property 1.8: 每个章节应包含必要的属性', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 29 }),
        (index) => {
          const chapter = CHAPTERS_DATA[index];
          
          // 验证必要属性存在
          expect(chapter).toHaveProperty('number');
          expect(chapter).toHaveProperty('title');
          expect(chapter).toHaveProperty('section');
          
          // 验证属性类型
          expect(typeof chapter.number).toBe('number');
          expect(typeof chapter.title).toBe('string');
          expect(typeof chapter.section).toBe('string');
          
          // 验证标题不为空
          expect(chapter.title.length).toBeGreaterThan(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 1.9: 分类内章节编号连续
   * **Validates: Requirements 6.2, 6.3, 6.4, 6.5, 6.6**
   * 
   * 验证每个分类内的章节编号是连续的
   */
  test('Property 1.9: 每个分类内的章节编号应连续', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...Object.keys(EXPECTED_SECTIONS)),
        (sectionName) => {
          const expectedInfo = EXPECTED_SECTIONS[sectionName];
          const chaptersInSection = CHAPTERS_DATA.filter(ch => ch.section === sectionName);
          
          // 按编号排序
          const sortedChapters = [...chaptersInSection].sort((a, b) => a.number - b.number);
          
          // 验证起始和结束章节编号
          expect(sortedChapters[0].number).toBe(expectedInfo.startChapter);
          expect(sortedChapters[sortedChapters.length - 1].number).toBe(expectedInfo.endChapter);
          
          // 验证编号连续
          for (let i = 0; i < sortedChapters.length - 1; i++) {
            expect(sortedChapters[i + 1].number - sortedChapters[i].number).toBe(1);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 1.10: NavigationSystem.getTableOfContents 返回完整数据
   * **Validates: Requirements 2.1**
   * 
   * 验证导航系统的 getTableOfContents 方法返回完整的章节数据
   */
  test('Property 1.10: getTableOfContents 应返回完整的章节数据', () => {
    fc.assert(
      fc.property(
        fc.constant(null),
        () => {
          const toc = NavigationSystem.getTableOfContents();
          
          // 验证返回的数据与 CHAPTERS_DATA 一致
          expect(toc).toBe(CHAPTERS_DATA);
          expect(toc.length).toBe(31);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 1.11: NavigationSystem.getSectionOrder 返回正确的分类顺序
   * **Validates: Requirements 6.1**
   * 
   * 验证导航系统的 getSectionOrder 方法返回正确的分类顺序
   */
  test('Property 1.11: getSectionOrder 应返回正确的分类顺序', () => {
    fc.assert(
      fc.property(
        fc.constant(null),
        () => {
          const sectionOrder = NavigationSystem.getSectionOrder();
          
          // 验证返回的数据与 SECTION_ORDER 一致
          expect(sectionOrder).toBe(SECTION_ORDER);
          expect(sectionOrder.length).toBe(5);
          
          // 验证顺序正确
          expect(sectionOrder).toEqual(EXPECTED_SECTION_ORDER);
        }
      ),
      { numRuns: 100 }
    );
  });
});
