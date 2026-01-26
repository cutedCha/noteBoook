/**
 * 海底UV扰动交互演示
 * 第18章：噪声的应用
 * 用噪声扭曲UV，让海底图像产生水波扰动效果
 */

const SeaDemo = {
  canvas: null,
  ctx: null,
  
  // 画布尺寸
  width: 280,
  height: 200,
  
  // 噪声类型
  noiseType: 'perlin',
  
  // 参数
  distortStrength: 0.03,
  speed: 1.0,
  
  // 动画
  animationFrame: null,
  time: 0,
  
  // 海底图像
  seaImage: null,
  imageLoaded: false,
  
  // 噪声表
  permutation: null,
  gradients: null,
  
  /**
   * 初始化演示
   */
  init: function() {
    this.canvas = document.getElementById('seaCanvas');
    if (!this.canvas) return false;
    
    this.ctx = this.canvas.getContext('2d');
    this.width = this.canvas.width;
    this.height = this.canvas.height;
    
    this.initPermutation();
    this.loadSeaImage();
    this.bindControls();
    
    return true;
  },
  
  /**
   * 加载海底图像
   */
  loadSeaImage: function() {
    const self = this;
    const img = new Image();
    img.onload = function() {
      // 创建离屏canvas来获取图像数据
      const offscreen = document.createElement('canvas');
      offscreen.width = self.width;
      offscreen.height = self.height;
      const offCtx = offscreen.getContext('2d');
      offCtx.drawImage(img, 0, 0, self.width, self.height);
      self.seaImage = offCtx.getImageData(0, 0, self.width, self.height);
      self.imageLoaded = true;
      self.startAnimation();
    };
    img.onerror = function() {
      // 如果图像加载失败，生成一个简单的蓝色渐变作为替代
      self.generateFallbackImage();
      self.imageLoaded = true;
      self.startAnimation();
    };
    img.src = 'assets/images/sea.png';
  },
  
  /**
   * 生成备用图像（如果sea.png不存在）
   */
  generateFallbackImage: function() {
    const offscreen = document.createElement('canvas');
    offscreen.width = this.width;
    offscreen.height = this.height;
    const ctx = offscreen.getContext('2d');
    
    // 创建海底渐变
    const gradient = ctx.createLinearGradient(0, 0, 0, this.height);
    gradient.addColorStop(0, '#1a5276');
    gradient.addColorStop(0.5, '#2874a6');
    gradient.addColorStop(1, '#1b4f72');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, this.width, this.height);
    
    // 添加一些"海底"元素
    ctx.fillStyle = '#145a32';
    for (let i = 0; i < 8; i++) {
      const x = Math.random() * this.width;
      const h = 20 + Math.random() * 40;
      ctx.beginPath();
      ctx.moveTo(x, this.height);
      ctx.quadraticCurveTo(x - 10, this.height - h/2, x, this.height - h);
      ctx.quadraticCurveTo(x + 10, this.height - h/2, x, this.height);
      ctx.fill();
    }
    
    this.seaImage = ctx.getImageData(0, 0, this.width, this.height);
  },
  
  /**
   * 初始化排列表
   */
  initPermutation: function() {
    const p = [];
    for (let i = 0; i < 256; i++) p[i] = i;
    
    let seed = 12345;
    for (let i = 255; i > 0; i--) {
      seed = (seed * 1103515245 + 12345) & 0x7fffffff;
      const j = seed % (i + 1);
      [p[i], p[j]] = [p[j], p[i]];
    }
    
    this.permutation = new Array(512);
    for (let i = 0; i < 512; i++) {
      this.permutation[i] = p[i & 255];
    }
    
    this.gradients = [
      [1, 1], [-1, 1], [1, -1], [-1, -1],
      [1, 0], [-1, 0], [0, 1], [0, -1]
    ];
  },
  
  hash: function(x, y) {
    const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
    return n - Math.floor(n);
  },
  
  smoothstep: function(t) {
    return t * t * (3 - 2 * t);
  },
  
  lerp: function(a, b, t) {
    return a + t * (b - a);
  },
  
  valueNoise: function(x, y) {
    const xi = Math.floor(x);
    const yi = Math.floor(y);
    const xf = x - xi;
    const yf = y - yi;
    
    const v00 = this.hash(xi, yi);
    const v10 = this.hash(xi + 1, yi);
    const v01 = this.hash(xi, yi + 1);
    const v11 = this.hash(xi + 1, yi + 1);
    
    const u = this.smoothstep(xf);
    const v = this.smoothstep(yf);
    
    return this.lerp(
      this.lerp(v00, v10, u),
      this.lerp(v01, v11, u),
      v
    );
  },
  
  perlinNoise: function(x, y) {
    const xi = Math.floor(x) & 255;
    const yi = Math.floor(y) & 255;
    const xf = x - Math.floor(x);
    const yf = y - Math.floor(y);
    
    const u = this.smoothstep(xf);
    const v = this.smoothstep(yf);
    
    const aa = this.permutation[this.permutation[xi] + yi] & 7;
    const ab = this.permutation[this.permutation[xi] + yi + 1] & 7;
    const ba = this.permutation[this.permutation[xi + 1] + yi] & 7;
    const bb = this.permutation[this.permutation[xi + 1] + yi + 1] & 7;
    
    const dot = (g, x, y) => this.gradients[g][0] * x + this.gradients[g][1] * y;
    
    const n00 = dot(aa, xf, yf);
    const n10 = dot(ba, xf - 1, yf);
    const n01 = dot(ab, xf, yf - 1);
    const n11 = dot(bb, xf - 1, yf - 1);
    
    const nx0 = this.lerp(n00, n10, u);
    const nx1 = this.lerp(n01, n11, u);
    
    return this.lerp(nx0, nx1, v);
  },
  
  getNoise: function(x, y) {
    switch (this.noiseType) {
      case 'value':
        return this.valueNoise(x, y) * 2 - 1;
      case 'perlin':
        return this.perlinNoise(x, y);
      default:
        return this.perlinNoise(x, y);
    }
  },

  /**
   * 双线性采样图像
   */
  sampleImage: function(x, y) {
    if (x < 0 || x >= this.width - 1 || y < 0 || y >= this.height - 1) {
      // 边界处理：clamp到边界
      x = Math.max(0, Math.min(this.width - 1, x));
      y = Math.max(0, Math.min(this.height - 1, y));
    }
    
    const x0 = Math.floor(x);
    const y0 = Math.floor(y);
    const x1 = Math.min(x0 + 1, this.width - 1);
    const y1 = Math.min(y0 + 1, this.height - 1);
    const fx = x - x0;
    const fy = y - y0;
    
    const data = this.seaImage.data;
    const w = this.width;
    
    const getPixel = (px, py) => {
      const idx = (py * w + px) * 4;
      return [data[idx], data[idx + 1], data[idx + 2], data[idx + 3]];
    };
    
    const p00 = getPixel(x0, y0);
    const p10 = getPixel(x1, y0);
    const p01 = getPixel(x0, y1);
    const p11 = getPixel(x1, y1);
    
    const result = [];
    for (let i = 0; i < 4; i++) {
      const top = p00[i] * (1 - fx) + p10[i] * fx;
      const bottom = p01[i] * (1 - fx) + p11[i] * fx;
      result[i] = top * (1 - fy) + bottom * fy;
    }
    
    return result;
  },
  
  /**
   * 渲染（用噪声扭曲UV模拟水波）
   */
  render: function() {
    if (!this.imageLoaded) return;
    
    const outputData = this.ctx.createImageData(this.width, this.height);
    const output = outputData.data;
    
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const u = x / this.width;
        const v = y / this.height;
        
        // 噪声采样坐标（加入时间产生动画）
        const noiseX = u * 6 + this.time * 0.015 * this.speed;
        const noiseY = v * 6 + this.time * 0.01 * this.speed;
        
        // 获取噪声值用于UV扭曲
        const noiseU = this.getNoise(noiseX, noiseY);
        const noiseV = this.getNoise(noiseX + 50, noiseY + 50);
        
        // 计算扭曲后的采样坐标
        const sampleX = x + noiseU * this.width * this.distortStrength;
        const sampleY = y + noiseV * this.height * this.distortStrength;
        
        // 采样图像
        const color = this.sampleImage(sampleX, sampleY);
        
        const idx = (y * this.width + x) * 4;
        output[idx] = color[0];
        output[idx + 1] = color[1];
        output[idx + 2] = color[2];
        output[idx + 3] = color[3];
      }
    }
    
    this.ctx.putImageData(outputData, 0, 0);
  },
  
  /**
   * 开始动画
   */
  startAnimation: function() {
    const self = this;
    
    function loop() {
      self.time += 1;
      self.render();
      self.animationFrame = requestAnimationFrame(loop);
    }
    
    loop();
  },
  
  /**
   * 停止动画
   */
  stopAnimation: function() {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
  },
  
  /**
   * 更新噪声类型按钮状态
   */
  updateNoiseTypeButtons: function(activeType) {
    const types = ['value', 'perlin'];
    types.forEach(function(type) {
      const btn = document.getElementById('sea-noise-' + type);
      if (btn) {
        btn.classList.toggle('active', type === activeType);
      }
    });
  },
  
  /**
   * 绑定控件
   */
  bindControls: function() {
    const self = this;
    
    // 噪声类型按钮
    const noiseTypes = ['value', 'perlin'];
    noiseTypes.forEach(function(type) {
      const btn = document.getElementById('sea-noise-' + type);
      if (btn) {
        btn.addEventListener('click', function() {
          self.noiseType = type;
          self.updateNoiseTypeButtons(type);
        });
      }
    });
    
    this.updateNoiseTypeButtons(this.noiseType);
    
    // 扭曲强度滑块
    const distortSlider = document.getElementById('seaDistort');
    const distortValue = document.getElementById('seaDistortValue');
    if (distortSlider) {
      distortSlider.addEventListener('input', function() {
        self.distortStrength = parseFloat(this.value);
        if (distortValue) distortValue.textContent = self.distortStrength.toFixed(2);
      });
    }
    
    // 速度滑块
    const speedSlider = document.getElementById('seaSpeed');
    const speedValue = document.getElementById('seaSpeedValue');
    if (speedSlider) {
      speedSlider.addEventListener('input', function() {
        self.speed = parseFloat(this.value);
        if (speedValue) speedValue.textContent = self.speed.toFixed(1);
      });
    }
  }
};

// 导出供全局使用
if (typeof window !== 'undefined') {
  window.SeaDemo = SeaDemo;
}
