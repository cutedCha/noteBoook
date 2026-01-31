/**
 * 透镜折射原理演示
 * 第1章：透镜成像的奥秘
 * 展示单条光线如何被透镜折射
 */

const LensRefractionDemo = {
  canvas: null,
  ctx: null,
  
  width: 350,
  height: 200,
  
  // 光线Y位置（可调节）
  rayY: 50,
  
  // 透镜参数
  lensX: 175,
  
  /**
   * 初始化
   */
  init: function() {
    this.canvas = document.getElementById('refractionDemoCanvas');
    if (!this.canvas) {
      console.log('LensRefractionDemo: canvas not found');
      return false;
    }
    
    this.ctx = this.canvas.getContext('2d');
    this.width = this.canvas.width;
    this.height = this.canvas.height;
    
    this.bindControls();
    this.draw();
    
    console.log('LensRefractionDemo initialized');
    return true;
  },
  
  /**
   * 绘制角度弧线
   * @param {number} cx - 圆心X
   * @param {number} cy - 圆心Y
   * @param {number} radius - 半径
   * @param {number} startAngle - 起始角度（弧度）
   * @param {number} endAngle - 结束角度（弧度）
   * @param {string} color - 颜色
   */
  drawAngleArc: function(cx, cy, radius, startAngle, endAngle, color) {
    const ctx = this.ctx;
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, startAngle, endAngle);
    ctx.stroke();
  },
  
  /**
   * 绘制
   */
  draw: function() {
    const ctx = this.ctx;
    const centerY = this.height / 2;
    const lensHeight = 70;
    
    // 清空背景
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, this.width, this.height);
    
    // 画主光轴（虚线）
    ctx.strokeStyle = '#444';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(0, centerY);
    ctx.lineTo(this.width, centerY);
    ctx.stroke();
    ctx.setLineDash([]);
    
    // 画透镜（椭圆形）
    ctx.fillStyle = 'rgba(78, 205, 196, 0.2)';
    ctx.strokeStyle = '#4ecdc4';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(this.lensX, centerY, 12, lensHeight, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    
    // 光线起点
    const startX = 20;
    const rayStartY = centerY - this.rayY;
    
    // 光线与透镜左侧交点
    const hitX = this.lensX - 10;
    const hitY = rayStartY;
    
    // 计算折射：入射角越大，折射越明显
    // 简化模型：根据光线离光轴的距离计算折射角度
    const distFromAxis = Math.abs(this.rayY);
    const maxDist = 70;
    const normalizedDist = Math.min(distFromAxis / maxDist, 1);
    
    // 入射角（与法线的夹角）- 凸透镜表面法线是斜的
    // 透镜表面越靠近边缘，法线与水平方向夹角越大
    const surfaceAngle = normalizedDist * 0.6; // 表面倾斜角度
    const incidentAngle = surfaceAngle; // 入射角 = 入射光线与法线的夹角
    
    // 折射角度（边缘折射更大）
    const refractAngle = normalizedDist * 0.5;  // 最大约30度
    
    // 透镜出口
    const exitX = this.lensX + 10;
    const exitY = hitY;
    
    // 出射光线方向（向光轴折射）
    const direction = this.rayY > 0 ? 1 : -1;  // 上方光线向下折，下方光线向上折
    
    // 计算出射光线终点
    const endX = this.width - 20;
    const endY = exitY + (endX - exitX) * Math.tan(refractAngle) * direction;
    
    // ===== 绘制法线（虚线，垂直于透镜表面） =====
    if (this.rayY !== 0) {
      ctx.strokeStyle = '#888';
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      
      // 法线方向：垂直于透镜表面，指向入射光线来的方向
      const normalLength = 40;
      const normalAngle = -surfaceAngle * direction; // 法线角度
      
      ctx.beginPath();
      ctx.moveTo(hitX - normalLength * Math.cos(normalAngle), hitY - normalLength * Math.sin(normalAngle));
      ctx.lineTo(hitX + normalLength * Math.cos(normalAngle), hitY + normalLength * Math.sin(normalAngle));
      ctx.stroke();
      ctx.setLineDash([]);
      
      // 标注法线
      ctx.fillStyle = '#888';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('法线', hitX + normalLength * Math.cos(normalAngle) + 3, hitY + normalLength * Math.sin(normalAngle));
    }
    
    // ===== 绘制光线 =====
    
    // 入射光线（黄色，水平）
    ctx.strokeStyle = '#ffd93d';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(startX, rayStartY);
    ctx.lineTo(hitX, hitY);
    ctx.stroke();
    
    // 画箭头
    ctx.fillStyle = '#ffd93d';
    ctx.beginPath();
    ctx.moveTo(hitX - 5, hitY);
    ctx.lineTo(hitX - 15, hitY - 5);
    ctx.lineTo(hitX - 15, hitY + 5);
    ctx.closePath();
    ctx.fill();
    
    // 透镜内部（青色）
    ctx.strokeStyle = '#4ecdc4';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(hitX, hitY);
    ctx.lineTo(exitX, exitY);
    ctx.stroke();
    
    // 出射光线（橙色）
    ctx.strokeStyle = '#ff9f43';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(exitX, exitY);
    ctx.lineTo(endX, Math.max(20, Math.min(this.height - 20, endY)));
    ctx.stroke();
    
    // 画出射箭头
    const arrowX = exitX + 40;
    const arrowY = exitY + 40 * Math.tan(refractAngle) * direction;
    ctx.fillStyle = '#ff9f43';
    ctx.beginPath();
    const angle = Math.atan2(arrowY - exitY, arrowX - exitX);
    ctx.moveTo(arrowX, arrowY);
    ctx.lineTo(arrowX - 10 * Math.cos(angle - 0.4), arrowY - 10 * Math.sin(angle - 0.4));
    ctx.lineTo(arrowX - 10 * Math.cos(angle + 0.4), arrowY - 10 * Math.sin(angle + 0.4));
    ctx.closePath();
    ctx.fill();
    
    // ===== 绘制入射角弧线（入射光线与法线之间） =====
    if (this.rayY !== 0) {
      const arcRadius = 20;
      const normalAngle = -surfaceAngle * direction;
      
      // 入射光线角度是 π（从右向左水平）
      const incidentRayAngle = Math.PI;
      
      // 入射角弧线：从法线到入射光线
      // 法线角度需要取指向入射光线来源方向的那一侧
      let normalAngleForArc = normalAngle;
      if (direction > 0) {
        // 光线从上方来，法线向上
        normalAngleForArc = normalAngle - Math.PI;
      } else {
        // 光线从下方来，法线向下
        normalAngleForArc = normalAngle + Math.PI;
      }
      
      // 画入射角弧线（黄色，在入射光线和法线之间）
      const startArc = Math.min(incidentRayAngle, normalAngleForArc + Math.PI);
      const endArc = Math.max(incidentRayAngle, normalAngleForArc + Math.PI);
      
      // 简化：入射角弧线在入射点，从水平线到法线
      if (direction > 0) {
        // 上方光线：弧线在法线上方
        this.drawAngleArc(hitX, hitY, arcRadius, Math.PI - surfaceAngle, Math.PI, '#ffd93d');
      } else {
        // 下方光线：弧线在法线下方
        this.drawAngleArc(hitX, hitY, arcRadius, Math.PI, Math.PI + surfaceAngle, '#ffd93d');
      }
      
      // 标注入射角 θ₁
      const labelRadius = arcRadius + 12;
      const labelAngle = direction > 0 ? Math.PI - surfaceAngle/2 : Math.PI + surfaceAngle/2;
      ctx.fillStyle = '#ffd93d';
      ctx.font = '11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('θ₁', hitX + labelRadius * Math.cos(labelAngle), hitY + labelRadius * Math.sin(labelAngle) + 4);
    }
    
    // 显示信息
    ctx.fillStyle = '#aaa';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'left';
    
    const incidentDeg = (normalizedDist * 35).toFixed(1);
    const refractDeg = (normalizedDist * 25).toFixed(1);
    ctx.fillText('入射角 θ₁: ' + incidentDeg + '°', 10, 20);
    ctx.fillText('折射角: ' + refractDeg + '°', 10, 38);
    
    // 底部说明
    if (this.rayY < 10) {
      ctx.fillStyle = '#51cf66';
      ctx.textAlign = 'center';
      ctx.fillText('✓ 平行光轴 → 几乎不折射', this.width / 2, this.height - 10);
    } else {
      ctx.fillStyle = '#888';
      ctx.textAlign = 'center';
      ctx.fillText('入射角 = 入射光线与法线的夹角', this.width / 2, this.height - 10);
    }
    
    // 透镜标签
    ctx.fillStyle = '#4ecdc4';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('凸透镜', this.lensX, centerY + lensHeight + 15);
  },
  
  /**
   * 绑定控件
   */
  bindControls: function() {
    const self = this;
    
    const slider = document.getElementById('rayYSlider');
    const valueEl = document.getElementById('rayYValue');
    
    if (slider) {
      slider.addEventListener('input', function() {
        self.rayY = parseInt(this.value);
        if (valueEl) valueEl.textContent = self.rayY;
        self.draw();
      });
    }
  }
};

// 导出
if (typeof window !== 'undefined') {
  window.LensRefractionDemo = LensRefractionDemo;
}
