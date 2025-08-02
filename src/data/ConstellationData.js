/**
 * 星座数据管理器
 * 提供星座的星点连线数据，用于在星图中绘制星座图案
 */
export class ConstellationData {
    constructor() {
        this.constellations = new Map();
        this.stars = new Map();
    }
    
    /**
     * 加载星座数据
     */
    async load() {
        // 加载主要星座数据
        this.loadMajorConstellations();
        // 加载亮星数据
        this.loadBrightStars();
    }
    
    /**
     * 加载主要星座数据
     * 包含12黄道星座和其他重要星座
     */
    loadMajorConstellations() {
        // 黄道十二星座的主要星点连线数据
        const constellationData = {
            // 白羊座 (Aries)
            'aries': {
                name: '白羊座',
                stars: [
                    { name: 'Hamal', ra: 31.8, dec: 23.5, mag: 2.0 },
                    { name: 'Sheratan', ra: 28.7, dec: 20.8, mag: 2.6 },
                    { name: 'Mesarthim', ra: 28.4, dec: 19.3, mag: 3.9 }
                ],
                lines: [[0, 1], [1, 2]]
            },
            
            // 金牛座 (Taurus)  
            'taurus': {
                name: '金牛座',
                stars: [
                    { name: 'Aldebaran', ra: 68.9, dec: 16.5, mag: 0.9 },
                    { name: 'Elnath', ra: 81.6, dec: 28.6, mag: 1.7 },
                    { name: 'Ain', ra: 67.2, dec: 19.2, mag: 3.5 },
                    { name: 'Prima Hyadum', ra: 65.7, dec: 15.6, mag: 3.7 }
                ],
                lines: [[0, 1], [0, 2], [0, 3]]
            },
            
            // 双子座 (Gemini)
            'gemini': {
                name: '双子座',
                stars: [
                    { name: 'Castor', ra: 113.6, dec: 31.9, mag: 1.6 },
                    { name: 'Pollux', ra: 116.3, dec: 28.0, mag: 1.1 },
                    { name: 'Alhena', ra: 99.4, dec: 16.4, mag: 1.9 },
                    { name: 'Wasat', ra: 107.8, dec: 22.0, mag: 3.5 }
                ],
                lines: [[0, 1], [1, 2], [2, 3], [3, 0]]
            },
            
            // 巨蟹座 (Cancer)
            'cancer': {
                name: '巨蟹座',
                stars: [
                    { name: 'Acubens', ra: 134.6, dec: 11.9, mag: 4.3 },
                    { name: 'Al Tarf', ra: 131.2, dec: 9.2, mag: 3.5 },
                    { name: 'Asellus Australis', ra: 130.1, dec: 18.2, mag: 3.9 },
                    { name: 'Asellus Borealis', ra: 129.0, dec: 21.5, mag: 4.7 }
                ],
                lines: [[0, 1], [1, 2], [2, 3]]
            },
            
            // 狮子座 (Leo)
            'leo': {
                name: '狮子座',
                stars: [
                    { name: 'Regulus', ra: 152.1, dec: 11.9, mag: 1.4 },
                    { name: 'Denebola', ra: 177.3, dec: 14.6, mag: 2.1 },
                    { name: 'Algieba', ra: 154.9, dec: 19.8, mag: 2.6 },
                    { name: 'Zosma', ra: 169.6, dec: 20.5, mag: 2.6 }
                ],
                lines: [[0, 2], [2, 3], [3, 1], [1, 0]]
            },
            
            // 处女座 (Virgo)
            'virgo': {
                name: '处女座',
                stars: [
                    { name: 'Spica', ra: 201.3, dec: -11.2, mag: 1.0 },
                    { name: 'Zavijava', ra: 188.6, dec: 1.8, mag: 3.6 },
                    { name: 'Porrima', ra: 190.4, dec: -1.4, mag: 2.7 },
                    { name: 'Vindemiatrix', ra: 195.5, dec: 10.9, mag: 2.9 }
                ],
                lines: [[1, 2], [2, 0], [2, 3]]
            },
            
            // 天秤座 (Libra)
            'libra': {
                name: '天秤座',
                stars: [
                    { name: 'Zubeneschamali', ra: 229.3, dec: -9.4, mag: 2.6 },
                    { name: 'Zubenelgenubi', ra: 222.7, dec: -16.0, mag: 2.8 },
                    { name: 'Brachium', ra: 233.8, dec: -15.4, mag: 3.3 }
                ],
                lines: [[0, 1], [1, 2]]
            },
            
            // 天蝎座 (Scorpius)
            'scorpius': {
                name: '天蝎座',
                stars: [
                    { name: 'Antares', ra: 247.4, dec: -26.4, mag: 1.1 },
                    { name: 'Shaula', ra: 263.4, dec: -37.1, mag: 1.6 },
                    { name: 'Sargas', ra: 264.3, dec: -43.0, mag: 1.9 },
                    { name: 'Dschubba', ra: 240.1, dec: -22.6, mag: 2.3 }
                ],
                lines: [[3, 0], [0, 1], [1, 2]]
            },
            
            // 射手座 (Sagittarius)
            'sagittarius': {
                name: '射手座',
                stars: [
                    { name: 'Kaus Australis', ra: 276.0, dec: -34.4, mag: 1.8 },
                    { name: 'Nunki', ra: 283.8, dec: -26.3, mag: 2.0 },
                    { name: 'Ascella', ra: 290.7, dec: -29.9, mag: 2.6 },
                    { name: 'Kaus Media', ra: 278.3, dec: -29.8, mag: 2.7 }
                ],
                lines: [[0, 3], [3, 1], [1, 2]]
            },
            
            // 摩羯座 (Capricornus)
            'capricornus': {
                name: '摩羯座',
                stars: [
                    { name: 'Deneb Algedi', ra: 322.2, dec: -16.1, mag: 2.9 },
                    { name: 'Dabih', ra: 305.3, dec: -14.8, mag: 3.1 },
                    { name: 'Nashira', ra: 325.0, dec: -16.7, mag: 3.7 }
                ],
                lines: [[1, 0], [0, 2]]
            },
            
            // 水瓶座 (Aquarius)
            'aquarius': {
                name: '水瓶座',
                stars: [
                    { name: 'Sadalsuud', ra: 322.9, dec: -5.6, mag: 2.9 },
                    { name: 'Sadalmelik', ra: 331.4, dec: -0.3, mag: 3.0 },
                    { name: 'Sadachbia', ra: 334.2, dec: -7.8, mag: 3.8 }
                ],
                lines: [[0, 1], [1, 2]]
            },
            
            // 双鱼座 (Pisces)
            'pisces': {
                name: '双鱼座',
                stars: [
                    { name: 'Alpherg', ra: 350.2, dec: 3.8, mag: 3.6 },
                    { name: 'Fumalsamakah', ra: 349.3, dec: 6.4, mag: 4.5 },
                    { name: 'Alrescha', ra: 30.5, dec: 2.8, mag: 4.3 }
                ],
                lines: [[0, 1], [1, 2]]
            }
        };
        
        // 存储星座数据
        for (const [key, constellation] of Object.entries(constellationData)) {
            this.constellations.set(key, constellation);
        }
    }
    
    /**
     * 加载亮星数据
     * 用于绘制背景星空
     */
    loadBrightStars() {
        // 一些重要的亮星数据 (赤经单位：度，赤纬单位：度，星等)
        const brightStars = [
            { name: 'Sirius', ra: 101.3, dec: -16.7, mag: -1.46 },
            { name: 'Canopus', ra: 95.9, dec: -52.7, mag: -0.74 },
            { name: 'Arcturus', ra: 213.9, dec: 19.2, mag: -0.05 },
            { name: 'Vega', ra: 279.2, dec: 38.8, mag: 0.03 },
            { name: 'Capella', ra: 79.2, dec: 45.9, mag: 0.08 },
            { name: 'Rigel', ra: 78.6, dec: -8.2, mag: 0.13 },
            { name: 'Procyon', ra: 114.8, dec: 5.2, mag: 0.34 },
            { name: 'Betelgeuse', ra: 88.8, dec: 7.4, mag: 0.50 },
            { name: 'Achernar', ra: 24.6, dec: -57.2, mag: 0.46 },
            { name: 'Altair', ra: 297.7, dec: 8.9, mag: 0.77 }
        ];
        
        brightStars.forEach((star, index) => {
            this.stars.set(star.name, { ...star, id: index });
        });
    }
    
    /**
     * 获取所有星座数据
     */
    getConstellations() {
        return this.constellations;
    }
    
    /**
     * 获取指定星座数据
     */
    getConstellation(name) {
        return this.constellations.get(name);
    }
    
    /**
     * 获取所有亮星数据
     */
    getBrightStars() {
        return this.stars;
    }
    
    /**
     * 将赤经赤纬坐标转换为笛卡尔坐标
     * @param {number} ra - 赤经 (度)
     * @param {number} dec - 赤纬 (度)
     * @param {number} distance - 距离 (默认为天球半径)
     */
    static raDecToCartesian(ra, dec, distance = 1000) {
        const raRad = (ra * Math.PI) / 180;
        const decRad = (dec * Math.PI) / 180;
        
        const x = distance * Math.cos(decRad) * Math.cos(raRad);
        const y = distance * Math.sin(decRad);
        const z = distance * Math.cos(decRad) * Math.sin(raRad);
        
        return { x, y, z };
    }
    
    /**
     * 根据星等计算星体大小
     */
    static magnitudeToSize(magnitude) {
        // 星等越小越亮，大小越大
        return Math.max(0.5, 5 - magnitude);
    }
    
    /**
     * 根据星等计算星体亮度
     */
    static magnitudeToIntensity(magnitude) {
        // 星等每差5等，亮度差100倍
        return Math.pow(2.512, -magnitude) * 0.3;
    }
}