/**
 * 折射原理交互演示
 * 第14章：折射原理
 * 演示光从空气进入液体的折射
 */

const RefractionDemo = {
  canvas: null,
  ctx: null,
  
  // 参数
  width: 320,
  height: 200,
  liquidIndex: 1.33,    // 液体折射率（默认水）
  incidentAngle: 45,    // 入射角（度）
  
  // 界面位置
  interfaceY: 100,      // 空气-液体界面的Y坐标
  
  /**
   * 初始化演示
   */
  init: function() {
    this.canvas = document.getElementById('refractionCanvas');
    
    if (!this.canvas) return false;
    
    this.ctx = this.canvas.getContext('2d');
    this.width = this.canvas.width;
    this.height = this.canvas.height;
    this.interfaceY = this.height / 2;
    
    // 绑定控件
    this.bindControls();
    
    // 初始绘制
    this.draw();
    
    return true;
  },
  
  /**
   * 绘制场景
   */
  draw: function() {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;
    
    // 清空画布
    ctx.clearRect(0, 0, w, h);
    
    // 绘制空气区域（上半部分）
    ctx.fillStyle = '#e8f4fc';
    ctx.fillRect(0, 0, w, this.interfaceY);
    
    // 绘制液体区域（下半部分）
    ctx.fillStyle = '#a8d8ea';
    ctx.fillRect(0, this.interfaceY, w, h - this.interfaceY);
    
    // 绘制界面线
    ctx.strokeStyle = '#5dade2';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(0, this.interfaceY);
    ctx.lineTo(w, this.interfaceY);
    ctx.stroke();
    ctx.setLineDash([]);
    
    // 绘制法线（虚线）
    const centerX = w / 2;
    ctx.strokeStyle = '#888';
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(centerX, 20);
    ctx.lineTo(centerX, h - 20);
    ctx.stroke();
    ctx.setLineDash([]);
    
    // 计算折射（光从空气进入液体）
    const n1 = 1.0;               // 空气折射率
    const n2 = this.liquidIndex;  // 液体折射率
    const theta1Rad = this.incidentAngle * Math.PI / 180;
    
    // 斯涅尔定律: n1 * sin(θ1) = n2 * sin(θ2)
    const sinTheta2 = (n1 / n2) * Math.sin(theta1Rad);
    const theta2Rad = Math.asin(sinTheta2);
    
    // 入射点
    const hitX = centerX;
    const hitY = this.interfaceY;
    
    // 入射光线（从空气中来，从上方射入）
    const rayLength = 80;
    const incidentStartX = hitX - rayLength * Math.sin(theta1Rad);
    const incidentStartY = hitY - rayLength * Math.cos(theta1Rad);
    
    // 绘制入射光线
    ctx.strokeStyle = '#e74c3c';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(incidentStartX, incidentStartY);
    ctx.lineTo(hitX, hitY);
    ctx.stroke();
    
    // 绘制入射光线箭头
    this.drawArrow(ctx, incidentStartX, incidentStartY, hitX, hitY, '#e74c3c');
    
    // 折射光线（进入液体，向下）
    const refractEndX = hitX + rayLength * Math.sin(theta2Rad);
    const refractEndY = hitY + rayLength * Math.cos(theta2Rad);
    
    ctx.strokeStyle = '#27ae60';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(hitX, hitY);
    ctx.lineTo(refractEndX, refractEndY);
    ctx.stroke();
    
    this.drawArrow(ctx, hitX, hitY, refractEndX, refractEndY, '#27ae60');
    
    // 绘制角度弧线
    this.drawAngleArc(ctx, hitX, hitY, theta1Rad, true, '#e74c3c');   // 入射角（上方）
    this.drawAngleArc(ctx, hitX, hitY, theta2Rad, false, '#27ae60');  // 折射角（下方）
    
    // 显示折射角
    const theta2Deg = Math.round(theta2Rad * 180 / Math.PI);
    ctx.fillStyle = '#27ae60';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`折射角: ${theta2Deg}°`, centerX + 10, this.interfaceY + 50);
    
    // 标签
    ctx.fillStyle = '#666';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('空气 (n=1.0)', 10, 25);
    ctx.fillText(`液体 (n=${this.liquidIndex.toFixed(2)})`, 10, this.interfaceY + 20);
    
    // 入射角标签
    ctx.fillStyle = '#e74c3c';
    ctx.fillText(`入射角: ${this.incidentAngle}°`, centerX + 10, this.interfaceY - 40);
    
    // 法线标签
    ctx.fillStyle = '#888';
    ctx.font = '10px sans-serif';
    ctx.fillText('法线', centerX + 5, 35);
  },
  
  /**
   * 绘制箭头
   */
  drawArrow: function(ctx, fromX, fromY, toX, toY, color) {
    const headLen = 10;
    const angle = Math.atan2(toY - fromY, toX - fromX);
    
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(toX, toY);
    ctx.lineTo(toX - headLen * Math.cos(angle - Math.PI / 6), toY - headLen * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(toX - headLen * Math.cos(angle + Math.PI / 6), toY - headLen * Math.sin(angle + Math.PI / 6));
    ctx.closePath();
    ctx.fill();
  },
  
  /**
   * 绘制角度弧线
   */
  drawAngleArc: function(ctx, x, y, angle, isAbove, color) {
    const radius = 25;
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    
    if (isAbove) {
      // 入射角（在界面上方，从法线到入射光线）
      ctx.arc(x, y, radius, -Math.PI / 2, -Math.PI / 2 + angle);
    } else {
      // 折射角（在界面下方，从法线到折射光线）
      ctx.arc(x, y, radius, Math.PI / 2 - angle, Math.PI / 2);
    }
    ctx.stroke();
  },
  
  /**
   * 绑定控件
   */
  bindControls: function() {
    const self = this;
    
    // 折射率滑块
    const indexSlider = document.getElementById('liquidIndex');
    const indexValue = document.getElementById('liquidIndexValue');
    if (indexSlider) {
      indexSlider.addEventListener('input', function() {
        self.liquidIndex = parseFloat(this.value);
        if (indexValue) indexValue.textContent = self.liquidIndex.toFixed(2);
        self.updateButtonStates();
        self.draw();
      });
    }
    
    // 入射角滑块
    const angleSlider = document.getElementById('incidentAngle');
    const angleValue = document.getElementById('incidentAngleValue');
    if (angleSlider) {
      angleSlider.addEventListener('input', function() {
        self.incidentAngle = parseInt(this.value);
        if (angleValue) angleValue.textContent = self.incidentAngle;
        self.draw();
      });
    }
    
    // 预设材质按钮
    const waterBtn = document.getElementById('presetWater');
    const glassBtn = document.getElementById('presetGlass');
    const diamondBtn = document.getElementById('presetDiamond');
    
    if (waterBtn) {
      waterBtn.addEventListener('click', function() {
        self.liquidIndex = 1.33;
        self.updateSlider('liquidIndex', 1.33);
        self.updateButtonStates();
        self.draw();
      });
    }
    
    if (glassBtn) {
      glassBtn.addEventListener('click', function() {
        self.liquidIndex = 1.5;
        self.updateSlider('liquidIndex', 1.5);
        self.updateButtonStates();
        self.draw();
      });
    }
    
    if (diamondBtn) {
      diamondBtn.addEventListener('click', function() {
        self.liquidIndex = 2.42;
        self.updateSlider('liquidIndex', 2.42);
        self.updateButtonStates();
        self.draw();
      });
    }
    
    this.updateButtonStates();
  },
  
  /**
   * 更新滑块值
   */
  updateSlider: function(id, value) {
    const slider = document.getElementById(id);
    const valueSpan = document.getElementById(id + 'Value');
    if (slider) {
      slider.value = value;
    }
    if (valueSpan) {
      valueSpan.textContent = value.toFixed(2);
    }
  },
  
  /**
   * 更新按钮状态
   */
  updateButtonStates: function() {
    const waterBtn = document.getElementById('presetWater');
    const glassBtn = document.getElementById('presetGlass');
    const diamondBtn = document.getElementById('presetDiamond');
    
    if (waterBtn) waterBtn.classList.toggle('active', Math.abs(this.liquidIndex - 1.33) < 0.01);
    if (glassBtn) glassBtn.classList.toggle('active', Math.abs(this.liquidIndex - 1.5) < 0.01);
    if (diamondBtn) diamondBtn.classList.toggle('active', Math.abs(this.liquidIndex - 2.42) < 0.01);
  }
};

// 导出供全局使用
if (typeof window !== 'undefined') {
  window.RefractionDemo = RefractionDemo;
}
