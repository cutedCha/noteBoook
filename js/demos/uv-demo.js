/**
 * UV坐标可视化交互演示
 * 第19章：UV是什么
 * 展示UV坐标的真面目 - 经典的红绿渐变图
 */

const UVDemo = {
  canvas: null,
  ctx: null,
  
  // 画布尺寸
  width: 200,
  height: 200,
  
  // UV参数
  tiling: 1,
  offsetU: 0,
  offsetV: 0,
  
  /**
   * 初始化演示
   */
  init: function() {
    this.canvas = document.getElementById('uvCanvas');
    if (!this.canvas) return false;
    
    this.ctx = this.canvas.getContext('2d');
    this.width = this.canvas.width;
    this.height = this.canvas.height;
    
    this.bindControls();
    this.render();
    
    return true;
  },
  
  /**
   * 渲染UV图
   */
  render: function() {
    const imageData = this.ctx.createImageData(this.width, this.height);
    const data = imageData.data;
    
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        // 计算基础UV (0-1)
        let u = x / this.width;
        let v = 1 - y / this.height;  // 翻转V，让底部是0，顶部是1
        
        // 应用平铺和偏移
        u = (u * this.tiling + this.offsetU) % 1;
        v = (v * this.tiling + this.offsetV) % 1;
        
        // 处理负数取模
        if (u < 0) u += 1;
        if (v < 0) v += 1;
        
        // UV映射到颜色：U→红，V→绿
        const r = Math.floor(u * 255);
        const g = Math.floor(v * 255);
        const b = 0;
        
        const idx = (y * this.width + x) * 4;
        data[idx] = r;
        data[idx + 1] = g;
        data[idx + 2] = b;
        data[idx + 3] = 255;
      }
    }
    
    this.ctx.putImageData(imageData, 0, 0);
    
    // 绘制网格线（可选）
    this.drawGrid();
  },
  
  /**
   * 绘制UV网格线
   */
  drawGrid: function() {
    const ctx = this.ctx;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 1;
    
    const gridCount = this.tiling * 4;  // 每个UV单元4条线
    
    // 垂直线
    for (let i = 1; i < gridCount; i++) {
      const x = (i / gridCount) * this.width;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, this.height);
      ctx.stroke();
    }
    
    // 水平线
    for (let i = 1; i < gridCount; i++) {
      const y = (i / gridCount) * this.height;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(this.width, y);
      ctx.stroke();
    }
  },
  
  /**
   * 绑定控件
   */
  bindControls: function() {
    const self = this;
    
    // 平铺滑块
    const tilingSlider = document.getElementById('uvTiling');
    const tilingValue = document.getElementById('uvTilingValue');
    if (tilingSlider) {
      tilingSlider.addEventListener('input', function() {
        self.tiling = parseInt(this.value);
        if (tilingValue) tilingValue.textContent = self.tiling + 'x';
        self.render();
      });
    }
    
    // U偏移滑块
    const offsetUSlider = document.getElementById('uvOffsetU');
    const offsetUValue = document.getElementById('uvOffsetUValue');
    if (offsetUSlider) {
      offsetUSlider.addEventListener('input', function() {
        self.offsetU = parseFloat(this.value);
        if (offsetUValue) offsetUValue.textContent = self.offsetU.toFixed(2);
        self.render();
      });
    }
    
    // V偏移滑块
    const offsetVSlider = document.getElementById('uvOffsetV');
    const offsetVValue = document.getElementById('uvOffsetVValue');
    if (offsetVSlider) {
      offsetVSlider.addEventListener('input', function() {
        self.offsetV = parseFloat(this.value);
        if (offsetVValue) offsetVValue.textContent = self.offsetV.toFixed(2);
        self.render();
      });
    }
  }
};

// 导出供全局使用
if (typeof window !== 'undefined') {
  window.UVDemo = UVDemo;
}
