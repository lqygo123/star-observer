/**
 * 星座数据管理器
 * 提供星座的星点连线数据，用于在星图中绘制星座图案
 */
export class ConstellationData {
    constructor() {
        this.constellations = new Map();
        this.stars = new Map();
        this.brightStars = new Map();
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
        // 黄道十二星座和其他重要星座的主要星点连线数据
        const constellationData = {
            // 黄道十二星座
            'aries': {
                name: '白羊座',
                english: 'Aries',
                stars: [
                    { name: 'Hamal', ra: 31.8, dec: 23.5, mag: 2.0 },
                    { name: 'Sheratan', ra: 28.7, dec: 20.8, mag: 2.6 },
                    { name: 'Mesarthim', ra: 28.4, dec: 19.3, mag: 3.9 },
                    { name: 'Botein', ra: 44.9, dec: 19.7, mag: 4.3 },
                    { name: '35 Arietis', ra: 41.9, dec: 27.7, mag: 4.7 },
                    { name: '39 Arietis', ra: 44.1, dec: 29.2, mag: 4.5 },
                    { name: '33 Arietis', ra: 40.6, dec: 27.0, mag: 5.3 }
                ],
                lines: [[0, 1], [1, 2], [0, 4], [4, 5], [5, 3], [0, 6]]
            },
            
            'taurus': {
                name: '金牛座',
                english: 'Taurus',
                stars: [
                    { name: 'Aldebaran', ra: 68.9, dec: 16.5, mag: 0.9 },
                    { name: 'Elnath', ra: 81.6, dec: 28.6, mag: 1.7 },
                    { name: 'Ain', ra: 67.2, dec: 19.2, mag: 3.5 },
                    { name: 'Prima Hyadum', ra: 65.7, dec: 15.6, mag: 3.7 }
                ],
                lines: [[0, 1], [0, 2], [0, 3]]
            },
            
            'gemini': {
                name: '双子座',
                english: 'Gemini',
                stars: [
                    { name: 'Castor', ra: 113.6, dec: 31.9, mag: 1.6 },
                    { name: 'Pollux', ra: 116.3, dec: 28.0, mag: 1.1 },
                    { name: 'Alhena', ra: 99.4, dec: 16.4, mag: 1.9 },
                    { name: 'Wasat', ra: 107.8, dec: 22.0, mag: 3.5 },
                    { name: 'Mebsuta', ra: 95.7, dec: 25.1, mag: 3.0 },
                    { name: 'Tejat', ra: 93.7, dec: 22.5, mag: 2.9 },
                    { name: 'Mekbuda', ra: 109.2, dec: 25.0, mag: 3.8 },
                    { name: 'Propus', ra: 94.3, dec: 22.5, mag: 3.3 }
                ],
                lines: [[0, 1], [1, 2], [2, 5], [5, 7], [7, 4], [4, 0], [3, 6], [6, 1], [0, 3]]
            },
            
            'cancer': {
                name: '巨蟹座',
                english: 'Cancer',
                stars: [
                    { name: 'Acubens', ra: 134.6, dec: 11.9, mag: 4.3 },
                    { name: 'Al Tarf', ra: 131.2, dec: 9.2, mag: 3.5 },
                    { name: 'Asellus Australis', ra: 130.1, dec: 18.2, mag: 3.9 },
                    { name: 'Asellus Borealis', ra: 129.0, dec: 21.5, mag: 4.7 }
                ],
                lines: [[0, 1], [1, 2], [2, 3]]
            },
            
            'leo': {
                name: '狮子座',
                english: 'Leo',
                stars: [
                    { name: 'Regulus', ra: 152.1, dec: 11.9, mag: 1.4 },
                    { name: 'Denebola', ra: 177.3, dec: 14.6, mag: 2.1 },
                    { name: 'Algieba', ra: 154.9, dec: 19.8, mag: 2.6 },
                    { name: 'Zosma', ra: 169.6, dec: 20.5, mag: 2.6 },
                    { name: 'Adhafera', ra: 153.7, dec: 23.4, mag: 3.4 },
                    { name: 'Chort', ra: 168.6, dec: 15.4, mag: 3.3 },
                    { name: 'Ras Elased Australis', ra: 148.2, dec: 23.8, mag: 3.9 },
                    { name: 'Ras Elased Borealis', ra: 148.0, dec: 26.0, mag: 4.0 },
                    { name: 'Subra', ra: 143.7, dec: 9.9, mag: 3.5 }
                ],
                lines: [[0, 2], [2, 4], [4, 6], [6, 7], [2, 3], [3, 5], [5, 1], [0, 8]]
            },
            
            'virgo': {
                name: '处女座',
                english: 'Virgo',
                stars: [
                    { name: 'Spica', ra: 201.3, dec: -11.2, mag: 1.0 },
                    { name: 'Zavijava', ra: 188.6, dec: 1.8, mag: 3.6 },
                    { name: 'Porrima', ra: 190.4, dec: -1.4, mag: 2.7 },
                    { name: 'Vindemiatrix', ra: 195.5, dec: 10.9, mag: 2.9 }
                ],
                lines: [[1, 2], [2, 0], [2, 3]]
            },
            
            'libra': {
                name: '天秤座',
                english: 'Libra',
                stars: [
                    { name: 'Zubeneschamali', ra: 229.3, dec: -9.4, mag: 2.6 },
                    { name: 'Zubenelgenubi', ra: 222.7, dec: -16.0, mag: 2.8 },
                    { name: 'Brachium', ra: 233.8, dec: -15.4, mag: 3.3 }
                ],
                lines: [[0, 1], [1, 2]]
            },
            
            'scorpius': {
                name: '天蝎座',
                english: 'Scorpius',
                stars: [
                    { name: 'Antares', ra: 247.4, dec: -26.4, mag: 1.1 },
                    { name: 'Shaula', ra: 263.4, dec: -37.1, mag: 1.6 },
                    { name: 'Sargas', ra: 264.3, dec: -43.0, mag: 1.9 },
                    { name: 'Dschubba', ra: 240.1, dec: -22.6, mag: 2.3 }
                ],
                lines: [[3, 0], [0, 1], [1, 2]]
            },
            
            'sagittarius': {
                name: '射手座',
                english: 'Sagittarius',
                stars: [
                    { name: 'Kaus Australis', ra: 276.0, dec: -34.4, mag: 1.8 },
                    { name: 'Nunki', ra: 283.8, dec: -26.3, mag: 2.0 },
                    { name: 'Ascella', ra: 290.7, dec: -29.9, mag: 2.6 },
                    { name: 'Kaus Media', ra: 278.3, dec: -29.8, mag: 2.7 }
                ],
                lines: [[0, 3], [3, 1], [1, 2]]
            },
            
            'capricornus': {
                name: '摩羯座',
                english: 'Capricornus',
                stars: [
                    { name: 'Deneb Algedi', ra: 322.2, dec: -16.1, mag: 2.9 },
                    { name: 'Dabih', ra: 305.3, dec: -14.8, mag: 3.1 },
                    { name: 'Nashira', ra: 325.0, dec: -16.7, mag: 3.7 }
                ],
                lines: [[1, 0], [0, 2]]
            },
            
            'aquarius': {
                name: '水瓶座',
                english: 'Aquarius',
                stars: [
                    { name: 'Sadalsuud', ra: 322.9, dec: -5.6, mag: 2.9 },
                    { name: 'Sadalmelik', ra: 331.4, dec: -0.3, mag: 3.0 },
                    { name: 'Sadachbia', ra: 334.2, dec: -7.8, mag: 3.8 }
                ],
                lines: [[0, 1], [1, 2]]
            },
            
            'pisces': {
                name: '双鱼座',
                english: 'Pisces',
                stars: [
                    { name: 'Alpherg', ra: 350.2, dec: 3.8, mag: 3.6 },
                    { name: 'Fumalsamakah', ra: 349.3, dec: 6.4, mag: 4.5 },
                    { name: 'Alrescha', ra: 30.5, dec: 2.8, mag: 4.3 }
                ],
                lines: [[0, 1], [1, 2]]
            },

            // 其他重要星座
            'ursa_major': {
                name: '大熊座',
                english: 'Ursa Major',
                stars: [
                    { name: 'Dubhe', ra: 165.9, dec: 61.8, mag: 1.8 },
                    { name: 'Merak', ra: 165.5, dec: 56.4, mag: 2.4 },
                    { name: 'Phecda', ra: 178.5, dec: 53.7, mag: 2.4 },
                    { name: 'Megrez', ra: 183.9, dec: 57.0, mag: 3.3 },
                    { name: 'Alioth', ra: 193.5, dec: 55.9, mag: 1.8 },
                    { name: 'Mizar', ra: 200.9, dec: 54.9, mag: 2.1 },
                    { name: 'Alkaid', ra: 206.9, dec: 49.3, mag: 1.9 },
                    { name: 'Talitha', ra: 134.8, dec: 48.0, mag: 3.1 },
                    { name: 'Tania Borealis', ra: 155.6, dec: 41.5, mag: 3.1 },
                    { name: 'Tania Australis', ra: 154.3, dec: 38.3, mag: 3.1 },
                    { name: 'Alula Borealis', ra: 169.6, dec: 33.1, mag: 3.5 },
                    { name: 'Alula Australis', ra: 169.5, dec: 31.5, mag: 3.8 },
                    { name: 'Muscida', ra: 130.0, dec: 60.7, mag: 3.4 }
                ],
                lines: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [0, 12], [1, 8], [8, 9], [2, 10], [10, 11]]
            },

            'ursa_minor': {
                name: '小熊座',
                english: 'Ursa Minor',
                stars: [
                    { name: 'Polaris', ra: 37.9, dec: 89.3, mag: 2.0 },
                    { name: 'Kochab', ra: 222.7, dec: 74.2, mag: 2.1 },
                    { name: 'Pherkad', ra: 230.2, dec: 71.8, mag: 3.0 },
                    { name: 'Yildun', ra: 263.1, dec: 86.6, mag: 4.4 }
                ],
                lines: [[0, 1], [1, 2], [2, 3], [3, 0]]
            },

            'orion': {
                name: '猎户座',
                english: 'Orion',
                stars: [
                    { name: 'Betelgeuse', ra: 88.8, dec: 7.4, mag: 0.5 },
                    { name: 'Rigel', ra: 78.6, dec: -8.2, mag: 0.1 },
                    { name: 'Bellatrix', ra: 81.3, dec: 6.3, mag: 1.6 },
                    { name: 'Mintaka', ra: 83.0, dec: -0.3, mag: 2.2 },
                    { name: 'Alnilam', ra: 84.1, dec: -1.2, mag: 1.7 },
                    { name: 'Alnitak', ra: 85.2, dec: -1.9, mag: 1.9 },
                    { name: 'Saiph', ra: 86.9, dec: -9.7, mag: 2.1 },
                    { name: 'Meissa', ra: 83.8, dec: 9.9, mag: 3.4 },
                    { name: 'Hatysa', ra: 84.7, dec: -2.6, mag: 3.7 },
                    { name: 'Tabit', ra: 76.6, dec: 6.3, mag: 3.2 },
                    { name: 'Nair al Saif', ra: 85.4, dec: -5.9, mag: 2.8 }
                ],
                lines: [[0, 2], [2, 3], [3, 4], [4, 5], [5, 1], [1, 6], [3, 6], [7, 0], [7, 2], [2, 9], [4, 8], [5, 10]]
            },

            'canis_major': {
                name: '大犬座',
                english: 'Canis Major',
                stars: [
                    { name: 'Sirius', ra: 101.3, dec: -16.7, mag: -1.5 },
                    { name: 'Mirzam', ra: 95.7, dec: -17.9, mag: 1.9 },
                    { name: 'Wezen', ra: 107.1, dec: -26.4, mag: 1.8 },
                    { name: 'Adhara', ra: 104.7, dec: -28.9, mag: 1.5 }
                ],
                lines: [[0, 1], [1, 2], [2, 3]]
            },

            'canis_minor': {
                name: '小犬座',
                english: 'Canis Minor',
                stars: [
                    { name: 'Procyon', ra: 114.8, dec: 5.2, mag: 0.3 },
                    { name: 'Gomeisa', ra: 111.8, dec: 8.3, mag: 2.9 }
                ],
                lines: [[0, 1]]
            },

            'cygnus': {
                name: '天鹅座',
                english: 'Cygnus',
                stars: [
                    { name: 'Deneb', ra: 310.4, dec: 45.3, mag: 1.3 },
                    { name: 'Sadr', ra: 305.5, dec: 40.2, mag: 2.2 },
                    { name: 'Gienah', ra: 304.5, dec: 33.4, mag: 2.5 },
                    { name: 'Delta Cygni', ra: 299.6, dec: 45.1, mag: 2.9 },
                    { name: 'Albireo', ra: 292.7, dec: 27.9, mag: 3.1 }
                ],
                lines: [[0, 1], [1, 2], [1, 3], [3, 4]]
            },

            'lyra': {
                name: '天琴座',
                english: 'Lyra',
                stars: [
                    { name: 'Vega', ra: 279.2, dec: 38.8, mag: 0.0 },
                    { name: 'Sheliak', ra: 282.5, dec: 33.4, mag: 3.5 },
                    { name: 'Sulafat', ra: 284.9, dec: 32.7, mag: 3.3 }
                ],
                lines: [[0, 1], [1, 2]]
            },

            'aquila': {
                name: '天鹰座',
                english: 'Aquila',
                stars: [
                    { name: 'Altair', ra: 297.7, dec: 8.9, mag: 0.8 },
                    { name: 'Tarazed', ra: 296.6, dec: 10.6, mag: 2.7 },
                    { name: 'Alshain', ra: 298.8, dec: 6.4, mag: 3.7 }
                ],
                lines: [[0, 1], [0, 2]]
            },

            'cassiopeia': {
                name: '仙后座',
                english: 'Cassiopeia',
                stars: [
                    { name: 'Schedar', ra: 10.1, dec: 56.5, mag: 2.2 },
                    { name: 'Caph', ra: 2.3, dec: 59.1, mag: 2.3 },
                    { name: 'Cih', ra: 14.2, dec: 60.7, mag: 2.5 },
                    { name: 'Ruchbah', ra: 21.5, dec: 60.2, mag: 2.7 },
                    { name: 'Segin', ra: 28.6, dec: 63.7, mag: 3.4 },
                    { name: 'Achird', ra: 19.4, dec: 57.8, mag: 3.4 }
                ],
                lines: [[1, 0], [0, 2], [2, 3], [3, 4], [3, 5]]
            },

            // 南半球重要星座
            'southern_cross': {
                name: '南十字座',
                english: 'Crux',
                stars: [
                    { name: 'Acrux', ra: 186.6, dec: -63.1, mag: 0.8 },
                    { name: 'Gacrux', ra: 187.8, dec: -57.1, mag: 1.6 },
                    { name: 'Imai', ra: 183.8, dec: -59.7, mag: 1.3 },
                    { name: 'Mimosa', ra: 191.9, dec: -59.7, mag: 1.3 },
                    { name: 'Intrometida', ra: 185.3, dec: -60.4, mag: 4.0 }
                ],
                lines: [[0, 1], [1, 3], [3, 2], [2, 0], [4, 1]]
            },

            'centaurus': {
                name: '半人马座',
                english: 'Centaurus',
                stars: [
                    { name: 'Rigil Kentaurus', ra: 219.9, dec: -60.8, mag: -0.3 },
                    { name: 'Hadar', ra: 210.9, dec: -60.4, mag: 0.6 },
                    { name: 'Menkent', ra: 211.7, dec: -36.4, mag: 2.1 },
                    { name: 'Alnair', ra: 208.9, dec: -47.3, mag: 2.3 },
                    { name: 'Muhlifain', ra: 204.9, dec: -53.5, mag: 2.2 },
                    { name: 'Ma Wei', ra: 173.9, dec: -31.9, mag: 2.9 }
                ],
                lines: [[0, 1], [1, 4], [4, 3], [3, 2], [2, 5]]
            },

            'scorpius_extended': {
                name: '天蝎座',
                english: 'Scorpius',
                stars: [
                    { name: 'Antares', ra: 247.4, dec: -26.4, mag: 1.1 },
                    { name: 'Shaula', ra: 263.4, dec: -37.1, mag: 1.6 },
                    { name: 'Sargas', ra: 264.3, dec: -43.0, mag: 1.9 },
                    { name: 'Dschubba', ra: 240.1, dec: -22.6, mag: 2.3 },
                    { name: 'Larawag', ra: 262.7, dec: -37.0, mag: 2.7 },
                    { name: 'Lesath', ra: 262.6, dec: -37.3, mag: 2.7 },
                    { name: 'Wei', ra: 239.7, dec: -26.1, mag: 2.9 },
                    { name: 'Acrab', ra: 241.4, dec: -19.8, mag: 2.6 },
                    { name: 'Fang', ra: 245.3, dec: -25.6, mag: 2.9 },
                    { name: 'Iklil', ra: 239.2, dec: -28.2, mag: 3.0 }
                ],
                lines: [[3, 7], [7, 0], [0, 8], [8, 6], [6, 9], [0, 4], [4, 5], [5, 1], [1, 2]]
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
            { name: 'Altair', ra: 297.7, dec: 8.9, mag: 0.77 },
            { name: 'Aldebaran', ra: 68.9, dec: 16.5, mag: 0.87 },
            { name: 'Spica', ra: 201.3, dec: -11.2, mag: 0.98 },
            { name: 'Antares', ra: 247.4, dec: -26.4, mag: 1.06 },
            { name: 'Pollux', ra: 116.3, dec: 28.0, mag: 1.14 },
            { name: 'Fomalhaut', ra: 344.4, dec: -29.6, mag: 1.16 },
            { name: 'Deneb', ra: 310.4, dec: 45.3, mag: 1.25 },
            { name: 'Regulus', ra: 152.1, dec: 11.9, mag: 1.36 },
            { name: 'Castor', ra: 113.6, dec: 31.9, mag: 1.58 },
            { name: 'Shaula', ra: 263.4, dec: -37.1, mag: 1.62 },
            { name: 'Bellatrix', ra: 81.3, dec: 6.3, mag: 1.64 }
        ];
        
        brightStars.forEach((star, index) => {
            this.brightStars.set(star.name, { ...star, id: index });
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
        return this.brightStars;
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