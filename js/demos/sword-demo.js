/**
 * 魔法剑特效交互演示
 * 第31章：一生二，二生三，三生万物
 */

const SwordDemo = {
  canvas: null,
  ctx: null,
  
  // 参数
  width: 300,
  height: 200,
  
  // 特效开关
  outlineEnabled: true,
  bloomEnabled: true,
  noiseEnabled: false,  // 仙气飘飘效果
  
  // 特效参数
  outlineColor: { r: 0, g: 200, b: 255 },  // 青色
  outlineWidth: 3,
  bloomIntensity: 0.8,
  bloomRadius: 8,
  
  // 噪音参数
  noiseScale: 0.05,      // 噪音缩放（更大的值=更细腻的扭曲）
  noiseSpeed: 2.0,       // 流动速度
  noiseOffset: 0,        // UV偏移（向上流动）
  
  // 噪声排列表
  permutation: null,
  gradients: null,
  
  // 动画
  animationFrame: null,
  glowPhase: 0,
  
  /**
   * 初始化演示
   */
  init: function() {
    this.canvas = document.getElementById('swordCanvas');
    
    if (!this.canvas) return false;
    
    this.ctx = this.canvas.getContext('2d');
    this.width = this.canvas.width;
    this.height = this.canvas.height;
    
    // 初始化噪声表
    this.initPermutation();
    
    // 绑定控件
    this.bindControls();
    
    // 开始动画
    this.startAnimation();
    
    return true;
  },
  
  /**
   * 开始动画循环
   */
  startAnimation: function() {
    const self = this;
    
    function animate() {
      self.glowPhase += 0.05;
      // 噪音UV向上流动
      self.noiseOffset += self.noiseSpeed * 0.02;
      self.draw();
      self.animationFrame = requestAnimationFrame(animate);
    }
    
    animate();
  },
  
  /**
   * 停止动画
   */
  stopAnimation: function() {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
  },
  
  /**
   * 绘制场景
   */
  draw: function() {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;
    
    // 清空画布 - 深色背景
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, w, h);
    
    // 剑的位置
    const swordX = w / 2;
    const swordY = h / 2;
    
    // 如果开启Bloom，先绘制发光层
    if (this.bloomEnabled && this.outlineEnabled) {
      this.drawBloom(ctx, swordX, swordY);
    }
    
    // 如果开启描边，绘制描边
    if (this.outlineEnabled) {
      this.drawOutline(ctx, swordX, swordY);
    }
    
    // 绘制剑本体
    this.drawSword(ctx, swordX, swordY);
  },

  /**
   * 绘制剑本体
   */
  drawSword: function(ctx, x, y) {
    ctx.save();
    ctx.translate(x, y);
    
    // 剑刃 - 银色渐变
    const bladeGradient = ctx.createLinearGradient(-8, 0, 8, 0);
    bladeGradient.addColorStop(0, '#a0a0a0');
    bladeGradient.addColorStop(0.3, '#e0e0e0');
    bladeGradient.addColorStop(0.5, '#ffffff');
    bladeGradient.addColorStop(0.7, '#e0e0e0');
    bladeGradient.addColorStop(1, '#a0a0a0');
    
    ctx.fillStyle = bladeGradient;
    ctx.beginPath();
    ctx.moveTo(0, -70);  // 剑尖
    ctx.lineTo(8, -50);
    ctx.lineTo(8, 20);
    ctx.lineTo(-8, 20);
    ctx.lineTo(-8, -50);
    ctx.closePath();
    ctx.fill();
    
    // 剑刃中线
    ctx.strokeStyle = '#c0c0c0';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, -65);
    ctx.lineTo(0, 15);
    ctx.stroke();
    
    // 护手
    ctx.fillStyle = '#8b7355';
    ctx.fillRect(-20, 20, 40, 8);
    
    // 护手装饰
    ctx.fillStyle = '#ffd700';
    ctx.beginPath();
    ctx.arc(-15, 24, 3, 0, Math.PI * 2);
    ctx.arc(15, 24, 3, 0, Math.PI * 2);
    ctx.fill();
    
    // 剑柄
    const handleGradient = ctx.createLinearGradient(-5, 28, 5, 28);
    handleGradient.addColorStop(0, '#5c4033');
    handleGradient.addColorStop(0.5, '#8b7355');
    handleGradient.addColorStop(1, '#5c4033');
    
    ctx.fillStyle = handleGradient;
    ctx.fillRect(-5, 28, 10, 35);
    
    // 剑柄缠绕
    ctx.strokeStyle = '#3c2415';
    ctx.lineWidth = 2;
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      ctx.moveTo(-5, 32 + i * 7);
      ctx.lineTo(5, 35 + i * 7);
      ctx.stroke();
    }
    
    // 剑柄底部
    ctx.fillStyle = '#ffd700';
    ctx.beginPath();
    ctx.arc(0, 68, 6, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
  },
  
  /**
   * 绘制描边
   */
  drawOutline: function(ctx, x, y) {
    const { r, g, b } = this.outlineColor;
    // 仙气飘飘模式下不闪烁
    const basePulse = this.noiseEnabled ? 1.0 : (0.7 + 0.3 * Math.sin(this.glowPhase));
    
    ctx.save();
    ctx.translate(x, y);
    
    ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${basePulse})`;
    ctx.lineWidth = this.outlineWidth;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    
    // 普通描边（不扭曲）
    ctx.beginPath();
    ctx.moveTo(0, -70);
    ctx.lineTo(8, -50);
    ctx.lineTo(8, 20);
    ctx.lineTo(-8, 20);
    ctx.lineTo(-8, -50);
    ctx.closePath();
    ctx.stroke();
    
    ctx.strokeRect(-20, 20, 40, 8);
    ctx.strokeRect(-5, 28, 10, 35);
    
    ctx.beginPath();
    ctx.arc(0, 68, 6, 0, Math.PI * 2);
    ctx.stroke();
    
    ctx.restore();
  },
  
  /**
   * 绘制扭曲的路径
   */
  drawDistortedPath: function(ctx, points, strength, closePath) {
    const subSegments = 10;
    
    ctx.beginPath();
    
    for (let i = 0; i < points.length - 1; i++) {
      const p1 = points[i];
      const p2 = points[i + 1];
      
      for (let j = 0; j <= subSegments; j++) {
        const t = j / subSegments;
        let x = p1.x + (p2.x - p1.x) * t;
        let y = p1.y + (p2.y - p1.y) * t;
        
        // 用噪音扭曲位置，UV向上流动
        const noiseX = this.fbmNoise(x * this.noiseScale, y * this.noiseScale + this.noiseOffset);
        const noiseY = this.fbmNoise(x * this.noiseScale + 100, y * this.noiseScale + this.noiseOffset);
        
        // 扭曲偏移（-0.5到0.5映射到-strength到+strength）
        x += (noiseX - 0.5) * strength * 2;
        y += (noiseY - 0.5) * strength;
        
        if (i === 0 && j === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
    }
    
    if (closePath) {
      ctx.closePath();
    }
    ctx.stroke();
  },
  
  /**
   * 绘制扭曲的圆
   */
  drawDistortedCircle: function(ctx, cx, cy, radius, strength) {
    const segments = 16;
    
    ctx.beginPath();
    
    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * Math.PI * 2;
      let x = cx + Math.cos(angle) * radius;
      let y = cy + Math.sin(angle) * radius;
      
      const noiseX = this.fbmNoise(x * this.noiseScale, y * this.noiseScale + this.noiseOffset);
      const noiseY = this.fbmNoise(x * this.noiseScale + 100, y * this.noiseScale + this.noiseOffset);
      
      x += (noiseX - 0.5) * strength * 2;
      y += (noiseY - 0.5) * strength;
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    
    ctx.closePath();
    ctx.stroke();
  },
  
  /**
   * 初始化噪声排列表
   */
  initPermutation: function() {
    const p = [];
    for (let i = 0; i < 256; i++) p[i] = i;
    
    // Fisher-Yates洗牌
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
   * Perlin噪声
   */
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
    
    const dot = (g, px, py) => this.gradients[g][0] * px + this.gradients[g][1] * py;
    
    const n00 = dot(aa, xf, yf);
    const n10 = dot(ba, xf - 1, yf);
    const n01 = dot(ab, xf, yf - 1);
    const n11 = dot(bb, xf - 1, yf - 1);
    
    const nx0 = this.lerp(n00, n10, u);
    const nx1 = this.lerp(n01, n11, u);
    
    return (this.lerp(nx0, nx1, v) + 1) * 0.5;
  },

  /**
   * 绘制Bloom发光效果
   */
  drawBloom: function(ctx, x, y) {
    const { r, g, b } = this.outlineColor;
    // 仙气飘飘模式下不闪烁
    const pulseIntensity = this.noiseEnabled ? 1.0 : (0.5 + 0.5 * Math.sin(this.glowPhase));
    
    ctx.save();
    ctx.translate(x, y);
    
    const layers = 5;
    
    if (this.noiseEnabled) {
      // 对扭曲后的描边做Bloom
      for (let i = layers; i >= 1; i--) {
        const radius = this.outlineWidth + this.bloomRadius * i * this.bloomIntensity;
        const alpha = (0.15 / i) * pulseIntensity;
        
        ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
        ctx.lineWidth = radius;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        
        this.drawDistortedBloomLayer(ctx);
      }
    } else {
      // 普通Bloom
      for (let i = layers; i >= 1; i--) {
        const radius = this.outlineWidth + this.bloomRadius * i * this.bloomIntensity;
        const alpha = (0.15 / i) * pulseIntensity;
        
        ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
        ctx.lineWidth = radius;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        
        ctx.beginPath();
        ctx.moveTo(0, -70);
        ctx.lineTo(8, -50);
        ctx.lineTo(8, 20);
        ctx.lineTo(-8, 20);
        ctx.lineTo(-8, -50);
        ctx.closePath();
        ctx.stroke();
        
        ctx.strokeRect(-20, 20, 40, 8);
        ctx.strokeRect(-5, 28, 10, 35);
        
        ctx.beginPath();
        ctx.arc(0, 68, 6, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
    
    ctx.restore();
  },
  
  /**
   * 绘制扭曲的Bloom层
   */
  drawDistortedBloomLayer: function(ctx) {
    const distortStrength = 8;  // 增大扭曲强度
    
    const bladePoints = [
      { x: 0, y: -70 },
      { x: 8, y: -50 },
      { x: 8, y: 20 },
      { x: -8, y: 20 },
      { x: -8, y: -50 },
      { x: 0, y: -70 }
    ];
    
    const guardPoints = [
      { x: -20, y: 20 },
      { x: 20, y: 20 },
      { x: 20, y: 28 },
      { x: -20, y: 28 },
      { x: -20, y: 20 }
    ];
    
    const handlePoints = [
      { x: -5, y: 28 },
      { x: 5, y: 28 },
      { x: 5, y: 63 },
      { x: -5, y: 63 },
      { x: -5, y: 28 }
    ];
    
    this.drawDistortedPath(ctx, bladePoints, distortStrength, true);
    this.drawDistortedPath(ctx, guardPoints, distortStrength * 0.5, true);
    this.drawDistortedPath(ctx, handlePoints, distortStrength * 0.5, true);
    this.drawDistortedCircle(ctx, 0, 68, 6, distortStrength * 0.3);
  },
  
  /**
   * FBM噪声（分形布朗运动）- 更自然的雾气效果
   */
  fbmNoise: function(x, y) {
    let value = 0;
    let amplitude = 1;
    let frequency = 1;
    let maxValue = 0;
    const octaves = 3;
    
    for (let i = 0; i < octaves; i++) {
      value += amplitude * this.perlinNoise(x * frequency, y * frequency);
      maxValue += amplitude;
      amplitude *= 0.5;
      frequency *= 2;
    }
    
    return value / maxValue;
  },
  
  /**
   * 绑定控件
   */
  bindControls: function() {
    const self = this;
    
    // 描边开关
    const outlineToggle = document.getElementById('swordOutline');
    if (outlineToggle) {
      outlineToggle.addEventListener('change', function() {
        self.outlineEnabled = this.checked;
      });
    }
    
    // Bloom开关
    const bloomToggle = document.getElementById('swordBloom');
    if (bloomToggle) {
      bloomToggle.addEventListener('change', function() {
        self.bloomEnabled = this.checked;
      });
    }
    
    // 噪音开关（仙气飘飘）
    const noiseToggle = document.getElementById('swordNoise');
    if (noiseToggle) {
      noiseToggle.addEventListener('change', function() {
        self.noiseEnabled = this.checked;
      });
    }
    
    // 描边宽度
    const widthSlider = document.getElementById('swordOutlineWidth');
    const widthValue = document.getElementById('swordOutlineWidthValue');
    if (widthSlider) {
      widthSlider.addEventListener('input', function() {
        self.outlineWidth = parseInt(this.value);
        if (widthValue) widthValue.textContent = self.outlineWidth;
      });
    }
    
    // Bloom强度
    const bloomSlider = document.getElementById('swordBloomIntensity');
    const bloomValue = document.getElementById('swordBloomIntensityValue');
    if (bloomSlider) {
      bloomSlider.addEventListener('input', function() {
        self.bloomIntensity = parseFloat(this.value);
        if (bloomValue) bloomValue.textContent = self.bloomIntensity.toFixed(1);
      });
    }
    
    // 噪音流动速度
    const noiseSpeedSlider = document.getElementById('swordNoiseSpeed');
    const noiseSpeedValue = document.getElementById('swordNoiseSpeedValue');
    if (noiseSpeedSlider) {
      noiseSpeedSlider.addEventListener('input', function() {
        self.noiseSpeed = parseFloat(this.value);
        if (noiseSpeedValue) noiseSpeedValue.textContent = self.noiseSpeed.toFixed(1);
      });
    }
    
    // 颜色预设按钮
    const colorBtns = {
      'colorCyan': { r: 0, g: 200, b: 255 },
      'colorGold': { r: 255, g: 200, b: 50 },
      'colorPurple': { r: 180, g: 100, b: 255 },
      'colorRed': { r: 255, g: 80, b: 80 },
      'colorGreen': { r: 100, g: 255, b: 150 }
    };
    
    Object.keys(colorBtns).forEach(function(id) {
      const btn = document.getElementById(id);
      if (btn) {
        btn.addEventListener('click', function() {
          self.outlineColor = colorBtns[id];
          self.updateColorButtonStates(id);
        });
      }
    });
    
    this.updateColorButtonStates('colorCyan');
  },
  
  /**
   * 更新颜色按钮状态
   */
  updateColorButtonStates: function(activeId) {
    const ids = ['colorCyan', 'colorGold', 'colorPurple', 'colorRed', 'colorGreen'];
    ids.forEach(function(id) {
      const btn = document.getElementById(id);
      if (btn) {
        btn.classList.toggle('active', id === activeId);
      }
    });
  }
};

// 导出供全局使用
if (typeof window !== 'undefined') {
  window.SwordDemo = SwordDemo;
}
