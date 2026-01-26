/**
 * 凸透镜成像交互演示
 * 第1章：透镜成像的奥秘
 */

const LensDemo = {
  canvas: null,
  ctx: null,
  
  // 参数
  focalLength: 60,
  lensX: 250,  // 透镜位置往左移，给像留更多空间
  objectX: 100,
  objectHeight: 50,
  isDragging: false,
  
  /**
   * 初始化演示
   */
  init: function() {
    this.canvas = document.getElementById('lensCanvas');
    if (!this.canvas) return false;
    
    this.ctx = this.canvas.getContext('2d');
    
    // 绑定事件
    this.bindEvents();
    
    // 绑定滑块
    this.bindSlider();
    
    // 初始绘制
    this.draw();
    
    return true;
  },
  
  /**
   * 透镜成像公式: 1/f = 1/u + 1/v
   */
  calculateImage: function(objX, f) {
    const u = this.lensX - objX;  // 物距（正值）
    if (u <= 0 || u <= f) return null;  // 物体在透镜上或焦点内
    
    const v = 1 / (1/f - 1/u);  // 像距
    const m = -v / u;  // 放大率（负号表示倒立）
    
    return {
      imageX: this.lensX + v,
      imageHeight: this.objectHeight * m,
      u: u,
      v: v,
      m: m
    };
  },
  
  /**
   * 绘制演示
   */
  draw: function() {
    const ctx = this.ctx;
    const canvas = this.canvas;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 画主光轴
    ctx.strokeStyle = '#666';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(0, 150);
    ctx.lineTo(600, 150);
    ctx.stroke();
    ctx.setLineDash([]);
    
    // 画透镜（双凸透镜形状）
    ctx.strokeStyle = '#4ecdc4';
    ctx.fillStyle = 'rgba(78, 205, 196, 0.1)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(this.lensX, 150, 15, 100, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    
    // 画焦点
    ctx.fillStyle = '#ffd93d';
    ctx.beginPath();
    ctx.arc(this.lensX - this.focalLength, 150, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(this.lensX + this.focalLength, 150, 6, 0, Math.PI * 2);
    ctx.fill();
    
    // 焦点标签
    ctx.fillStyle = '#aaa';
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('F', this.lensX - this.focalLength, 175);
    ctx.fillText("F'", this.lensX + this.focalLength, 175);
    
    // 画2倍焦距点
    ctx.fillStyle = '#888';
    ctx.beginPath();
    ctx.arc(this.lensX - this.focalLength * 2, 150, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(this.lensX + this.focalLength * 2, 150, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillText('2F', this.lensX - this.focalLength * 2, 175);
    ctx.fillText("2F'", this.lensX + this.focalLength * 2, 175);
    
    // 物体中心在主光轴上，上下对称
    const halfHeight = this.objectHeight / 2;
    const objTopY = 150 - halfHeight;    // 物体顶部
    const objBottomY = 150 + halfHeight; // 物体底部
    
    // 画物体（红色箭头，从底部到顶部）
    this.drawArrow(this.objectX, objBottomY, this.objectX, objTopY, '#ff6b6b', 3);
    ctx.fillStyle = '#ff6b6b';
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('物体', this.objectX, objBottomY + 20);
    
    // 计算成像
    const img = this.calculateImage(this.objectX, this.focalLength);
    
    if (img && img.imageX > this.lensX) {
      // 像也是中心对称的（倒立）
      const imgHalfHeight = halfHeight * Math.abs(img.m);
      const imgTopY = 150 + imgHalfHeight;    // 像顶部（倒立后在下方）
      const imgBottomY = 150 - imgHalfHeight; // 像底部（倒立后在上方）
      
      // 限制像的x坐标不超出画布
      const displayImgX = Math.min(img.imageX, 570);
      // 如果像超出画布，按比例缩放显示位置
      const scale = (displayImgX - this.lensX) / (img.imageX - this.lensX);
      const displayImgTopY = 150 + imgHalfHeight * scale;
      const displayImgBottomY = 150 - imgHalfHeight * scale;
      
      ctx.lineWidth = 2;
      
      // ========== 经典物理课本画法：从物体顶部和底部发出光线 ==========
      
      // 光线1：从物体顶部水平射出 → 经透镜折射到像底部
      ctx.strokeStyle = 'rgba(255, 180, 100, 0.85)';
      ctx.beginPath();
      ctx.moveTo(this.objectX, objTopY);
      ctx.lineTo(this.lensX, objTopY);
      ctx.lineTo(displayImgX, displayImgTopY);
      ctx.stroke();
      
      // 光线2：从物体顶部过光心 → 直线到像底部（形成X交叉）
      ctx.strokeStyle = 'rgba(100, 200, 255, 0.85)';
      ctx.beginPath();
      ctx.moveTo(this.objectX, objTopY);
      ctx.lineTo(displayImgX, displayImgTopY);
      ctx.stroke();
      
      // 光线3：从物体底部水平射出 → 经透镜折射到像顶部
      ctx.strokeStyle = 'rgba(150, 255, 150, 0.85)';
      ctx.beginPath();
      ctx.moveTo(this.objectX, objBottomY);
      ctx.lineTo(this.lensX, objBottomY);
      ctx.lineTo(displayImgX, displayImgBottomY);
      ctx.stroke();
      
      // 光线4：从物体底部过光心 → 直线到像顶部
      ctx.strokeStyle = 'rgba(200, 150, 255, 0.85)';
      ctx.beginPath();
      ctx.moveTo(this.objectX, objBottomY);
      ctx.lineTo(displayImgX, displayImgBottomY);
      ctx.stroke();
      
      // 只有当像在画布内时才画像
      if (img.imageX < 580) {
        // 画像（蓝色箭头，倒立：从顶部到底部）
        this.drawArrow(img.imageX, imgBottomY, img.imageX, imgTopY, '#45b7d1', 3);
        ctx.fillStyle = '#45b7d1';
        ctx.font = '14px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('像', img.imageX, imgTopY + 20);
      } else {
        // 像超出画布，显示提示
        ctx.fillStyle = '#45b7d1';
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText('像在右侧 →', 590, 150);
      }
      
      // 更新信息显示
      this.updateInfo(img);
    } else {
      // 虚像情况或无法成像
      this.updateInfo(null);
    }
    
    // 提示文字
    ctx.fillStyle = '#888';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('← 拖动红色箭头', this.objectX + 15, 90 - this.objectHeight/2);
  },
  
  /**
   * 画箭头
   */
  drawArrow: function(x1, y1, x2, y2, color, lineWidth) {
    const ctx = this.ctx;
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = lineWidth;
    
    // 画线
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    
    // 画箭头头部
    const angle = Math.atan2(y2 - y1, x2 - x1);
    const headLen = 12;
    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - headLen * Math.cos(angle - Math.PI/6), y2 - headLen * Math.sin(angle - Math.PI/6));
    ctx.lineTo(x2 - headLen * Math.cos(angle + Math.PI/6), y2 - headLen * Math.sin(angle + Math.PI/6));
    ctx.closePath();
    ctx.fill();
  },
  
  /**
   * 更新信息显示
   */
  updateInfo: function(img) {
    const objDistEl = document.getElementById('objectDistance');
    const imgDistEl = document.getElementById('imageDistance');
    const magEl = document.getElementById('magnification');
    const imgTypeEl = document.getElementById('imageType');
    
    if (img) {
      if (objDistEl) objDistEl.textContent = Math.round(img.u);
      if (imgDistEl) imgDistEl.textContent = Math.round(img.v);
      if (magEl) magEl.textContent = Math.abs(img.m).toFixed(2);
      
      // 判断像的性质
      let imgType = '';
      if (img.m < 0) {
        imgType = '倒立';
      } else {
        imgType = '正立';
      }
      if (Math.abs(img.m) > 1) {
        imgType += '放大';
      } else if (Math.abs(img.m) < 1) {
        imgType += '缩小';
      } else {
        imgType += '等大';
      }
      imgType += '实像';
      
      if (imgTypeEl) imgTypeEl.textContent = imgType;
    } else {
      if (objDistEl) objDistEl.textContent = Math.round(this.lensX - this.objectX);
      if (imgDistEl) imgDistEl.textContent = '--';
      if (magEl) magEl.textContent = '--';
      if (imgTypeEl) imgTypeEl.textContent = '无法成实像';
    }
  },
  
  /**
   * 绑定鼠标/触摸事件
   */
  bindEvents: function() {
    const self = this;
    const canvas = this.canvas;
    
    // 鼠标事件
    canvas.addEventListener('mousedown', function(e) {
      const pos = self.getEventPos(e);
      if (self.isNearObject(pos.x, pos.y)) {
        self.isDragging = true;
        canvas.style.cursor = 'grabbing';
      }
    });
    
    canvas.addEventListener('mousemove', function(e) {
      const pos = self.getEventPos(e);
      
      if (self.isDragging) {
        self.objectX = Math.max(30, Math.min(self.lensX - self.focalLength - 5, pos.x));
        self.draw();
      } else {
        // 悬停效果
        if (self.isNearObject(pos.x, pos.y)) {
          canvas.style.cursor = 'grab';
        } else {
          canvas.style.cursor = 'default';
        }
      }
    });
    
    canvas.addEventListener('mouseup', function() {
      self.isDragging = false;
      canvas.style.cursor = 'default';
    });
    
    canvas.addEventListener('mouseleave', function() {
      self.isDragging = false;
      canvas.style.cursor = 'default';
    });
    
    // 触摸事件
    canvas.addEventListener('touchstart', function(e) {
      e.preventDefault();
      const pos = self.getEventPos(e.touches[0]);
      if (self.isNearObject(pos.x, pos.y)) {
        self.isDragging = true;
      }
    }, { passive: false });
    
    canvas.addEventListener('touchmove', function(e) {
      if (!self.isDragging) return;
      e.preventDefault();
      const pos = self.getEventPos(e.touches[0]);
      self.objectX = Math.max(30, Math.min(self.lensX - self.focalLength - 5, pos.x));
      self.draw();
    }, { passive: false });
    
    canvas.addEventListener('touchend', function() {
      self.isDragging = false;
    });
  },
  
  /**
   * 获取事件坐标（相对于canvas）
   */
  getEventPos: function(e) {
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.canvas.width / rect.width;
    const scaleY = this.canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  },
  
  /**
   * 检查是否靠近物体
   */
  isNearObject: function(x, y) {
    const dx = Math.abs(x - this.objectX);
    const dy = y - (150 - this.objectHeight);
    return dx < 25 && dy > -20 && dy < this.objectHeight + 20;
  },
  
  /**
   * 绑定焦距滑块
   */
  bindSlider: function() {
    const self = this;
    const slider = document.getElementById('focalSlider');
    const valueEl = document.getElementById('focalValue');
    
    if (slider) {
      slider.addEventListener('input', function() {
        self.focalLength = parseInt(this.value);
        if (valueEl) valueEl.textContent = self.focalLength;
        
        // 确保物体不在焦点内
        if (self.objectX > self.lensX - self.focalLength - 5) {
          self.objectX = self.lensX - self.focalLength - 5;
        }
        self.draw();
      });
    }
  }
};

// 导出供全局使用
if (typeof window !== 'undefined') {
  window.LensDemo = LensDemo;
}
