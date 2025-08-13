import * as THREE from 'three';
import { ConstellationData } from '../data/ConstellationData.js';
import { FPSMonitor } from '../utils/FPSMonitor.js';

/**
 * 星图3D渲染器
 * 使用Three.js渲染星空、星座和行星
 */
export class StarMapRenderer {
    constructor(container) {
        console.log('StarMapRenderer: 构造函数被调用');
        this.container = container;
        
        // Three.js核心组件
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        
        // 渲染对象组
        this.skyGroup = null; // 天球整体分组
        this.starField = null;
        this.constellationGroup = null;
        this.planetGroup = null;
        this.orbitTrailsGroup = null;
        
        // 数据
        this.constellationData = null;
        this.planetObjects = new Map();
        this.orbitTrails = new Map();
        this.starCatalogRaw = null; // 原始星表（用于半球可见性过滤）
        this.starPoints = null; // 背景恒星 Points 引用
        
        // 显示控制
        this.showConstellations = true;
        this.showOrbitTrails = true;
        this.showEcliptic = false;
        this.focusPlanet = 'all';
        
        // 渲染参数
        this.celestialSphereRadius = 1000;
        this.planetScale = 2.0;

        // 观测者参数（默认广州）
        this.observer = {
            latitudeDeg: 23.1291,
            longitudeDeg: 113.2644
        };

        // 地平线裁剪平面
        this.horizonPlane = null;
        
        // FPS监控器
        this.fpsMonitor = new FPSMonitor();
    }
    
    /**
     * 初始化渲染器
     */
    async init() {
        console.log('StarMapRenderer: 开始初始化渲染器');
        // 创建场景
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x001122);
        console.log('StarMapRenderer: 场景创建完成');
        
        // 创建相机
        this.camera = new THREE.PerspectiveCamera(
            75,
            this.container.clientWidth / this.container.clientHeight,
            0.1,
            5000
        );
        this.camera.position.set(0, 0, 100);
        console.log('StarMapRenderer: 相机创建完成');
        
        // 创建渲染器
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.container.appendChild(this.renderer.domElement);
        // 启用局部裁剪（用于半球可见性）
        this.renderer.localClippingEnabled = true;
        console.log('StarMapRenderer: 渲染器创建完成');
        
        // 创建轨道控制器
        console.log('StarMapRenderer: 开始初始化轨道控制器');
        await this.initControls();
        console.log('StarMapRenderer: 轨道控制器初始化完成');
        
        // 创建场景对象组
        console.log('StarMapRenderer: 开始创建场景对象组');
        this.createSceneGroups();
        console.log('StarMapRenderer: 场景对象组创建完成');
        
        // 创建星空背景（优先加载真实星表，失败则回退随机分布）
        console.log('StarMapRenderer: 开始创建星空背景');
        await this.createBackgroundStars();
        console.log('StarMapRenderer: 星空背景创建完成');
        
        // 创建重要亮星标注
        console.log('StarMapRenderer: 开始创建重要亮星标注');
        this.createBrightStarLabels();
        console.log('StarMapRenderer: 重要亮星标注创建完成');
        
        // 创建黄道（投影为天球大圆）
        console.log('StarMapRenderer: 开始创建黄道大圆');
        this.createEcliptic();
        console.log('StarMapRenderer: 黄道大圆创建完成');
        
        // 窗口resize处理
        this.setupResizeHandler();
        console.log('StarMapRenderer: 窗口resize处理设置完成');
        
        console.log('3D渲染器初始化完成');
    }
    
    /**
     * 初始化轨道控制器
     */
    async initControls() {
        try {
            console.log('StarMapRenderer: 正在加载OrbitControls模块');
            const { OrbitControls } = await import('three/examples/jsm/controls/OrbitControls.js');
            this.controls = new OrbitControls(this.camera, this.renderer.domElement);
            this.controls.enableDamping = true;
            this.controls.dampingFactor = 0.05;
            this.controls.enableZoom = true;
            this.controls.enablePan = true;
            this.controls.maxDistance = 2000;
            this.controls.minDistance = 10;
            console.log('StarMapRenderer: OrbitControls初始化成功');
        } catch (error) {
            console.warn('无法加载OrbitControls，使用基础相机控制', error);
        }
    }
    
    /**
     * 创建场景对象组
     */
    createSceneGroups() {
        console.log('StarMapRenderer: 创建场景对象组');
        // 顶层天球分组
        this.skyGroup = new THREE.Group();
        this.scene.add(this.skyGroup);

        // 子分组
        this.starField = new THREE.Group();
        this.constellationGroup = new THREE.Group();
        this.planetGroup = new THREE.Group();
        this.orbitTrailsGroup = new THREE.Group();

        this.skyGroup.add(this.starField);
        this.skyGroup.add(this.constellationGroup);
        this.skyGroup.add(this.planetGroup);
        this.skyGroup.add(this.orbitTrailsGroup);

        // 地平线裁剪平面：y>=0 可见（应用于所有材质）
        this.horizonPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
        this.renderer.clippingPlanes = [this.horizonPlane];
        console.log('StarMapRenderer: 场景对象组添加到场景中');
    }
    
    /**
     * 创建星空背景
     */
    createStarField() {
        console.log('StarMapRenderer: 开始创建星空背景');
        const starCount = 2000;
        console.log(`StarMapRenderer: 准备创建${starCount}颗恒星`);
        const starGeometry = new THREE.BufferGeometry();
        const starPositions = new Float32Array(starCount * 3);
        const starColors = new Float32Array(starCount * 3);
        const starSizes = new Float32Array(starCount);
        
        for (let i = 0; i < starCount; i++) {
            // 随机分布在天球上
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            
            const x = this.celestialSphereRadius * Math.sin(phi) * Math.cos(theta);
            const y = this.celestialSphereRadius * Math.sin(phi) * Math.sin(theta);
            const z = this.celestialSphereRadius * Math.cos(phi);
            
            starPositions[i * 3] = x;
            starPositions[i * 3 + 1] = y;
            starPositions[i * 3 + 2] = z;
            
            // 星体颜色 (根据温度分布)
            const temp = Math.random();
            if (temp < 0.3) {
                // 红星
                starColors[i * 3] = 1.0;
                starColors[i * 3 + 1] = 0.6;
                starColors[i * 3 + 2] = 0.4;
            } else if (temp < 0.7) {
                // 黄白星
                starColors[i * 3] = 1.0;
                starColors[i * 3 + 1] = 1.0;
                starColors[i * 3 + 2] = 0.8;
            } else {
                // 蓝白星
                starColors[i * 3] = 0.8;
                starColors[i * 3 + 1] = 0.9;
                starColors[i * 3 + 2] = 1.0;
            }
            
            // 星体大小 (模拟不同星等)
            starSizes[i] = Math.random() * 2 + 0.5;
        }
        
        starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
        starGeometry.setAttribute('color', new THREE.BufferAttribute(starColors, 3));
        starGeometry.setAttribute('size', new THREE.BufferAttribute(starSizes, 1));
        
        const starMaterial = new THREE.PointsMaterial({
            size: 2,
            sizeAttenuation: false,
            vertexColors: true,
            transparent: true,
            opacity: 0.8
        });
        
        const stars = new THREE.Points(starGeometry, starMaterial);
        this.starField.add(stars);
        console.log('StarMapRenderer: 星空背景创建完成');
    }

    /**
     * 优先从真实星表创建星空背景，失败时回退到随机分布
     */
    async createBackgroundStars() {
        try {
            // 默认尝试加载 HYG/HiP 子集（可在部署时将数据放在 public/data/ 下）
            // 数据格式期望：[{ ra: number(deg), dec: number(deg), mag: number, bv?: number }]
            await this.loadStarCatalog({
                url: './data/hyg_v3_mag6.json',
                maxMagnitude: 6.5,
                limit: 20000
            });
        } catch (error) {
            console.warn('StarMapRenderer: 加载真实星表失败，改用随机星空。错误：', error);
            this.createStarField();
        }
    }

    /**
     * 从星表加载并渲染背景星空
     * @param {{ url: string, maxMagnitude?: number, limit?: number }} options
     */
    async loadStarCatalog(options) {
        const { url, maxMagnitude = 6.5, limit = 20000 } = options || {};
        if (!url) throw new Error('缺少星表数据URL');

        console.log(`StarMapRenderer: 开始加载星表 ${url}`);
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`星表请求失败：${response.status} ${response.statusText}`);
        }
        const stars = await response.json();
        if (!Array.isArray(stars)) {
            throw new Error('星表格式错误：期望为数组');
        }

        // 过滤与裁剪
        const filtered = stars
            .filter(s => Number.isFinite(s.ra) && Number.isFinite(s.dec) && Number.isFinite(s.mag))
            .filter(s => s.mag <= maxMagnitude)
            .sort((a, b) => a.mag - b.mag);

        const sliced = filtered.slice(0, limit);
        console.log(`StarMapRenderer: 星表加载完成，原始=${stars.length}，可见=${filtered.length}，绘制=${sliced.length}`);

        // 构建几何
        const starGeometry = new THREE.BufferGeometry();
        const starCount = sliced.length;
        const positions = new Float32Array(starCount * 3);
        const colors = new Float32Array(starCount * 3);

        for (let i = 0; i < starCount; i++) {
            const star = sliced[i];
            const pos = ConstellationData.raDecToCartesian(star.ra, star.dec, this.celestialSphereRadius);
            positions[i * 3] = pos.x;
            positions[i * 3 + 1] = pos.y;
            positions[i * 3 + 2] = pos.z;

            // 颜色：优先使用 B-V 估算色温到RGB；否则按亮度映射白光
            const rgb = Number.isFinite(star.bv)
                ? this.bvToRgb(star.bv)
                : { r: 1, g: 1, b: 1 };

            // 亮度：依据星等缩放颜色强度（增强亮度，让恒星更明显）
            // 对亮星（低星等）给予更高亮度，暗星（高星等）给予基础亮度
            const baseIntensity = Math.pow(2.512, -star.mag);
            const enhancedIntensity = star.mag <= 2.0 ? baseIntensity * 4.0 : 
                                    star.mag <= 4.0 ? baseIntensity * 3.0 : 
                                    baseIntensity * 2.0;
            const intensity = Math.min(1, Math.max(0.3, enhancedIntensity));
            colors[i * 3] = rgb.r * intensity;
            colors[i * 3 + 1] = rgb.g * intensity;
            colors[i * 3 + 2] = rgb.b * intensity;
        }

        starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        starGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        // 清空旧背景并添加新的点云
        this.starField.clear();
        const starMaterial = new THREE.PointsMaterial({
            size: 2.5,
            sizeAttenuation: true,
            vertexColors: true,
            transparent: true,
            opacity: 1.0
        });

        const starsPoints = new THREE.Points(starGeometry, starMaterial);
        this.starField.add(starsPoints);
        this.starPoints = starsPoints;
        console.log('StarMapRenderer: 已使用真实星表创建星空背景');
    }

    /**
     * 粗略的 B-V -> RGB 近似映射（0.0 ~ 1.5 常见主序星范围）
     * 参考经验映射，非高保真，仅用于视觉近似
     */
    bvToRgb(bv) {
        // 限制范围
        const x = Math.max(-0.4, Math.min(2.0, bv));

        // 蓝(负)到红(正)的分段插值
        // 近似值：
        // bv=-0.4 → 蓝白 (0.64, 0.79, 1.00)
        // bv=0.0  → 白    (1.00, 1.00, 1.00)
        // bv=0.65 → 黄白  (1.00, 0.94, 0.80)
        // bv=1.5  → 橙红  (1.00, 0.75, 0.60)
        const keys = [
            { b: -0.4, c: [0.64, 0.79, 1.00] },
            { b: 0.0,  c: [1.00, 1.00, 1.00] },
            { b: 0.65, c: [1.00, 0.94, 0.80] },
            { b: 1.5,  c: [1.00, 0.75, 0.60] }
        ];

        let c0 = keys[0], c1 = keys[keys.length - 1];
        for (let i = 0; i < keys.length - 1; i++) {
            if (x >= keys[i].b && x <= keys[i + 1].b) {
                c0 = keys[i];
                c1 = keys[i + 1];
                break;
            }
        }

        const t = (x - c0.b) / (c1.b - c0.b);
        const r = c0.c[0] + (c1.c[0] - c0.c[0]) * t;
        const g = c0.c[1] + (c1.c[1] - c0.c[1]) * t;
        const b = c0.c[2] + (c1.c[2] - c0.c[2]) * t;
        return { r, g, b };
    }
    
    /**
     * 设置星座数据
     */
    setConstellationData(constellationData) {
        console.log('StarMapRenderer: 设置星座数据');
        this.constellationData = constellationData;
        this.createConstellations();
        console.log('StarMapRenderer: 星座数据设置完成');
    }
    
    /**
     * 创建星座图案
     */
    createConstellations() {
        console.log('StarMapRenderer: 开始创建星座图案');
        if (!this.constellationData) {
            console.warn('StarMapRenderer: 星座数据为空，无法创建星座图案');
            return;
        }
        
        // 清除现有星座
        this.constellationGroup.clear();
        console.log('StarMapRenderer: 已清除现有星座');
        
        const constellations = this.constellationData.getConstellations();
        console.log(`StarMapRenderer: 准备创建${constellations.size}个星座`);
        
        for (const [key, constellation] of constellations) {
            console.log(`StarMapRenderer: 创建星座 ${key}`);
            const constellationObject = new THREE.Group();
            
            // 创建星座中的恒星
            constellation.stars.forEach((star, index) => {
                const starPos = ConstellationData.raDecToCartesian(star.ra, star.dec, this.celestialSphereRadius);
                
                // 根据星等调整恒星大小和亮度（增强效果）
                const starSize = Math.max(1.5, 6 - star.mag);
                const starGeometry = new THREE.SphereGeometry(starSize, 12, 12);
                
                // 根据星等和光谱类型调整颜色（更丰富的颜色）
                let starColor = 0xffffaa; // 默认黄色
                if (star.mag <= 0.5) starColor = 0xffffff; // 最亮星为白色
                else if (star.mag <= 1.0) starColor = 0xfff8dc; // 极亮星为蜜色
                else if (star.mag <= 1.5) starColor = 0xffffcc; // 亮星为浅黄色
                else if (star.mag <= 2.5) starColor = 0xffffaa; // 中等星为黄色
                else if (star.mag <= 3.5) starColor = 0xffdd77; // 暗星为橙黄色
                else starColor = 0xffaa44; // 更暗星为橙色
                
                const starMaterial = new THREE.MeshBasicMaterial({
                    color: starColor,
                    transparent: true,
                    opacity: Math.max(0.7, Math.min(1.0, 1.3 - star.mag * 0.2))
                });
                
                // 为亮星添加光晕效果
                if (star.mag <= 2.0) {
                    const glowSize = starSize * 2.5;
                    const glowGeometry = new THREE.SphereGeometry(glowSize, 8, 8);
                    const glowMaterial = new THREE.MeshBasicMaterial({
                        color: starColor,
                        transparent: true,
                        opacity: 0.1,
                        blending: THREE.AdditiveBlending
                    });
                    const glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
                    glowMesh.position.set(starPos.x, starPos.y, starPos.z);
                    constellationObject.add(glowMesh);
                }
                
                const starMesh = new THREE.Mesh(starGeometry, starMaterial);
                starMesh.position.set(starPos.x, starPos.y, starPos.z);
                starMesh.userData = { name: star.name, magnitude: star.mag, constellation: constellation.name };
                
                constellationObject.add(starMesh);
                
                // 为亮星添加名字标注（改进样式）
                if (star.mag <= 2.5) {
                    const labelSprite = this.createTextSprite(star.name, '#ffffff');
                    labelSprite.position.set(starPos.x + 20, starPos.y + 10, starPos.z);
                    labelSprite.scale.multiplyScalar(1.2); // 略微放大标签
                    labelSprite.userData = { type: 'star_label', starName: star.name };
                    constellationObject.add(labelSprite);
                }
            });
            
            // 创建星座连线
            if (constellation.lines) {
                console.log(`StarMapRenderer: 为星座 ${key} 创建${constellation.lines.length}条连线`);
                constellation.lines.forEach(line => {
                    const startStar = constellation.stars[line[0]];
                    const endStar = constellation.stars[line[1]];
                    
                    const startPos = ConstellationData.raDecToCartesian(startStar.ra, startStar.dec, this.celestialSphereRadius);
                    const endPos = ConstellationData.raDecToCartesian(endStar.ra, endStar.dec, this.celestialSphereRadius);
                    
                    const lineGeometry = new THREE.BufferGeometry().setFromPoints([
                        new THREE.Vector3(startPos.x, startPos.y, startPos.z),
                        new THREE.Vector3(endPos.x, endPos.y, endPos.z)
                    ]);
                    
                    // 改进星座连线效果
                    const lineMaterial = new THREE.LineBasicMaterial({
                        color: 0x4a90e2,
                        transparent: true,
                        opacity: 0.9,
                        linewidth: 3
                    });
                    
                    // 为重要星座添加双线效果
                    const importantConstellations = ['ursa_major', 'orion', 'cassiopeia', 'southern_cross', 'leo'];
                    if (importantConstellations.includes(key)) {
                        const innerLineMaterial = new THREE.LineBasicMaterial({
                            color: 0x66aaff,
                            transparent: true,
                            opacity: 0.6,
                            linewidth: 1
                        });
                        const innerLine = new THREE.Line(lineGeometry.clone(), innerLineMaterial);
                        constellationObject.add(innerLine);
                    }
                    
                    const lineMesh = new THREE.Line(lineGeometry, lineMaterial);
                    constellationObject.add(lineMesh);
                });
            }
            
            // 添加星座名字标注（在星座中心位置）
            const centerPos = this.calculateConstellationCenter(constellation.stars);
            if (centerPos) {
                const constellationLabel = this.createTextSprite(constellation.name, '#4a90e2');
                // 放大星座名称标签（由2倍提升到12倍，使其更醒目）
                constellationLabel.scale.multiplyScalar(12.0);
                constellationLabel.position.set(centerPos.x, centerPos.y + 40, centerPos.z);
                constellationLabel.userData = { type: 'constellation_label', constellationName: constellation.name };
                constellationObject.add(constellationLabel);
            }
            
            // 为星座对象添加轻微的动画效果
            constellationObject.userData = { 
                type: 'constellation', 
                name: constellation.name,
                animationPhase: Math.random() * Math.PI * 2
            };
            
            constellationObject.visible = this.showConstellations;
            this.constellationGroup.add(constellationObject);
        }
        console.log('StarMapRenderer: 星座图案创建完成');
    }
    
    /**
     * 计算星座中心位置
     */
    calculateConstellationCenter(stars) {
        if (stars.length === 0) return null;
        
        let sumX = 0, sumY = 0, sumZ = 0;
        stars.forEach(star => {
            const pos = ConstellationData.raDecToCartesian(star.ra, star.dec, this.celestialSphereRadius);
            sumX += pos.x;
            sumY += pos.y;
            sumZ += pos.z;
        });
        
        return {
            x: sumX / stars.length,
            y: sumY / stars.length,
            z: sumZ / stars.length
        };
    }
    
    /**
     * 创建重要亮星标注
     */
    createBrightStarLabels() {
        if (!this.constellationData) return;
        
        const brightStars = this.constellationData.getBrightStars();
        console.log(`StarMapRenderer: 为${brightStars.size}颗重要亮星创建标注`);
        
        brightStars.forEach((star, starName) => {
            const starPos = ConstellationData.raDecToCartesian(star.ra, star.dec, this.celestialSphereRadius);
            
            // 创建亮星标注（只标注最亮的星）
            if (star.mag <= 1.0) {
                const labelSprite = this.createTextSprite(starName, '#ffff00');
                labelSprite.position.set(starPos.x + 20, starPos.y, starPos.z);
                labelSprite.userData = { type: 'bright_star_label', starName: starName };
                this.constellationGroup.add(labelSprite);
            }
        });
    }
    
    /**
     * 更新行星位置
     */
    updatePlanetPositions(planetPositions) {
        console.log('StarMapRenderer: 开始更新行星位置');
        // 清除现有行星
        this.planetGroup.clear();
        this.planetObjects.clear();
        console.log('StarMapRenderer: 已清除现有行星');
        
        let planetCount = 0;
        for (const [key, planet] of Object.entries(planetPositions)) {
            if (this.focusPlanet !== 'all' && this.focusPlanet !== key) {
                continue; // 跳过不聚焦的行星
            }
            
            console.log(`StarMapRenderer: 创建行星 ${key}`);
            // 创建行星几何体
            const planetGeometry = new THREE.SphereGeometry(this.planetScale, 16, 16);
            const planetMaterial = new THREE.MeshBasicMaterial({
                color: planet.color,
                transparent: true,
                opacity: 0.9
            });
            
            const planetMesh = new THREE.Mesh(planetGeometry, planetMaterial);
            // 将行星按赤经赤纬映射到天球表面
            const raDeg = planet.celestialCoords.ra * 15.0;
            const decDeg = planet.celestialCoords.dec;
            const proj = ConstellationData.raDecToCartesian(raDeg, decDeg, this.celestialSphereRadius + 2);
            planetMesh.position.set(proj.x, proj.y, proj.z);
            
            // 添加行星标签
            const labelSprite = this.createTextSprite(planet.name, planet.color);
            // 放大行星名称标签（由2倍提升到10倍）
            labelSprite.scale.multiplyScalar(10.0);
            labelSprite.position.set(proj.x, proj.y + 5, proj.z);
            
            // 行星发光效果
            const glowGeometry = new THREE.SphereGeometry(this.planetScale * 1.5, 16, 16);
            const glowMaterial = new THREE.MeshBasicMaterial({
                color: planet.color,
                transparent: true,
                opacity: 0.3
            });
            const glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
            glowMesh.position.copy(planetMesh.position);
            
            const planetGroup = new THREE.Group();
            planetGroup.add(planetMesh);
            planetGroup.add(glowMesh);
            planetGroup.add(labelSprite);
            
            this.planetGroup.add(planetGroup);
            this.planetObjects.set(key, planetGroup);
            
            // 更新轨道轨迹
            this.updateOrbitTrail(key, { x: proj.x, y: proj.y, z: proj.z });
            planetCount++;
        }
        console.log(`StarMapRenderer: 行星位置更新完成，共创建了${planetCount}个行星`);
    }
    
    /**
     * 创建文字精灵
     */
    createTextSprite(text, color) {
        console.log(`StarMapRenderer: 创建文字精灵 "${text}"`);
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = 512;
        canvas.height = 128;
        
        // 设置背景（半透明黑色）
        context.fillStyle = 'rgba(0, 0, 0, 0.7)';
        context.fillRect(0, 0, canvas.width, canvas.height);
        
        // 设置文字样式
        context.fillStyle = color;
        context.font = 'bold 32px Arial, sans-serif';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        
        // 添加文字阴影效果
        context.shadowColor = 'rgba(0, 0, 0, 0.8)';
        context.shadowBlur = 4;
        context.shadowOffsetX = 2;
        context.shadowOffsetY = 2;
        
        // 绘制文字
        context.fillText(text, canvas.width / 2, canvas.height / 2);
        
        const texture = new THREE.CanvasTexture(canvas);
        const material = new THREE.SpriteMaterial({ 
            map: texture, 
            transparent: true,
            alphaTest: 0.1
        });
        const sprite = new THREE.Sprite(material);
        sprite.scale.set(30, 7.5, 1);
        
        return sprite;
    }
    
    /**
     * 更新轨道轨迹
     */
    updateOrbitTrail(planetKey, position) {
        console.log(`StarMapRenderer: 更新行星 ${planetKey} 的轨道轨迹`);
        if (!this.orbitTrails.has(planetKey)) {
            this.orbitTrails.set(planetKey, []);
        }
        
        const trail = this.orbitTrails.get(planetKey);
        trail.push(new THREE.Vector3(position.x, position.y, position.z));
        
        // 限制轨迹长度
        if (trail.length > 100) {
            trail.shift();
        }
        
        // 更新轨迹显示
        if (this.showOrbitTrails && trail.length > 1) {
            const trailGeometry = new THREE.BufferGeometry().setFromPoints(trail);
            const trailMaterial = new THREE.LineBasicMaterial({
                color: 0xffffff,
                transparent: true,
                opacity: 0.5
            });
            
            const trailLine = new THREE.Line(trailGeometry, trailMaterial);
            this.orbitTrailsGroup.add(trailLine);
        }
    }
    
    /**
     * 创建黄道平面
     */
    createEcliptic() {
        console.log('StarMapRenderer: 创建黄道大圆（映射到天球表面）');
        const points = [];
        const eps = THREE.MathUtils.degToRad(23.4367);
        const radius = this.celestialSphereRadius;
        for (let lambdaDeg = 0; lambdaDeg <= 360; lambdaDeg += 1) {
            const lam = THREE.MathUtils.degToRad(lambdaDeg);
            const sinDec = Math.sin(eps) * Math.sin(lam);
            const dec = Math.asin(sinDec);
            const yRA = Math.cos(eps) * Math.sin(lam);
            const xRA = Math.cos(lam);
            let ra = Math.atan2(yRA, xRA);
            if (ra < 0) ra += Math.PI * 2;
            const pos = ConstellationData.raDecToCartesian(THREE.MathUtils.radToDeg(ra), THREE.MathUtils.radToDeg(dec), radius);
            points.push(new THREE.Vector3(pos.x, pos.y, pos.z));
        }
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineBasicMaterial({ color: 0xffff00, transparent: true, opacity: 0.5 });
        const eclipticLine = new THREE.LineLoop(geometry, material);
        eclipticLine.visible = this.showEcliptic;
        this.skyGroup.add(eclipticLine);
        this.eclipticMesh = eclipticLine;
        console.log('StarMapRenderer: 黄道大圆创建完成');
    }
    
    /**
     * 更新星空 (考虑地球自转和公转)
     */
    updateStarField(date) {
        console.log('StarMapRenderer: 更新星空背景（本地视角对齐）');
        this.updateSkyOrientation(date);
    }
    
    /**
     * 设置显示选项
     */
    setConstellationsVisible(visible) {
        console.log(`StarMapRenderer: 设置星座可见性为 ${visible}`);
        this.showConstellations = visible;
        this.constellationGroup.visible = visible;
    }
    
    setOrbitTrailsVisible(visible) {
        console.log(`StarMapRenderer: 设置轨道轨迹可见性为 ${visible}`);
        this.showOrbitTrails = visible;
        this.orbitTrailsGroup.visible = visible;
    }
    
    setEclipticVisible(visible) {
        console.log(`StarMapRenderer: 设置黄道平面可见性为 ${visible}`);
        this.showEcliptic = visible;
        if (this.eclipticMesh) {
            this.eclipticMesh.visible = visible;
        }
    }
    
    setFocusPlanet(planet) {
        console.log(`StarMapRenderer: 设置聚焦行星为 ${planet}`);
        this.focusPlanet = planet;
    }
    
    /**
     * 调整星座透明度
     */
    setConstellationOpacity(opacity) {
        if (!this.constellationGroup) return;
        
        this.constellationGroup.children.forEach(constellation => {
            constellation.children.forEach(child => {
                if (child.material && child.material.opacity !== undefined) {
                    const baseOpacity = child.userData.baseOpacity || child.material.opacity;
                    child.userData.baseOpacity = baseOpacity;
                    child.material.opacity = baseOpacity * opacity;
                }
            });
        });
    }
    
    /**
     * 高亮指定星座
     */
    highlightConstellation(constellationName) {
        if (!this.constellationGroup) return;
        
        this.constellationGroup.children.forEach(constellation => {
            const isTarget = constellation.userData.name === constellationName;
            const opacity = isTarget ? 1.0 : 0.3;
            
            constellation.children.forEach(child => {
                if (child.material && child.material.opacity !== undefined) {
                    child.material.opacity = child.material.opacity * opacity;
                }
            });
        });
    }
    
    /**
     * 渲染循环
     */
    render() {
        // 开始FPS监控
        this.fpsMonitor.beginRender();
        
        // 为了性能考虑，不在渲染循环中添加日志
        if (this.controls) {
            this.controls.update();
        }
        
        // 更新星座动画效果
        this.updateConstellationAnimations();
        
        this.renderer.render(this.scene, this.camera);
        
        // 结束FPS监控
        this.fpsMonitor.endRender();
    }
    
    /**
     * 更新星座动画效果
     */
    updateConstellationAnimations() {
        if (!this.constellationGroup) return;
        
        const time = Date.now() * 0.001; // 转换为秒
        
        this.constellationGroup.children.forEach(constellation => {
            if (constellation.userData && constellation.userData.type === 'constellation') {
                const phase = constellation.userData.animationPhase || 0;
                
                // 轻微的星光闪烁效果
                constellation.children.forEach(child => {
                    if (child.material && child.material.opacity !== undefined) {
                        if (child.userData && child.userData.name) {
                            // 恒星闪烁效果
                            const baseOpacity = child.material.opacity;
                            const flicker = 0.95 + 0.1 * Math.sin(time * 2 + phase);
                            child.material.opacity = Math.min(1.0, baseOpacity * flicker);
                        }
                    }
                });
            }
        });
    }
    
    /**
     * 设置窗口resize处理
     */
    setupResizeHandler() {
        console.log('StarMapRenderer: 设置窗口resize处理');
        window.addEventListener('resize', () => {
            this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        });
    }
    
    /**
     * 工具函数：获取一年中的第几天
     */
    getDayOfYear(date) {
        const start = new Date(date.getFullYear(), 0, 0);
        const diff = date - start;
        return Math.floor(diff / (1000 * 60 * 60 * 24));
    }
    
    /**
     * 设置观测者地理位置
     */
    setObserverLocation(latitudeDeg, longitudeDeg) {
        this.observer.latitudeDeg = latitudeDeg;
        this.observer.longitudeDeg = longitudeDeg;
    }

    /**
     * 根据本地恒星时与纬度，将 skyGroup 姿态对齐，使世界坐标 y 轴为当地天顶方向
     */
    updateSkyOrientation(date) {
        const lstRad = this.computeLocalSiderealTimeRadians(date, this.observer.longitudeDeg);
        const zenithRaDeg = THREE.MathUtils.radToDeg(lstRad);
        const zenithDecDeg = this.observer.latitudeDeg;
        const zenith = ConstellationData.raDecToCartesian(zenithRaDeg, zenithDecDeg, 1);
        const zenithVec = new THREE.Vector3(zenith.x, zenith.y, zenith.z).normalize();

        const up = new THREE.Vector3(0, 1, 0);
        const q = new THREE.Quaternion().setFromUnitVectors(zenithVec, up);
        this.skyGroup.setRotationFromQuaternion(q);
    }

    /**
     * 计算儒略日
     */
    toJulianDate(date) {
        return date.getTime() / 86400000 + 2440587.5;
    }

    /**
     * 本地恒星时（弧度）
     */
    computeLocalSiderealTimeRadians(date, longitudeDeg) {
        const jd = this.toJulianDate(date);
        const T = (jd - 2451545.0) / 36525.0;
        let GMST = 280.46061837 + 360.98564736629 * (jd - 2451545.0) + 0.000387933 * T * T - (T * T * T) / 38710000.0;
        GMST = ((GMST % 360) + 360) % 360;
        let LST = GMST + longitudeDeg;
        LST = ((LST % 360) + 360) % 360;
        return THREE.MathUtils.degToRad(LST);
    }
    
    /**
     * 清理资源
     */
    dispose() {
        console.log('StarMapRenderer: 开始清理资源');
        if (this.renderer) {
            this.container.removeChild(this.renderer.domElement);
            this.renderer.dispose();
        }
        
        if (this.controls) {
            this.controls.dispose();
        }
        
        // 重置FPS监控器
        if (this.fpsMonitor) {
            this.fpsMonitor.reset();
        }
        
        console.log('StarMapRenderer: 资源清理完成');
    }
}