/**
 * 天文计算器
 * 负责计算太阳系行星的位置，基于简化的天体力学模型
 * 实现了从古代天文学观测推演行星位置的基本原理
 */
export class AstronomicalCalculator {
    constructor() {
        // 行星轨道参数 (简化的开普勒轨道元素)
        this.planetData = {
            mercury: {
                name: '水星',
                color: '#8C7853',
                semiMajorAxis: 0.387, // 天文单位
                eccentricity: 0.206,
                inclination: 7.0, // 度
                longitudeOfAscendingNode: 48.3, // 度
                argumentOfPeriapsis: 77.5, // 度
                meanAnomalyAtEpoch: 174.8, // 2000年1月1日的平近点角
                meanDailyMotion: 4.0923 // 度/天
            },
            venus: {
                name: '金星',
                color: '#FFC649',
                semiMajorAxis: 0.723,
                eccentricity: 0.007,
                inclination: 3.4,
                longitudeOfAscendingNode: 76.7,
                argumentOfPeriapsis: 131.6,
                meanAnomalyAtEpoch: 50.1,
                meanDailyMotion: 1.6022
            },
            mars: {
                name: '火星',
                color: '#CD5C5C',
                semiMajorAxis: 1.524,
                eccentricity: 0.093,
                inclination: 1.9,
                longitudeOfAscendingNode: 49.6,
                argumentOfPeriapsis: 336.1,
                meanAnomalyAtEpoch: 19.4,
                meanDailyMotion: 0.5240
            },
            jupiter: {
                name: '木星',
                color: '#D8CA9D',
                semiMajorAxis: 5.203,
                eccentricity: 0.049,
                inclination: 1.3,
                longitudeOfAscendingNode: 100.5,
                argumentOfPeriapsis: 14.8,
                meanAnomalyAtEpoch: 20.0,
                meanDailyMotion: 0.0831
            },
            saturn: {
                name: '土星',
                color: '#FAD5A5',
                semiMajorAxis: 9.537,
                eccentricity: 0.057,
                inclination: 2.5,
                longitudeOfAscendingNode: 113.7,
                argumentOfPeriapsis: 93.0,
                meanAnomalyAtEpoch: 317.0,
                meanDailyMotion: 0.0334
            }
        };
        
        // 历元日期 (J2000.0 = 2000年1月1日 12:00 UTC)
        this.epochDate = new Date('2000-01-01T12:00:00Z');
    }
    
    /**
     * 初始化计算器
     */
    async init() {
        // 这里可以加载更精确的天体历表数据
        console.log('天文计算器初始化完成');
    }
    
    /**
     * 计算所有行星在指定日期的位置
     * @param {Date} date - 观测日期
     * @returns {Object} 行星位置信息
     */
    calculatePlanetPositions(date) {
        const positions = {};
        
        for (const [key, planetData] of Object.entries(this.planetData)) {
            positions[key] = this.calculatePlanetPosition(planetData, date);
        }
        
        return positions;
    }
    
    /**
     * 计算单个行星的位置
     * @param {Object} planetData - 行星轨道参数
     * @param {Date} date - 观测日期
     * @returns {Object} 行星位置和天文信息
     */
    calculatePlanetPosition(planetData, date) {
        // 计算从历元到观测日期的天数
        const daysSinceEpoch = (date.getTime() - this.epochDate.getTime()) / (1000 * 60 * 60 * 24);
        
        // 计算平近点角
        const meanAnomaly = (planetData.meanAnomalyAtEpoch + planetData.meanDailyMotion * daysSinceEpoch) % 360;
        
        // 解开普勒方程求偏近点角
        const eccentricAnomaly = this.solveKeplerEquation(meanAnomaly, planetData.eccentricity);
        
        // 计算真近点角
        const trueAnomaly = this.calculateTrueAnomaly(eccentricAnomaly, planetData.eccentricity);
        
        // 计算日心距离
        const heliocentricDistance = planetData.semiMajorAxis * (1 - planetData.eccentricity * Math.cos(this.degToRad(eccentricAnomaly)));
        
        // 计算轨道平面内的坐标
        const x_orbit = heliocentricDistance * Math.cos(this.degToRad(trueAnomaly));
        const y_orbit = heliocentricDistance * Math.sin(this.degToRad(trueAnomaly));
        
        // 转换到黄道坐标系
        const eclipticCoords = this.orbitToEcliptic(
            x_orbit, y_orbit, 0,
            planetData.inclination,
            planetData.argumentOfPeriapsis,
            planetData.longitudeOfAscendingNode
        );
        
        // 转换到地心坐标系
        const earthPosition = this.calculateEarthPosition(date);
        const geocentricCoords = {
            x: eclipticCoords.x - earthPosition.x,
            y: eclipticCoords.y - earthPosition.y,
            z: eclipticCoords.z - earthPosition.z
        };
        
        // 计算赤经赤纬 (地球视角)
        const equatorialCoords = this.eclipticToEquatorial(geocentricCoords, date);
        
        // 计算星座位置
        const constellation = this.getConstellationFromCoords(equatorialCoords.ra, equatorialCoords.dec);
        
        return {
            name: planetData.name,
            color: planetData.color,
            
            // 3D坐标 (用于渲染)
            position: {
                x: geocentricCoords.x * 50, // 缩放用于显示
                y: geocentricCoords.y * 50,
                z: geocentricCoords.z * 50
            },
            
            // 天文坐标
            celestialCoords: {
                ra: equatorialCoords.ra,        // 赤经 (小时)
                dec: equatorialCoords.dec,      // 赤纬 (度)
                distance: Math.sqrt(geocentricCoords.x**2 + geocentricCoords.y**2 + geocentricCoords.z**2)
            },
            
            // 观测信息
            constellation: constellation,
            magnitude: this.calculateApparentMagnitude(planetData, heliocentricDistance, Math.sqrt(geocentricCoords.x**2 + geocentricCoords.y**2 + geocentricCoords.z**2)),
            
            // 轨道信息
            orbitInfo: {
                meanAnomaly,
                eccentricAnomaly,
                trueAnomaly,
                heliocentricDistance
            }
        };
    }
    
    /**
     * 解开普勒方程
     * E - e*sin(E) = M
     */
    solveKeplerEquation(meanAnomaly, eccentricity, tolerance = 1e-6) {
        let E = this.degToRad(meanAnomaly); // 初始猜测
        let deltaE = 1;
        
        while (Math.abs(deltaE) > tolerance) {
            const f = E - eccentricity * Math.sin(E) - this.degToRad(meanAnomaly);
            const fp = 1 - eccentricity * Math.cos(E);
            deltaE = f / fp;
            E = E - deltaE;
        }
        
        return this.radToDeg(E);
    }
    
    /**
     * 计算真近点角
     */
    calculateTrueAnomaly(eccentricAnomaly, eccentricity) {
        const E_rad = this.degToRad(eccentricAnomaly);
        const nu = 2 * Math.atan2(
            Math.sqrt(1 + eccentricity) * Math.sin(E_rad / 2),
            Math.sqrt(1 - eccentricity) * Math.cos(E_rad / 2)
        );
        return this.radToDeg(nu);
    }
    
    /**
     * 轨道坐标转换到黄道坐标
     */
    orbitToEcliptic(x, y, z, inclination, argumentOfPeriapsis, longitudeOfAscendingNode) {
        const i = this.degToRad(inclination);
        const w = this.degToRad(argumentOfPeriapsis);
        const Omega = this.degToRad(longitudeOfAscendingNode);
        
        // 旋转矩阵
        const cosW = Math.cos(w);
        const sinW = Math.sin(w);
        const cosI = Math.cos(i);
        const sinI = Math.sin(i);
        const cosOmega = Math.cos(Omega);
        const sinOmega = Math.sin(Omega);
        
        const x_ecl = (cosW * cosOmega - sinW * sinOmega * cosI) * x + (-sinW * cosOmega - cosW * sinOmega * cosI) * y;
        const y_ecl = (cosW * sinOmega + sinW * cosOmega * cosI) * x + (-sinW * sinOmega + cosW * cosOmega * cosI) * y;
        const z_ecl = (sinW * sinI) * x + (cosW * sinI) * y;
        
        return { x: x_ecl, y: y_ecl, z: z_ecl };
    }
    
    /**
     * 计算地球位置 (简化：假设地球在原点附近的小椭圆轨道)
     */
    calculateEarthPosition(date) {
        const daysSinceEpoch = (date.getTime() - this.epochDate.getTime()) / (1000 * 60 * 60 * 24);
        const earthMeanAnomaly = (100.0 + 0.9856 * daysSinceEpoch) % 360; // 地球公转
        
        const earthDistance = 1.0; // 1 AU
        const earthEccentricity = 0.017; // 地球轨道偏心率
        
        const earthEccentricAnomaly = this.solveKeplerEquation(earthMeanAnomaly, earthEccentricity);
        const earthTrueAnomaly = this.calculateTrueAnomaly(earthEccentricAnomaly, earthEccentricity);
        
        const x = earthDistance * Math.cos(this.degToRad(earthTrueAnomaly));
        const y = earthDistance * Math.sin(this.degToRad(earthTrueAnomaly));
        
        return { x, y, z: 0 };
    }
    
    /**
     * 黄道坐标转赤道坐标
     */
    eclipticToEquatorial(coords, date) {
        // 黄赤交角 (平均值，实际需要考虑章动等修正)
        const obliquity = this.degToRad(23.4367);
        
        const x = coords.x;
        const y = coords.y * Math.cos(obliquity) - coords.z * Math.sin(obliquity);
        const z = coords.y * Math.sin(obliquity) + coords.z * Math.cos(obliquity);
        
        // 计算赤经赤纬
        const ra = Math.atan2(y, x);
        const dec = Math.asin(z / Math.sqrt(x*x + y*y + z*z));
        
        return {
            ra: this.radToDeg(ra) / 15, // 转换为小时
            dec: this.radToDeg(dec)
        };
    }
    
    /**
     * 根据赤经赤纬确定所在星座
     */
    getConstellationFromCoords(ra, dec) {
        // 简化的星座边界判断
        const raHours = ra;
        const decDeg = dec;
        
        // 黄道十二星座的大致范围
        const constellationBounds = [
            { name: '双鱼座', raStart: 0, raEnd: 2, decMin: -5, decMax: 25 },
            { name: '白羊座', raStart: 2, raEnd: 4, decMin: 0, decMax: 30 },
            { name: '金牛座', raStart: 4, raEnd: 7, decMin: 5, decMax: 35 },
            { name: '双子座', raStart: 7, raEnd: 9, decMin: 10, decMax: 35 },
            { name: '巨蟹座', raStart: 9, raEnd: 10, decMin: 5, decMax: 35 },
            { name: '狮子座', raStart: 10, raEnd: 12, decMin: 0, decMax: 30 },
            { name: '处女座', raStart: 12, raEnd: 15, decMin: -15, decMax: 15 },
            { name: '天秤座', raStart: 15, raEnd: 16, decMin: -25, decMax: 0 },
            { name: '天蝎座', raStart: 16, raEnd: 18, decMin: -45, decMax: -5 },
            { name: '射手座', raStart: 18, raEnd: 20, decMin: -45, decMax: -15 },
            { name: '摩羯座', raStart: 20, raEnd: 22, decMin: -25, decMax: -5 },
            { name: '水瓶座', raStart: 22, raEnd: 24, decMin: -25, decMax: 5 }
        ];
        
        for (const constellation of constellationBounds) {
            let inRA = false;
            if (constellation.raStart <= constellation.raEnd) {
                inRA = raHours >= constellation.raStart && raHours <= constellation.raEnd;
            } else {
                // 跨越0时的情况
                inRA = raHours >= constellation.raStart || raHours <= constellation.raEnd;
            }
            
            if (inRA && decDeg >= constellation.decMin && decDeg <= constellation.decMax) {
                return constellation.name;
            }
        }
        
        return '未知星座';
    }
    
    /**
     * 计算视星等
     */
    calculateApparentMagnitude(planetData, heliocentricDistance, geocentricDistance) {
        // 简化的星等计算
        const baseMagnitudes = {
            mercury: -0.6,
            venus: -4.4,
            mars: -2.9,
            jupiter: -2.9,
            saturn: -0.5
        };
        
        const baseMag = baseMagnitudes[planetData.name] || 0;
        // 距离修正
        const distanceEffect = 5 * Math.log10(heliocentricDistance * geocentricDistance);
        
        return baseMag + distanceEffect;
    }
    
    /**
     * 工具函数：度转弧度
     */
    degToRad(degrees) {
        return degrees * Math.PI / 180;
    }
    
    /**
     * 工具函数：弧度转度
     */
    radToDeg(radians) {
        return radians * 180 / Math.PI;
    }
}