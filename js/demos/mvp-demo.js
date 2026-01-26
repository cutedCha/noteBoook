/**
 * MVP矩阵交互演示
 * 第29章：MVP矩阵
 * 展示"矩阵当函数使"的概念 - 每个旋转矩阵是一个变换函数
 */

const MVPDemo = {
  canvas: null,
  ctx: null,
  
  // 画布尺寸
  width: 350,
  height: 280,
  
  // 旋转角度（弧度）
  rotationX: 0.5,
  rotationY: 0.5,
  rotationZ: 0.3,
  
  // 各轴旋转是否启用（矩阵函数开关）
  enableRotX: true,
  enableRotY: true,
  enableRotZ: false,
  
  // 动画
  animationFrame: null,
  autoRotate: true,
  time: 0,
  
  // 光照方向（归一化）
  lightDir: { x: 0.5, y: 0.7, z: 0.5 },
  
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
  
  // 面的法线
  faceNormals: [
    { x: 0, y: 0, z: 1 },   // 前
    { x: 0, y: 0, z: -1 },  // 后
    { x: 0, y: 1, z: 0 },   // 上
    { x: 0, y: -1, z: 0 },  // 下
    { x: 1, y: 0, z: 0 },   // 右
    { x: -1, y: 0, z: 0 }   // 左
  ],
  
  // 面的基础颜色
  faceColors: [
    { r: 100, g: 150, b: 255 },  // 前 - 蓝
    { r: 100, g: 150, b: 255 },  // 后 - 蓝
    { r: 150, g: 200, b: 100 },  // 上 - 绿
    { r: 150, g: 200, b: 100 },  // 下 - 绿
    { r: 255, g: 150, b: 100 },  // 右 - 橙
    { r: 255, g: 150, b: 100 }   // 左 - 橙
  ],
  
  /**
   * 初始化演示
   */
  init: function() {
    this.canvas = document.getElementById('mvpCanvas');
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
      if (self.autoRotate) {
        self.time += 0.02;
        // 自动旋转时，每个轴独立旋转
        self.rotationX += 0.01;
        self.rotationY += 0.015;
        self.rotationZ += 0.008;
      }
      self.draw();
      self.animationFrame = requestAnimationFrame(animate);
    }
    
    animate();
  },

  /**
   * 创建单位矩阵
   */
  identityMatrix: function() {
    return [
      [1, 0, 0],
      [0, 1, 0],
      [0, 0, 1]
    ];
  },
  
  /**
   * 创建旋转矩阵（绕X轴）- 矩阵函数1
   */
  rotationMatrixX: function(angle) {
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    return [
      [1, 0, 0],
      [0, c, -s],
      [0, s, c]
    ];
  },
  
  /**
   * 创建旋转矩阵（绕Y轴）- 矩阵函数2
   */
  rotationMatrixY: function(angle) {
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    return [
      [c, 0, s],
      [0, 1, 0],
      [-s, 0, c]
    ];
  },
  
  /**
   * 创建旋转矩阵（绕Z轴）- 矩阵函数3
   */
  rotationMatrixZ: function(angle) {
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    return [
      [c, -s, 0],
      [s, c, 0],
      [0, 0, 1]
    ];
  },
  
  /**
   * 矩阵乘法 3x3 - 函数组合！
   */
  multiplyMatrix: function(a, b) {
    const result = [[0,0,0], [0,0,0], [0,0,0]];
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        for (let k = 0; k < 3; k++) {
          result[i][j] += a[i][k] * b[k][j];
        }
      }
    }
    return result;
  },
  
  /**
   * 矩阵乘向量 - 应用变换函数
   */
  transformPoint: function(matrix, point) {
    return [
      matrix[0][0] * point[0] + matrix[0][1] * point[1] + matrix[0][2] * point[2],
      matrix[1][0] * point[0] + matrix[1][1] * point[1] + matrix[1][2] * point[2],
      matrix[2][0] * point[0] + matrix[2][1] * point[1] + matrix[2][2] * point[2]
    ];
  },
  
  /**
   * 变换法线
   */
  transformNormal: function(matrix, normal) {
    const result = this.transformPoint(matrix, [normal.x, normal.y, normal.z]);
    const len = Math.sqrt(result[0]*result[0] + result[1]*result[1] + result[2]*result[2]);
    return {
      x: result[0] / len,
      y: result[1] / len,
      z: result[2] / len
    };
  },
  
  /**
   * 计算漫反射光照
   */
  calculateDiffuse: function(normal) {
    const dot = normal.x * this.lightDir.x + 
                normal.y * this.lightDir.y + 
                normal.z * this.lightDir.z;
    return Math.max(0.2, Math.min(1, 0.3 + 0.7 * Math.max(0, dot)));
  },
  
  /**
   * 投影到2D - 正交投影，保持正方形不变形
   */
  project: function(point3d) {
    const scale = 50;
    const offsetX = this.width / 2;
    const offsetY = this.height / 2 - 20;
    
    // 正交投影，不加透视变形
    return {
      x: offsetX + point3d[0] * scale,
      y: offsetY - point3d[1] * scale,
      z: point3d[2]
    };
  },

  /**
   * 构建组合变换矩阵 - 核心：矩阵当函数使！
   * 只组合启用的旋转矩阵
   */
  buildTransformMatrix: function() {
    // 从单位矩阵开始（什么都不做的函数）
    let result = this.identityMatrix();
    
    // 按顺序应用启用的旋转矩阵（函数组合）
    
    // 1. 如果启用X轴旋转，组合进来
    if (this.enableRotX) {
      const rx = this.rotationMatrixX(this.rotationX);
      result = this.multiplyMatrix(rx, result);
    }
    
    // 2. 如果启用Y轴旋转，组合进来
    if (this.enableRotY) {
      const ry = this.rotationMatrixY(this.rotationY);
      result = this.multiplyMatrix(ry, result);
    }
    
    // 3. 如果启用Z轴旋转，组合进来
    if (this.enableRotZ) {
      const rz = this.rotationMatrixZ(this.rotationZ);
      result = this.multiplyMatrix(rz, result);
    }
    
    return result;
  },
  
  /**
   * 绘制场景
   */
  draw: function() {
    const ctx = this.ctx;
    
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, this.width, this.height);
    
    // 在CPU中计算组合变换矩阵（就像传给GPU的uniform）
    const transformMatrix = this.buildTransformMatrix();
    
    // 变换8个顶点（模拟GPU顶点着色器）
    const transformedPoints = this.cubePoints.map(v => 
      this.transformPoint(transformMatrix, v)
    );
    const projectedPoints = transformedPoints.map(v => this.project(v));
    
    // 准备面数据
    const faces = [];
    for (let i = 0; i < 6; i++) {
      const faceIndices = this.cubeFaces[i];
      const faceVertices = faceIndices.map(idx => projectedPoints[idx]);
      
      const avgZ = faceVertices.reduce((sum, v) => sum + v.z, 0) / 4;
      
      const transformedNormal = this.transformNormal(transformMatrix, this.faceNormals[i]);
      
      // 背面剔除
      if (transformedNormal.z < 0) continue;
      
      const diffuse = this.calculateDiffuse(transformedNormal);
      
      faces.push({
        vertices: faceVertices,
        avgZ: avgZ,
        color: this.faceColors[i],
        diffuse: diffuse
      });
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
    
    // 绘制坐标轴
    this.drawAxes(ctx, transformMatrix);
    
    // 绘制矩阵组合公式
    this.drawMatrixFormula(ctx);
  },

  /**
   * 绘制矩阵组合公式 - 显示当前启用的变换
   */
  drawMatrixFormula: function(ctx) {
    ctx.font = '11px monospace';
    ctx.textAlign = 'left';
    
    const y = this.height - 12;
    let x = 10;
    
    // 显示公式：result = Rz × Ry × Rx × vertex
    ctx.fillStyle = '#888';
    ctx.fillText('变换 = ', x, y);
    x += 45;
    
    // Z轴旋转
    if (this.enableRotZ) {
      ctx.fillStyle = '#74c0fc';
      ctx.fillText('Rz', x, y);
      x += 18;
      ctx.fillStyle = '#666';
      ctx.fillText('×', x, y);
      x += 12;
    }
    
    // Y轴旋转
    if (this.enableRotY) {
      ctx.fillStyle = '#51cf66';
      ctx.fillText('Ry', x, y);
      x += 18;
      ctx.fillStyle = '#666';
      ctx.fillText('×', x, y);
      x += 12;
    }
    
    // X轴旋转
    if (this.enableRotX) {
      ctx.fillStyle = '#ff6b6b';
      ctx.fillText('Rx', x, y);
      x += 18;
      ctx.fillStyle = '#666';
      ctx.fillText('×', x, y);
      x += 12;
    }
    
    // 如果什么都没启用
    if (!this.enableRotX && !this.enableRotY && !this.enableRotZ) {
      ctx.fillStyle = '#888';
      ctx.fillText('I (单位矩阵)', x, y);
      x += 80;
      ctx.fillStyle = '#666';
      ctx.fillText('×', x, y);
      x += 12;
    }
    
    ctx.fillStyle = '#fff';
    ctx.fillText('顶点', x, y);
  },
  
  /**
   * 绘制坐标轴指示
   */
  drawAxes: function(ctx, rotationMatrix) {
    const axisLength = 25;
    const origin = { x: 45, y: this.height - 50 };
    
    // X轴（红）
    const xAxis = this.transformPoint(rotationMatrix, [1, 0, 0]);
    ctx.strokeStyle = this.enableRotX ? '#ff6b6b' : '#553333';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(origin.x, origin.y);
    ctx.lineTo(origin.x + xAxis[0] * axisLength, origin.y - xAxis[1] * axisLength);
    ctx.stroke();
    ctx.fillStyle = this.enableRotX ? '#ff6b6b' : '#553333';
    ctx.font = '11px sans-serif';
    ctx.fillText('X', origin.x + xAxis[0] * axisLength + 3, origin.y - xAxis[1] * axisLength);
    
    // Y轴（绿）
    const yAxis = this.transformPoint(rotationMatrix, [0, 1, 0]);
    ctx.strokeStyle = this.enableRotY ? '#51cf66' : '#335533';
    ctx.beginPath();
    ctx.moveTo(origin.x, origin.y);
    ctx.lineTo(origin.x + yAxis[0] * axisLength, origin.y - yAxis[1] * axisLength);
    ctx.stroke();
    ctx.fillStyle = this.enableRotY ? '#51cf66' : '#335533';
    ctx.fillText('Y', origin.x + yAxis[0] * axisLength + 3, origin.y - yAxis[1] * axisLength);
    
    // Z轴（蓝）
    const zAxis = this.transformPoint(rotationMatrix, [0, 0, 1]);
    ctx.strokeStyle = this.enableRotZ ? '#74c0fc' : '#334455';
    ctx.beginPath();
    ctx.moveTo(origin.x, origin.y);
    ctx.lineTo(origin.x + zAxis[0] * axisLength, origin.y - zAxis[1] * axisLength);
    ctx.stroke();
    ctx.fillStyle = this.enableRotZ ? '#74c0fc' : '#334455';
    ctx.fillText('Z', origin.x + zAxis[0] * axisLength + 3, origin.y - zAxis[1] * axisLength);
  },
  
  /**
   * 重置
   */
  reset: function() {
    this.rotationX = 0.5;
    this.rotationY = 0.5;
    this.rotationZ = 0.3;
    this.enableRotX = true;
    this.enableRotY = true;
    this.enableRotZ = false;
    this.autoRotate = true;
    this.time = 0;
    
    // 更新UI
    const autoRotateCheckbox = document.getElementById('mvpAutoRotate');
    if (autoRotateCheckbox) autoRotateCheckbox.checked = true;
    
    const rotXCheckbox = document.getElementById('mvpEnableRotX');
    const rotYCheckbox = document.getElementById('mvpEnableRotY');
    const rotZCheckbox = document.getElementById('mvpEnableRotZ');
    if (rotXCheckbox) rotXCheckbox.checked = true;
    if (rotYCheckbox) rotYCheckbox.checked = true;
    if (rotZCheckbox) rotZCheckbox.checked = false;
  },

  /**
   * 绑定控件
   */
  bindControls: function() {
    const self = this;
    
    // 自动旋转开关
    const autoRotateCheckbox = document.getElementById('mvpAutoRotate');
    if (autoRotateCheckbox) {
      autoRotateCheckbox.addEventListener('change', function() {
        self.autoRotate = this.checked;
      });
    }
    
    // X轴旋转启用开关
    const rotXCheckbox = document.getElementById('mvpEnableRotX');
    if (rotXCheckbox) {
      rotXCheckbox.addEventListener('change', function() {
        self.enableRotX = this.checked;
      });
    }
    
    // Y轴旋转启用开关
    const rotYCheckbox = document.getElementById('mvpEnableRotY');
    if (rotYCheckbox) {
      rotYCheckbox.addEventListener('change', function() {
        self.enableRotY = this.checked;
      });
    }
    
    // Z轴旋转启用开关
    const rotZCheckbox = document.getElementById('mvpEnableRotZ');
    if (rotZCheckbox) {
      rotZCheckbox.addEventListener('change', function() {
        self.enableRotZ = this.checked;
      });
    }
    
    // 重置按钮
    const resetBtn = document.getElementById('mvpReset');
    if (resetBtn) {
      resetBtn.addEventListener('click', function() {
        self.reset();
      });
    }
  }
};

// 导出供全局使用
if (typeof window !== 'undefined') {
  window.MVPDemo = MVPDemo;
}
