/**
 * UI控制器
 * 处理用户界面交互和信息显示
 */
export class UIController {
    constructor() {
        // DOM元素
        this.elements = {
            dateInput: document.getElementById('date-input'),
            timeSpeed: document.getElementById('time-speed'),
            speedValue: document.getElementById('speed-value'),
            planetFocus: document.getElementById('planet-focus'),
            observerLocation: document.getElementById('observer-location'),
            playPause: document.getElementById('play-pause'),
            reset: document.getElementById('reset'),
            showConstellations: document.getElementById('show-constellations'),
            showPlanetOrbits: document.getElementById('show-planet-orbits'),
            showEcliptic: document.getElementById('show-ecliptic'),
            currentDate: document.getElementById('current-date'),
            planetPositions: document.getElementById('planet-positions')
        };
        
        // 状态
        this.isPlaying = false;
        this.currentSpeed = 1;
        
        // 事件监听器
        this.listeners = new Map();
        
        // 初始化
        this.initializeEventHandlers();
        this.updateUI();
    }
    
    /**
     * 初始化事件处理器
     */
    initializeEventHandlers() {
        // 日期输入变化
        if (this.elements.dateInput) {
            this.elements.dateInput.addEventListener('change', (event) => {
                const date = new Date(event.target.value + 'T12:00:00');
                this.emit('dateChange', date);
            });
        }
        
        // 时间速度变化
        if (this.elements.timeSpeed) {
            this.elements.timeSpeed.addEventListener('input', (event) => {
                const speed = parseFloat(event.target.value);
                this.currentSpeed = speed;
                this.emit('speedChange', speed);
                this.updateSpeedDisplay(speed);
            });
        }
        
        // 行星聚焦变化
        if (this.elements.planetFocus) {
            this.elements.planetFocus.addEventListener('change', (event) => {
                this.emit('planetFocusChange', event.target.value);
            });
        }

        // 观察地点变化
        if (this.elements.observerLocation) {
            this.elements.observerLocation.addEventListener('change', (event) => {
                const v = event.target.value;
                const presets = {
                    guangzhou: { lat: 23.1291, lon: 113.2644 },
                    beijing: { lat: 39.9042, lon: 116.4074 },
                    shanghai: { lat: 31.2304, lon: 121.4737 },
                    newyork: { lat: 40.7128, lon: -74.0060 },
                    sydney: { lat: -33.8688, lon: 151.2093 }
                };
                if (presets[v]) {
                    this.emit('observerChange', presets[v]);
                } else {
                    this.emit('observerChangeRequestedCustom');
                }
            });
        }
        
        // 播放/暂停按钮
        if (this.elements.playPause) {
            this.elements.playPause.addEventListener('click', () => {
                this.isPlaying = !this.isPlaying;
                this.emit('playPause', this.isPlaying);
                this.updatePlayPauseButton();
            });
        }
        
        // 重置按钮
        if (this.elements.reset) {
            this.elements.reset.addEventListener('click', () => {
                this.isPlaying = false;
                this.emit('reset');
                this.updatePlayPauseButton();
            });
        }
        
        // 显示选项
        if (this.elements.showConstellations) {
            this.elements.showConstellations.addEventListener('change', (event) => {
                this.emit('showConstellationsChange', event.target.checked);
            });
        }
        
        if (this.elements.showPlanetOrbits) {
            this.elements.showPlanetOrbits.addEventListener('change', (event) => {
                this.emit('showOrbitTrailsChange', event.target.checked);
            });
        }
        
        if (this.elements.showEcliptic) {
            this.elements.showEcliptic.addEventListener('change', (event) => {
                this.emit('showEclipticChange', event.target.checked);
            });
        }
        
        // 键盘快捷键
        this.initializeKeyboardShortcuts();
    }
    
    /**
     * 初始化键盘快捷键
     */
    initializeKeyboardShortcuts() {
        document.addEventListener('keydown', (event) => {
            // 防止在输入框中触发快捷键
            if (event.target.tagName === 'INPUT' || event.target.tagName === 'SELECT') {
                return;
            }
            
            switch (event.code) {
                case 'Space':
                    event.preventDefault();
                    this.elements.playPause?.click();
                    break;
                case 'KeyR':
                    event.preventDefault();
                    this.elements.reset?.click();
                    break;
                case 'ArrowLeft':
                    event.preventDefault();
                    this.emit('stepBackward');
                    break;
                case 'ArrowRight':
                    event.preventDefault();
                    this.emit('stepForward');
                    break;
                case 'ArrowUp':
                    event.preventDefault();
                    this.increaseSpeed();
                    break;
                case 'ArrowDown':
                    event.preventDefault();
                    this.decreaseSpeed();
                    break;
                case 'KeyT':
                    event.preventDefault();
                    this.emit('jumpToToday');
                    break;
            }
        });
    }
    
    /**
     * 增加速度
     */
    increaseSpeed() {
        const newSpeed = Math.min(100, this.currentSpeed + 0.5);
        this.setSpeed(newSpeed);
    }
    
    /**
     * 减少速度
     */
    decreaseSpeed() {
        const newSpeed = Math.max(0, this.currentSpeed - 0.5);
        this.setSpeed(newSpeed);
    }
    
    /**
     * 设置速度
     */
    setSpeed(speed) {
        this.currentSpeed = speed;
        if (this.elements.timeSpeed) {
            this.elements.timeSpeed.value = speed;
        }
        this.updateSpeedDisplay(speed);
        this.emit('speedChange', speed);
    }
    
    /**
     * 更新日期显示
     */
    updateDateDisplay(date) {
        if (this.elements.currentDate) {
            const options = {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                weekday: 'long'
            };
            const dateString = date.toLocaleDateString('zh-CN', options);
            const dayOfYear = this.getDayOfYear(date);
            
            this.elements.currentDate.innerHTML = `
                <div style="font-size: 14px; color: #ffd700;">
                    ${dateString}
                </div>
                <div style="font-size: 12px; color: #ccc; margin-top: 5px;">
                    一年中的第 ${dayOfYear} 天
                </div>
            `;
        }
        
        // 同步日期输入框
        if (this.elements.dateInput) {
            const isoDate = date.toISOString().split('T')[0];
            this.elements.dateInput.value = isoDate;
        }
    }
    
    /**
     * 更新行星信息显示
     */
    updatePlanetInfo(planetPositions) {
        if (!this.elements.planetPositions) return;
        
        let infoHTML = '';
        
        for (const [key, planet] of Object.entries(planetPositions)) {
            const ra = planet.celestialCoords.ra.toFixed(1);
            const dec = planet.celestialCoords.dec.toFixed(1);
            const mag = planet.magnitude.toFixed(1);
            
            infoHTML += `
                <div class="planet-info">
                    <span class="planet-name">${planet.name}</span>
                    <span class="constellation-name">${planet.constellation}</span>
                </div>
                <div class="planet-info" style="font-size: 10px; color: #999; margin-bottom: 8px;">
                    <span>赤经: ${ra}h</span>
                    <span>赤纬: ${dec}°</span>
                    <span>星等: ${mag}</span>
                </div>
            `;
        }
        
        this.elements.planetPositions.innerHTML = infoHTML;
    }
    
    /**
     * 更新速度显示
     */
    updateSpeedDisplay(speed) {
        if (this.elements.speedValue) {
            if (speed === 0) {
                this.elements.speedValue.textContent = '暂停';
            } else if (speed < 1) {
                this.elements.speedValue.textContent = `${speed.toFixed(1)} 天/秒`;
            } else if (speed < 10) {
                this.elements.speedValue.textContent = `${speed.toFixed(1)} 天/秒`;
            } else {
                this.elements.speedValue.textContent = `${Math.round(speed)} 天/秒`;
            }
        }
    }
    
    /**
     * 更新播放/暂停按钮
     */
    updatePlayPauseButton() {
        if (this.elements.playPause) {
            this.elements.playPause.textContent = this.isPlaying ? '暂停' : '播放';
            this.elements.playPause.className = this.isPlaying ? 'btn btn-secondary' : 'btn btn-primary';
        }
    }
    
    /**
     * 显示加载状态
     */
    showLoading(message = '加载中...') {
        // 可以显示loading指示器
        console.log('Loading:', message);
    }
    
    /**
     * 隐藏加载状态
     */
    hideLoading() {
        console.log('Loading complete');
    }
    
    /**
     * 显示错误信息
     */
    showError(message) {
        alert('错误: ' + message);
    }
    
    /**
     * 显示信息提示
     */
    showInfo(message) {
        // 可以实现toast提示
        console.log('Info:', message);
    }
    
    /**
     * 显示帮助信息
     */
    showHelp() {
        const helpText = `
太阳系星图观测器 - 快捷键帮助：

空格键: 播放/暂停
R: 重置
T: 跳转到今天
方向键 ←/→: 前进/后退一天
方向键 ↑/↓: 增加/减少时间速度

鼠标操作：
拖拽: 旋转视角
滚轮: 缩放
        `;
        alert(helpText);
    }
    
    /**
     * 更新整个UI
     */
    updateUI() {
        this.updatePlayPauseButton();
        this.updateSpeedDisplay(this.currentSpeed);
    }
    
    /**
     * 添加事件监听器
     */
    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);
    }
    
    /**
     * 移除事件监听器
     */
    off(event, callback) {
        if (!this.listeners.has(event)) return;
        
        const callbacks = this.listeners.get(event);
        const index = callbacks.indexOf(callback);
        if (index > -1) {
            callbacks.splice(index, 1);
        }
    }
    
    /**
     * 触发事件
     */
    emit(event, data) {
        if (!this.listeners.has(event)) return;
        
        const callbacks = this.listeners.get(event);
        callbacks.forEach(callback => {
            try {
                callback(data);
            } catch (error) {
                console.error('UI事件回调执行错误:', error);
            }
        });
    }
    
    /**
     * 获取一年中的第几天
     */
    getDayOfYear(date) {
        const start = new Date(date.getFullYear(), 0, 0);
        const diff = date - start;
        return Math.floor(diff / (1000 * 60 * 60 * 24));
    }
    
    /**
     * 清理资源
     */
    dispose() {
        this.listeners.clear();
        // 移除事件监听器
        document.removeEventListener('keydown', this.keydownHandler);
    }
}