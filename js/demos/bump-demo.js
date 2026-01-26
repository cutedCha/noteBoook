/**
 * 凹凸映射交互演示
 * 第3章：凹凸映射原理
 */

const BumpDemo = {
  canvas: null,
  ctx: null,
  
  // 参数
  width: 280,
  height: 200,
  bumpStrength: 0.5,
  lightAngle: -45,
  mode: 'bump',  // 'flat' | 'bump'
  pattern: 'bricks',  // 'bricks' | 'waves' | 'dots'
  
  /**
   * 初始化演示
   */
  init: function() {
    this.canvas = document.getElementById('bumpCanvas');
    if (!this.canvas) return false;
    
    this.ctx = this.canvas.getContext('2d');
    this.width = this.canvas.width;
    this.height = this.canvas.height;
    
    // 绑定事件
    this.bindButtons();
    this.bindSliders();
    
    // 初始绘制
    this.draw();
    
    return true;
  },
  
  /**
   * 生成凹凸高度图
   */
  getHeight: function(x, y) {
    switch (this.pattern) {
      case 'bricks':
        // 砖块图案
        const brickW = 40;
        const brickH = 20;
        const row = Math.floor(y / brickH);
        const offsetX = (row % 2) * (brickW / 2);
        const bx = (x + offsetX) % brickW;
        const by = y % brickH;
        // 砖缝是凹的
        if (bx < 2 || by < 2) return 0;
        return 1;
        
      case 'waves':
        // 波浪图案
        return (Math.sin(x * 0.1) * Math.sin(y * 0.1) + 1) / 2;
        
      case 'dots':
        // 圆点凸起图案
        const dotSpacing = 30;
        const dotRadius = 10;
        const cx = (x % dotSpacing) - dotSpacing / 2;
        const cy = (y % dotSpacing) - dotSpacing / 2;
        const dist = Math.sqrt(cx * cx + cy * cy);
        if (dist < dotRadius) {
          return 1 - dist / dotRadius;
        }
        return 0;
        
      default:
        return 0.5;
    }
  },
  
  /**
   * 计算法线（从高度图）
   */
  getNormal: function(x, y) {
    if (this.mode === 'flat') {
      return { x: 0, y: 0, z: 1 };
    }
    
    // 采样周围高度
    const hL = this.getHeight(x - 1, y);
    const hR = this.getHeight(x + 1, y);
    const hU = this.getHeight(x, y - 1);
    const hD = this.getHeight(x, y + 1);
    
    // 计算梯度
    const dx = (hR - hL) * this.bumpStrength * 2;
    const dy = (hD - hU) * this.bumpStrength * 2;
    
    // 归一化
    const len = Math.sqrt(dx * dx + dy * dy + 1);
    return {
      x: -dx / len,
      y: -dy / len,
      z: 1 / len
    };
  },
  
  /**
   * 绘制
   */
  draw: function() {
    const ctx = this.ctx;
    const imageData = ctx.createImageData(this.width, this.height);
    const data = imageData.data;
    
    // 光源方向
    const lightRad = this.lightAngle * Math.PI / 180;
    const lightX = Math.cos(lightRad) * 0.7;
    const lightY = Math.sin(lightRad) * 0.7;
    const lightZ = 0.7;
    const lightLen = Math.sqrt(lightX * lightX + lightY * lightY + lightZ * lightZ);
    const lx = lightX / lightLen;
    const ly = lightY / lightLen;
    const lz = lightZ / lightLen;
    
    // 基础颜色（砖红色）
    const baseR = 180;
    const baseG = 100;
    const baseB = 80;
    
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const normal = this.getNormal(x, y);
        
        // 漫反射光照
        const diffuse = Math.max(0, normal.x * lx + normal.y * ly + normal.z * lz);
        const brightness = 0.3 + diffuse * 0.7;
        
        const idx = (y * this.width + x) * 4;
        data[idx] = Math.min(255, baseR * brightness);
        data[idx + 1] = Math.min(255, baseG * brightness);
        data[idx + 2] = Math.min(255, baseB * brightness);
        data[idx + 3] = 255;
      }
    }
    
    ctx.putImageData(imageData, 0, 0);
    
    // 画标签
    ctx.fillStyle = '#fff';
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'center';
    const label = this.mode === 'flat' ? '无凹凸映射（平面）' : '有凹凸映射（立体感）';
    ctx.fillText(label, this.width / 2, this.height - 10);
  },
  
  /**
   * 绑定按钮
   */
  bindButtons: function() {
    const self = this;
    
    // 模式按钮
    const modeButtons = document.querySelectorAll('.bump-mode-btn');
    modeButtons.forEach(function(btn) {
      btn.addEventListener('click', function() {
        modeButtons.forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        self.mode = this.dataset.mode;
        self.draw();
      });
    });
    
    // 图案按钮
    const patternButtons = document.querySelectorAll('.bump-pattern-btn');
    patternButtons.forEach(function(btn) {
      btn.addEventListener('click', function() {
        patternButtons.forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        self.pattern = this.dataset.pattern;
        self.draw();
      });
    });
  },
  
  /**
   * 绑定滑块
   */
  bindSliders: function() {
    const self = this;
    
    // 光源角度
    const angleSlider = document.getElementById('bumpLightAngle');
    const angleValue = document.getElementById('bumpLightAngleValue');
    if (angleSlider) {
      angleSlider.addEventListener('input', function() {
        self.lightAngle = parseInt(this.value);
        if (angleValue) angleValue.textContent = self.lightAngle;
        self.draw();
      });
    }
    
    // 凹凸强度
    const strengthSlider = document.getElementById('bumpStrength');
    const strengthValue = document.getElementById('bumpStrengthValue');
    if (strengthSlider) {
      strengthSlider.addEventListener('input', function() {
        self.bumpStrength = parseFloat(this.value);
        if (strengthValue) strengthValue.textContent = self.bumpStrength.toFixed(1);
        self.draw();
      });
    }
  }
};

// 导出供全局使用
if (typeof window !== 'undefined') {
  window.BumpDemo = BumpDemo;
}
