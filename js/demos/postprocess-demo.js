/**
 * 后屏幕渲染演示
 * 第11章：后屏幕渲染是什么
 * 展示几个小人跑步，应用不同的后处理效果
 */

const PostProcessDemo = {
  canvas: null,
  ctx: null,
  offscreenCanvas: null,
  offscreenCtx: null,
  
  width: 350,
  height: 220,
  
  // 当前效果
  currentEffect: 'none',
  
  // 动画
  animationFrame: null,
  time: 0,
  
  // 小人数据
  runners: [],
  
  /**
   * 初始化
   */
  init: function() {
    this.canvas = document.getElementById('postprocessCanvas');
    if (!this.canvas) return false;
    
    this.ctx = this.canvas.getContext('2d');
    this.width = this.canvas.width;
    this.height = this.canvas.height;
    
    // 创建离屏canvas用于"渲染到纹理"
    this.offscreenCanvas = document.createElement('canvas');
    this.offscreenCanvas.width = this.width;
    this.offscreenCanvas.height = this.height;
    this.offscreenCtx = this.offscreenCanvas.getContext('2d');
    
    // 初始化小人
    this.initRunners();
    this.bindControls();
    this.startAnimation();
    
    return true;
  },
  
  /**
   * 初始化跑步小人
   */
  initRunners: function() {
    this.runners = [];
    const colors = ['#ff6b6b', '#51cf66', '#74c0fc', '#ffd43b', '#da77f2'];
    
    for (let i = 0; i < 5; i++) {
      this.runners.push({
        x: 30 + i * 65,
        y: this.height - 60,
        color: colors[i],
        phase: i * 0.5,  // 不同的跑步相位
        speed: 0.8 + Math.random() * 0.4
      });
    }
  },
  
  /**
   * 开始动画
   */
  startAnimation: function() {
    const self = this;
    
    function animate() {
      self.time += 0.05;
      self.draw();
      self.animationFrame = requestAnimationFrame(animate);
    }
    
    animate();
  },
  
  /**
   * 绘制跑步小人
   */
  drawRunner: function(ctx, runner, time) {
    const { x, y, color, phase, speed } = runner;
    const t = time * speed + phase;
    
    // 跑步动画参数
    const bounce = Math.abs(Math.sin(t * 4)) * 8;
    const legSwing = Math.sin(t * 4) * 0.5;
    const armSwing = Math.sin(t * 4) * 0.4;
    
    ctx.save();
    ctx.translate(x, y - bounce);
    
    // 身体
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.ellipse(0, -20, 10, 14, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // 头
    ctx.fillStyle = '#ffeaa7';
    ctx.beginPath();
    ctx.arc(0, -42, 10, 0, Math.PI * 2);
    ctx.fill();
    
    // 眼睛
    ctx.fillStyle = '#2d3436';
    ctx.beginPath();
    ctx.arc(-3, -44, 2, 0, Math.PI * 2);
    ctx.arc(3, -44, 2, 0, Math.PI * 2);
    ctx.fill();
    
    // 腿
    ctx.strokeStyle = color;
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    
    // 左腿
    ctx.beginPath();
    ctx.moveTo(-4, -8);
    ctx.lineTo(-4 + Math.sin(legSwing) * 15, 15);
    ctx.stroke();
    
    // 右腿
    ctx.beginPath();
    ctx.moveTo(4, -8);
    ctx.lineTo(4 + Math.sin(-legSwing) * 15, 15);
    ctx.stroke();
    
    // 手臂
    ctx.lineWidth = 4;
    
    // 左臂
    ctx.beginPath();
    ctx.moveTo(-8, -28);
    ctx.lineTo(-8 + Math.sin(-armSwing) * 12, -15);
    ctx.stroke();
    
    // 右臂
    ctx.beginPath();
    ctx.moveTo(8, -28);
    ctx.lineTo(8 + Math.sin(armSwing) * 12, -15);
    ctx.stroke();
    
    ctx.restore();
  },
  
  /**
   * 绘制场景到离屏canvas（模拟渲染到纹理）
   */
  drawSceneToTexture: function() {
    const ctx = this.offscreenCtx;
    
    // 清空并绘制背景
    ctx.fillStyle = '#2d3436';
    ctx.fillRect(0, 0, this.width, this.height);
    
    // 绘制地面
    ctx.fillStyle = '#636e72';
    ctx.fillRect(0, this.height - 40, this.width, 40);
    
    // 绘制跑道线
    ctx.strokeStyle = '#dfe6e9';
    ctx.lineWidth = 2;
    ctx.setLineDash([20, 10]);
    ctx.beginPath();
    ctx.moveTo(0, this.height - 40);
    ctx.lineTo(this.width, this.height - 40);
    ctx.stroke();
    ctx.setLineDash([]);
    
    // 绘制背景装饰（太阳/云）
    ctx.fillStyle = '#ffeaa7';
    ctx.beginPath();
    ctx.arc(this.width - 50, 40, 25, 0, Math.PI * 2);
    ctx.fill();
    
    // 云
    ctx.fillStyle = '#dfe6e9';
    this.drawCloud(ctx, 60, 50, 0.8);
    this.drawCloud(ctx, 180, 35, 0.6);
    
    // 绘制所有小人
    for (const runner of this.runners) {
      this.drawRunner(ctx, runner, this.time);
    }
  },
  
  /**
   * 绘制云朵
   */
  drawCloud: function(ctx, x, y, scale) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    ctx.beginPath();
    ctx.arc(0, 0, 20, 0, Math.PI * 2);
    ctx.arc(25, 0, 15, 0, Math.PI * 2);
    ctx.arc(-20, 5, 15, 0, Math.PI * 2);
    ctx.arc(10, -10, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  },
  
  /**
   * 应用后处理效果
   */
  applyPostProcess: function() {
    const srcCtx = this.offscreenCtx;
    const dstCtx = this.ctx;
    const w = this.width;
    const h = this.height;
    
    switch (this.currentEffect) {
      case 'none':
        // 直接复制
        dstCtx.drawImage(this.offscreenCanvas, 0, 0);
        break;
        
      case 'blur':
        this.applyBlur(srcCtx, dstCtx, w, h);
        break;
        
      case 'distort':
        this.applyDistort(srcCtx, dstCtx, w, h);
        break;
        
      case 'darken':
        this.applyDarken(srcCtx, dstCtx, w, h);
        break;
        
      case 'brighten':
        this.applyBrighten(srcCtx, dstCtx, w, h);
        break;
    }
  },
  
  /**
   * 模糊效果
   */
  applyBlur: function(srcCtx, dstCtx, w, h) {
    // 使用canvas内置的filter模拟高斯模糊
    dstCtx.filter = 'blur(4px)';
    dstCtx.drawImage(this.offscreenCanvas, 0, 0);
    dstCtx.filter = 'none';
  },
  
  /**
   * 扭曲效果（水波纹）
   */
  applyDistort: function(srcCtx, dstCtx, w, h) {
    const srcData = srcCtx.getImageData(0, 0, w, h);
    const dstData = dstCtx.createImageData(w, h);
    const src = srcData.data;
    const dst = dstData.data;
    
    const centerX = w / 2;
    const centerY = h / 2;
    const time = this.time;
    
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        // 计算到中心的距离
        const dx = x - centerX;
        const dy = y - centerY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        // 水波扭曲
        const wave = Math.sin(dist * 0.1 - time * 3) * 5;
        const angle = Math.atan2(dy, dx);
        
        // 计算采样位置
        let srcX = x + Math.cos(angle) * wave;
        let srcY = y + Math.sin(angle) * wave;
        
        // 边界检查
        srcX = Math.max(0, Math.min(w - 1, srcX));
        srcY = Math.max(0, Math.min(h - 1, srcY));
        
        const srcIdx = (Math.floor(srcY) * w + Math.floor(srcX)) * 4;
        const dstIdx = (y * w + x) * 4;
        
        dst[dstIdx] = src[srcIdx];
        dst[dstIdx + 1] = src[srcIdx + 1];
        dst[dstIdx + 2] = src[srcIdx + 2];
        dst[dstIdx + 3] = src[srcIdx + 3];
      }
    }
    
    dstCtx.putImageData(dstData, 0, 0);
  },
  
  /**
   * 变暗效果
   */
  applyDarken: function(srcCtx, dstCtx, w, h) {
    // 先绘制原图
    dstCtx.drawImage(this.offscreenCanvas, 0, 0);
    
    // 叠加半透明黑色
    dstCtx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    dstCtx.fillRect(0, 0, w, h);
    
    // 添加暗角效果
    const gradient = dstCtx.createRadialGradient(w/2, h/2, 0, w/2, h/2, w * 0.7);
    gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0.5)');
    dstCtx.fillStyle = gradient;
    dstCtx.fillRect(0, 0, w, h);
  },
  
  /**
   * 变亮效果
   */
  applyBrighten: function(srcCtx, dstCtx, w, h) {
    const srcData = srcCtx.getImageData(0, 0, w, h);
    const data = srcData.data;
    
    const brightness = 60;
    
    for (let i = 0; i < data.length; i += 4) {
      data[i] = Math.min(255, data[i] + brightness);
      data[i + 1] = Math.min(255, data[i + 1] + brightness);
      data[i + 2] = Math.min(255, data[i + 2] + brightness);
    }
    
    dstCtx.putImageData(srcData, 0, 0);
    
    // 添加光晕效果
    const gradient = dstCtx.createRadialGradient(w - 50, 40, 0, w - 50, 40, 100);
    gradient.addColorStop(0, 'rgba(255, 255, 200, 0.4)');
    gradient.addColorStop(1, 'rgba(255, 255, 200, 0)');
    dstCtx.fillStyle = gradient;
    dstCtx.fillRect(0, 0, w, h);
  },
  
  /**
   * 主绘制函数
   */
  draw: function() {
    // 第一步：渲染场景到"纹理"（离屏canvas）
    this.drawSceneToTexture();
    
    // 第二步：应用后处理效果
    this.applyPostProcess();
    
    // 绘制效果标签
    this.drawEffectLabel();
  },
  
  /**
   * 绘制当前效果标签
   */
  drawEffectLabel: function() {
    const ctx = this.ctx;
    const labels = {
      'none': '无效果（原始画面）',
      'blur': '模糊效果',
      'distort': '扭曲效果（水波）',
      'darken': '变暗效果',
      'brighten': '变亮效果'
    };
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(5, 5, 130, 22);
    
    ctx.fillStyle = '#fff';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(labels[this.currentEffect], 10, 20);
  },
  
  /**
   * 绑定控件
   */
  bindControls: function() {
    const self = this;
    
    const select = document.getElementById('postprocessEffect');
    if (select) {
      select.addEventListener('change', function() {
        self.currentEffect = this.value;
      });
    }
    
    const resetBtn = document.getElementById('postprocessReset');
    if (resetBtn) {
      resetBtn.addEventListener('click', function() {
        self.currentEffect = 'none';
        if (select) select.value = 'none';
      });
    }
  }
};

// 导出
if (typeof window !== 'undefined') {
  window.PostProcessDemo = PostProcessDemo;
}
