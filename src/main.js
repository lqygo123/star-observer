import { StarMapRenderer } from './renderer/StarMapRenderer.js';
import { AstronomicalCalculator } from './astronomy/AstronomicalCalculator.js';
import { TimeController } from './controllers/TimeController.js';
import { UIController } from './controllers/UIController.js';
import { ConstellationData } from './data/ConstellationData.js';

/**
 * 太阳系星图观测器主程序
 * 整合所有模块，提供完整的星图观测体验
 */
class SolarSystemStarMap {
    constructor() {
        this.container = document.getElementById('container');
        this.loadingElement = document.getElementById('loading');
        
        // 核心组件
        this.renderer = null;
        this.calculator = null;
        this.timeController = null;
        this.uiController = null;
        
        // 状态管理
        this.isInitialized = false;
        this.animationId = null;
        this.fixedObservationTime = '00:00'; // HH:MM
    }
    
    /**
     * 初始化应用程序
     */
    async init() {
        try {
            this.showLoading('初始化3D渲染器...');
            
            // 初始化3D渲染器
            this.renderer = new StarMapRenderer(this.container);
            await this.renderer.init();
            
            this.showLoading('加载天体数据...');
            
            // 初始化天文计算器
            this.calculator = new AstronomicalCalculator();
            await this.calculator.init();
            
            this.showLoading('设置控制系统...');
            
            // 初始化时间控制器
            this.timeController = new TimeController();
            this.timeController.on('dateChange', (date) => {
                this.updateStarMap(date);
            });
            
            // 初始化UI控制器
            this.uiController = new UIController();
            this.setupUIEventHandlers();
            
            // 加载星座数据
            const constellationData = new ConstellationData();
            await constellationData.load();
            this.renderer.setConstellationData(constellationData);
            
            this.showLoading('准备就绪...');
            
            // 设置初始日期和星图
            const initialDate = new Date('2024-01-01');
            this.timeController.setDate(initialDate);
            this.updateStarMap(initialDate);
            
            this.hideLoading();
            this.isInitialized = true;
            
            // 开始渲染循环
            this.startRenderLoop();

            this.mycustomModifycation();
            
        } catch (error) {
            console.error('初始化失败:', error);
            this.showError('初始化失败: ' + error.message);
        }
    }
    
    mycustomModifycation() {
        console.log('mycustomModifycation');
    }

    /**
     * 设置UI事件处理器
     */
    setupUIEventHandlers() {
        // 日期变化
        this.uiController.on('dateChange', (date) => {
            this.timeController.setDate(date);
        });
        
        // 播放/暂停
        this.uiController.on('playPause', (isPlaying) => {
            if (isPlaying) {
                this.timeController.play();
            } else {
                this.timeController.pause();
            }
        });
        
        // 时间速度变化
        this.uiController.on('speedChange', (speed) => {
            this.timeController.setSpeed(speed);
        });
        
        // 行星聚焦变化
        this.uiController.on('planetFocusChange', (planet) => {
            this.renderer.setFocusPlanet(planet);
        });
        
        // 观察地点变化
        this.uiController.on('observerChange', ({ lat, lon }) => {
            this.renderer.setObserverLocation(lat, lon);
            // 刷新一次姿态与渲染
            const date = this.timeController.getCurrentDate();
            this.updateStarMap(date);
        });

        // 固定观测时间
        this.uiController.on('fixedTimeChange', (hhmm) => {
            this.fixedObservationTime = hhmm || '00:00';
            // 切到当前日期的该时间点重算
            const curr = this.timeController.getCurrentDate();
            this.updateStarMap(curr);
        });

        // 显示选项变化
        this.uiController.on('showConstellationsChange', (show) => {
            this.renderer.setConstellationsVisible(show);
        });
        
        this.uiController.on('showOrbitTrailsChange', (show) => {
            this.renderer.setOrbitTrailsVisible(show);
        });
        
        this.uiController.on('showEclipticChange', (show) => {
            this.renderer.setEclipticVisible(show);
        });
        
        // 重置
        this.uiController.on('reset', () => {
            this.timeController.setDate(new Date('2024-01-01'));
            this.timeController.pause();
        });
    }
    
    /**
     * 更新星图显示
     */
    updateStarMap(date) {
        if (!this.isInitialized) return;
        
        // 将日期时间固定为指定HH:MM
        const effectiveDate = new Date(date);
        if (typeof this.fixedObservationTime === 'string') {
            const [hh, mm] = this.fixedObservationTime.split(':').map(Number);
            effectiveDate.setHours(Number.isFinite(hh) ? hh : 0, Number.isFinite(mm) ? mm : 0, 0, 0);
        }

        // 计算当前日期所有行星的位置（使用固定时间）
        const planetPositions = this.calculator.calculatePlanetPositions(effectiveDate);
        
        // 更新3D场景
        this.renderer.updatePlanetPositions(planetPositions);
        this.renderer.updateStarField(effectiveDate);
        
        // 更新UI信息显示
        this.uiController.updateDateDisplay(effectiveDate);
        this.uiController.updatePlanetInfo(planetPositions);
    }
    
    /**
     * 开始渲染循环
     */
    startRenderLoop() {
        const animate = () => {
            this.animationId = requestAnimationFrame(animate);
            
            if (this.renderer) {
                this.renderer.render();
            }
        };
        animate();
    }
    
    /**
     * 停止渲染循环
     */
    stopRenderLoop() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }
    
    /**
     * 显示加载状态
     */
    showLoading(message) {
        this.loadingElement.textContent = message;
        this.loadingElement.style.display = 'block';
    }
    
    /**
     * 隐藏加载状态
     */
    hideLoading() {
        this.loadingElement.style.display = 'none';
    }
    
    /**
     * 显示错误信息
     */
    showError(message) {
        this.loadingElement.textContent = message;
        this.loadingElement.style.color = '#ff6b6b';
    }
    
    /**
     * 清理资源
     */
    dispose() {
        this.stopRenderLoop();
        
        if (this.renderer) {
            this.renderer.dispose();
        }
        
        if (this.timeController) {
            this.timeController.dispose();
        }
        
        if (this.uiController) {
            this.uiController.dispose();
        }
    }
}

// 应用程序入口
document.addEventListener('DOMContentLoaded', () => {
    const app = new SolarSystemStarMap();
    app.init();
    
    // 页面卸载时清理资源
    window.addEventListener('beforeunload', () => {
        app.dispose();
    });
});

export default SolarSystemStarMap;