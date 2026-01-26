/**
 * 深度纹理交互演示
 * 第26章：深度纹理
 */

const DepthDemo = {
  canvas: null,
  ctx: null,
  
  // 参数
  width: 300,
  height: 200,
  
  // 立方体旋转角度
  rotationY: 0,
  rotationX: 0.4,
  autoRotate: true,
  
  // 深度缓冲 - 存储每个像素的真实深度
  depthBuffer: null,
  
  // 鼠标位置
  mouseX: -1,
  mouseY: -1,
  hoverDepth: -1,
  isHoveringDepth: false,
  
  // 动画
  animationFrame: null,
  
  // 相机参数 - 调整让深度差异更明显
  near: 2,
  far: 8,
  cameraZ: 5,
  
  /**
   * 初始化演示
   */
  init: function() {
    this.canvas = document.getElementById('depthCanvas');
    
    if (!this.canvas) return false;
    
    this.ctx = this.canvas.getContext('2d');
    this.width = this.canvas.width;
    this.height = this.canvas.height;
    
    // 初始化深度缓冲
    const halfW = Math.floor(this.width / 2);
    this.depthBuffer = new Float32Array(halfW * this.height);
    this.depthBuffer.fill(1.0);
    
    // 绑定控件和事件
    this.bindControls();
    this.bindMouseEvents();
    
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
      if (self.autoRotate) {
        self.rotationY += 0.015;
      }
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
    const halfW = Math.floor(w / 2);
    
    // 清空画布
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, w, h);
    
    // 清空深度缓冲
    this.depthBuffer.fill(1.0);
    
    // 获取变换后的面数据
    const transformedFaces = this.getTransformedFaces(halfW / 2, h / 2, 100);
    
    // 左半边：渲染彩色立方体
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, halfW, h);
    ctx.clip();
    this.drawColorCube(ctx, transformedFaces);
    ctx.restore();
    
    // 右半边：渲染深度纹理（逐像素）
    ctx.save();
    ctx.beginPath();
    ctx.rect(halfW, 0, halfW, h);
    ctx.clip();
    this.drawDepthTexture(ctx, transformedFaces, halfW);
    ctx.restore();
    
    // 分隔线
    ctx.strokeStyle = '#444';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(halfW, 0);
    ctx.lineTo(halfW, h);
    ctx.stroke();
    
    // 标签
    ctx.fillStyle = '#888';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('彩色渲染', halfW / 2, 15);
    ctx.fillText('深度纹理', halfW + halfW / 2, 15);
    
    // 实时显示深度信息（动画时也更新）
    if (this.isHoveringDepth) {
      this.updateHoverDepth();
      if (this.hoverDepth >= 0 && this.hoverDepth < 1) {
        this.drawDepthInfo(ctx);
      }
    }
  },
  
  /**
   * 3D变换：旋转
   */
  rotateY: function(point, angle) {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return {
      x: point.x * cos - point.z * sin,
      y: point.y,
      z: point.x * sin + point.z * cos
    };
  },
  
  rotateX: function(point, angle) {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return {
      x: point.x,
      y: point.y * cos - point.z * sin,
      z: point.y * sin + point.z * cos
    };
  },
  
  /**
   * 投影到屏幕，返回屏幕坐标和深度
   */
  project: function(point, centerX, centerY, scale) {
    const z = point.z + this.cameraZ;
    const factor = scale / z;
    return {
      x: centerX + point.x * factor,
      y: centerY - point.y * factor,
      z: z  // 保留相机空间z值
    };
  },
  
  /**
   * 计算线性深度值 (0-1)
   */
  calculateDepth: function(z) {
    // 线性深度映射，让差异更明显
    const depth = (z - this.near) / (this.far - this.near);
    return Math.max(0, Math.min(1, depth));
  },

  /**
   * 获取立方体顶点
   */
  getCubeVertices: function(size) {
    const s = size / 2;
    return [
      { x: -s, y: -s, z: -s },  // 0: 后左下
      { x:  s, y: -s, z: -s },  // 1: 后右下
      { x:  s, y:  s, z: -s },  // 2: 后右上
      { x: -s, y:  s, z: -s },  // 3: 后左上
      { x: -s, y: -s, z:  s },  // 4: 前左下
      { x:  s, y: -s, z:  s },  // 5: 前右下
      { x:  s, y:  s, z:  s },  // 6: 前右上
      { x: -s, y:  s, z:  s },  // 7: 前左上
    ];
  },
  
  /**
   * 立方体面定义
   */
  getCubeFaces: function() {
    return [
      { indices: [0, 1, 2, 3], color: '#e74c3c', name: '后' },   // 后面 - 红
      { indices: [5, 4, 7, 6], color: '#3498db', name: '前' },   // 前面 - 蓝
      { indices: [4, 0, 3, 7], color: '#2ecc71', name: '左' },   // 左面 - 绿
      { indices: [1, 5, 6, 2], color: '#f39c12', name: '右' },   // 右面 - 橙
      { indices: [3, 2, 6, 7], color: '#9b59b6', name: '上' },   // 上面 - 紫
      { indices: [4, 5, 1, 0], color: '#1abc9c', name: '下' },   // 下面 - 青
    ];
  },
  
  /**
   * 获取变换后的面数据
   */
  getTransformedFaces: function(centerX, centerY, scale) {
    const vertices = this.getCubeVertices(2.0);
    const faces = this.getCubeFaces();
    
    // 变换顶点
    const transformed = vertices.map(v => {
      let p = this.rotateX(v, this.rotationX);
      p = this.rotateY(p, this.rotationY);
      return this.project(p, centerX, centerY, scale);
    });
    
    // 计算面数据
    const facesWithDepth = faces.map((face, i) => {
      const pts = face.indices.map(idx => transformed[idx]);
      
      // 背面剔除检测
      const v1 = { x: pts[1].x - pts[0].x, y: pts[1].y - pts[0].y };
      const v2 = { x: pts[2].x - pts[0].x, y: pts[2].y - pts[0].y };
      const cross = v1.x * v2.y - v1.y * v2.x;
      
      // 计算面的平均深度用于排序
      const avgZ = pts.reduce((sum, p) => sum + p.z, 0) / 4;
      
      return {
        ...face,
        pts: pts,
        avgZ: avgZ,
        isBackFace: cross > 0,
        index: i
      };
    });
    
    // 按深度排序（远的先画）
    facesWithDepth.sort((a, b) => b.avgZ - a.avgZ);
    
    return facesWithDepth;
  },
  
  /**
   * 绘制彩色立方体
   */
  drawColorCube: function(ctx, faces) {
    faces.forEach(face => {
      if (face.isBackFace) return;
      
      const pts = face.pts;
      
      ctx.fillStyle = face.color;
      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y);
      pts.forEach(p => ctx.lineTo(p.x, p.y));
      ctx.closePath();
      ctx.fill();
      
      // 边框
      ctx.strokeStyle = 'rgba(255,255,255,0.3)';
      ctx.lineWidth = 1;
      ctx.stroke();
    });
  },

  /**
   * 绘制深度纹理 - 逐像素计算真实深度
   */
  drawDepthTexture: function(ctx, faces, offsetX) {
    const halfW = Math.floor(this.width / 2);
    const h = this.height;
    
    // 创建ImageData用于逐像素绘制
    const imageData = ctx.createImageData(halfW, h);
    const data = imageData.data;
    
    // 初始化为背景色（深蓝色）
    for (let i = 0; i < data.length; i += 4) {
      data[i] = 26;     // R
      data[i + 1] = 26; // G
      data[i + 2] = 46; // B
      data[i + 3] = 255; // A
    }
    
    // 对每个可见面进行光栅化
    faces.forEach(face => {
      if (face.isBackFace) return;
      
      // 获取面的顶点（相对于右半边）
      const pts = face.pts.map(p => ({
        x: p.x,  // 已经是相对于左半边中心的坐标
        y: p.y,
        z: p.z
      }));
      
      // 光栅化这个面
      this.rasterizeFace(pts, data, halfW, h);
    });
    
    // 绘制到canvas
    ctx.putImageData(imageData, offsetX, 0);
  },
  
  /**
   * 光栅化一个四边形面，计算每个像素的深度
   */
  rasterizeFace: function(pts, data, width, height) {
    // 计算包围盒
    const minX = Math.max(0, Math.floor(Math.min(pts[0].x, pts[1].x, pts[2].x, pts[3].x)));
    const maxX = Math.min(width - 1, Math.ceil(Math.max(pts[0].x, pts[1].x, pts[2].x, pts[3].x)));
    const minY = Math.max(0, Math.floor(Math.min(pts[0].y, pts[1].y, pts[2].y, pts[3].y)));
    const maxY = Math.min(height - 1, Math.ceil(Math.max(pts[0].y, pts[1].y, pts[2].y, pts[3].y)));
    
    // 遍历包围盒内的每个像素
    for (let y = minY; y <= maxY; y++) {
      for (let x = minX; x <= maxX; x++) {
        // 检查点是否在四边形内
        if (!this.pointInQuad(x, y, pts)) continue;
        
        // 计算该点的深度（使用重心坐标插值）
        const z = this.interpolateDepth(x, y, pts);
        const depth = this.calculateDepth(z);
        
        // 深度测试
        const idx = y * width + x;
        if (depth < this.depthBuffer[idx]) {
          this.depthBuffer[idx] = depth;
          
          // 深度值转灰度（近=白，远=黑）
          // 使用非线性映射让差异更明显
          const normalizedDepth = Math.pow(1 - depth, 0.7);
          const gray = Math.floor(normalizedDepth * 255);
          
          // 写入像素
          const pixelIdx = (y * width + x) * 4;
          data[pixelIdx] = gray;
          data[pixelIdx + 1] = gray;
          data[pixelIdx + 2] = gray;
          data[pixelIdx + 3] = 255;
        }
      }
    }
  },
  
  /**
   * 检查点是否在四边形内
   */
  pointInQuad: function(px, py, pts) {
    // 使用叉积判断点是否在凸四边形内
    let sign = 0;
    for (let i = 0; i < 4; i++) {
      const j = (i + 1) % 4;
      const cross = (pts[j].x - pts[i].x) * (py - pts[i].y) - 
                    (pts[j].y - pts[i].y) * (px - pts[i].x);
      if (i === 0) {
        sign = cross > 0 ? 1 : -1;
      } else if ((cross > 0 ? 1 : -1) !== sign && Math.abs(cross) > 0.001) {
        return false;
      }
    }
    return true;
  },
  
  /**
   * 使用双线性插值计算深度
   */
  interpolateDepth: function(px, py, pts) {
    // 简化：使用到四个顶点的距离加权平均
    let totalWeight = 0;
    let weightedZ = 0;
    
    for (let i = 0; i < 4; i++) {
      const dx = px - pts[i].x;
      const dy = py - pts[i].y;
      const dist = Math.sqrt(dx * dx + dy * dy) + 0.001;
      const weight = 1 / dist;
      totalWeight += weight;
      weightedZ += pts[i].z * weight;
    }
    
    return weightedZ / totalWeight;
  },

  /**
   * 实时更新鼠标位置的深度值
   */
  updateHoverDepth: function() {
    const halfW = Math.floor(this.width / 2);
    
    if (this.mouseX >= halfW && this.mouseX < this.width) {
      const depthX = Math.floor(this.mouseX - halfW);
      const depthY = Math.floor(this.mouseY);
      
      if (depthX >= 0 && depthX < halfW && depthY >= 0 && depthY < this.height) {
        const idx = depthY * halfW + depthX;
        this.hoverDepth = this.depthBuffer[idx];
      }
    }
  },
  
  /**
   * 绘制深度信息提示
   */
  drawDepthInfo: function(ctx) {
    // 距离计算：放大100倍让数值更敏感
    const realZ = this.near + this.hoverDepth * (this.far - this.near);
    const distance = realZ * 100;  // 放大100倍
    
    // 信息框
    const text = `深度值: ${this.hoverDepth.toFixed(4)}`;
    const text2 = `距离: ${distance.toFixed(1)} cm`;
    
    ctx.font = '11px sans-serif';
    const textWidth = Math.max(ctx.measureText(text).width, ctx.measureText(text2).width);
    
    let boxX = this.mouseX + 15;
    let boxY = this.mouseY - 45;
    
    // 确保不超出边界
    if (boxX + textWidth + 20 > this.width) {
      boxX = this.mouseX - textWidth - 30;
    }
    if (boxY < 5) {
      boxY = this.mouseY + 15;
    }
    
    // 背景
    ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
    ctx.fillRect(boxX, boxY, textWidth + 20, 42);
    
    // 边框
    ctx.strokeStyle = '#00c8ff';
    ctx.lineWidth = 1;
    ctx.strokeRect(boxX, boxY, textWidth + 20, 42);
    
    // 文字
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'left';
    ctx.fillText(text, boxX + 10, boxY + 16);
    ctx.fillText(text2, boxX + 10, boxY + 32);
    
    // 十字准星
    ctx.strokeStyle = '#00c8ff';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(this.mouseX - 10, this.mouseY);
    ctx.lineTo(this.mouseX + 10, this.mouseY);
    ctx.moveTo(this.mouseX, this.mouseY - 10);
    ctx.lineTo(this.mouseX, this.mouseY + 10);
    ctx.stroke();
    
    // 小圆点
    ctx.fillStyle = '#00c8ff';
    ctx.beginPath();
    ctx.arc(this.mouseX, this.mouseY, 3, 0, Math.PI * 2);
    ctx.fill();
  },
  
  /**
   * 绑定鼠标事件
   */
  bindMouseEvents: function() {
    const self = this;
    const halfW = Math.floor(this.width / 2);
    
    this.canvas.addEventListener('mousemove', function(e) {
      const rect = self.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      self.mouseX = x;
      self.mouseY = y;
      
      // 检查是否在深度纹理区域
      self.isHoveringDepth = (x >= halfW && x < self.width);
    });
    
    this.canvas.addEventListener('mouseleave', function() {
      self.isHoveringDepth = false;
      self.hoverDepth = -1;
    });
  },
  
  /**
   * 绑定控件
   */
  bindControls: function() {
    const self = this;
    
    // 自动旋转开关
    const autoRotateToggle = document.getElementById('depthAutoRotate');
    if (autoRotateToggle) {
      autoRotateToggle.addEventListener('change', function() {
        self.autoRotate = this.checked;
      });
    }
    
    // 手动旋转滑块
    const rotateSlider = document.getElementById('depthRotation');
    const rotateValue = document.getElementById('depthRotationValue');
    if (rotateSlider) {
      rotateSlider.addEventListener('input', function() {
        if (!self.autoRotate) {
          self.rotationY = parseFloat(this.value) * Math.PI / 180;
          if (rotateValue) rotateValue.textContent = this.value + '°';
        }
      });
    }
  }
};

// 导出供全局使用
if (typeof window !== 'undefined') {
  window.DepthDemo = DepthDemo;
}
