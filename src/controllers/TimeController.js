/**
 * 时间控制器
 * 管理时间流逝、动画播放和日期控制
 */
export class TimeController {
    constructor() {
        this.currentDate = new Date();
        this.isPlaying = false;
        this.speed = 1; // 天/秒
        this.lastUpdateTime = 0;
        this.animationId = null;
        
        // 事件监听器
        this.listeners = new Map();
        
        // 时间范围限制
        this.minDate = new Date('1900-01-01');
        this.maxDate = new Date('2100-12-31');
    }
    
    /**
     * 设置当前日期
     */
    setDate(date) {
        if (date < this.minDate || date > this.maxDate) {
            console.warn('日期超出允许范围');
            return;
        }
        
        this.currentDate = new Date(date);
        this.emit('dateChange', this.currentDate);
    }
    
    /**
     * 获取当前日期
     */
    getCurrentDate() {
        return new Date(this.currentDate);
    }
    
    /**
     * 设置时间流逝速度
     */
    setSpeed(speed) {
        this.speed = Math.max(0, Math.min(100, speed)); // 限制在0-100之间
        this.emit('speedChange', this.speed);
    }
    
    /**
     * 获取当前速度
     */
    getSpeed() {
        return this.speed;
    }
    
    /**
     * 开始播放时间动画
     */
    play() {
        if (this.isPlaying) return;
        
        this.isPlaying = true;
        this.lastUpdateTime = performance.now();
        this.startAnimation();
        this.emit('playStateChange', true);
    }
    
    /**
     * 暂停时间动画
     */
    pause() {
        if (!this.isPlaying) return;
        
        this.isPlaying = false;
        this.stopAnimation();
        this.emit('playStateChange', false);
    }
    
    /**
     * 切换播放/暂停状态
     */
    toggle() {
        if (this.isPlaying) {
            this.pause();
        } else {
            this.play();
        }
    }
    
    /**
     * 是否正在播放
     */
    isPlaying() {
        return this.isPlaying;
    }
    
    /**
     * 重置到指定日期
     */
    reset(date = new Date('2024-01-01')) {
        this.pause();
        this.setDate(date);
        this.emit('reset', this.currentDate);
    }
    
    /**
     * 快进到指定天数后
     */
    fastForward(days) {
        const newDate = new Date(this.currentDate);
        newDate.setDate(newDate.getDate() + days);
        this.setDate(newDate);
    }
    
    /**
     * 快退到指定天数前
     */
    fastBackward(days) {
        const newDate = new Date(this.currentDate);
        newDate.setDate(newDate.getDate() - days);
        this.setDate(newDate);
    }
    
    /**
     * 跳转到今天
     */
    jumpToToday() {
        this.setDate(new Date());
    }
    
    /**
     * 跳转到特定天文事件
     */
    jumpToEvent(eventType, year = null) {
        const targetYear = year || this.currentDate.getFullYear();
        let targetDate;
        
        switch (eventType) {
            case 'spring_equinox':
                // 春分 (大约3月20日)
                targetDate = new Date(targetYear, 2, 20);
                break;
            case 'summer_solstice':
                // 夏至 (大约6月21日)
                targetDate = new Date(targetYear, 5, 21);
                break;
            case 'autumn_equinox':
                // 秋分 (大约9月23日)
                targetDate = new Date(targetYear, 8, 23);
                break;
            case 'winter_solstice':
                // 冬至 (大约12月21日)
                targetDate = new Date(targetYear, 11, 21);
                break;
            default:
                console.warn('未知的天文事件类型:', eventType);
                return;
        }
        
        this.setDate(targetDate);
    }
    
    /**
     * 开始动画循环
     */
    startAnimation() {
        const animate = (currentTime) => {
            if (!this.isPlaying) return;
            
            const deltaTime = (currentTime - this.lastUpdateTime) / 1000; // 转换为秒
            this.lastUpdateTime = currentTime;
            
            // 计算时间增量 (天)
            const timeDelta = deltaTime * this.speed;
            
            // 更新日期
            const newDate = new Date(this.currentDate);
            newDate.setTime(newDate.getTime() + timeDelta * 24 * 60 * 60 * 1000);
            
            // 检查时间范围
            if (newDate >= this.minDate && newDate <= this.maxDate) {
                this.currentDate = newDate;
                this.emit('dateChange', this.currentDate);
            } else {
                // 超出范围，暂停动画
                this.pause();
                this.emit('timeRangeExceeded', newDate);
            }
            
            this.animationId = requestAnimationFrame(animate);
        };
        
        this.animationId = requestAnimationFrame(animate);
    }
    
    /**
     * 停止动画循环
     */
    stopAnimation() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
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
                console.error('事件回调执行错误:', error);
            }
        });
    }
    
    /**
     * 获取日期信息
     */
    getDateInfo() {
        const date = this.currentDate;
        const dayOfYear = this.getDayOfYear(date);
        const weekOfYear = this.getWeekOfYear(date);
        
        return {
            date: new Date(date),
            year: date.getFullYear(),
            month: date.getMonth() + 1,
            day: date.getDate(),
            dayOfYear,
            weekOfYear,
            dayOfWeek: date.getDay(),
            timestamp: date.getTime(),
            isoString: date.toISOString(),
            localString: date.toLocaleDateString('zh-CN'),
            timeString: date.toLocaleTimeString('zh-CN')
        };
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
     * 获取一年中的第几周
     */
    getWeekOfYear(date) {
        const start = new Date(date.getFullYear(), 0, 1);
        const days = Math.floor((date - start) / (24 * 60 * 60 * 1000));
        return Math.ceil((days + start.getDay() + 1) / 7);
    }
    
    /**
     * 计算两个日期之间的天数差
     */
    daysBetween(date1, date2) {
        const diffTime = Math.abs(date2 - date1);
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
    
    /**
     * 格式化持续时间
     */
    formatDuration(days) {
        if (days < 1) {
            const hours = Math.round(days * 24);
            return `${hours}小时`;
        } else if (days < 30) {
            return `${Math.round(days)}天`;
        } else if (days < 365) {
            const months = Math.round(days / 30);
            return `${months}个月`;
        } else {
            const years = (days / 365).toFixed(1);
            return `${years}年`;
        }
    }
    
    /**
     * 清理资源
     */
    dispose() {
        this.pause();
        this.listeners.clear();
    }
}