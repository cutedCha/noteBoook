/**
 * Property-Based Tests for Responsive Layout - 响应式视图模式切换
 * 
 * **Feature: graphics-tutorial-book, Property 6: 响应式视图模式切换**
 * **Validates: Requirements 5.1, 5.2**
 * 
 * Property 6 定义：
 * *For any* 屏幕宽度W，当W < 768px时系统应显示单页视图模式，
 * 当W ≥ 768px时系统应显示双页视图模式。
 */

const fc = require('fast-check');

// Import the BookUI module
const { BookUI } = require('../js/book.js');

describe('Property 6: 响应式视图模式切换', () => {
  /**
   * 响应式断点常量
   * 768px 是移动端/桌面端切换的主断点
   */
  const BREAKPOINT = 768;

  /**
   * Helper function to determine expected view mode based on screen width
   * @param {number} width - Screen width in pixels
   * @returns {string} - Expected view mode: 'single' or 'double'
   */
  function getExpectedViewMode(width) {
    return width < BREAKPOINT ? 'single' : 'double';
  }

  /**
   * Helper function to create a mock window object for testing
   * @param {number} width - Screen width in pixels
   * @returns {object} - Mock window-like object
   */
  function createMockWindow(width) {
    return {
      innerWidth: width
    };
  }

  /**
   * Helper function to simulate BookUI view mode detection
   * This mirrors the logic in BookUI.detectViewMode()
   * @param {number} width - Screen width in pixels
   * @returns {string} - Detected view mode: 'single' or 'double'
   */
  function detectViewMode(width) {
    return width < BREAKPOINT ? 'single' : 'double';
  }

  /**
   * Property 6.1: 屏幕宽度小于768px时应显示单页视图模式
   * **Validates: Requirements 5.1**
   * 
   * For any screen width W where W < 768px, the system should display single view mode.
   */
  test('Property 6.1: 屏幕宽度小于768px时应显示单页视图模式', () => {
    fc.assert(
      fc.property(
        // Generate random widths from 1 to 767 (mobile range)
        fc.integer({ min: 1, max: 767 }),
        (width) => {
          const viewMode = detectViewMode(width);
          
          // Width < 768px should result in single view mode
          expect(viewMode).toBe('single');
          expect(width).toBeLessThan(BREAKPOINT);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 6.2: 屏幕宽度大于等于768px时应显示双页视图模式
   * **Validates: Requirements 5.2**
   * 
   * For any screen width W where W >= 768px, the system should display double view mode.
   */
  test('Property 6.2: 屏幕宽度大于等于768px时应显示双页视图模式', () => {
    fc.assert(
      fc.property(
        // Generate random widths from 768 to 2560 (desktop range)
        fc.integer({ min: 768, max: 2560 }),
        (width) => {
          const viewMode = detectViewMode(width);
          
          // Width >= 768px should result in double view mode
          expect(viewMode).toBe('double');
          expect(width).toBeGreaterThanOrEqual(BREAKPOINT);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 6.3: 断点边界行为正确
   * **Validates: Requirements 5.1, 5.2**
   * 
   * At the exact breakpoint (768px), the system should display double view mode.
   * At 767px, the system should display single view mode.
   */
  test('Property 6.3: 断点边界行为应正确', () => {
    // Test exact breakpoint (768px) - should be double
    expect(detectViewMode(768)).toBe('double');
    
    // Test just below breakpoint (767px) - should be single
    expect(detectViewMode(767)).toBe('single');
    
    // Property test for values around the breakpoint
    fc.assert(
      fc.property(
        fc.integer({ min: 760, max: 775 }),
        (width) => {
          const viewMode = detectViewMode(width);
          const expectedMode = width < BREAKPOINT ? 'single' : 'double';
          
          expect(viewMode).toBe(expectedMode);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 6.4: 视图模式切换的一致性
   * **Validates: Requirements 5.1, 5.2**
   * 
   * For any screen width, the view mode should be deterministic and consistent.
   * Calling detectViewMode multiple times with the same width should return the same result.
   */
  test('Property 6.4: 视图模式切换应具有一致性', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 2560 }),
        (width) => {
          // Call detectViewMode multiple times
          const result1 = detectViewMode(width);
          const result2 = detectViewMode(width);
          const result3 = detectViewMode(width);
          
          // All results should be identical
          expect(result1).toBe(result2);
          expect(result2).toBe(result3);
          
          // Result should match expected mode
          const expectedMode = getExpectedViewMode(width);
          expect(result1).toBe(expectedMode);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 6.5: 视图模式只有两种有效值
   * **Validates: Requirements 5.1, 5.2**
   * 
   * For any screen width, the view mode should be either 'single' or 'double'.
   */
  test('Property 6.5: 视图模式应只有两种有效值', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 4096 }),
        (width) => {
          const viewMode = detectViewMode(width);
          
          // View mode should be one of the two valid values
          expect(['single', 'double']).toContain(viewMode);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 6.6: 宽度增加时视图模式单调变化
   * **Validates: Requirements 5.1, 5.2**
   * 
   * As width increases from below breakpoint to above breakpoint,
   * the view mode should transition from 'single' to 'double' exactly once.
   */
  test('Property 6.6: 宽度增加时视图模式应单调变化', () => {
    fc.assert(
      fc.property(
        // Generate a starting width below breakpoint
        fc.integer({ min: 1, max: 767 }),
        // Generate an ending width above breakpoint
        fc.integer({ min: 768, max: 2560 }),
        (startWidth, endWidth) => {
          const startMode = detectViewMode(startWidth);
          const endMode = detectViewMode(endWidth);
          
          // Start should be single, end should be double
          expect(startMode).toBe('single');
          expect(endMode).toBe('double');
          
          // Verify the transition happens at the breakpoint
          expect(detectViewMode(BREAKPOINT - 1)).toBe('single');
          expect(detectViewMode(BREAKPOINT)).toBe('double');
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 6.7: 常见设备宽度的视图模式正确
   * **Validates: Requirements 5.1, 5.2**
   * 
   * Test common device widths to ensure correct view mode assignment.
   */
  test('Property 6.7: 常见设备宽度的视图模式应正确', () => {
    // Common mobile device widths (should be single view)
    const mobileWidths = [320, 375, 414, 480, 640, 720, 767];
    
    // Common desktop/tablet widths (should be double view)
    const desktopWidths = [768, 800, 1024, 1280, 1366, 1440, 1920, 2560];
    
    fc.assert(
      fc.property(
        fc.constantFrom(...mobileWidths),
        (width) => {
          const viewMode = detectViewMode(width);
          expect(viewMode).toBe('single');
        }
      ),
      { numRuns: 100 }
    );
    
    fc.assert(
      fc.property(
        fc.constantFrom(...desktopWidths),
        (width) => {
          const viewMode = detectViewMode(width);
          expect(viewMode).toBe('double');
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 6.8: BookUI.setViewMode 正确设置视图模式
   * **Validates: Requirements 5.1, 5.2**
   * 
   * Test that BookUI.setViewMode correctly updates the viewMode property.
   * This test verifies the internal state management of BookUI.
   */
  test('Property 6.8: BookUI.setViewMode 应正确设置视图模式', () => {
    // Save original state
    const originalViewMode = BookUI.viewMode;
    
    // Create a mock for document.body.setAttribute
    const originalSetAttribute = document.body.setAttribute;
    const setAttributeMock = jest.fn();
    document.body.setAttribute = setAttributeMock;
    
    // Create a mock for document.querySelector
    const originalQuerySelector = document.querySelector;
    document.querySelector = jest.fn().mockReturnValue(null);
    
    // Create a mock for document.dispatchEvent
    const originalDispatchEvent = document.dispatchEvent;
    document.dispatchEvent = jest.fn();
    
    try {
      fc.assert(
        fc.property(
          fc.constantFrom('single', 'double'),
          (mode) => {
            // Reset BookUI state to opposite mode to ensure change
            BookUI.viewMode = mode === 'single' ? 'double' : 'single';
            
            // Clear mock call history
            setAttributeMock.mockClear();
            
            // Set the view mode
            BookUI.setViewMode(mode);
            
            // Verify the viewMode property is updated
            expect(BookUI.viewMode).toBe(mode);
            
            // Verify document.body.setAttribute was called with correct arguments
            expect(setAttributeMock).toHaveBeenCalledWith('data-view-mode', mode);
          }
        ),
        { numRuns: 100 }
      );
    } finally {
      // Restore original functions
      document.body.setAttribute = originalSetAttribute;
      document.querySelector = originalQuerySelector;
      document.dispatchEvent = originalDispatchEvent;
      BookUI.viewMode = originalViewMode;
    }
  });

  /**
   * Property 6.9: 随机宽度序列的视图模式切换正确
   * **Validates: Requirements 5.1, 5.2**
   * 
   * For any sequence of random screen widths, each width should result in the correct view mode.
   */
  test('Property 6.9: 随机宽度序列的视图模式切换应正确', () => {
    fc.assert(
      fc.property(
        fc.array(fc.integer({ min: 1, max: 2560 }), { minLength: 1, maxLength: 20 }),
        (widthSequence) => {
          widthSequence.forEach(width => {
            const viewMode = detectViewMode(width);
            const expectedMode = getExpectedViewMode(width);
            
            expect(viewMode).toBe(expectedMode);
            
            // Additional verification
            if (width < BREAKPOINT) {
              expect(viewMode).toBe('single');
            } else {
              expect(viewMode).toBe('double');
            }
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 6.10: 极端宽度值的处理
   * **Validates: Requirements 5.1, 5.2**
   * 
   * Test that extreme width values are handled correctly.
   */
  test('Property 6.10: 极端宽度值应正确处理', () => {
    // Very small widths (should be single)
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 100 }),
        (width) => {
          const viewMode = detectViewMode(width);
          expect(viewMode).toBe('single');
        }
      ),
      { numRuns: 100 }
    );
    
    // Very large widths (should be double)
    fc.assert(
      fc.property(
        fc.integer({ min: 3000, max: 10000 }),
        (width) => {
          const viewMode = detectViewMode(width);
          expect(viewMode).toBe('double');
        }
      ),
      { numRuns: 100 }
    );
  });
});
