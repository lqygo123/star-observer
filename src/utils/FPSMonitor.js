/**
 * FPS监控器
 * 用于跟踪和显示渲染性能指标
 */
export class FPSMonitor {
    constructor() {
        this.frameCount = 0;
        this.lastTime = performance.now();
        this.fps = 0;
        this.renderTime = 0;
        this.lastRenderStart = 0;
        
        // 性能统计
        this.fpsHistory = [];
        this.renderTimeHistory = [];
        this.maxHistoryLength = 60; // 保存60帧的历史数据
        
        // DOM元素引用
        this.fpsElement = null;
        this.renderTimeElement = null;
        this.memoryElement = null;
        
        this.init();
    }
    
    /**
     * 初始化FPS监控器
     */
    init() {
        this.fpsElement = document.getElementById('fps-value');
        this.renderTimeElement = document.getElementById('render-time');
        this.memoryElement = document.getElementById('memory-usage');
        
        if (!this.fpsElement || !this.renderTimeElement || !this.memoryElement) {
            console.warn('FPS监控器: 未找到必要的DOM元素');
        }
    }
    
    /**
     * 开始渲染计时
     */
    beginRender() {
        this.lastRenderStart = performance.now();
    }
    
    /**
     * 结束渲染计时并更新统计
     */
    endRender() {
        const currentTime = performance.now();
        
        // 计算渲染时间
        this.renderTime = currentTime - this.lastRenderStart;
        
        // 更新帧计数
        this.frameCount++;
        
        // 每秒更新一次FPS
        if (currentTime - this.lastTime >= 1000) {
            this.fps = Math.round((this.frameCount * 1000) / (currentTime - this.lastTime));
            this.frameCount = 0;
            this.lastTime = currentTime;
            
            // 保存历史数据
            this.fpsHistory.push(this.fps);
            this.renderTimeHistory.push(this.renderTime);
            
            // 限制历史数据长度
            if (this.fpsHistory.length > this.maxHistoryLength) {
                this.fpsHistory.shift();
                this.renderTimeHistory.shift();
            }
        }
        
        // 更新显示
        this.updateDisplay();
    }
    
    /**
     * 更新显示内容
     */
    updateDisplay() {
        if (this.fpsElement) {
            this.fpsElement.textContent = this.fps.toString();
            
            // 根据FPS值改变颜色
            if (this.fps >= 55) {
                this.fpsElement.style.color = '#00ff88'; // 绿色 - 优秀
            } else if (this.fps >= 30) {
                this.fpsElement.style.color = '#ffff00'; // 黄色 - 良好
            } else {
                this.fpsElement.style.color = '#ff4444'; // 红色 - 较差
            }
        }
        
        if (this.renderTimeElement) {
            this.renderTimeElement.textContent = this.renderTime.toFixed(1);
            
            // 根据渲染时间改变颜色
            if (this.renderTime <= 16.67) { // 60FPS对应的时间
                this.renderTimeElement.style.color = '#00ff88';
            } else if (this.renderTime <= 33.33) { // 30FPS对应的时间
                this.renderTimeElement.style.color = '#ffff00';
            } else {
                this.renderTimeElement.style.color = '#ff4444';
            }
        }
        
        if (this.memoryElement) {
            this.updateMemoryUsage();
        }
    }
    
    /**
     * 更新内存使用情况
     */
    updateMemoryUsage() {
        if (performance.memory) {
            const usedMemory = performance.memory.usedJSHeapSize / (1024 * 1024);
            this.memoryElement.textContent = usedMemory.toFixed(1);
            
            // 根据内存使用量改变颜色
            if (usedMemory < 100) {
                this.memoryElement.style.color = '#00ff88';
            } else if (usedMemory < 500) {
                this.memoryElement.style.color = '#ffff00';
            } else {
                this.memoryElement.style.color = '#ff4444';
            }
        } else {
            this.memoryElement.textContent = 'N/A';
            this.memoryElement.style.color = '#888';
        }
    }
    
    /**
     * 获取平均FPS
     */
    getAverageFPS() {
        if (this.fpsHistory.length === 0) return 0;
        const sum = this.fpsHistory.reduce((a, b) => a + b, 0);
        return Math.round(sum / this.fpsHistory.length);
    }
    
    /**
     * 获取平均渲染时间
     */
    getAverageRenderTime() {
        if (this.renderTimeHistory.length === 0) return 0;
        const sum = this.renderTimeHistory.reduce((a, b) => a + b, 0);
        return sum / this.renderTimeHistory.length;
    }
    
    /**
     * 获取性能统计信息
     */
    getStats() {
        return {
            currentFPS: this.fps,
            averageFPS: this.getAverageFPS(),
            currentRenderTime: this.renderTime,
            averageRenderTime: this.getAverageRenderTime(),
            frameCount: this.frameCount,
            fpsHistory: [...this.fpsHistory],
            renderTimeHistory: [...this.renderTimeHistory]
        };
    }
    
    /**
     * 重置统计信息
     */
    reset() {
        this.frameCount = 0;
        this.lastTime = performance.now();
        this.fps = 0;
        this.renderTime = 0;
        this.fpsHistory = [];
        this.renderTimeHistory = [];
        this.updateDisplay();
    }
}

