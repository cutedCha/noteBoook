/**
 * 目录渲染单元测试
 * 验证目录内容能正确生成
 */

// 导入章节数据
const { CHAPTERS_DATA, SECTION_ORDER } = require('../js/navigation.js');

describe('目录渲染测试', () => {
  
  test('CHAPTERS_DATA 应该包含 31 个章节', () => {
    expect(CHAPTERS_DATA).toBeDefined();
    expect(CHAPTERS_DATA.length).toBe(31);
  });
  
  test('每个章节应该有必要的属性', () => {
    CHAPTERS_DATA.forEach((chapter, index) => {
      expect(chapter.number).toBe(index + 1);
      expect(chapter.title).toBeDefined();
      expect(typeof chapter.title).toBe('string');
      expect(chapter.title.length).toBeGreaterThan(0);
      expect(chapter.section).toBeDefined();
    });
  });
  
  test('章节应该正确分组到各个分类', () => {
    const sections = {};
    CHAPTERS_DATA.forEach(chapter => {
      if (!sections[chapter.section]) {
        sections[chapter.section] = [];
      }
      sections[chapter.section].push(chapter);
    });
    
    // 验证分类存在
    expect(sections['基础概念篇']).toBeDefined();
    expect(sections['效果原理篇']).toBeDefined();
    expect(sections['进阶概念篇']).toBeDefined();
    expect(sections['数学篇']).toBeDefined();
    expect(sections['哲学彩蛋篇']).toBeDefined();
    
    // 验证章节数量
    expect(sections['基础概念篇'].length).toBe(11);
    expect(sections['效果原理篇'].length).toBe(11);
    expect(sections['进阶概念篇'].length).toBe(4);
    expect(sections['数学篇'].length).toBe(3);
    expect(sections['哲学彩蛋篇'].length).toBe(2);
  });
  
  test('SECTION_ORDER 应该包含所有分类', () => {
    expect(SECTION_ORDER).toBeDefined();
    expect(SECTION_ORDER.length).toBe(5);
    expect(SECTION_ORDER).toContain('基础概念篇');
    expect(SECTION_ORDER).toContain('效果原理篇');
    expect(SECTION_ORDER).toContain('进阶概念篇');
    expect(SECTION_ORDER).toContain('数学篇');
    expect(SECTION_ORDER).toContain('哲学彩蛋篇');
  });
  
  test('生成目录 HTML 的逻辑应该正确', () => {
    // 模拟 renderTableOfContents 函数的核心逻辑
    const sections = {};
    CHAPTERS_DATA.forEach(chapter => {
      if (!sections[chapter.section]) {
        sections[chapter.section] = [];
      }
      sections[chapter.section].push(chapter);
    });
    
    const sectionOrder = [
      '基础概念篇',
      '效果原理篇',
      '进阶概念篇',
      '数学篇',
      '哲学彩蛋篇'
    ];
    
    let htmlParts = [];
    
    // 渲染各分类
    sectionOrder.forEach(sectionName => {
      const chapters = sections[sectionName];
      if (!chapters) return;
      
      let sectionHtml = `<div class="toc-section">`;
      sectionHtml += `<h3 class="toc-section-title">${sectionName}</h3>`;
      sectionHtml += `<ul class="toc-chapter-list">`;
      
      chapters.forEach(chapter => {
        sectionHtml += `<li class="toc-chapter-item">`;
        sectionHtml += `<a class="toc-chapter-link" href="#" data-chapter="${chapter.number}">`;
        sectionHtml += `<span class="toc-chapter-number">第${chapter.number}章</span>`;
        sectionHtml += `<span class="toc-chapter-title">${chapter.title}</span>`;
        if (chapter.subtitle) {
          sectionHtml += `<span class="toc-chapter-subtitle">${chapter.subtitle}</span>`;
        }
        sectionHtml += `</a></li>`;
      });
      
      sectionHtml += `</ul></div>`;
      htmlParts.push(sectionHtml);
    });
    
    const fullHtml = htmlParts.join('');
    
    // 验证生成的 HTML
    expect(htmlParts.length).toBe(5); // 5 个分类
    expect(fullHtml.length).toBeGreaterThan(1000);
    
    // 验证包含所有章节
    for (let i = 1; i <= 31; i++) {
      expect(fullHtml).toContain(`data-chapter="${i}"`);
      expect(fullHtml).toContain(`第${i}章`);
    }
    
    // 验证包含所有分类标题
    sectionOrder.forEach(sectionName => {
      expect(fullHtml).toContain(sectionName);
    });
    
    // 验证第一章标题
    expect(fullHtml).toContain('眼睛如何看世界');
    
    console.log('生成的 HTML 长度:', fullHtml.length);
  });
  
  test('第一章数据应该正确', () => {
    const chapter1 = CHAPTERS_DATA[0];
    expect(chapter1.number).toBe(1);
    expect(chapter1.title).toBe('眼睛如何看世界');
    expect(chapter1.subtitle).toBe('透镜成像原理，眼睛里呈现的是倒像');
    expect(chapter1.section).toBe('基础概念篇');
  });
  
  test('最后一章数据应该正确', () => {
    const chapter31 = CHAPTERS_DATA[30];
    expect(chapter31.number).toBe(31);
    expect(chapter31.title).toBe('一生二，二生三，三生万物');
    expect(chapter31.section).toBe('哲学彩蛋篇');
  });
});
