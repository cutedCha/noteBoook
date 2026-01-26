/**
 * Property-Based Tests for Navigation System - 章节导航正确性
 * 
 * **Feature: graphics-tutorial-book, Property 2: 章节导航正确性**
 * **Validates: Requirements 2.2, 2.3, 2.5**
 * 
 * Property 2 定义：
 * *For any* 章节编号N（1 ≤ N ≤ 31），当用户从目录点击第N章或通过上一章/下一章按钮导航时，
 * 系统应显示正确的第N章内容，且当前章节位置信息应正确显示为"第N章"。
 */

const fc = require('fast-check');

// Import the navigation module
const { CHAPTERS_DATA, NavigationSystem } = require('../js/navigation.js');

describe('Property 2: 章节导航正确性', () => {
  /**
   * Reset NavigationSystem state before each test
   */
  beforeEach(() => {
    NavigationSystem.currentChapter = null;
  });

  /**
   * Property 2.1: goToChapter 正确设置当前章节
   * **Validates: Requirements 2.2**
   * 
   * For any chapter number N (1 ≤ N ≤ 31), calling goToChapter(N) should
   * set the current chapter to the chapter with number N.
   */
  test('Property 2.1: goToChapter 应正确设置当前章节', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 31 }),
        (chapterNumber) => {
          // Navigate to the chapter
          NavigationSystem.goToChapter(chapterNumber);
          
          // Get current chapter
          const currentChapter = NavigationSystem.getCurrentChapter();
          
          // Verify current chapter is set correctly
          expect(currentChapter).not.toBeNull();
          expect(currentChapter.number).toBe(chapterNumber);
          
          // Verify the chapter data matches CHAPTERS_DATA
          const expectedChapter = CHAPTERS_DATA.find(ch => ch.number === chapterNumber);
          expect(currentChapter.title).toBe(expectedChapter.title);
          expect(currentChapter.section).toBe(expectedChapter.section);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 2.2: getChapterByNumber 返回正确的章节数据
   * **Validates: Requirements 2.2**
   * 
   * For any chapter number N (1 ≤ N ≤ 31), getChapterByNumber(N) should
   * return the chapter object with number N.
   */
  test('Property 2.2: getChapterByNumber 应返回正确的章节数据', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 31 }),
        (chapterNumber) => {
          const chapter = NavigationSystem.getChapterByNumber(chapterNumber);
          
          // Verify chapter is found
          expect(chapter).not.toBeNull();
          expect(chapter.number).toBe(chapterNumber);
          
          // Verify it matches the expected data
          const expectedChapter = CHAPTERS_DATA[chapterNumber - 1];
          expect(chapter).toEqual(expectedChapter);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 2.3: prevChapter 正确导航到上一章
   * **Validates: Requirements 2.5**
   * 
   * For any chapter number N (2 ≤ N ≤ 31), when at chapter N,
   * calling prevChapter() should navigate to chapter N-1.
   */
  test('Property 2.3: prevChapter 应正确导航到上一章', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 2, max: 31 }),
        (chapterNumber) => {
          // First navigate to the chapter
          NavigationSystem.goToChapter(chapterNumber);
          
          // Verify we're at the correct chapter
          expect(NavigationSystem.getCurrentChapter().number).toBe(chapterNumber);
          
          // Navigate to previous chapter
          NavigationSystem.prevChapter();
          
          // Verify we're now at chapter N-1
          const currentChapter = NavigationSystem.getCurrentChapter();
          expect(currentChapter.number).toBe(chapterNumber - 1);
          
          // Verify the chapter data is correct
          const expectedChapter = CHAPTERS_DATA.find(ch => ch.number === chapterNumber - 1);
          expect(currentChapter.title).toBe(expectedChapter.title);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 2.4: nextChapter 正确导航到下一章
   * **Validates: Requirements 2.5**
   * 
   * For any chapter number N (1 ≤ N ≤ 30), when at chapter N,
   * calling nextChapter() should navigate to chapter N+1.
   */
  test('Property 2.4: nextChapter 应正确导航到下一章', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 30 }),
        (chapterNumber) => {
          // First navigate to the chapter
          NavigationSystem.goToChapter(chapterNumber);
          
          // Verify we're at the correct chapter
          expect(NavigationSystem.getCurrentChapter().number).toBe(chapterNumber);
          
          // Navigate to next chapter
          NavigationSystem.nextChapter();
          
          // Verify we're now at chapter N+1
          const currentChapter = NavigationSystem.getCurrentChapter();
          expect(currentChapter.number).toBe(chapterNumber + 1);
          
          // Verify the chapter data is correct
          const expectedChapter = CHAPTERS_DATA.find(ch => ch.number === chapterNumber + 1);
          expect(currentChapter.title).toBe(expectedChapter.title);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 2.5: 第一章时 prevChapter 不改变当前章节
   * **Validates: Requirements 2.5**
   * 
   * When at chapter 1, calling prevChapter() should not change the current chapter.
   */
  test('Property 2.5: 第一章时 prevChapter 不应改变当前章节', () => {
    fc.assert(
      fc.property(
        fc.constant(1),
        (chapterNumber) => {
          // Navigate to chapter 1
          NavigationSystem.goToChapter(chapterNumber);
          
          // Verify we're at chapter 1
          expect(NavigationSystem.getCurrentChapter().number).toBe(1);
          
          // Try to navigate to previous chapter
          NavigationSystem.prevChapter();
          
          // Should still be at chapter 1
          expect(NavigationSystem.getCurrentChapter().number).toBe(1);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 2.6: 最后一章时 nextChapter 不改变当前章节
   * **Validates: Requirements 2.5**
   * 
   * When at chapter 31, calling nextChapter() should not change the current chapter.
   */
  test('Property 2.6: 最后一章时 nextChapter 不应改变当前章节', () => {
    fc.assert(
      fc.property(
        fc.constant(31),
        (chapterNumber) => {
          // Navigate to chapter 31
          NavigationSystem.goToChapter(chapterNumber);
          
          // Verify we're at chapter 31
          expect(NavigationSystem.getCurrentChapter().number).toBe(31);
          
          // Try to navigate to next chapter
          NavigationSystem.nextChapter();
          
          // Should still be at chapter 31
          expect(NavigationSystem.getCurrentChapter().number).toBe(31);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 2.7: 连续导航序列正确性
   * **Validates: Requirements 2.2, 2.5**
   * 
   * For any starting chapter and sequence of prev/next operations,
   * the final chapter should be predictable and correct.
   */
  test('Property 2.7: 连续导航序列应产生正确的最终章节', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 31 }),
        fc.array(fc.constantFrom('prev', 'next'), { minLength: 1, maxLength: 20 }),
        (startChapter, operations) => {
          // Navigate to starting chapter
          NavigationSystem.goToChapter(startChapter);
          
          // Calculate expected final chapter
          let expectedChapter = startChapter;
          operations.forEach(op => {
            if (op === 'prev' && expectedChapter > 1) {
              expectedChapter--;
            } else if (op === 'next' && expectedChapter < 31) {
              expectedChapter++;
            }
          });
          
          // Apply operations
          operations.forEach(op => {
            if (op === 'prev') {
              NavigationSystem.prevChapter();
            } else {
              NavigationSystem.nextChapter();
            }
          });
          
          // Verify final chapter
          const currentChapter = NavigationSystem.getCurrentChapter();
          expect(currentChapter.number).toBe(expectedChapter);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 2.8: 无效章节编号处理
   * **Validates: Requirements 2.2**
   * 
   * For any invalid chapter number (< 1 or > 31), goToChapter should not
   * change the current chapter state.
   */
  test('Property 2.8: 无效章节编号不应改变当前章节', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 31 }),
        fc.oneof(
          fc.integer({ min: -100, max: 0 }),
          fc.integer({ min: 32, max: 100 })
        ),
        (validChapter, invalidChapter) => {
          // First navigate to a valid chapter
          NavigationSystem.goToChapter(validChapter);
          const chapterBefore = NavigationSystem.getCurrentChapter();
          
          // Try to navigate to invalid chapter
          NavigationSystem.goToChapter(invalidChapter);
          
          // Current chapter should remain unchanged
          const chapterAfter = NavigationSystem.getCurrentChapter();
          expect(chapterAfter.number).toBe(chapterBefore.number);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 2.9: 当前章节位置信息正确性
   * **Validates: Requirements 2.3**
   * 
   * For any chapter number N (1 ≤ N ≤ 31), after navigating to chapter N,
   * getCurrentChapter() should return chapter information that correctly
   * identifies it as "第N章".
   */
  test('Property 2.9: 当前章节位置信息应正确显示', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 31 }),
        (chapterNumber) => {
          // Navigate to the chapter
          NavigationSystem.goToChapter(chapterNumber);
          
          // Get current chapter
          const currentChapter = NavigationSystem.getCurrentChapter();
          
          // Verify chapter number for position display
          expect(currentChapter.number).toBe(chapterNumber);
          
          // The position info should be constructable as "第N章"
          const positionInfo = `第${currentChapter.number}章`;
          expect(positionInfo).toBe(`第${chapterNumber}章`);
          
          // Verify title is available for full position display
          expect(currentChapter.title).toBeDefined();
          expect(currentChapter.title.length).toBeGreaterThan(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 2.10: 从任意章节导航到任意章节
   * **Validates: Requirements 2.2**
   * 
   * For any two chapter numbers A and B (1 ≤ A, B ≤ 31),
   * navigating from A to B should correctly set the current chapter to B.
   */
  test('Property 2.10: 从任意章节导航到任意章节应正确', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 31 }),
        fc.integer({ min: 1, max: 31 }),
        (chapterA, chapterB) => {
          // Navigate to chapter A first
          NavigationSystem.goToChapter(chapterA);
          expect(NavigationSystem.getCurrentChapter().number).toBe(chapterA);
          
          // Navigate to chapter B
          NavigationSystem.goToChapter(chapterB);
          expect(NavigationSystem.getCurrentChapter().number).toBe(chapterB);
          
          // Verify chapter B data is correct
          const expectedChapter = CHAPTERS_DATA.find(ch => ch.number === chapterB);
          const currentChapter = NavigationSystem.getCurrentChapter();
          expect(currentChapter.title).toBe(expectedChapter.title);
          expect(currentChapter.section).toBe(expectedChapter.section);
        }
      ),
      { numRuns: 100 }
    );
  });
});
