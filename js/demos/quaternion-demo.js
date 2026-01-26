/**
 * 四元数插值演示
 * 第28章：旋转矩阵
 * 对比欧拉角插值和四元数插值的区别
 */

const QuaternionDemo = {
  canvas: null,
  ctx: null,
  
  // 画布尺寸
  width: 350,
  height: 280,
  
  // 起始和结束旋转（欧拉角，弧度）
  startRotation: { x: 0.3, y: 0.2, z: 0 },
  endRotation: { x: 0.8, y: Math.PI * 0.7, z: 0.5 },
  
  // 插值进度 (0-1)
  t: 0,
  
  // 动画
  animationFrame: null,
  autoPlay: true,
  speed: 0.008,
  direction: 1,
  
  // 标准正方形方块顶点（8个顶点）
  cubePoints: [
    [-1, -1, -1],  // 0: 后左下
    [ 1, -1, -1],  // 1: 后右下
    [ 1,  1, -1],  // 2: 后右上
    [-1,  1, -1],  // 3: 后左上
    [-1, -1,  1],  // 4: 前左下
    [ 1, -1,  1],  // 5: 前右下
    [ 1,  1,  1],  // 6: 前右上
    [-1,  1,  1],  // 7: 前左上
  ],
  
  // 6个面，每个面4个顶点索引
  cubeFaces: [
    [4, 5, 6, 7],  // 前面
    [1, 0, 3, 2],  // 后面
    [3, 7, 6, 2],  // 上面
    [0, 1, 5, 4],  // 下面
    [5, 1, 2, 6],  // 右面
    [0, 4, 7, 3],  // 左面
  ],
  
  faceColors: [
    { r: 100, g: 150, b: 255 },  // 前 - 蓝
    { r: 100, g: 150, b: 255 },  // 后 - 蓝
    { r: 150, g: 200, b: 100 },  // 上 - 绿
    { r: 150, g: 200, b: 100 },  // 下 - 绿
    { r: 255, g: 150, b: 100 },  // 右 - 橙
    { r: 255, g: 150, b: 100 },  // 左 - 橙
  ],
  
  faceNormals: [
    { x: 0, y: 0, z: 1 },   // 前
    { x: 0, y: 0, z: -1 },  // 后
    { x: 0, y: 1, z: 0 },   // 上
    { x: 0, y: -1, z: 0 },  // 下
    { x: 1, y: 0, z: 0 },   // 右
    { x: -1, y: 0, z: 0 },  // 左
  ],
  
  lightDir: { x: 0.5, y: 0.7, z: 0.5 },
  
  /**
   * 初始化
   */
  init: function() {
    this.canvas = document.getElementById('quaternionCanvas');
    if (!this.canvas) return false;
    
    this.ctx = this.canvas.getContext('2d');
    this.width = this.canvas.width;
    this.height = this.canvas.height;
    
    this.bindControls();
    this.startAnimation();
    
    return true;
  },
  
  /**
   * 开始动画
   */
  startAnimation: function() {
    const self = this;
    
    function animate() {
      if (self.autoPlay) {
        self.t += self.speed * self.direction;
        if (self.t >= 1) {
          self.t = 1;
          self.direction = -1;
        } else if (self.t <= 0) {
          self.t = 0;
          self.direction = 1;
        }
        self.updateSlider();
      }
      self.draw();
      self.animationFrame = requestAnimationFrame(animate);
    }
    
    animate();
  },
  
  updateSlider: function() {
    const slider = document.getElementById('quatT');
    if (slider) slider.value = this.t;
    const value = document.getElementById('quatTValue');
    if (value) value.textContent = (this.t * 100).toFixed(0) + '%';
  },

  // ========== 四元数运算 ==========
  
  /**
   * 欧拉角转四元数
   */
  eulerToQuaternion: function(euler) {
    const cx = Math.cos(euler.x / 2);
    const sx = Math.sin(euler.x / 2);
    const cy = Math.cos(euler.y / 2);
    const sy = Math.sin(euler.y / 2);
    const cz = Math.cos(euler.z / 2);
    const sz = Math.sin(euler.z / 2);
    
    return {
      w: cx * cy * cz + sx * sy * sz,
      x: sx * cy * cz - cx * sy * sz,
      y: cx * sy * cz + sx * cy * sz,
      z: cx * cy * sz - sx * sy * cz
    };
  },
  
  /**
   * 四元数归一化
   */
  normalizeQuaternion: function(q) {
    const len = Math.sqrt(q.w*q.w + q.x*q.x + q.y*q.y + q.z*q.z);
    return { w: q.w/len, x: q.x/len, y: q.y/len, z: q.z/len };
  },
  
  /**
   * 四元数球面线性插值 (Slerp) - 关键！
   */
  slerp: function(q1, q2, t) {
    // 计算两个四元数的点积
    let dot = q1.w*q2.w + q1.x*q2.x + q1.y*q2.y + q1.z*q2.z;
    
    // 如果点积为负，取反一个四元数（走短路径）
    let q2Adj = q2;
    if (dot < 0) {
      dot = -dot;
      q2Adj = { w: -q2.w, x: -q2.x, y: -q2.y, z: -q2.z };
    }
    
    // 如果两个四元数很接近，用线性插值
    if (dot > 0.9995) {
      return this.normalizeQuaternion({
        w: q1.w + t * (q2Adj.w - q1.w),
        x: q1.x + t * (q2Adj.x - q1.x),
        y: q1.y + t * (q2Adj.y - q1.y),
        z: q1.z + t * (q2Adj.z - q1.z)
      });
    }
    
    // 球面插值
    const theta = Math.acos(dot);
    const sinTheta = Math.sin(theta);
    const w1 = Math.sin((1 - t) * theta) / sinTheta;
    const w2 = Math.sin(t * theta) / sinTheta;
    
    return {
      w: w1 * q1.w + w2 * q2Adj.w,
      x: w1 * q1.x + w2 * q2Adj.x,
      y: w1 * q1.y + w2 * q2Adj.y,
      z: w1 * q1.z + w2 * q2Adj.z
    };
  },
  
  /**
   * 四元数转旋转矩阵
   */
  quaternionToMatrix: function(q) {
    const { w, x, y, z } = q;
    return [
      [1 - 2*y*y - 2*z*z, 2*x*y - 2*w*z, 2*x*z + 2*w*y],
      [2*x*y + 2*w*z, 1 - 2*x*x - 2*z*z, 2*y*z - 2*w*x],
      [2*x*z - 2*w*y, 2*y*z + 2*w*x, 1 - 2*x*x - 2*y*y]
    ];
  },
  
  // ========== 欧拉角运算 ==========
  
  /**
   * 欧拉角线性插值（有问题的方式）
   */
  lerpEuler: function(e1, e2, t) {
    return {
      x: e1.x + t * (e2.x - e1.x),
      y: e1.y + t * (e2.y - e1.y),
      z: e1.z + t * (e2.z - e1.z)
    };
  },
  
  /**
   * 欧拉角转旋转矩阵
   */
  eulerToMatrix: function(euler) {
    const cx = Math.cos(euler.x), sx = Math.sin(euler.x);
    const cy = Math.cos(euler.y), sy = Math.sin(euler.y);
    const cz = Math.cos(euler.z), sz = Math.sin(euler.z);
    
    // Y * X * Z 顺序
    return [
      [cy*cz + sy*sx*sz, -cy*sz + sy*sx*cz, sy*cx],
      [cx*sz, cx*cz, -sx],
      [-sy*cz + cy*sx*sz, sy*sz + cy*sx*cz, cy*cx]
    ];
  },

  // ========== 绘制相关 ==========
  
  transformPoint: function(matrix, point) {
    return [
      matrix[0][0] * point[0] + matrix[0][1] * point[1] + matrix[0][2] * point[2],
      matrix[1][0] * point[0] + matrix[1][1] * point[1] + matrix[1][2] * point[2],
      matrix[2][0] * point[0] + matrix[2][1] * point[1] + matrix[2][2] * point[2]
    ];
  },
  
  transformNormal: function(matrix, normal) {
    const result = this.transformPoint(matrix, [normal.x, normal.y, normal.z]);
    const len = Math.sqrt(result[0]*result[0] + result[1]*result[1] + result[2]*result[2]);
    return { x: result[0]/len, y: result[1]/len, z: result[2]/len };
  },
  
  calculateDiffuse: function(normal) {
    const dot = normal.x * this.lightDir.x + normal.y * this.lightDir.y + normal.z * this.lightDir.z;
    return Math.max(0.3, Math.min(1, 0.3 + 0.7 * Math.max(0, dot)));
  },
  
  project: function(point3d, offsetX, offsetY) {
    const scale = 40;
    // 正交投影，不加透视变形
    return {
      x: offsetX + point3d[0] * scale,
      y: offsetY - point3d[1] * scale,
      z: point3d[2]
    };
  },
  
  drawCube: function(ctx, matrix, offsetX, offsetY, label, color) {
    // 变换8个顶点
    const transformedPoints = this.cubePoints.map(v => this.transformPoint(matrix, v));
    const projectedPoints = transformedPoints.map(v => this.project(v, offsetX, offsetY));
    
    const faces = [];
    for (let i = 0; i < 6; i++) {
      const faceIndices = this.cubeFaces[i];
      const faceVertices = faceIndices.map(idx => projectedPoints[idx]);
      
      const avgZ = faceVertices.reduce((sum, v) => sum + v.z, 0) / 4;
      const transformedNormal = this.transformNormal(matrix, this.faceNormals[i]);
      
      // 背面剔除
      if (transformedNormal.z < 0) continue;
      
      const diffuse = this.calculateDiffuse(transformedNormal);
      faces.push({ vertices: faceVertices, avgZ, color: this.faceColors[i], diffuse });
    }
    
    // 画家算法排序
    faces.sort((a, b) => a.avgZ - b.avgZ);
    
    // 绘制面
    faces.forEach(face => {
      const { r, g, b } = face.color;
      const d = face.diffuse;
      ctx.fillStyle = `rgb(${Math.floor(r * d)}, ${Math.floor(g * d)}, ${Math.floor(b * d)})`;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = 1;
      
      ctx.beginPath();
      ctx.moveTo(face.vertices[0].x, face.vertices[0].y);
      face.vertices.forEach(v => ctx.lineTo(v.x, v.y));
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    });
    
    // 标签
    ctx.fillStyle = color;
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(label, offsetX, offsetY + 70);
  },
  
  /**
   * 绘制轨迹点（显示插值路径）
   */
  drawTrajectory: function(ctx, offsetX, offsetY, useQuaternion, color) {
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.setLineDash([2, 2]);
    ctx.beginPath();
    
    // 追踪一个顶点的轨迹
    const testPoint = [1, 1, 1];
    
    for (let i = 0; i <= 20; i++) {
      const t = i / 20;
      let matrix;
      
      if (useQuaternion) {
        const q1 = this.eulerToQuaternion(this.startRotation);
        const q2 = this.eulerToQuaternion(this.endRotation);
        const q = this.slerp(q1, q2, t);
        matrix = this.quaternionToMatrix(q);
      } else {
        const euler = this.lerpEuler(this.startRotation, this.endRotation, t);
        matrix = this.eulerToMatrix(euler);
      }
      
      const transformed = this.transformPoint(matrix, testPoint);
      const projected = this.project(transformed, offsetX, offsetY);
      
      if (i === 0) {
        ctx.moveTo(projected.x, projected.y);
      } else {
        ctx.lineTo(projected.x, projected.y);
      }
    }
    
    ctx.stroke();
    ctx.setLineDash([]);
  },

  /**
   * 主绘制函数
   */
  draw: function() {
    const ctx = this.ctx;
    
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, this.width, this.height);
    
    const leftX = this.width * 0.25;
    const rightX = this.width * 0.75;
    const centerY = this.height * 0.45;
    
    // 绘制轨迹
    this.drawTrajectory(ctx, leftX, centerY, false, 'rgba(255, 100, 100, 0.5)');
    this.drawTrajectory(ctx, rightX, centerY, true, 'rgba(100, 255, 100, 0.5)');
    
    // 欧拉角插值
    const eulerInterp = this.lerpEuler(this.startRotation, this.endRotation, this.t);
    const eulerMatrix = this.eulerToMatrix(eulerInterp);
    this.drawCube(ctx, eulerMatrix, leftX, centerY, '欧拉角插值', '#ff6b6b');
    
    // 四元数插值
    const q1 = this.eulerToQuaternion(this.startRotation);
    const q2 = this.eulerToQuaternion(this.endRotation);
    const qInterp = this.slerp(q1, q2, this.t);
    const quatMatrix = this.quaternionToMatrix(qInterp);
    this.drawCube(ctx, quatMatrix, rightX, centerY, '四元数插值', '#51cf66');
    
    // 分隔线
    ctx.strokeStyle = '#444';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(this.width / 2, 20);
    ctx.lineTo(this.width / 2, this.height - 40);
    ctx.stroke();
    
    // 说明文字
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ff6b6b';
    ctx.fillText('路径不稳定，可能抖动', leftX, centerY + 85);
    ctx.fillStyle = '#51cf66';
    ctx.fillText('路径平滑，走最短弧线', rightX, centerY + 85);
    
    // 进度条
    this.drawProgressBar(ctx);
  },
  
  drawProgressBar: function(ctx) {
    const barY = this.height - 25;
    const barWidth = this.width - 40;
    const barX = 20;
    
    // 背景
    ctx.fillStyle = '#333';
    ctx.fillRect(barX, barY, barWidth, 8);
    
    // 进度
    ctx.fillStyle = '#00c8ff';
    ctx.fillRect(barX, barY, barWidth * this.t, 8);
    
    // 标签
    ctx.fillStyle = '#888';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('起始', barX, barY - 3);
    ctx.textAlign = 'right';
    ctx.fillText('结束', barX + barWidth, barY - 3);
  },
  
  /**
   * 绑定控件
   */
  bindControls: function() {
    const self = this;
    
    // 自动播放开关
    const autoPlayCheckbox = document.getElementById('quatAutoPlay');
    if (autoPlayCheckbox) {
      autoPlayCheckbox.addEventListener('change', function() {
        self.autoPlay = this.checked;
      });
    }
    
    // 进度滑块
    const tSlider = document.getElementById('quatT');
    const tValue = document.getElementById('quatTValue');
    if (tSlider) {
      tSlider.addEventListener('input', function() {
        self.t = parseFloat(this.value);
        self.autoPlay = false;
        if (autoPlayCheckbox) autoPlayCheckbox.checked = false;
        if (tValue) tValue.textContent = (self.t * 100).toFixed(0) + '%';
      });
    }
    
    // 重置按钮
    const resetBtn = document.getElementById('quatReset');
    if (resetBtn) {
      resetBtn.addEventListener('click', function() {
        self.t = 0;
        self.direction = 1;
        self.autoPlay = true;
        if (autoPlayCheckbox) autoPlayCheckbox.checked = true;
        self.updateSlider();
      });
    }
  }
};

// 导出
if (typeof window !== 'undefined') {
  window.QuaternionDemo = QuaternionDemo;
}
