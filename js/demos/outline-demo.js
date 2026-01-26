/**
 * 描边原理交互演示
 * 第22章：描边原理
 * 展示如何通过检测透明/不透明边界来实现描边效果
 */

const OutlineDemo = {
  canvas: null,
  ctx: null,
  
  // 画布尺寸
  width: 280,
  height: 200,
  
  // 参数
  outlineWidth: 2,
  outlineColor: [255, 100, 50],  // 橙红色描边
  showOutlineOnly: false,
  
  // 原始图像数据
  originalImage: null,
  
  /**
   * 初始化演示
   */
  init: function() {
    this.canvas = document.getElementById('outlineCanvas');
    if (!this.canvas) return false;
    
    this.ctx = this.canvas.getContext('2d');
    this.width = this.canvas.width;
    this.height = this.canvas.height;
    
    this.generateOriginalImage();
    this.bindControls();
    this.render();
    
    return true;
  },
  
  /**
   * 生成原始图像（一个简单的图形）
   */
  generateOriginalImage: function() {
    const offscreen = document.createElement('canvas');
    offscreen.width = this.width;
    offscreen.height = this.height;
    const ctx = offscreen.getContext('2d');
    
    // 透明背景
    ctx.clearRect(0, 0, this.width, this.height);
    
    // 绘制一个卡通风格的角色轮廓
    // 身体（椭圆）
    ctx.fillStyle = '#4a90d9';
    ctx.beginPath();
    ctx.ellipse(140, 130, 50, 60, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // 头部（圆形）
    ctx.fillStyle = '#f5d0a9';
    ctx.beginPath();
    ctx.arc(140, 60, 40, 0, Math.PI * 2);
    ctx.fill();
    
    // 眼睛
    ctx.fillStyle = '#333';
    ctx.beginPath();
    ctx.arc(125, 55, 6, 0, Math.PI * 2);
    ctx.arc(155, 55, 6, 0, Math.PI * 2);
    ctx.fill();
    
    // 嘴巴
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(140, 70, 12, 0.2, Math.PI - 0.2);
    ctx.stroke();
    
    // 手臂
    ctx.fillStyle = '#f5d0a9';
    ctx.beginPath();
    ctx.ellipse(80, 120, 15, 25, -0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(200, 120, 15, 25, 0.3, 0, Math.PI * 2);
    ctx.fill();
    
    this.originalImage = ctx.getImageData(0, 0, this.width, this.height);
  },
  
  /**
   * 检查像素是否不透明
   */
  isOpaque: function(data, x, y) {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
      return false;
    }
    const idx = (y * this.width + x) * 4;
    return data[idx + 3] > 25;  // alpha > 25 视为不透明
  },
  
  /**
   * 检查像素周围是否有不透明像素
   */
  hasOpaqueNeighbor: function(data, x, y, radius) {
    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = -radius; dx <= radius; dx++) {
        if (dx === 0 && dy === 0) continue;
        
        // 圆形范围检查
        if (dx * dx + dy * dy <= radius * radius) {
          if (this.isOpaque(data, x + dx, y + dy)) {
            return true;
          }
        }
      }
    }
    return false;
  },

  /**
   * 渲染描边效果
   */
  render: function() {
    const srcData = this.originalImage.data;
    const result = this.ctx.createImageData(this.width, this.height);
    const dstData = result.data;
    
    const outlineWidth = this.outlineWidth;
    const [outR, outG, outB] = this.outlineColor;
    
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const idx = (y * this.width + x) * 4;
        const isCurrentOpaque = srcData[idx + 3] > 25;
        
        if (!isCurrentOpaque) {
          // 当前像素是透明的，检查周围是否有不透明像素
          if (this.hasOpaqueNeighbor(srcData, x, y, outlineWidth)) {
            // 这是描边位置！
            dstData[idx] = outR;
            dstData[idx + 1] = outG;
            dstData[idx + 2] = outB;
            dstData[idx + 3] = 255;
          } else {
            // 纯透明背景
            dstData[idx] = 240;
            dstData[idx + 1] = 240;
            dstData[idx + 2] = 245;
            dstData[idx + 3] = 255;
          }
        } else {
          // 不透明像素
          if (this.showOutlineOnly) {
            // 只显示描边模式：把原图变成半透明
            dstData[idx] = Math.floor(srcData[idx] * 0.3 + 240 * 0.7);
            dstData[idx + 1] = Math.floor(srcData[idx + 1] * 0.3 + 240 * 0.7);
            dstData[idx + 2] = Math.floor(srcData[idx + 2] * 0.3 + 245 * 0.7);
            dstData[idx + 3] = 255;
          } else {
            // 正常显示原图
            dstData[idx] = srcData[idx];
            dstData[idx + 1] = srcData[idx + 1];
            dstData[idx + 2] = srcData[idx + 2];
            dstData[idx + 3] = 255;
          }
        }
      }
    }
    
    this.ctx.putImageData(result, 0, 0);
  },
  
  /**
   * 更新颜色按钮状态
   */
  updateColorButtons: function(activeColor) {
    const colors = ['red', 'green', 'blue', 'black'];
    colors.forEach(function(color) {
      const btn = document.getElementById('outline-color-' + color);
      if (btn) {
        btn.classList.toggle('active', color === activeColor);
      }
    });
  },
  
  /**
   * 绑定控件
   */
  bindControls: function() {
    const self = this;
    
    // 描边宽度滑块
    const widthSlider = document.getElementById('outlineWidth');
    const widthValue = document.getElementById('outlineWidthValue');
    if (widthSlider) {
      widthSlider.addEventListener('input', function() {
        self.outlineWidth = parseInt(this.value);
        if (widthValue) widthValue.textContent = self.outlineWidth;
        self.render();
      });
    }
    
    // 颜色按钮
    const colorMap = {
      'red': [255, 100, 50],
      'green': [50, 200, 100],
      'blue': [50, 150, 255],
      'black': [30, 30, 30]
    };
    
    Object.keys(colorMap).forEach(function(colorName) {
      const btn = document.getElementById('outline-color-' + colorName);
      if (btn) {
        btn.addEventListener('click', function() {
          self.outlineColor = colorMap[colorName];
          self.updateColorButtons(colorName);
          self.render();
        });
      }
    });
    
    this.updateColorButtons('red');
    
    // 只显示描边开关
    const outlineOnlyCheckbox = document.getElementById('outlineOnly');
    if (outlineOnlyCheckbox) {
      outlineOnlyCheckbox.addEventListener('change', function() {
        self.showOutlineOnly = this.checked;
        self.render();
      });
    }
  }
};

// 导出供全局使用
if (typeof window !== 'undefined') {
  window.OutlineDemo = OutlineDemo;
}
