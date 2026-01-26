/**
 * 素描原理交互演示
 * 第4章：素描的原理
 */

const SketchDemo = {
  canvasOriginal: null,
  canvasSketch: null,
  ctxOriginal: null,
  ctxSketch: null,
  
  // 参数
  width: 140,
  height: 140,
  sphereRadius: 55,
  centerX: 70,
  centerY: 70,
  lightAngle: -45,
  sketchDensity: 0.5,  // 素描线条密度
  
  /**
   * 初始化演示
   */
  init: function() {
    this.canvasOriginal = document.getElementById('sketchOriginal');
    this.canvasSketch = document.getElementById('sketchResult');
    
    if (!this.canvasOriginal || !this.canvasSketch) return false;
    
    this.ctxOriginal = this.canvasOriginal.getContext('2d');
    this.ctxSketch = this.canvasSketch.getContext('2d');
    
    this.width = this.canvasOriginal.width;
    this.height = this.canvasOriginal.height;
    this.centerX = this.width / 2;
    this.centerY = this.height / 2;
    
    // 绑定滑块
    this.bindSliders();
    
    // 初始绘制
    this.draw();
    
    return true;
  },
  
  /**
   * 绘制两个画布
   */
  draw: function() {
    this.drawOriginal();
    this.drawSketch();
  },
  
  /**
   * 绘制原图（彩色球体）
   */
  drawOriginal: function() {
    const ctx = this.ctxOriginal;
    const imageData = ctx.createImageData(this.width, this.height);
    const data = imageData.data;
    
    // 光源方向
    const lightRad = this.lightAngle * Math.PI / 180;
    const lx = Math.cos(lightRad);
    const ly = Math.sin(lightRad);
    const lz = 0.5;
    const lightLen = Math.sqrt(lx * lx + ly * ly + lz * lz);
    
    // 基础颜色
    const baseR = 200, baseG = 120, baseB = 100;
    
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const dx = x - this.centerX;
        const dy = y - this.centerY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        const idx = (y * this.width + x) * 4;
        
        if (dist <= this.sphereRadius) {
          // 计算球面法线
          const nx = dx / this.sphereRadius;
          const ny = dy / this.sphereRadius;
          const nz = Math.sqrt(1 - nx * nx - ny * ny);
          
          // 漫反射
          const diffuse = Math.max(0, (nx * lx + ny * ly + nz * lz) / lightLen);
          const brightness = 0.2 + diffuse * 0.8;
          
          data[idx] = Math.min(255, baseR * brightness);
          data[idx + 1] = Math.min(255, baseG * brightness);
          data[idx + 2] = Math.min(255, baseB * brightness);
          data[idx + 3] = 255;
        } else {
          // 背景
          data[idx] = 240;
          data[idx + 1] = 235;
          data[idx + 2] = 230;
          data[idx + 3] = 255;
        }
      }
    }
    
    ctx.putImageData(imageData, 0, 0);
    
    // 标签
    ctx.fillStyle = '#666';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('原图', this.centerX, this.height - 5);
  },
  
  /**
   * 绘制素描效果
   */
  drawSketch: function() {
    const ctx = this.ctxSketch;
    
    // 清空画布，填充纸张颜色
    ctx.fillStyle = '#f5f0e8';
    ctx.fillRect(0, 0, this.width, this.height);
    
    // 光源方向
    const lightRad = this.lightAngle * Math.PI / 180;
    const lx = Math.cos(lightRad);
    const ly = Math.sin(lightRad);
    const lz = 0.5;
    const lightLen = Math.sqrt(lx * lx + ly * ly + lz * lz);
    
    // 素描线条方向（垂直于光源方向）
    const strokeAngle = lightRad + Math.PI / 2;
    
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 0.8;
    
    // 用线条密度表示明暗
    for (let y = 0; y < this.height; y += 2) {
      for (let x = 0; x < this.width; x += 2) {
        const dx = x - this.centerX;
        const dy = y - this.centerY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist <= this.sphereRadius) {
          // 计算球面法线
          const nx = dx / this.sphereRadius;
          const ny = dy / this.sphereRadius;
          const nz = Math.sqrt(1 - nx * nx - ny * ny);
          
          // 漫反射亮度
          const diffuse = Math.max(0, (nx * lx + ny * ly + nz * lz) / lightLen);
          const brightness = 0.2 + diffuse * 0.8;
          
          // 亮度越低，线条越密
          const darkness = 1 - brightness;
          
          // 根据暗度决定是否画线
          if (Math.random() < darkness * this.sketchDensity * 1.5) {
            const lineLen = 3 + darkness * 4;
            const x1 = x - Math.cos(strokeAngle) * lineLen / 2;
            const y1 = y - Math.sin(strokeAngle) * lineLen / 2;
            const x2 = x + Math.cos(strokeAngle) * lineLen / 2;
            const y2 = y + Math.sin(strokeAngle) * lineLen / 2;
            
            ctx.globalAlpha = 0.3 + darkness * 0.5;
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
          }
          
          // 交叉线（更暗的区域）
          if (darkness > 0.5 && Math.random() < (darkness - 0.5) * this.sketchDensity) {
            const crossAngle = strokeAngle + Math.PI / 3;
            const lineLen = 2 + darkness * 3;
            const x1 = x - Math.cos(crossAngle) * lineLen / 2;
            const y1 = y - Math.sin(crossAngle) * lineLen / 2;
            const x2 = x + Math.cos(crossAngle) * lineLen / 2;
            const y2 = y + Math.sin(crossAngle) * lineLen / 2;
            
            ctx.globalAlpha = 0.2 + (darkness - 0.5) * 0.4;
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
          }
        }
      }
    }
    
    ctx.globalAlpha = 1;
    
    // 画球体轮廓
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(this.centerX, this.centerY, this.sphereRadius, 0, Math.PI * 2);
    ctx.stroke();
    
    // 标签
    ctx.fillStyle = '#666';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('素描效果', this.centerX, this.height - 5);
  },
  
  /**
   * 绑定滑块
   */
  bindSliders: function() {
    const self = this;
    
    // 光源角度
    const angleSlider = document.getElementById('sketchLightAngle');
    const angleValue = document.getElementById('sketchLightAngleValue');
    if (angleSlider) {
      angleSlider.addEventListener('input', function() {
        self.lightAngle = parseInt(this.value);
        if (angleValue) angleValue.textContent = self.lightAngle;
        self.draw();
      });
    }
    
    // 线条密度
    const densitySlider = document.getElementById('sketchDensity');
    const densityValue = document.getElementById('sketchDensityValue');
    if (densitySlider) {
      densitySlider.addEventListener('input', function() {
        self.sketchDensity = parseFloat(this.value);
        if (densityValue) densityValue.textContent = self.sketchDensity.toFixed(1);
        self.draw();
      });
    }
  }
};

// 导出供全局使用
if (typeof window !== 'undefined') {
  window.SketchDemo = SketchDemo;
}
