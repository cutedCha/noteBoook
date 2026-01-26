/**
 * storage.js - 本地存储管理模块
 * 管理阅读进度的本地存储
 * Requirements: 7.1, 7.2, 7.3, 7.4, 7.5
 */

// 存储键名
const STORAGE_KEYS = {
  PROGRESS: 'graphics_tutorial_progress',
  READ_CHAPTERS: 'graphics_tutorial_read_chapters',
  LAST_READ_TIME: 'graphics_tutorial_last_read_time'
};

// 存储管理器
const StorageManager = {
  /**
   * 检查本地存储是否可用
   * @returns {boolean} 是否可用
   */
  isAvailable: function() {
    try {
      const test = '__storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (e) {
      return false;
    }
  },
  
  /**
   * 保存阅读进度
   * @param {number} chapterNumber - 章节编号
   * @param {number} pageNumber - 页码
   */
  saveProgress: function(chapterNumber, pageNumber) {
    if (!this.isAvailable()) {
      console.warn('本地存储不可用');
      return;
    }
    
    try {
      const progress = {
        chapter: chapterNumber,
        page: pageNumber,
        timestamp: Date.now()
      };
      localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(progress));
      localStorage.setItem(STORAGE_KEYS.LAST_READ_TIME, Date.now().toString());
    } catch (e) {
      console.error('保存阅读进度失败:', e);
    }
  },
  
  /**
   * 获取阅读进度
   * @returns {Object|null} 阅读进度对象 {chapter, page, timestamp}
   */
  getProgress: function() {
    if (!this.isAvailable()) {
      return null;
    }
    
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PROGRESS);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.error('读取阅读进度失败:', e);
    }
    return null;
  },
  
  /**
   * 保存已读章节列表
   * @param {Array<number>} chapters - 已读章节编号数组
   */
  saveReadChapters: function(chapters) {
    if (!this.isAvailable()) {
      console.warn('本地存储不可用');
      return;
    }
    
    try {
      localStorage.setItem(STORAGE_KEYS.READ_CHAPTERS, JSON.stringify(chapters));
    } catch (e) {
      console.error('保存已读章节失败:', e);
    }
  },
  
  /**
   * 获取已读章节列表
   * @returns {Array<number>} 已读章节编号数组
   */
  getReadChapters: function() {
    if (!this.isAvailable()) {
      return [];
    }
    
    try {
      const data = localStorage.getItem(STORAGE_KEYS.READ_CHAPTERS);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.error('读取已读章节失败:', e);
    }
    return [];
  },
  
  /**
   * 获取最后阅读时间
   * @returns {number|null} 时间戳
   */
  getLastReadTime: function() {
    if (!this.isAvailable()) {
      return null;
    }
    
    try {
      const data = localStorage.getItem(STORAGE_KEYS.LAST_READ_TIME);
      if (data) {
        return parseInt(data, 10);
      }
    } catch (e) {
      console.error('读取最后阅读时间失败:', e);
    }
    return null;
  },
  
  /**
   * 清除所有数据
   */
  clearAll: function() {
    if (!this.isAvailable()) {
      return;
    }
    
    try {
      localStorage.removeItem(STORAGE_KEYS.PROGRESS);
      localStorage.removeItem(STORAGE_KEYS.READ_CHAPTERS);
      localStorage.removeItem(STORAGE_KEYS.LAST_READ_TIME);
    } catch (e) {
      console.error('清除存储数据失败:', e);
    }
  },
  
  /**
   * 检查是否有保存的阅读进度
   * @returns {boolean} 是否有进度
   */
  hasProgress: function() {
    const progress = this.getProgress();
    return progress !== null && progress.chapter !== undefined;
  }
};

// 导出供其他模块使用
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    STORAGE_KEYS,
    StorageManager
  };
}
