import * as THREE from 'three';
import { ConstellationData } from '../data/ConstellationData.js';

/**
 * 星图3D渲染器
 * 使用Three.js渲染星空、星座和行星
 */
export class StarMapRenderer {
    constructor(container) {
        this.container = container;
        
        // Three.js核心组件
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        
        // 渲染对象组
        this.starField = null;
        this.constellationGroup = null;
        this.planetGroup = null;
        this.orbitTrailsGroup = null;
        
        // 数据
        this.constellationData = null;
        this.planetObjects = new Map();
        this.orbitTrails = new Map();
        
        // 显示控制
        this.showConstellations = true;
        this.showOrbitTrails = true;
        this.showEcliptic = false;
        this.focusPlanet = 'all';
        
        // 渲染参数
        this.celestialSphereRadius = 1000;
        this.planetScale = 2.0;
    }
    
    /**
     * 初始化渲染器
     */
    async init() {
        // 创建场景
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x000011);
        
        // 创建相机
        this.camera = new THREE.PerspectiveCamera(
            75,
            this.container.clientWidth / this.container.clientHeight,
            0.1,
            5000
        );
        this.camera.position.set(0, 0, 100);
        
        // 创建渲染器
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.container.appendChild(this.renderer.domElement);
        
        // 创建轨道控制器
        await this.initControls();
        
        // 创建场景对象组
        this.createSceneGroups();
        
        // 创建星空背景
        this.createStarField();
        
        // 创建黄道平面
        this.createEcliptic();
        
        // 窗口resize处理
        this.setupResizeHandler();
        
        console.log('3D渲染器初始化完成');
    }
    
    /**
     * 初始化轨道控制器
     */
    async initControls() {
        try {
            const { OrbitControls } = await import('three/examples/jsm/controls/OrbitControls.js');
            this.controls = new OrbitControls(this.camera, this.renderer.domElement);
            this.controls.enableDamping = true;
            this.controls.dampingFactor = 0.05;
            this.controls.enableZoom = true;
            this.controls.enablePan = true;
            this.controls.maxDistance = 2000;
            this.controls.minDistance = 10;
        } catch (error) {
            console.warn('无法加载OrbitControls，使用基础相机控制');
        }
    }
    
    /**
     * 创建场景对象组
     */
    createSceneGroups() {
        this.starField = new THREE.Group();
        this.constellationGroup = new THREE.Group();
        this.planetGroup = new THREE.Group();
        this.orbitTrailsGroup = new THREE.Group();
        
        this.scene.add(this.starField);
        this.scene.add(this.constellationGroup);
        this.scene.add(this.planetGroup);
        this.scene.add(this.orbitTrailsGroup);
    }
    
    /**
     * 创建星空背景
     */
    createStarField() {
        const starCount = 2000;
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
    }
    
    /**
     * 设置星座数据
     */
    setConstellationData(constellationData) {
        this.constellationData = constellationData;
        this.createConstellations();
    }
    
    /**
     * 创建星座图案
     */
    createConstellations() {
        if (!this.constellationData) return;
        
        // 清除现有星座
        this.constellationGroup.clear();
        
        const constellations = this.constellationData.getConstellations();
        
        for (const [key, constellation] of constellations) {
            const constellationObject = new THREE.Group();
            
            // 创建星座中的恒星
            constellation.stars.forEach((star, index) => {
                const starPos = ConstellationData.raDecToCartesian(star.ra, star.dec, this.celestialSphereRadius);
                
                const starGeometry = new THREE.SphereGeometry(ConstellationData.magnitudeToSize(star.mag), 8, 8);
                const starMaterial = new THREE.MeshBasicMaterial({
                    color: 0xffffaa,
                    transparent: true,
                    opacity: ConstellationData.magnitudeToIntensity(star.mag)
                });
                
                const starMesh = new THREE.Mesh(starGeometry, starMaterial);
                starMesh.position.set(starPos.x, starPos.y, starPos.z);
                starMesh.userData = { name: star.name, magnitude: star.mag };
                
                constellationObject.add(starMesh);
            });
            
            // 创建星座连线
            if (constellation.lines) {
                constellation.lines.forEach(line => {
                    const startStar = constellation.stars[line[0]];
                    const endStar = constellation.stars[line[1]];
                    
                    const startPos = ConstellationData.raDecToCartesian(startStar.ra, startStar.dec, this.celestialSphereRadius);
                    const endPos = ConstellationData.raDecToCartesian(endStar.ra, endStar.dec, this.celestialSphereRadius);
                    
                    const lineGeometry = new THREE.BufferGeometry().setFromPoints([
                        new THREE.Vector3(startPos.x, startPos.y, startPos.z),
                        new THREE.Vector3(endPos.x, endPos.y, endPos.z)
                    ]);
                    
                    const lineMaterial = new THREE.LineBasicMaterial({
                        color: 0x4a90e2,
                        transparent: true,
                        opacity: 0.6
                    });
                    
                    const lineMesh = new THREE.Line(lineGeometry, lineMaterial);
                    constellationObject.add(lineMesh);
                });
            }
            
            constellationObject.visible = this.showConstellations;
            this.constellationGroup.add(constellationObject);
        }
    }
    
    /**
     * 更新行星位置
     */
    updatePlanetPositions(planetPositions) {
        // 清除现有行星
        this.planetGroup.clear();
        this.planetObjects.clear();
        
        for (const [key, planet] of Object.entries(planetPositions)) {
            if (this.focusPlanet !== 'all' && this.focusPlanet !== key) {
                continue; // 跳过不聚焦的行星
            }
            
            // 创建行星几何体
            const planetGeometry = new THREE.SphereGeometry(this.planetScale, 16, 16);
            const planetMaterial = new THREE.MeshBasicMaterial({
                color: planet.color,
                transparent: true,
                opacity: 0.9
            });
            
            const planetMesh = new THREE.Mesh(planetGeometry, planetMaterial);
            planetMesh.position.set(planet.position.x, planet.position.y, planet.position.z);
            
            // 添加行星标签
            const labelSprite = this.createTextSprite(planet.name, planet.color);
            labelSprite.position.set(
                planet.position.x,
                planet.position.y + 5,
                planet.position.z
            );
            
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
            this.updateOrbitTrail(key, planet.position);
        }
    }
    
    /**
     * 创建文字精灵
     */
    createTextSprite(text, color) {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = 256;
        canvas.height = 64;
        
        context.fillStyle = color;
        context.font = '24px Arial';
        context.textAlign = 'center';
        context.fillText(text, 128, 40);
        
        const texture = new THREE.CanvasTexture(canvas);
        const material = new THREE.SpriteMaterial({ map: texture, transparent: true });
        const sprite = new THREE.Sprite(material);
        sprite.scale.set(20, 5, 1);
        
        return sprite;
    }
    
    /**
     * 更新轨道轨迹
     */
    updateOrbitTrail(planetKey, position) {
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
        const eclipticGeometry = new THREE.RingGeometry(50, 800, 64);
        const eclipticMaterial = new THREE.MeshBasicMaterial({
            color: 0xffff00,
            transparent: true,
            opacity: 0.1,
            side: THREE.DoubleSide
        });
        
        const eclipticMesh = new THREE.Mesh(eclipticGeometry, eclipticMaterial);
        eclipticMesh.rotation.x = Math.PI / 2;
        eclipticMesh.visible = this.showEcliptic;
        
        this.scene.add(eclipticMesh);
        this.eclipticMesh = eclipticMesh;
    }
    
    /**
     * 更新星空 (考虑地球自转和公转)
     */
    updateStarField(date) {
        // 简化：根据日期旋转整个星空
        const dayOfYear = this.getDayOfYear(date);
        const rotation = (dayOfYear / 365.25) * Math.PI * 2;
        
        this.starField.rotation.y = rotation;
        this.constellationGroup.rotation.y = rotation;
    }
    
    /**
     * 设置显示选项
     */
    setConstellationsVisible(visible) {
        this.showConstellations = visible;
        this.constellationGroup.visible = visible;
    }
    
    setOrbitTrailsVisible(visible) {
        this.showOrbitTrails = visible;
        this.orbitTrailsGroup.visible = visible;
    }
    
    setEclipticVisible(visible) {
        this.showEcliptic = visible;
        if (this.eclipticMesh) {
            this.eclipticMesh.visible = visible;
        }
    }
    
    setFocusPlanet(planet) {
        this.focusPlanet = planet;
    }
    
    /**
     * 渲染循环
     */
    render() {
        if (this.controls) {
            this.controls.update();
        }
        
        this.renderer.render(this.scene, this.camera);
    }
    
    /**
     * 设置窗口resize处理
     */
    setupResizeHandler() {
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
     * 清理资源
     */
    dispose() {
        if (this.renderer) {
            this.container.removeChild(this.renderer.domElement);
            this.renderer.dispose();
        }
        
        if (this.controls) {
            this.controls.dispose();
        }
    }
}