/**
 * Property-Based Tests for Storage Manager - 阅读进度保存与恢复一致性
 * 
 * **Feature: graphics-tutorial-book, Property 9: 阅读进度保存与恢复一致性**
 * **Validates: Requirements 7.1, 7.3**
 * 
 * Property 9 定义：
 * *For any* 阅读状态（章节N，页码P），保存到本地存储后再读取，
 * 应能恢复到完全相同的阅读位置（章节N，页码P）。
 */

const fc = require('fast-check');

// Import the storage module
const { StorageManager, STORAGE_KEYS } = require('../js/storage.js');

describe('Property 9: 阅读进度保存与恢复一致性（Round-trip）', () => {
  /**
   * Mock localStorage for testing
   */
  let mockStorage = {};
  
  beforeEach(() => {
    // Reset mock storage before each test
    mockStorage = {};
    
    // Mock localStorage
    const localStorageMock = {
      getItem: jest.fn((key) => mockStorage[key] || null),
      setItem: jest.fn((key, value) => {
        mockStorage[key] = value;
      }),
      removeItem: jest.fn((key) => {
        delete mockStorage[key];
      }),
      clear: jest.fn(() => {
        mockStorage = {};
      })
    };
    
    Object.defineProperty(global, 'localStorage', {
      value: localStorageMock,
      writable: true
    });
  });

  afterEach(() => {
    // Clean up
    mockStorage = {};
  });

  /**
   * Arbitrary generator for valid chapter numbers (1-31)
   */
  const chapterArbitrary = fc.integer({ min: 1, max: 31 });

  /**
   * Arbitrary generator for valid page numbers (1-100)
   */
  const pageArbitrary = fc.integer({ min: 1, max: 100 });

  /**
   * Property 9.1: 保存后读取章节编号一致
   * **Validates: Requirements 7.1, 7.3**
   * 
   * For any chapter number N (1-31), after saving and retrieving,
   * the chapter number should be exactly N.
   */
  test('Property 9.1: 保存后读取章节编号应一致', () => {
    fc.assert(
      fc.property(
        chapterArbitrary,
        pageArbitrary,
        (chapter, page) => {
          // Clear any existing data
          StorageManager.clearAll();
          
          // Save progress
          StorageManager.saveProgress(chapter, page);
          
          // Retrieve progress
          const retrieved = StorageManager.getProgress();
          
          // Chapter should match exactly
          expect(retrieved.chapter).toBe(chapter);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 9.2: 保存后读取页码一致
   * **Validates: Requirements 7.1, 7.3**
   * 
   * For any page number P (1-100), after saving and retrieving,
   * the page number should be exactly P.
   */
  test('Property 9.2: 保存后读取页码应一致', () => {
    fc.assert(
      fc.property(
        chapterArbitrary,
        pageArbitrary,
        (chapter, page) => {
          // Clear any existing data
          StorageManager.clearAll();
          
          // Save progress
          StorageManager.saveProgress(chapter, page);
          
          // Retrieve progress
          const retrieved = StorageManager.getProgress();
          
          // Page should match exactly
          expect(retrieved.page).toBe(page);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 9.3: 完整Round-trip一致性
   * **Validates: Requirements 7.1, 7.3**
   * 
   * For any (chapter, page) pair, the complete round-trip should preserve both values.
   */
  test('Property 9.3: 完整Round-trip应一致', () => {
    fc.assert(
      fc.property(
        chapterArbitrary,
        pageArbitrary,
        (chapter, page) => {
          // Clear any existing data
          StorageManager.clearAll();
          
          // Save progress
          StorageManager.saveProgress(chapter, page);
          
          // Retrieve progress
          const retrieved = StorageManager.getProgress();
          
          // Both values should match
          expect(retrieved).toEqual({ chapter, page });
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 9.4: 多次保存后读取最新值
   * **Validates: Requirements 7.1, 7.3**
   * 
   * After multiple saves, the retrieved value should be the last saved value.
   */
  test('Property 9.4: 多次保存后应读取最新值', () => {
    fc.assert(
      fc.property(
        fc.array(fc.tuple(chapterArbitrary, pageArbitrary), { minLength: 2, maxLength: 10 }),
        (progressList) => {
          // Clear any existing data
          StorageManager.clearAll();
          
          // Save multiple progress values
          progressList.forEach(([chapter, page]) => {
            StorageManager.saveProgress(chapter, page);
          });
          
          // Get the last saved value
          const lastProgress = progressList[progressList.length - 1];
          
          // Retrieve progress
          const retrieved = StorageManager.getProgress();
          
          // Should match the last saved value
          expect(retrieved.chapter).toBe(lastProgress[0]);
          expect(retrieved.page).toBe(lastProgress[1]);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 9.5: 边界章节编号Round-trip一致
   * **Validates: Requirements 7.1, 7.3**
   * 
   * Boundary chapter numbers (1 and 31) should round-trip correctly.
   */
  test('Property 9.5: 边界章节编号Round-trip应一致', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(1, 31), // Boundary chapter numbers
        pageArbitrary,
        (chapter, page) => {
          // Clear any existing data
          StorageManager.clearAll();
          
          // Save progress
          StorageManager.saveProgress(chapter, page);
          
          // Retrieve progress
          const retrieved = StorageManager.getProgress();
          
          // Should match exactly
          expect(retrieved.chapter).toBe(chapter);
          expect(retrieved.page).toBe(page);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 9.6: 边界页码Round-trip一致
   * **Validates: Requirements 7.1, 7.3**
   * 
   * Boundary page numbers (1 and 100) should round-trip correctly.
   */
  test('Property 9.6: 边界页码Round-trip应一致', () => {
    fc.assert(
      fc.property(
        chapterArbitrary,
        fc.constantFrom(1, 100), // Boundary page numbers
        (chapter, page) => {
          // Clear any existing data
          StorageManager.clearAll();
          
          // Save progress
          StorageManager.saveProgress(chapter, page);
          
          // Retrieve progress
          const retrieved = StorageManager.getProgress();
          
          // Should match exactly
          expect(retrieved.chapter).toBe(chapter);
          expect(retrieved.page).toBe(page);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 9.7: 清除后应返回默认值
   * **Validates: Requirements 7.1, 7.3**
   * 
   * After clearing storage, getProgress should return default values.
   */
  test('Property 9.7: 清除后应返回默认值', () => {
    fc.assert(
      fc.property(
        chapterArbitrary,
        pageArbitrary,
        (chapter, page) => {
          // Save some progress first
          StorageManager.saveProgress(chapter, page);
          
          // Clear all data
          StorageManager.clearAll();
          
          // Retrieve progress
          const retrieved = StorageManager.getProgress();
          
          // Should return default values
          expect(retrieved.chapter).toBe(1);
          expect(retrieved.page).toBe(1);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 9.8: 数据类型应保持一致
   * **Validates: Requirements 7.1, 7.3**
   * 
   * Retrieved values should be numbers, not strings.
   */
  test('Property 9.8: 数据类型应保持一致', () => {
    fc.assert(
      fc.property(
        chapterArbitrary,
        pageArbitrary,
        (chapter, page) => {
          // Clear any existing data
          StorageManager.clearAll();
          
          // Save progress
          StorageManager.saveProgress(chapter, page);
          
          // Retrieve progress
          const retrieved = StorageManager.getProgress();
          
          // Values should be numbers
          expect(typeof retrieved.chapter).toBe('number');
          expect(typeof retrieved.page).toBe('number');
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 9.9: hasProgress应正确反映存储状态
   * **Validates: Requirements 7.1, 7.3**
   * 
   * hasProgress should return true after saving and false after clearing.
   */
  test('Property 9.9: hasProgress应正确反映存储状态', () => {
    fc.assert(
      fc.property(
        chapterArbitrary,
        pageArbitrary,
        (chapter, page) => {
          // Clear first
          StorageManager.clearAll();
          
          // Should be false initially
          expect(StorageManager.hasProgress()).toBe(false);
          
          // Save progress
          StorageManager.saveProgress(chapter, page);
          
          // Should be true after saving
          expect(StorageManager.hasProgress()).toBe(true);
          
          // Clear again
          StorageManager.clearAll();
          
          // Should be false after clearing
          expect(StorageManager.hasProgress()).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });
});


/**
 * Property-Based Tests for Storage Manager - 已读章节标记
 * 
 * **Feature: graphics-tutorial-book, Property 10: 已读章节标记**
 * **Validates: Requirements 7.4, 7.5**
 * 
 * Property 10 定义：
 * *For any* 章节，当用户完成阅读后，该章节应被标记为已读，
 * 且在目录中应显示已读标记，刷新页面后已读状态应保持不变。
 */

describe('Property 10: 已读章节标记', () => {
  /**
   * Mock localStorage for testing
   */
  let mockStorage = {};
  
  beforeEach(() => {
    // Reset mock storage before each test
    mockStorage = {};
    
    // Mock localStorage
    const localStorageMock = {
      getItem: jest.fn((key) => mockStorage[key] || null),
      setItem: jest.fn((key, value) => {
        mockStorage[key] = value;
      }),
      removeItem: jest.fn((key) => {
        delete mockStorage[key];
      }),
      clear: jest.fn(() => {
        mockStorage = {};
      })
    };
    
    Object.defineProperty(global, 'localStorage', {
      value: localStorageMock,
      writable: true
    });
  });

  afterEach(() => {
    // Clean up
    mockStorage = {};
  });

  /**
   * Arbitrary generator for valid chapter numbers (1-31)
   */
  const chapterArbitrary = fc.integer({ min: 1, max: 31 });

  /**
   * Arbitrary generator for arrays of unique chapter numbers (1-31)
   * Simulates a list of read chapters
   */
  const readChaptersArbitrary = fc.uniqueArray(chapterArbitrary, { minLength: 0, maxLength: 31 });

  /**
   * Property 10.1: 已读章节列表Round-trip一致
   * **Validates: Requirements 7.4, 7.5**
   * 
   * For any list of read chapters, after saving and retrieving,
   * the read chapters list should contain exactly the same values.
   */
  test('Property 10.1: 已读章节列表Round-trip应一致', () => {
    fc.assert(
      fc.property(
        readChaptersArbitrary,
        (chapters) => {
          // Clear any existing data
          StorageManager.clearAll();
          
          // Save read chapters
          StorageManager.saveReadChapters(chapters);
          
          // Retrieve read chapters
          const retrieved = StorageManager.getReadChapters();
          
          // Sort both for comparison
          const sortedOriginal = [...chapters].sort((a, b) => a - b);
          const sortedRetrieved = [...retrieved].sort((a, b) => a - b);
          
          // Should contain the same values
          expect(sortedRetrieved).toEqual(sortedOriginal);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 10.2: 空已读列表Round-trip一致
   * **Validates: Requirements 7.4, 7.5**
   * 
   * An empty read chapters list should round-trip correctly.
   */
  test('Property 10.2: 空已读列表Round-trip应一致', () => {
    fc.assert(
      fc.property(
        fc.constant([]),
        (chapters) => {
          // Clear any existing data
          StorageManager.clearAll();
          
          // Save empty read chapters
          StorageManager.saveReadChapters(chapters);
          
          // Retrieve read chapters
          const retrieved = StorageManager.getReadChapters();
          
          // Should be empty array
          expect(retrieved).toEqual([]);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 10.3: 单个章节标记为已读后应出现在已读列表
   * **Validates: Requirements 7.4, 7.5**
   * 
   * When a chapter is marked as read, it should appear in the read chapters list.
   */
  test('Property 10.3: 单个章节标记为已读后应出现在已读列表', () => {
    fc.assert(
      fc.property(
        chapterArbitrary,
        (chapter) => {
          // Clear any existing data
          StorageManager.clearAll();
          
          // Mark chapter as read
          StorageManager.saveReadChapters([chapter]);
          
          // Retrieve read chapters
          const retrieved = StorageManager.getReadChapters();
          
          // Should contain the chapter
          expect(retrieved).toContain(chapter);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 10.4: 已读章节数量应保持一致
   * **Validates: Requirements 7.4, 7.5**
   * 
   * The number of read chapters should be preserved after round-trip.
   */
  test('Property 10.4: 已读章节数量应保持一致', () => {
    fc.assert(
      fc.property(
        readChaptersArbitrary,
        (chapters) => {
          // Clear any existing data
          StorageManager.clearAll();
          
          // Save read chapters
          StorageManager.saveReadChapters(chapters);
          
          // Retrieve read chapters
          const retrieved = StorageManager.getReadChapters();
          
          // Count should match
          expect(retrieved.length).toBe(chapters.length);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 10.5: 清除后已读列表应为空
   * **Validates: Requirements 7.4, 7.5**
   * 
   * After clearing storage, getReadChapters should return empty array.
   */
  test('Property 10.5: 清除后已读列表应为空', () => {
    fc.assert(
      fc.property(
        readChaptersArbitrary,
        (chapters) => {
          // Save some read chapters first
          StorageManager.saveReadChapters(chapters);
          
          // Clear all data
          StorageManager.clearAll();
          
          // Retrieve read chapters
          const retrieved = StorageManager.getReadChapters();
          
          // Should be empty
          expect(retrieved).toEqual([]);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 10.6: 所有31章全部已读Round-trip应一致
   * **Validates: Requirements 7.4, 7.5**
   * 
   * When all 31 chapters are marked as read, they should all be preserved.
   */
  test('Property 10.6: 所有31章全部已读Round-trip应一致', () => {
    fc.assert(
      fc.property(
        fc.constant(Array.from({ length: 31 }, (_, i) => i + 1)),
        (chapters) => {
          // Clear any existing data
          StorageManager.clearAll();
          
          // Save all 31 chapters as read
          StorageManager.saveReadChapters(chapters);
          
          // Retrieve read chapters
          const retrieved = StorageManager.getReadChapters();
          
          // Should contain all 31 chapters
          expect(retrieved).toHaveLength(31);
          
          const sortedRetrieved = [...retrieved].sort((a, b) => a - b);
          expect(sortedRetrieved).toEqual(chapters);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 10.7: 已读章节数据类型应保持一致
   * **Validates: Requirements 7.4, 7.5**
   * 
   * Retrieved chapter numbers should be numbers, not strings.
   */
  test('Property 10.7: 已读章节数据类型应保持一致', () => {
    fc.assert(
      fc.property(
        readChaptersArbitrary.filter(arr => arr.length > 0),
        (chapters) => {
          // Clear any existing data
          StorageManager.clearAll();
          
          // Save read chapters
          StorageManager.saveReadChapters(chapters);
          
          // Retrieve read chapters
          const retrieved = StorageManager.getReadChapters();
          
          // All values should be numbers
          retrieved.forEach(ch => {
            expect(typeof ch).toBe('number');
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 10.8: 重复章节应被去重
   * **Validates: Requirements 7.4, 7.5**
   * 
   * Duplicate chapter numbers should be deduplicated.
   */
  test('Property 10.8: 重复章节应被去重', () => {
    fc.assert(
      fc.property(
        fc.array(chapterArbitrary, { minLength: 1, maxLength: 50 }),
        (chapters) => {
          // Clear any existing data
          StorageManager.clearAll();
          
          // Save read chapters (may contain duplicates)
          StorageManager.saveReadChapters(chapters);
          
          // Retrieve read chapters
          const retrieved = StorageManager.getReadChapters();
          
          // Should have no duplicates
          const uniqueSet = new Set(retrieved);
          expect(retrieved.length).toBe(uniqueSet.size);
          
          // Should contain all unique values from original
          const originalUnique = [...new Set(chapters)];
          originalUnique.forEach(ch => {
            expect(retrieved).toContain(ch);
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 10.9: 随机顺序章节列表Round-trip应一致
   * **Validates: Requirements 7.4, 7.5**
   * 
   * Chapter numbers in any order should be preserved after round-trip.
   */
  test('Property 10.9: 随机顺序章节列表Round-trip应一致', () => {
    fc.assert(
      fc.property(
        fc.shuffledSubarray(Array.from({ length: 31 }, (_, i) => i + 1)),
        (chapters) => {
          // Clear any existing data
          StorageManager.clearAll();
          
          // Save read chapters in random order
          StorageManager.saveReadChapters(chapters);
          
          // Retrieve read chapters
          const retrieved = StorageManager.getReadChapters();
          
          // Sort both for comparison
          const sortedOriginal = [...chapters].sort((a, b) => a - b);
          const sortedRetrieved = [...retrieved].sort((a, b) => a - b);
          
          // Should contain the same values
          expect(sortedRetrieved).toEqual(sortedOriginal);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 10.10: 进度和已读章节独立存储
   * **Validates: Requirements 7.1, 7.3, 7.4, 7.5**
   * 
   * Progress and read chapters should be stored independently.
   */
  test('Property 10.10: 进度和已读章节应独立存储', () => {
    fc.assert(
      fc.property(
        readChaptersArbitrary,
        fc.integer({ min: 1, max: 31 }),
        fc.integer({ min: 1, max: 100 }),
        (readChapters, progressChapter, progressPage) => {
          // Clear any existing data
          StorageManager.clearAll();
          
          // Save both progress and read chapters
          StorageManager.saveProgress(progressChapter, progressPage);
          StorageManager.saveReadChapters(readChapters);
          
          // Retrieve both
          const retrievedProgress = StorageManager.getProgress();
          const retrievedReadChapters = StorageManager.getReadChapters();
          
          // Progress should be correct
          expect(retrievedProgress.chapter).toBe(progressChapter);
          expect(retrievedProgress.page).toBe(progressPage);
          
          // Read chapters should be correct
          const sortedOriginal = [...readChapters].sort((a, b) => a - b);
          const sortedRetrieved = [...retrievedReadChapters].sort((a, b) => a - b);
          expect(sortedRetrieved).toEqual(sortedOriginal);
        }
      ),
      { numRuns: 100 }
    );
  });
});
