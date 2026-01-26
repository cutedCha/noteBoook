/**
 * Bloom光晕交互演示
 * 第20章：Bloom光晕原理
 * 展示Bloom效果的三个步骤：提取高亮、模糊、叠加
 */

const BloomDemo = {
  canvas: null,
  ctx: null,
  
  // 画布尺寸
  width: 280,
  height: 200,
  
  // 参数
  threshold: 0.5,
  blurRadius: 8,
  intensity: 1.0,
  
  // 显示模式: 'original', 'bright', 'blur', 'final'
  displayMode: 'final',
  
  // 图像数据缓存
  originalImage: null,
  brightImage: null,
  blurredImage: null,
  
  // 光源配置
  lights: [
    { x: 70, y: 80, radius: 25, color: [255, 255, 200] },
    { x: 180, y: 60, radius: 20, color: [200, 220, 255] },
    { x: 140, y: 140, radius: 30, color: [255, 200, 150] },
    { x: 220, y: 130, radius: 18, color: [220, 255, 220] }
  ],
  
  /**
   * 初始化演示
   */
  init: function() {
    this.canvas = document.getElementById('bloomCanvas');
    if (!this.canvas) return false;
    
    this.ctx = this.canvas.getContext('2d');
    this.width = this.canvas.width;
    this.height = this.canvas.height;
    
    this.bindControls();
    this.render();
    
    return true;
  },
  
  /**
   * 渲染原始场景（发光的圆形光源）
   */
  renderOriginal: function() {
    const imageData = this.ctx.createImageData(this.width, this.height);
    const data = imageData.data;
    
    // 黑色背景
    for (let i = 0; i < data.length; i += 4) {
      data[i] = 10;
      data[i + 1] = 10;
      data[i + 2] = 20;
      data[i + 3] = 255;
    }
    
    // 绘制每个光源
    for (const light of this.lights) {
      this.drawLight(data, light);
    }
    
    this.originalImage = imageData;
    return imageData;
  },
  
  /**
   * 绘制单个光源
   */
  drawLight: function(data, light) {
    const { x, y, radius, color } = light;
    
    for (let py = 0; py < this.height; py++) {
      for (let px = 0; px < this.width; px++) {
        const dx = px - x;
        const dy = py - y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < radius * 2) {
          // 光源强度随距离衰减
          let intensity = 1 - dist / (radius * 2);
          intensity = Math.pow(intensity, 1.5);  // 更集中的光
          
          if (intensity > 0) {
            const idx = (py * this.width + px) * 4;
            // 叠加混合
            data[idx] = Math.min(255, data[idx] + color[0] * intensity);
            data[idx + 1] = Math.min(255, data[idx + 1] + color[1] * intensity);
            data[idx + 2] = Math.min(255, data[idx + 2] + color[2] * intensity);
          }
        }
      }
    }
  },
  
  /**
   * 步骤1：提取高亮区域
   */
  extractBright: function(sourceData) {
    const brightData = this.ctx.createImageData(this.width, this.height);
    const src = sourceData.data;
    const dst = brightData.data;
    
    for (let i = 0; i < src.length; i += 4) {
      const r = src[i] / 255;
      const g = src[i + 1] / 255;
      const b = src[i + 2] / 255;
      
      // 计算亮度
      const brightness = 0.299 * r + 0.587 * g + 0.114 * b;
      
      if (brightness > this.threshold) {
        // 保留高亮部分，减去阈值让过渡更平滑
        const factor = (brightness - this.threshold) / (1 - this.threshold);
        dst[i] = src[i] * factor;
        dst[i + 1] = src[i + 1] * factor;
        dst[i + 2] = src[i + 2] * factor;
        dst[i + 3] = 255;
      } else {
        dst[i] = 0;
        dst[i + 1] = 0;
        dst[i + 2] = 0;
        dst[i + 3] = 255;
      }
    }
    
    this.brightImage = brightData;
    return brightData;
  },

  /**
   * 步骤2：高斯模糊
   */
  gaussianBlur: function(sourceData) {
    const radius = this.blurRadius;
    const src = sourceData.data;
    
    // 创建临时缓冲区
    const temp = new Float32Array(this.width * this.height * 4);
    const result = this.ctx.createImageData(this.width, this.height);
    const dst = result.data;
    
    // 生成高斯核
    const kernel = this.generateGaussianKernel(radius);
    
    // 水平模糊
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        let r = 0, g = 0, b = 0, weightSum = 0;
        
        for (let k = -radius; k <= radius; k++) {
          const sx = Math.min(Math.max(x + k, 0), this.width - 1);
          const idx = (y * this.width + sx) * 4;
          const weight = kernel[k + radius];
          
          r += src[idx] * weight;
          g += src[idx + 1] * weight;
          b += src[idx + 2] * weight;
          weightSum += weight;
        }
        
        const tidx = (y * this.width + x) * 4;
        temp[tidx] = r / weightSum;
        temp[tidx + 1] = g / weightSum;
        temp[tidx + 2] = b / weightSum;
        temp[tidx + 3] = 255;
      }
    }
    
    // 垂直模糊
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        let r = 0, g = 0, b = 0, weightSum = 0;
        
        for (let k = -radius; k <= radius; k++) {
          const sy = Math.min(Math.max(y + k, 0), this.height - 1);
          const tidx = (sy * this.width + x) * 4;
          const weight = kernel[k + radius];
          
          r += temp[tidx] * weight;
          g += temp[tidx + 1] * weight;
          b += temp[tidx + 2] * weight;
          weightSum += weight;
        }
        
        const idx = (y * this.width + x) * 4;
        dst[idx] = r / weightSum;
        dst[idx + 1] = g / weightSum;
        dst[idx + 2] = b / weightSum;
        dst[idx + 3] = 255;
      }
    }
    
    this.blurredImage = result;
    return result;
  },
  
  /**
   * 生成高斯核
   */
  generateGaussianKernel: function(radius) {
    const sigma = radius / 3;
    const kernel = [];
    
    for (let i = -radius; i <= radius; i++) {
      const weight = Math.exp(-(i * i) / (2 * sigma * sigma));
      kernel.push(weight);
    }
    
    return kernel;
  },
  
  /**
   * 步骤3：叠加合成
   */
  composite: function(originalData, blurredData) {
    const result = this.ctx.createImageData(this.width, this.height);
    const orig = originalData.data;
    const bloom = blurredData.data;
    const dst = result.data;
    
    for (let i = 0; i < orig.length; i += 4) {
      // 加法混合
      dst[i] = Math.min(255, orig[i] + bloom[i] * this.intensity);
      dst[i + 1] = Math.min(255, orig[i + 1] + bloom[i + 1] * this.intensity);
      dst[i + 2] = Math.min(255, orig[i + 2] + bloom[i + 2] * this.intensity);
      dst[i + 3] = 255;
    }
    
    return result;
  },
  
  /**
   * 完整渲染流程
   */
  render: function() {
    // 步骤1：渲染原始场景
    const original = this.renderOriginal();
    
    // 步骤2：提取高亮
    const bright = this.extractBright(original);
    
    // 步骤3：模糊高亮
    const blurred = this.gaussianBlur(bright);
    
    // 步骤4：叠加合成
    const final = this.composite(original, blurred);
    
    // 根据显示模式输出
    switch (this.displayMode) {
      case 'original':
        this.ctx.putImageData(original, 0, 0);
        break;
      case 'bright':
        this.ctx.putImageData(bright, 0, 0);
        break;
      case 'blur':
        this.ctx.putImageData(blurred, 0, 0);
        break;
      case 'final':
      default:
        this.ctx.putImageData(final, 0, 0);
        break;
    }
  },
  
  /**
   * 更新显示模式按钮状态
   */
  updateModeButtons: function(activeMode) {
    const modes = ['original', 'bright', 'blur', 'final'];
    modes.forEach(function(mode) {
      const btn = document.getElementById('bloom-mode-' + mode);
      if (btn) {
        btn.classList.toggle('active', mode === activeMode);
      }
    });
  },
  
  /**
   * 绑定控件
   */
  bindControls: function() {
    const self = this;
    
    // 显示模式按钮
    const modes = ['original', 'bright', 'blur', 'final'];
    modes.forEach(function(mode) {
      const btn = document.getElementById('bloom-mode-' + mode);
      if (btn) {
        btn.addEventListener('click', function() {
          self.displayMode = mode;
          self.updateModeButtons(mode);
          self.render();
        });
      }
    });
    
    this.updateModeButtons(this.displayMode);
    
    // 阈值滑块
    const thresholdSlider = document.getElementById('bloomThreshold');
    const thresholdValue = document.getElementById('bloomThresholdValue');
    if (thresholdSlider) {
      thresholdSlider.addEventListener('input', function() {
        self.threshold = parseFloat(this.value);
        if (thresholdValue) thresholdValue.textContent = self.threshold.toFixed(2);
        self.render();
      });
    }
    
    // 模糊半径滑块
    const blurSlider = document.getElementById('bloomBlur');
    const blurValue = document.getElementById('bloomBlurValue');
    if (blurSlider) {
      blurSlider.addEventListener('input', function() {
        self.blurRadius = parseInt(this.value);
        if (blurValue) blurValue.textContent = self.blurRadius;
        self.render();
      });
    }
    
    // 强度滑块
    const intensitySlider = document.getElementById('bloomIntensity');
    const intensityValue = document.getElementById('bloomIntensityValue');
    if (intensitySlider) {
      intensitySlider.addEventListener('input', function() {
        self.intensity = parseFloat(this.value);
        if (intensityValue) intensityValue.textContent = self.intensity.toFixed(1);
        self.render();
      });
    }
  }
};

// 导出供全局使用
if (typeof window !== 'undefined') {
  window.BloomDemo = BloomDemo;
}
