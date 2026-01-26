/**
 * 缩小镜原理交互演示
 * 第16章：缩小镜原理
 */

const MinifyDemo = {
  canvas: null,
  ctx: null,
  
  // 参数
  width: 280,
  height: 180,
  strength: 0.5,        // 缩小强度
  radius: 60,           // 缩小镜半径
  
  // 缩小镜位置（可拖动）
  centerX: 140,
  centerY: 90,
  isDragging: false,
  
  // 原始图像数据
  originalImageData: null,
  
  /**
   * 初始化演示
   */
  init: function() {
    this.canvas = document.getElementById('minifyCanvas');
    
    if (!this.canvas) return false;
    
    this.ctx = this.canvas.getContext('2d');
    this.width = this.canvas.width;
    this.height = this.canvas.height;
    this.centerX = this.width / 2;
    this.centerY = this.height / 2;
    
    // 生成原始图像
    this.generateOriginalImage();
    
    // 绑定控件
    this.bindControls();
    
    // 绑定鼠标/触摸事件
    this.bindDragEvents();
    
    // 初始绘制
    this.draw();
    
    return true;
  },
  
  /**
   * 生成原始测试图像（网格+文字）
   */
  generateOriginalImage: function() {
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = this.width;
    tempCanvas.height = this.height;
    const ctx = tempCanvas.getContext('2d');
    
    // 背景
    ctx.fillStyle = '#f5f5f5';
    ctx.fillRect(0, 0, this.width, this.height);
    
    // 绘制网格
    ctx.strokeStyle = '#ddd';
    ctx.lineWidth = 1;
    for (let x = 0; x <= this.width; x += 20) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, this.height);
      ctx.stroke();
    }
    for (let y = 0; y <= this.height; y += 20) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(this.width, y);
      ctx.stroke();
    }
    
    // 绘制一些彩色形状
    ctx.fillStyle = '#9b59b6';
    ctx.fillRect(30, 30, 40, 40);
    
    ctx.fillStyle = '#1abc9c';
    ctx.beginPath();
    ctx.arc(200, 50, 25, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#e67e22';
    ctx.fillRect(50, 110, 50, 40);
    
    ctx.fillStyle = '#3498db';
    ctx.beginPath();
    ctx.arc(180, 130, 20, 0, Math.PI * 2);
    ctx.fill();
    
    // 绘制文字
    ctx.fillStyle = '#333';
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('缩小镜', this.width / 2, this.height / 2 + 5);
    
    // 保存原始图像数据
    this.originalImageData = ctx.getImageData(0, 0, this.width, this.height);
  },
  
  /**
   * 绘制缩小效果
   */
  draw: function() {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;
    
    // 获取原始数据
    const srcData = this.originalImageData.data;
    const destImageData = ctx.createImageData(w, h);
    const destData = destImageData.data;
    
    const cx = this.centerX;
    const cy = this.centerY;
    const r = this.radius;
    const strength = this.strength;
    
    // 对每个像素应用缩小效果
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const dx = x - cx;
        const dy = y - cy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        let srcX = x;
        let srcY = y;
        
        if (dist < r) {
          // 在缩小镜范围内，向外扩张UV（缩小效果）
          const factor = 1.0 - Math.pow(dist / r, 2);
          const distortion = factor * strength;
          
          // 注意这里是加号，与放大镜相反
          srcX = cx + dx * (1.0 + distortion);
          srcY = cy + dy * (1.0 + distortion);
        }
        
        // 边界检查
        srcX = Math.max(0, Math.min(w - 1, srcX));
        srcY = Math.max(0, Math.min(h - 1, srcY));
        
        // 双线性插值采样
        const color = this.bilinearSample(srcData, srcX, srcY, w, h);
        
        const destIdx = (y * w + x) * 4;
        destData[destIdx] = color.r;
        destData[destIdx + 1] = color.g;
        destData[destIdx + 2] = color.b;
        destData[destIdx + 3] = 255;
      }
    }
    
    ctx.putImageData(destImageData, 0, 0);
    
    // 绘制缩小镜边框（凹透镜样式）
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();
    
    // 绘制凹透镜内部装饰（表示凹面）
    ctx.strokeStyle = 'rgba(0,0,0,0.1)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.7, 0, Math.PI * 2);
    ctx.stroke();
    
    // 绘制手柄
    const handleAngle = Math.PI / 4;
    const handleStartX = cx + r * Math.cos(handleAngle);
    const handleStartY = cy + r * Math.sin(handleAngle);
    const handleEndX = handleStartX + 25 * Math.cos(handleAngle);
    const handleEndY = handleStartY + 25 * Math.sin(handleAngle);
    
    ctx.strokeStyle = '#666';
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(handleStartX, handleStartY);
    ctx.lineTo(handleEndX, handleEndY);
    ctx.stroke();
  },
  
  /**
   * 双线性插值采样
   */
  bilinearSample: function(data, x, y, w, h) {
    const x0 = Math.floor(x);
    const y0 = Math.floor(y);
    const x1 = Math.min(x0 + 1, w - 1);
    const y1 = Math.min(y0 + 1, h - 1);
    
    const fx = x - x0;
    const fy = y - y0;
    
    const getPixel = (px, py) => {
      const idx = (py * w + px) * 4;
      return { r: data[idx], g: data[idx + 1], b: data[idx + 2] };
    };
    
    const p00 = getPixel(x0, y0);
    const p10 = getPixel(x1, y0);
    const p01 = getPixel(x0, y1);
    const p11 = getPixel(x1, y1);
    
    return {
      r: (1 - fx) * (1 - fy) * p00.r + fx * (1 - fy) * p10.r + (1 - fx) * fy * p01.r + fx * fy * p11.r,
      g: (1 - fx) * (1 - fy) * p00.g + fx * (1 - fy) * p10.g + (1 - fx) * fy * p01.g + fx * fy * p11.g,
      b: (1 - fx) * (1 - fy) * p00.b + fx * (1 - fy) * p10.b + (1 - fx) * fy * p01.b + fx * fy * p11.b
    };
  },
  
  /**
   * 绑定控件
   */
  bindControls: function() {
    const self = this;
    
    // 缩小强度滑块
    const strengthSlider = document.getElementById('minifyStrength');
    const strengthValue = document.getElementById('minifyStrengthValue');
    if (strengthSlider) {
      strengthSlider.addEventListener('input', function() {
        self.strength = parseFloat(this.value);
        if (strengthValue) strengthValue.textContent = self.strength.toFixed(1);
        self.draw();
      });
    }
    
    // 缩小镜半径滑块
    const radiusSlider = document.getElementById('minifyRadius');
    const radiusValue = document.getElementById('minifyRadiusValue');
    if (radiusSlider) {
      radiusSlider.addEventListener('input', function() {
        self.radius = parseInt(this.value);
        if (radiusValue) radiusValue.textContent = self.radius;
        self.draw();
      });
    }
  },
  
  /**
   * 绑定拖动事件
   */
  bindDragEvents: function() {
    const self = this;
    const canvas = this.canvas;
    
    const getPos = (e) => {
      const rect = canvas.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      return {
        x: (clientX - rect.left) * (canvas.width / rect.width),
        y: (clientY - rect.top) * (canvas.height / rect.height)
      };
    };
    
    const onStart = (e) => {
      const pos = getPos(e);
      const dx = pos.x - self.centerX;
      const dy = pos.y - self.centerY;
      if (Math.sqrt(dx * dx + dy * dy) < self.radius + 10) {
        self.isDragging = true;
        e.preventDefault();
      }
    };
    
    const onMove = (e) => {
      if (!self.isDragging) return;
      const pos = getPos(e);
      self.centerX = Math.max(self.radius, Math.min(self.width - self.radius, pos.x));
      self.centerY = Math.max(self.radius, Math.min(self.height - self.radius, pos.y));
      self.draw();
      e.preventDefault();
    };
    
    const onEnd = () => {
      self.isDragging = false;
    };
    
    canvas.addEventListener('mousedown', onStart);
    canvas.addEventListener('mousemove', onMove);
    canvas.addEventListener('mouseup', onEnd);
    canvas.addEventListener('mouseleave', onEnd);
    
    canvas.addEventListener('touchstart', onStart, { passive: false });
    canvas.addEventListener('touchmove', onMove, { passive: false });
    canvas.addEventListener('touchend', onEnd);
  }
};

// 导出供全局使用
if (typeof window !== 'undefined') {
  window.MinifyDemo = MinifyDemo;
}
