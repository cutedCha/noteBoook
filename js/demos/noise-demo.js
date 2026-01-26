/**
 * 噪声可视化交互演示
 * 第17章：噪声是什么
 * 展示不同类型的噪声函数
 */

const NoiseDemo = {
  canvas: null,
  ctx: null,
  imageData: null,
  
  // 画布尺寸
  width: 300,
  height: 200,
  
  // 噪声类型
  noiseType: 'perlin',
  
  // 参数
  scale: 20,
  octaves: 4,
  seed: 12345,
  
  // 动画
  animationFrame: null,
  animate: false,
  time: 0,
  
  // 预计算的梯度表
  gradients: null,
  permutation: null,
  
  /**
   * 初始化演示
   */
  init: function() {
    this.canvas = document.getElementById('noiseCanvas');
    if (!this.canvas) return false;
    
    this.ctx = this.canvas.getContext('2d');
    this.width = this.canvas.width;
    this.height = this.canvas.height;
    this.imageData = this.ctx.createImageData(this.width, this.height);
    
    // 初始化噪声表
    this.initPermutation();
    
    this.bindControls();
    this.render();
    
    return true;
  },
  
  /**
   * 初始化排列表（用于Perlin噪声）
   */
  initPermutation: function() {
    // 使用种子生成伪随机排列
    const p = [];
    for (let i = 0; i < 256; i++) p[i] = i;
    
    // Fisher-Yates洗牌
    let seed = this.seed;
    for (let i = 255; i > 0; i--) {
      seed = (seed * 1103515245 + 12345) & 0x7fffffff;
      const j = seed % (i + 1);
      [p[i], p[j]] = [p[j], p[i]];
    }
    
    // 复制一份
    this.permutation = new Array(512);
    for (let i = 0; i < 512; i++) {
      this.permutation[i] = p[i & 255];
    }
    
    // 梯度向量
    this.gradients = [
      [1, 1], [-1, 1], [1, -1], [-1, -1],
      [1, 0], [-1, 0], [0, 1], [0, -1]
    ];
  },
  
  /**
   * 简单哈希函数
   */
  hash: function(x, y) {
    const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
    return n - Math.floor(n);
  },
  
  /**
   * 平滑插值
   */
  smoothstep: function(t) {
    return t * t * (3 - 2 * t);
  },
  
  /**
   * 线性插值
   */
  lerp: function(a, b, t) {
    return a + t * (b - a);
  },
  
  /**
   * 白噪声（纯随机）
   */
  whiteNoise: function(x, y) {
    return this.hash(Math.floor(x), Math.floor(y));
  },
  
  /**
   * 值噪声（平滑的随机）
   */
  valueNoise: function(x, y) {
    const xi = Math.floor(x);
    const yi = Math.floor(y);
    const xf = x - xi;
    const yf = y - yi;
    
    // 四个角的值
    const v00 = this.hash(xi, yi);
    const v10 = this.hash(xi + 1, yi);
    const v01 = this.hash(xi, yi + 1);
    const v11 = this.hash(xi + 1, yi + 1);
    
    // 平滑插值
    const u = this.smoothstep(xf);
    const v = this.smoothstep(yf);
    
    return this.lerp(
      this.lerp(v00, v10, u),
      this.lerp(v01, v11, u),
      v
    );
  },
  
  /**
   * Perlin噪声
   */
  perlinNoise: function(x, y) {
    const xi = Math.floor(x) & 255;
    const yi = Math.floor(y) & 255;
    const xf = x - Math.floor(x);
    const yf = y - Math.floor(y);
    
    const u = this.smoothstep(xf);
    const v = this.smoothstep(yf);
    
    // 获取梯度索引
    const aa = this.permutation[this.permutation[xi] + yi] & 7;
    const ab = this.permutation[this.permutation[xi] + yi + 1] & 7;
    const ba = this.permutation[this.permutation[xi + 1] + yi] & 7;
    const bb = this.permutation[this.permutation[xi + 1] + yi + 1] & 7;
    
    // 计算点积
    const dot = (g, x, y) => this.gradients[g][0] * x + this.gradients[g][1] * y;
    
    const n00 = dot(aa, xf, yf);
    const n10 = dot(ba, xf - 1, yf);
    const n01 = dot(ab, xf, yf - 1);
    const n11 = dot(bb, xf - 1, yf - 1);
    
    // 插值
    const nx0 = this.lerp(n00, n10, u);
    const nx1 = this.lerp(n01, n11, u);
    
    return (this.lerp(nx0, nx1, v) + 1) * 0.5;
  },
  
  /**
   * Simplex噪声（简化版）
   */
  simplexNoise: function(x, y) {
    const F2 = 0.5 * (Math.sqrt(3) - 1);
    const G2 = (3 - Math.sqrt(3)) / 6;
    
    const s = (x + y) * F2;
    const i = Math.floor(x + s);
    const j = Math.floor(y + s);
    
    const t = (i + j) * G2;
    const X0 = i - t;
    const Y0 = j - t;
    const x0 = x - X0;
    const y0 = y - Y0;
    
    let i1, j1;
    if (x0 > y0) { i1 = 1; j1 = 0; }
    else { i1 = 0; j1 = 1; }
    
    const x1 = x0 - i1 + G2;
    const y1 = y0 - j1 + G2;
    const x2 = x0 - 1 + 2 * G2;
    const y2 = y0 - 1 + 2 * G2;
    
    const ii = i & 255;
    const jj = j & 255;
    
    const gi0 = this.permutation[ii + this.permutation[jj]] & 7;
    const gi1 = this.permutation[ii + i1 + this.permutation[jj + j1]] & 7;
    const gi2 = this.permutation[ii + 1 + this.permutation[jj + 1]] & 7;
    
    const dot = (g, x, y) => this.gradients[g][0] * x + this.gradients[g][1] * y;
    
    let n0 = 0, n1 = 0, n2 = 0;
    
    let t0 = 0.5 - x0*x0 - y0*y0;
    if (t0 >= 0) {
      t0 *= t0;
      n0 = t0 * t0 * dot(gi0, x0, y0);
    }
    
    let t1 = 0.5 - x1*x1 - y1*y1;
    if (t1 >= 0) {
      t1 *= t1;
      n1 = t1 * t1 * dot(gi1, x1, y1);
    }
    
    let t2 = 0.5 - x2*x2 - y2*y2;
    if (t2 >= 0) {
      t2 *= t2;
      n2 = t2 * t2 * dot(gi2, x2, y2);
    }
    
    return (70 * (n0 + n1 + n2) + 1) * 0.5;
  },
  
  /**
   * 分形噪声（FBM）
   */
  fbmNoise: function(x, y, baseNoise) {
    let value = 0;
    let amplitude = 1;
    let frequency = 1;
    let maxValue = 0;
    
    for (let i = 0; i < this.octaves; i++) {
      value += amplitude * baseNoise.call(this, x * frequency, y * frequency);
      maxValue += amplitude;
      amplitude *= 0.5;
      frequency *= 2;
    }
    
    return value / maxValue;
  },

  /**
   * 获取当前噪声值
   */
  getNoise: function(x, y) {
    switch (this.noiseType) {
      case 'white':
        return this.whiteNoise(x, y);
      case 'value':
        return this.valueNoise(x, y);
      case 'perlin':
        return this.perlinNoise(x, y);
      case 'simplex':
        return this.simplexNoise(x, y);
      case 'fbm':
        return this.fbmNoise(x, y, this.perlinNoise);
      default:
        return this.perlinNoise(x, y);
    }
  },
  
  /**
   * 渲染噪声图像
   */
  render: function() {
    const data = this.imageData.data;
    const scale = this.scale;
    const offsetX = this.animate ? this.time * 0.5 : 0;
    
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const nx = (x + offsetX) / scale;
        const ny = y / scale;
        
        let value = this.getNoise(nx, ny);
        value = Math.max(0, Math.min(1, value));
        
        const idx = (y * this.width + x) * 4;
        const gray = Math.floor(value * 255);
        
        data[idx] = gray;
        data[idx + 1] = gray;
        data[idx + 2] = gray;
        data[idx + 3] = 255;
      }
    }
    
    this.ctx.putImageData(this.imageData, 0, 0);
  },
  
  /**
   * 开始动画
   */
  startAnimation: function() {
    const self = this;
    
    function loop() {
      if (self.animate) {
        self.time += 1;
        self.render();
        self.animationFrame = requestAnimationFrame(loop);
      }
    }
    
    loop();
  },
  
  /**
   * 停止动画
   */
  stopAnimation: function() {
    this.animate = false;
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
  },
  
  /**
   * 更新噪声类型按钮状态
   */
  updateNoiseTypeButtons: function(activeType) {
    const types = ['white', 'value', 'perlin', 'simplex', 'fbm'];
    types.forEach(function(type) {
      const btn = document.getElementById('noise-' + type);
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
    const noiseTypes = ['white', 'value', 'perlin', 'simplex', 'fbm'];
    noiseTypes.forEach(function(type) {
      const btn = document.getElementById('noise-' + type);
      if (btn) {
        btn.addEventListener('click', function() {
          self.noiseType = type;
          self.updateNoiseTypeButtons(type);
          self.render();
        });
      }
    });
    
    this.updateNoiseTypeButtons(this.noiseType);
    
    // 缩放滑块
    const scaleSlider = document.getElementById('noiseScale');
    const scaleValue = document.getElementById('noiseScaleValue');
    if (scaleSlider) {
      scaleSlider.addEventListener('input', function() {
        self.scale = parseInt(this.value);
        if (scaleValue) scaleValue.textContent = self.scale;
        self.render();
      });
    }
    
    // 层数滑块（FBM）
    const octavesSlider = document.getElementById('noiseOctaves');
    const octavesValue = document.getElementById('noiseOctavesValue');
    if (octavesSlider) {
      octavesSlider.addEventListener('input', function() {
        self.octaves = parseInt(this.value);
        if (octavesValue) octavesValue.textContent = self.octaves;
        self.render();
      });
    }
    
    // 种子滑块
    const seedSlider = document.getElementById('noiseSeed');
    const seedValue = document.getElementById('noiseSeedValue');
    if (seedSlider) {
      seedSlider.addEventListener('input', function() {
        self.seed = parseInt(this.value);
        if (seedValue) seedValue.textContent = self.seed;
        self.initPermutation();
        self.render();
      });
    }
    
    // 动画开关
    const animateCheckbox = document.getElementById('noiseAnimate');
    if (animateCheckbox) {
      animateCheckbox.addEventListener('change', function() {
        self.animate = this.checked;
        if (self.animate) {
          self.startAnimation();
        } else {
          self.stopAnimation();
        }
      });
    }
  }
};

// 导出供全局使用
if (typeof window !== 'undefined') {
  window.NoiseDemo = NoiseDemo;
}
