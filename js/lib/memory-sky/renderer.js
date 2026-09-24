/**
 * Memory Sky 3D Engine (单文件极致浓缩版)
 * 包含：3D星系布局、星尘渲染、手指触控旋转、射线点击检测
 */
export class MemorySkyRenderer {
    constructor(options) {
        this.container = options.container;
        this.data = options.data || [];
        this.onNodeClick = options.onNodeClick || function() {};
        
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.container.appendChild(this.canvas);

        this.stars = [];
        this.dust = [];
        
        // 3D 视角参数
        this.angleX = 0.2; // 初始俯角
        this.angleY = 0;   // 初始旋转角
        this.focalLength = 300; // 焦距
        
        // 交互参数
        this.isDragging = false;
        this.lastX = 0;
        this.lastY = 0;
        this.dragDist = 0;

        this.init();
    }

    init() {
        this.resize();
        window.addEventListener('resize', () => this.resize());

        // 1. 生成记忆星球 (Galaxy Layout)
        this.data.forEach((mem, i) => {
            // 星系螺旋算法
            const arm = i % 2; // 两条旋臂
            const distance = 40 + Math.random() * 150 + (i * 5); // 距离中心的距离
            const angle = (distance / 40) + (arm * Math.PI); // 螺旋角度
            
            // 根据类型分配神仙颜色 (Light Materials)
            let color = '#ffffff';
            if (mem.type === 'diary') color = '#a78bfa'; // 薄雾紫
            if (mem.type === 'moment') color = '#60a5fa'; // 星河蓝
            if (mem.type === 'chat') color = '#f4a261';   // 天光金

            this.stars.push({
                ...mem,
                x: Math.cos(angle) * distance,
                y: (Math.random() - 0.5) * 30, // 上下浮动厚度
                z: Math.sin(angle) * distance,
                size: 3 + Math.random() * 3,
                color: color,
                glow: Math.random() * 0.05 // 闪烁基数
            });
        });

        // 2. 生成背景星尘 (Lens Dust)
        for(let i = 0; i < 400; i++) {
            const dist = Math.random() * 400;
            const ang = Math.random() * Math.PI * 2;
            this.dust.push({
                x: Math.cos(ang) * dist,
                y: (Math.random() - 0.5) * 200,
                z: Math.sin(ang) * dist,
                size: Math.random() * 1.5,
                color: `rgba(255, 255, 255, ${Math.random() * 0.6})`
            });
        }

        // 3. 绑定触摸/鼠标事件
        this.canvas.addEventListener('pointerdown', (e) => {
            this.isDragging = true;
            this.lastX = e.clientX;
            this.lastY = e.clientY;
            this.dragDist = 0;
        });

        window.addEventListener('pointermove', (e) => {
            if (!this.isDragging) return;
            const deltaX = e.clientX - this.lastX;
            const deltaY = e.clientY - this.lastY;
            this.angleY -= deltaX * 0.005;
            this.angleX -= deltaY * 0.005;
            // 限制俯仰角
            this.angleX = Math.max(-Math.PI/2, Math.min(Math.PI/2, this.angleX));
            this.lastX = e.clientX;
            this.lastY = e.clientY;
            this.dragDist += Math.abs(deltaX) + Math.abs(deltaY);
        });

        window.addEventListener('pointerup', (e) => {
            this.isDragging = false;
            // 如果滑动距离很小，判定为点击 (Raycaster 检测)
            if (this.dragDist < 10) {
                this.checkClick(e.clientX, e.clientY);
            }
        });
    }

    resize() {
        // 适配高清屏
        const dpr = window.devicePixelRatio || 1;
        this.width = this.container.clientWidth;
        this.height = this.container.clientHeight;
        this.canvas.width = this.width * dpr;
        this.canvas.height = this.height * dpr;
        this.ctx.scale(dpr, dpr);
        this.canvas.style.width = this.width + 'px';
        this.canvas.style.height = this.height + 'px';
        this.centerX = this.width / 2;
        this.centerY = this.height / 2;
    }

    // 3D 投影算法
    project(x, y, z) {
        // 绕 X 轴旋转
        const cosX = Math.cos(this.angleX);
        const sinX = Math.sin(this.angleX);
        const y1 = y * cosX - z * sinX;
        const z1 = y * sinX + z * cosX;

        // 绕 Y 轴旋转
        const cosY = Math.cos(this.angleY);
        const sinY = Math.sin(this.angleY);
        const x2 = x * cosY + z1 * sinY;
        const z2 = -x * sinY + z1 * cosY;

        // 透视投影
        const scale = this.focalLength / (this.focalLength + z2 + 300);
        return {
            x: this.centerX + x2 * scale,
            y: this.centerY + y1 * scale,
            scale: scale,
            z: z2 // 用于深度排序
        };
    }

    checkClick(clientX, clientY) {
        const rect = this.canvas.getBoundingClientRect();
        const clickX = clientX - rect.left;
        const clickY = clientY - rect.top;

        // 从近到远寻找被点击的星星
        const sortedStars = [...this.stars].sort((a, b) => {
            const pA = this.project(a.x, a.y, a.z);
            const pB = this.project(b.x, b.y, b.z);
            return pA.z - pB.z;
        });

        for (let star of sortedStars) {
            const p = this.project(star.x, star.y, star.z);
            if (p.scale < 0) continue; // 在相机背后
            
            const radius = star.size * p.scale * 2.5; // 扩大点击热区
            const dist = Math.hypot(clickX - p.x, clickY - p.y);
            
            if (dist < Math.max(radius, 15)) {
                this.onNodeClick(star);
                break; // 只触发最前面的一个
            }
        }
    }

    render() {
        const loop = () => {
            // 自动缓慢旋转
            if (!this.isDragging) {
                this.angleY -= 0.001;
            }

            // 清空画布 (带拖尾效果)
            this.ctx.fillStyle = 'rgba(0, 5, 15, 0.3)';
            this.ctx.fillRect(0, 0, this.width, this.height);

            // 渲染背景星尘
            this.dust.forEach(p => {
                const proj = this.project(p.x, p.y, p.z);
                if (proj.scale > 0) {
                    this.ctx.beginPath();
                    this.ctx.arc(proj.x, proj.y, p.size * proj.scale, 0, Math.PI * 2);
                    this.ctx.fillStyle = p.color;
                    this.ctx.fill();
                }
            });

            // 渲染记忆星球 (根据 Z 轴排序，实现正确的遮挡)
            const sortedStars = [...this.stars].sort((a, b) => {
                return this.project(b.x, b.y, b.z).z - this.project(a.x, a.y, a.z).z;
            });

            const time = Date.now();

            sortedStars.forEach(star => {
                const proj = this.project(star.x, star.y, star.z);
                if (proj.scale > 0) {
                    const currentSize = star.size * proj.scale;
                    // 呼吸闪烁效果
                    const alpha = 0.6 + Math.sin(time * star.glow) * 0.4;

                    this.ctx.beginPath();
                    this.ctx.arc(proj.x, proj.y, currentSize, 0, Math.PI * 2);
                    
                    // 辉光效果 (Star Accents)
                    this.ctx.shadowBlur = 15 * proj.scale;
                    this.ctx.shadowColor = star.color;
                    this.ctx.fillStyle = star.color;
                    
                    this.ctx.globalAlpha = alpha;
                    this.ctx.fill();
                    
                    // 重置状态
                    this.ctx.globalAlpha = 1;
                    this.ctx.shadowBlur = 0;
                    
                    // 画个高光核心
                    this.ctx.beginPath();
                    this.ctx.arc(proj.x, proj.y, currentSize * 0.4, 0, Math.PI * 2);
                    this.ctx.fillStyle = '#ffffff';
                    this.ctx.fill();
                }
            });

            requestAnimationFrame(loop);
        };
        loop();
    }
}
