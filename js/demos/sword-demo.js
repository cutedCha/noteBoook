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
  
  // 特效参数
  outlineColor: { r: 0, g: 200, b: 255 },  // 青色
  outlineWidth: 3,
  bloomIntensity: 0.8,
  bloomRadius: 8,
  
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
    const pulseIntensity = 0.7 + 0.3 * Math.sin(this.glowPhase);
    
    ctx.save();
    ctx.translate(x, y);
    
    ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${pulseIntensity})`;
    ctx.lineWidth = this.outlineWidth;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    
    // 剑刃描边
    ctx.beginPath();
    ctx.moveTo(0, -70);
    ctx.lineTo(8, -50);
    ctx.lineTo(8, 20);
    ctx.lineTo(-8, 20);
    ctx.lineTo(-8, -50);
    ctx.closePath();
    ctx.stroke();
    
    // 护手描边
    ctx.strokeRect(-20, 20, 40, 8);
    
    // 剑柄描边
    ctx.strokeRect(-5, 28, 10, 35);
    
    // 剑柄底部描边
    ctx.beginPath();
    ctx.arc(0, 68, 6, 0, Math.PI * 2);
    ctx.stroke();
    
    ctx.restore();
  },

  /**
   * 绘制Bloom发光效果
   */
  drawBloom: function(ctx, x, y) {
    const { r, g, b } = this.outlineColor;
    const pulseIntensity = 0.5 + 0.5 * Math.sin(this.glowPhase);
    
    ctx.save();
    ctx.translate(x, y);
    
    // 多层发光模拟Bloom
    const layers = 5;
    for (let i = layers; i >= 1; i--) {
      const radius = this.outlineWidth + this.bloomRadius * i * this.bloomIntensity;
      const alpha = (0.15 / i) * pulseIntensity;
      
      ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
      ctx.lineWidth = radius;
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      
      // 剑刃发光
      ctx.beginPath();
      ctx.moveTo(0, -70);
      ctx.lineTo(8, -50);
      ctx.lineTo(8, 20);
      ctx.lineTo(-8, 20);
      ctx.lineTo(-8, -50);
      ctx.closePath();
      ctx.stroke();
      
      // 护手发光
      ctx.strokeRect(-20, 20, 40, 8);
      
      // 剑柄发光
      ctx.strokeRect(-5, 28, 10, 35);
      
      // 剑柄底部发光
      ctx.beginPath();
      ctx.arc(0, 68, 6, 0, Math.PI * 2);
      ctx.stroke();
    }
    
    ctx.restore();
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
