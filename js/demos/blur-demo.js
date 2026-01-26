/**
 * 模糊原理交互演示
 * 第12章：模糊原理
 */

const BlurDemo = {
  canvasOriginal: null,
  canvasBlurred: null,
  ctxOriginal: null,
  ctxBlurred: null,
  
  // 参数
  width: 160,
  height: 160,
  blurType: 'gaussian',  // 'gaussian' | 'box'
  blurRadius: 3,         // 模糊半径 1-10
  
  // 原始图像数据
  originalImageData: null,
  
  /**
   * 初始化演示
   */
  init: function() {
    this.canvasOriginal = document.getElementById('blurOriginal');
    this.canvasBlurred = document.getElementById('blurResult');
    
    if (!this.canvasOriginal || !this.canvasBlurred) return false;
    
    this.ctxOriginal = this.canvasOriginal.getContext('2d');
    this.ctxBlurred = this.canvasBlurred.getContext('2d');
    
    this.width = this.canvasOriginal.width;
    this.height = this.canvasOriginal.height;
    
    // 绑定控件
    this.bindControls();
    
    // 生成原始图像
    this.generateOriginalImage();
    
    // 初始绘制
    this.draw();
    
    return true;
  },
  
  /**
   * 生成原始测试图像（彩色方块和圆形）
   */
  generateOriginalImage: function() {
    const ctx = this.ctxOriginal;
    const w = this.width;
    const h = this.height;
    
    // 背景
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, w, h);
    
    // 红色方块
    ctx.fillStyle = '#e74c3c';
    ctx.fillRect(20, 20, 50, 50);
    
    // 蓝色圆形
    ctx.fillStyle = '#3498db';
    ctx.beginPath();
    ctx.arc(110, 45, 30, 0, Math.PI * 2);
    ctx.fill();
    
    // 绿色方块
    ctx.fillStyle = '#2ecc71';
    ctx.fillRect(30, 90, 40, 50);
    
    // 黄色圆形
    ctx.fillStyle = '#f1c40f';
    ctx.beginPath();
    ctx.arc(100, 115, 25, 0, Math.PI * 2);
    ctx.fill();
    
    // 紫色三角形
    ctx.fillStyle = '#9b59b6';
    ctx.beginPath();
    ctx.moveTo(80, 70);
    ctx.lineTo(60, 100);
    ctx.lineTo(100, 100);
    ctx.closePath();
    ctx.fill();
    
    // 保存原始图像数据
    this.originalImageData = ctx.getImageData(0, 0, w, h);
    
    // 添加标签
    ctx.fillStyle = '#666';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('原图', w / 2, h - 5);
  },
  
  /**
   * 绘制模糊效果
   */
  draw: function() {
    this.applyBlur();
  },
  
  /**
   * 应用模糊效果
   */
  applyBlur: function() {
    const ctx = this.ctxBlurred;
    const w = this.width;
    const h = this.height;
    
    // 获取原始数据的副本
    const srcData = this.originalImageData.data;
    const destImageData = ctx.createImageData(w, h);
    const destData = destImageData.data;
    
    const radius = this.blurRadius;
    const kernel = this.blurType === 'gaussian' 
      ? this.generateGaussianKernel(radius)
      : this.generateBoxKernel(radius);
    
    const kernelSize = radius * 2 + 1;
    
    // 对每个像素应用卷积
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        let r = 0, g = 0, b = 0;
        let weightSum = 0;
        
        // 卷积
        for (let ky = -radius; ky <= radius; ky++) {
          for (let kx = -radius; kx <= radius; kx++) {
            const px = x + kx;
            const py = y + ky;
            
            // 边界检查
            if (px >= 0 && px < w && py >= 0 && py < h) {
              const srcIdx = (py * w + px) * 4;
              const weight = kernel[(ky + radius) * kernelSize + (kx + radius)];
              
              r += srcData[srcIdx] * weight;
              g += srcData[srcIdx + 1] * weight;
              b += srcData[srcIdx + 2] * weight;
              weightSum += weight;
            }
          }
        }
        
        // 归一化并写入
        const destIdx = (y * w + x) * 4;
        destData[destIdx] = r / weightSum;
        destData[destIdx + 1] = g / weightSum;
        destData[destIdx + 2] = b / weightSum;
        destData[destIdx + 3] = 255;
      }
    }
    
    ctx.putImageData(destImageData, 0, 0);
    
    // 添加标签
    const label = this.blurType === 'gaussian' ? '高斯模糊' : '均值模糊';
    ctx.fillStyle = '#666';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(label, w / 2, h - 5);
  },
  
  /**
   * 生成高斯卷积核
   */
  generateGaussianKernel: function(radius) {
    const size = radius * 2 + 1;
    const kernel = new Array(size * size);
    const sigma = radius / 2;
    let sum = 0;
    
    for (let y = -radius; y <= radius; y++) {
      for (let x = -radius; x <= radius; x++) {
        const dist = x * x + y * y;
        const weight = Math.exp(-dist / (2 * sigma * sigma));
        kernel[(y + radius) * size + (x + radius)] = weight;
        sum += weight;
      }
    }
    
    // 归一化
    for (let i = 0; i < kernel.length; i++) {
      kernel[i] /= sum;
    }
    
    return kernel;
  },
  
  /**
   * 生成均值卷积核（Box Blur）
   */
  generateBoxKernel: function(radius) {
    const size = radius * 2 + 1;
    const kernel = new Array(size * size);
    const weight = 1 / (size * size);
    
    for (let i = 0; i < kernel.length; i++) {
      kernel[i] = weight;
    }
    
    return kernel;
  },
  
  /**
   * 绑定控件
   */
  bindControls: function() {
    const self = this;
    
    // 模糊类型按钮
    const gaussianBtn = document.getElementById('blurGaussian');
    const boxBtn = document.getElementById('blurBox');
    
    if (gaussianBtn) {
      gaussianBtn.addEventListener('click', function() {
        self.blurType = 'gaussian';
        self.updateButtonStates();
        self.draw();
      });
    }
    
    if (boxBtn) {
      boxBtn.addEventListener('click', function() {
        self.blurType = 'box';
        self.updateButtonStates();
        self.draw();
      });
    }
    
    // 模糊半径滑块
    const radiusSlider = document.getElementById('blurRadius');
    const radiusValue = document.getElementById('blurRadiusValue');
    if (radiusSlider) {
      radiusSlider.addEventListener('input', function() {
        self.blurRadius = parseInt(this.value);
        if (radiusValue) radiusValue.textContent = self.blurRadius;
        self.draw();
      });
    }
    
    // 初始化按钮状态
    this.updateButtonStates();
  },
  
  /**
   * 更新按钮状态
   */
  updateButtonStates: function() {
    const gaussianBtn = document.getElementById('blurGaussian');
    const boxBtn = document.getElementById('blurBox');
    
    if (gaussianBtn) {
      gaussianBtn.classList.toggle('active', this.blurType === 'gaussian');
    }
    if (boxBtn) {
      boxBtn.classList.toggle('active', this.blurType === 'box');
    }
  }
};

// 导出供全局使用
if (typeof window !== 'undefined') {
  window.BlurDemo = BlurDemo;
}
