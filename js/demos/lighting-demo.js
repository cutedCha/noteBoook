/**
 * 光照模型交互演示
 * 第2章：光照模型是什么
 */

const LightingDemo = {
  canvas: null,
  ctx: null,
  
  // 参数
  sphereRadius: 80,
  centerX: 150,
  centerY: 150,
  lightAngle: -45,  // 光源角度（度）
  currentModel: 'diffuse',  // 当前光照模型
  
  // 颜色
  baseColor: { r: 100, g: 150, b: 255 },  // 球体基础颜色
  
  /**
   * 初始化演示
   */
  init: function() {
    this.canvas = document.getElementById('lightingCanvas');
    if (!this.canvas) return false;
    
    this.ctx = this.canvas.getContext('2d');
    
    // 绑定按钮事件
    this.bindButtons();
    
    // 绑定滑块
    this.bindSlider();
    
    // 初始绘制
    this.draw();
    
    return true;
  },
  
  /**
   * 绘制球体
   */
  draw: function() {
    const ctx = this.ctx;
    const canvas = this.canvas;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 计算光源方向（归一化）
    const lightRad = this.lightAngle * Math.PI / 180;
    const lightX = Math.cos(lightRad);
    const lightY = Math.sin(lightRad);
    
    // 逐像素绘制球体
    const imageData = ctx.createImageData(canvas.width, canvas.height);
    const data = imageData.data;
    
    for (let y = 0; y < canvas.height; y++) {
      for (let x = 0; x < canvas.width; x++) {
        const dx = x - this.centerX;
        const dy = y - this.centerY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist <= this.sphereRadius) {
          // 计算球面法线
          const nx = dx / this.sphereRadius;
          const ny = dy / this.sphereRadius;
          const nz = Math.sqrt(1 - nx * nx - ny * ny);
          
          // 计算光照强度
          let brightness = this.calculateLighting(nx, ny, nz, lightX, lightY);
          
          // 应用颜色
          const idx = (y * canvas.width + x) * 4;
          data[idx] = Math.min(255, this.baseColor.r * brightness);
          data[idx + 1] = Math.min(255, this.baseColor.g * brightness);
          data[idx + 2] = Math.min(255, this.baseColor.b * brightness);
          data[idx + 3] = 255;
        }
      }
    }
    
    ctx.putImageData(imageData, 0, 0);
    
    // 画光源指示
    this.drawLightIndicator(lightRad);
    
    // 画模型名称
    ctx.fillStyle = '#fff';
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(this.getModelName(), this.centerX, canvas.height - 10);
  },
  
  /**
   * 计算光照强度
   */
  calculateLighting: function(nx, ny, nz, lightX, lightY) {
    const lightZ = 0.5;  // 光源z方向分量
    
    // 归一化光源方向
    const lightLen = Math.sqrt(lightX * lightX + lightY * lightY + lightZ * lightZ);
    const lx = lightX / lightLen;
    const ly = lightY / lightLen;
    const lz = lightZ / lightLen;
    
    switch (this.currentModel) {
      case 'flat':
        // 无光照：纯色
        return 1.0;
        
      case 'diffuse':
        // 漫反射（Lambert）
        const diffuse = Math.max(0, nx * lx + ny * ly + nz * lz);
        return 0.2 + diffuse * 0.8;  // 环境光 + 漫反射
        
      case 'phong':
        // Phong光照模型
        const diff = Math.max(0, nx * lx + ny * ly + nz * lz);
        // 计算反射向量
        const dot = nx * lx + ny * ly + nz * lz;
        const rx = 2 * dot * nx - lx;
        const ry = 2 * dot * ny - ly;
        const rz = 2 * dot * nz - lz;
        // 视线方向（朝向屏幕外）
        const spec = Math.pow(Math.max(0, rz), 32);
        return 0.1 + diff * 0.6 + spec * 0.8;
        
      case 'toon':
        // 卡通着色（色阶）
        const toonDiff = Math.max(0, nx * lx + ny * ly + nz * lz);
        if (toonDiff > 0.8) return 1.0;
        if (toonDiff > 0.5) return 0.7;
        if (toonDiff > 0.2) return 0.4;
        return 0.2;
        
      default:
        return 1.0;
    }
  },
  
  /**
   * 获取模型名称
   */
  getModelName: function() {
    const names = {
      'flat': '无光照（平面）',
      'diffuse': '漫反射（Lambert）',
      'phong': 'Phong高光',
      'toon': '卡通着色'
    };
    return names[this.currentModel] || '';
  },
  
  /**
   * 画光源指示器
   */
  drawLightIndicator: function(lightRad) {
    const ctx = this.ctx;
    const indicatorDist = this.sphereRadius + 30;
    const lx = this.centerX + Math.cos(lightRad) * indicatorDist;
    const ly = this.centerY + Math.sin(lightRad) * indicatorDist;
    
    // 画光源
    ctx.fillStyle = '#ffd93d';
    ctx.beginPath();
    ctx.arc(lx, ly, 10, 0, Math.PI * 2);
    ctx.fill();
    
    // 画光芒
    ctx.strokeStyle = '#ffd93d';
    ctx.lineWidth = 2;
    for (let i = 0; i < 8; i++) {
      const angle = i * Math.PI / 4;
      ctx.beginPath();
      ctx.moveTo(lx + Math.cos(angle) * 12, ly + Math.sin(angle) * 12);
      ctx.lineTo(lx + Math.cos(angle) * 18, ly + Math.sin(angle) * 18);
      ctx.stroke();
    }
    
    // 标签
    ctx.fillStyle = '#ffd93d';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('光源', lx, ly + 30);
  },
  
  /**
   * 绑定按钮事件
   */
  bindButtons: function() {
    const self = this;
    const buttons = document.querySelectorAll('.lighting-model-btn');
    
    buttons.forEach(function(btn) {
      btn.addEventListener('click', function() {
        // 移除所有active状态
        buttons.forEach(b => b.classList.remove('active'));
        // 添加当前active状态
        this.classList.add('active');
        // 切换模型
        self.currentModel = this.dataset.model;
        self.draw();
      });
    });
  },
  
  /**
   * 绑定光源角度滑块
   */
  bindSlider: function() {
    const self = this;
    const slider = document.getElementById('lightAngleSlider');
    const valueEl = document.getElementById('lightAngleValue');
    
    if (slider) {
      slider.addEventListener('input', function() {
        self.lightAngle = parseInt(this.value);
        if (valueEl) valueEl.textContent = self.lightAngle;
        self.draw();
      });
    }
  }
};

// 导出供全局使用
if (typeof window !== 'undefined') {
  window.LightingDemo = LightingDemo;
}
