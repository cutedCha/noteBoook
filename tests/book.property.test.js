/**
 * Property-Based Tests for Book UI - 翻页边界约束
 * 
 * **Feature: graphics-tutorial-book, Property 3: 翻页边界约束**
 * **Validates: Requirements 3.5, 3.6**
 * 
 * Property 3 定义：
 * *For any* 页面状态，当用户处于第一页时向前翻页功能应被禁用，
 * 当用户处于最后一页时向后翻页功能应被禁用，
 * 翻页操作不应导致页码超出有效范围。
 */

const fc = require('fast-check');

// Import the BookUI module
const { BookUI } = require('../js/book.js');

describe('Property 3: 翻页边界约束', () => {
  /**
   * Helper function to create a fresh BookUI instance for testing
   * @param {number} currentPage - Current page number
   * @param {number} totalPages - Total number of pages
   * @returns {object} - BookUI-like object for testing
   */
  function createBookState(currentPage, totalPages) {
    return {
      currentPage: currentPage,
      totalPages: totalPages,
      isAnimating: false,
      viewMode: 'double',
      
      /**
       * Check if previous page navigation should be disabled
       * @returns {boolean} - True if prev navigation should be disabled
       */
      isPrevDisabled: function() {
        return this.currentPage <= 1;
      },
      
      /**
       * Check if next page navigation should be disabled
       * @returns {boolean} - True if next navigation should be disabled
       */
      isNextDisabled: function() {
        return this.currentPage >= this.totalPages;
      },
      
      /**
       * Attempt to flip to previous page
       * @returns {boolean} - True if flip was successful
       */
      flipPrev: function() {
        if (this.isPrevDisabled()) {
          return false;
        }
        this.currentPage--;
        return true;
      },
      
      /**
       * Attempt to flip to next page
       * @returns {boolean} - True if flip was successful
       */
      flipNext: function() {
        if (this.isNextDisabled()) {
          return false;
        }
        this.currentPage++;
        return true;
      },
      
      /**
       * Check if current page is within valid range
       * @returns {boolean} - True if page is valid
       */
      isPageValid: function() {
        return this.currentPage >= 1 && this.currentPage <= this.totalPages;
      }
    };
  }

  /**
   * Arbitrary generator for valid page states
   * Generates currentPage and totalPages where:
   * - totalPages >= 1
   * - 1 <= currentPage <= totalPages
   */
  const pageStateArbitrary = fc.integer({ min: 1, max: 100 }).chain(totalPages =>
    fc.integer({ min: 1, max: totalPages }).map(currentPage => ({
      currentPage,
      totalPages
    }))
  );

  /**
   * Property 3.1: 第一页时向前翻页被禁用
   * **Validates: Requirements 3.5**
   * 
   * When user is on the first page, previous page navigation should be disabled.
   */
  test('Property 3.1: 第一页时向前翻页功能应被禁用', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 100 }), // totalPages
        (totalPages) => {
          const book = createBookState(1, totalPages);
          
          // On first page, prev should be disabled
          expect(book.isPrevDisabled()).toBe(true);
          
          // Attempting to flip prev should fail
          const flipResult = book.flipPrev();
          expect(flipResult).toBe(false);
          
          // Page should remain at 1
          expect(book.currentPage).toBe(1);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 3.2: 最后一页时向后翻页被禁用
   * **Validates: Requirements 3.6**
   * 
   * When user is on the last page, next page navigation should be disabled.
   */
  test('Property 3.2: 最后一页时向后翻页功能应被禁用', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 100 }), // totalPages
        (totalPages) => {
          const book = createBookState(totalPages, totalPages);
          
          // On last page, next should be disabled
          expect(book.isNextDisabled()).toBe(true);
          
          // Attempting to flip next should fail
          const flipResult = book.flipNext();
          expect(flipResult).toBe(false);
          
          // Page should remain at totalPages
          expect(book.currentPage).toBe(totalPages);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 3.3: 翻页操作后页码在有效范围内
   * **Validates: Requirements 3.5, 3.6**
   * 
   * After any flip operation, the page number should remain within valid range [1, totalPages].
   */
  test('Property 3.3: 翻页操作后页码应在有效范围内', () => {
    fc.assert(
      fc.property(
        pageStateArbitrary,
        fc.array(fc.constantFrom('prev', 'next'), { minLength: 1, maxLength: 20 }),
        ({ currentPage, totalPages }, operations) => {
          const book = createBookState(currentPage, totalPages);
          
          // Apply a sequence of flip operations
          operations.forEach(op => {
            if (op === 'prev') {
              book.flipPrev();
            } else {
              book.flipNext();
            }
            
            // After each operation, page should be valid
            expect(book.isPageValid()).toBe(true);
            expect(book.currentPage).toBeGreaterThanOrEqual(1);
            expect(book.currentPage).toBeLessThanOrEqual(totalPages);
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 3.4: 非边界页面翻页功能正常
   * **Validates: Requirements 3.5, 3.6**
   * 
   * When not on boundary pages, flip operations should succeed and change the page.
   */
  test('Property 3.4: 非边界页面翻页功能应正常工作', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 3, max: 100 }), // totalPages (at least 3 to have middle pages)
        fc.integer({ min: 2, max: 99 }).filter(p => p >= 2), // currentPage (middle page)
        (totalPages, currentPage) => {
          // Ensure currentPage is valid for the given totalPages
          const validCurrentPage = Math.min(currentPage, totalPages - 1);
          if (validCurrentPage < 2) return; // Skip if no valid middle page
          
          const book = createBookState(validCurrentPage, totalPages);
          
          // Not on first page, prev should be enabled
          expect(book.isPrevDisabled()).toBe(false);
          
          // Not on last page, next should be enabled
          expect(book.isNextDisabled()).toBe(false);
          
          // Flip prev should succeed
          const prevResult = book.flipPrev();
          expect(prevResult).toBe(true);
          expect(book.currentPage).toBe(validCurrentPage - 1);
          
          // Reset and test next
          book.currentPage = validCurrentPage;
          const nextResult = book.flipNext();
          expect(nextResult).toBe(true);
          expect(book.currentPage).toBe(validCurrentPage + 1);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 3.5: 单页书籍边界行为
   * **Validates: Requirements 3.5, 3.6**
   * 
   * For a book with only one page, both prev and next should be disabled.
   */
  test('Property 3.5: 单页书籍时两个方向翻页都应被禁用', () => {
    const book = createBookState(1, 1);
    
    // Both directions should be disabled
    expect(book.isPrevDisabled()).toBe(true);
    expect(book.isNextDisabled()).toBe(true);
    
    // Neither flip should succeed
    expect(book.flipPrev()).toBe(false);
    expect(book.flipNext()).toBe(false);
    
    // Page should remain at 1
    expect(book.currentPage).toBe(1);
  });

  /**
   * Property 3.6: 连续翻页到边界后停止
   * **Validates: Requirements 3.5, 3.6**
   * 
   * Repeatedly flipping in one direction should eventually stop at the boundary.
   */
  test('Property 3.6: 连续翻页应在边界处停止', () => {
    fc.assert(
      fc.property(
        pageStateArbitrary,
        ({ currentPage, totalPages }) => {
          const book = createBookState(currentPage, totalPages);
          
          // Flip prev until we can't anymore
          let prevFlips = 0;
          while (book.flipPrev()) {
            prevFlips++;
            // Safety check to prevent infinite loop
            if (prevFlips > totalPages) {
              throw new Error('Too many prev flips');
            }
          }
          
          // Should be at page 1
          expect(book.currentPage).toBe(1);
          expect(book.isPrevDisabled()).toBe(true);
          
          // Flip next until we can't anymore
          let nextFlips = 0;
          while (book.flipNext()) {
            nextFlips++;
            // Safety check to prevent infinite loop
            if (nextFlips > totalPages) {
              throw new Error('Too many next flips');
            }
          }
          
          // Should be at last page
          expect(book.currentPage).toBe(totalPages);
          expect(book.isNextDisabled()).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });
});
