/**
 * 天气工具类
 * 提供天气图标映射、背景图片映射、日期处理和天气数据处理等通用功能
 */

/**
 * 天气图标映射表
 * 将天气代码映射到对应的图标文件名
 * @type {Object.<number, string>}
 */
export const WeatherIconMap = {
  100: "sunny", // 晴
  101: "cloudy", // 多云
  102: "cloudy", // 少云
  103: "cloudy", // 晴间多云
  104: "overcast", // 阴
  150: "sunny", // 晴
  151: "cloudy", // 多云
  152: "cloudy", // 少云
  153: "cloudy", // 晴间多云

  300: "moderate-rain", // 阵雨
  301: "moderate-rain", // 强阵雨
  302: "t-storm", // 雷阵雨
  303: "t-storm", // 强雷阵雨
  304: "t-storm", // 雷阵雨伴有冰雹
  305: "light-rain", // 小雨
  306: "moderate-rain", // 中雨
  307: "heavy-rain", // 大雨
  308: "heavy-rain", // 极端降雨
  309: "light-rain", // 毛毛雨/细雨
  310: "heavy-rain", // 暴雨
  311: "heavy-rain", // 大暴雨
  312: "heavy-rain", // 特大暴雨
  313: "ice-rain", // 冻雨
  314: "light-rain", // 小到中雨
  315: "moderate-rain", // 中到大雨
  316: "heavy-rain", // 大到暴雨
  317: "heavy-rain", // 暴雨到大暴雨
  318: "heavy-rain", // 大暴雨到特大暴雨
  350: "moderate-rain", // 阵雨
  351: "moderate-rain", // 强阵雨
  399: "light-rain", // 雨

  400: "light-snow", // 小雪
  401: "moderate-snow", // 中雪
  402: "heavy-snow", // 大雪
  403: "heavy-snow", // 暴雪
  404: "rain-snow", // 雨夹雪
  405: "rain-snow", // 雨雪天气
  406: "rain-snow", // 阵雨夹雪
  407: "light-snow", // 阵雪
  408: "light-snow", // 小到中雪
  409: "moderate-snow", // 中到大雪
  410: "heavy-snow", // 大到暴雪
  456: "rain-snow", // 阵雨夹雪
  457: "moderate-snow", // 阵雪
  499: "light-snow", // 雪

  500: "fog", // 薄雾
  501: "fog", // 雾
  502: "fog", // 霾
  503: "sand", // 扬沙
  504: "float-dirt", // 浮尘
  507: "sand", // 沙尘暴
  508: "sand", // 强沙尘暴
  509: "fog", // 浓雾
  510: "fog", // 强浓雾
  511: "fog", // 中度霾
  512: "fog", // 重度霾
  513: "fog", // 严重霾
  514: "fog", // 大雾
  515: "fog", // 特强浓雾

  900: "sunny", // 热
  901: "sunny", // 冷
  999: "cloudy" // 未知
}

/**
 * 天气背景图片映射表
 * 将天气代码映射到对应的背景文件名
 * @type {Object.<number, string>}
 */
export const WeatherBackgroundImageMap = {
  100: "21", // 晴
  101: "11", // 多云
  102: "11", // 少云
  103: "11", // 晴间多云
  104: "31", // 阴
  150: "21", // 晴
  151: "11", // 多云
  152: "11", // 少云
  153: "11", // 晴间多云

  300: "51", // 阵雨
  301: "51", // 强阵雨
  302: "51", // 雷阵雨
  303: "51", // 强雷阵雨
  304: "51", // 雷阵雨伴有冰雹
  305: "51", // 小雨
  306: "51", // 中雨
  307: "51", // 大雨
  308: "51", // 极端降雨
  309: "51", // 毛毛雨/细雨
  310: "51", // 暴雨
  311: "51", // 大暴雨
  312: "51", // 特大暴雨
  313: "51", // 冻雨
  314: "51", // 小到中雨
  315: "51", // 中到大雨
  316: "51", // 大到暴雨
  317: "51", // 暴雨到大暴雨
  318: "51", // 大暴雨到特大暴雨
  350: "51", // 阵雨
  351: "51", // 强阵雨
  399: "51", // 雨

  400: "61", // 小雪
  401: "61", // 中雪
  402: "61", // 大雪
  403: "61", // 暴雪
  404: "61", // 雨夹雪
  405: "61", // 雨雪天气
  406: "61", // 阵雨夹雪
  407: "61", // 阵雪
  408: "61", // 小到中雪
  409: "61", // 中到大雪
  410: "61", // 大到暴雪
  456: "61", // 阵雨夹雪
  457: "61", // 阵雪
  499: "61", // 雪

  500: "41", // 薄雾
  501: "41", // 雾
  502: "41", // 霾
  503: "41", // 扬沙
  504: "41", // 浮尘
  507: "41", // 沙尘暴
  508: "41", // 强沙尘暴
  509: "41", // 浓雾
  510: "41", // 强浓雾
  511: "41", // 中度霾
  512: "41", // 重度霾
  513: "41", // 严重霾
  514: "41", // 大雾
  515: "41", // 特强浓雾

  900: "21", // 热
  901: "21", // 冷
  999: "11" // 未知
}

/**
 * 日期工具类
 * 提供日期格式化、相对时间计算等功能
 */
export const DateUtils = {
  /**
   * 格式化日期为 YYYY-MM-DD 字符串
   * @param {Date} date
   * @returns {string}
   */
  formatDate(date) {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")
    return `${year}-${month}-${day}`
  },

  /**
   * 获取今天的日期字符串
   * @returns {string} 格式为 YYYY-MM-DD 的日期字符串
   */
  getTodayString() {
    return this.formatDate(new Date())
  },

  /**
   * 格式化相对时间
   * 将时间戳转换为相对时间描述（如"5分钟前更新"）
   * @param {Date|number} updateTime - 更新时间
   * @returns {string} 相对时间描述
   */
  formatTimeAgo(updateTime) {
    const now = new Date()
    const diffMs = now - updateTime
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) {
      return "刚刚"
    } else if (diffMins < 60) {
      return diffMins + "分钟前更新"
    } else if (diffHours < 24) {
      return diffHours + "小时前更新"
    } else {
      return diffDays + "天前更新"
    }
  },

  /**
   * 获取星期几名称数组
   * @returns {string[]} 星期名称数组
   */
  getWeekdayNames() {
    return ["周日", "周一", "周二", "周三", "周四", "周五", "周六"]
  },

  /**
   * 计算日期差异
   * @param {string} dateStr - 日期字符串，格式为 YYYY-MM-DD
   * @returns {number} 与今天的天数差（负数表示过去，正数表示未来）
   */
  calculateDateDiff(dateStr) {
    const dateParts = dateStr.split("-")
    const date = new Date(dateParts[0], dateParts[1] - 1, dateParts[2])
    const today = new Date()
    const timeDiff = date.getTime() - today.getTime()
    return Math.ceil(timeDiff / (1000 * 3600 * 24))
  },

  /**
   * 获取日期的显示名称
   * 根据日期差异返回友好的显示名称（如"今天"、"明天"、"周一"等）
   * @param {string} dateStr - 日期字符串，格式为 YYYY-MM-DD
   * @param {number} dayDiff - 与今天的天数差
   * @returns {string} 日期显示名称
   */
  getDisplayName(dateStr, dayDiff) {
    const weekdays = this.getWeekdayNames()
    const dateParts = dateStr.split("-")
    const date = new Date(dateParts[0], dateParts[1] - 1, dateParts[2])

    if (dayDiff === -1) {
      return "昨天"
    } else if (dayDiff === 0) {
      return "今天"
    } else if (dayDiff === 1) {
      return "明天"
    } else if (dayDiff === 2) {
      return "后天"
    } else if (Math.abs(dayDiff) > 7) {
      return `${dateParts[1]}/${dateParts[2]}`
    } else {
      return weekdays[date.getDay()]
    }
  }
}

/**
 * 日落时段范围（日落前后各N分钟）
 * @type {number}
 */
const SUNSET_PERIOD_MINUTES = 30

/**
 * 天气数据工具类
 * 提供天气数据处理、图标映射、背景图片选择等功能
 */
export const WeatherDataUtils = {
  /**
   * 获取映射后的图标代码
   * 根据天气代码和时间（白天/夜晚）返回对应的图标文件名
   * @param {number} iconCode - 天气图标代码
   * @param {boolean} isNight - 是否为夜晚
   * @returns {string} 图标文件名
   */
  getMappedIconCode(iconCode, isNight = false) {
    let mappedIcon = WeatherIconMap[iconCode] || iconCode

    if (isNight) {
      if (mappedIcon === "sunny") {
        mappedIcon = "sunny-night"
      } else if (mappedIcon === "cloudy") {
        mappedIcon = "cloudy-night"
      } else if (mappedIcon === "fog") {
        mappedIcon = "fog-night"
      }
    }

    return mappedIcon
  },

  /**
   * 根据小时、分钟和日出日落时间判断当前时段
   * @param {number} hour - 当前小时
   * @param {number} minute - 当前分钟
   * @param {string} sunrise - 日出时间字符串，格式：HH:MM
   * @param {string} sunset - 日落时间字符串，格式：HH:MM
   * @returns {'day'|'sunset'|'night'} 时段标识
   */
  getDayPeriod(hour, minute, sunrise, sunset) {
    const currentMinutes = hour * 60 + minute

    if (sunrise && sunset) {
      try {
        const sunriseMinutes = this.parseTimeToMinutes(sunrise)
        const sunsetMinutes = this.parseTimeToMinutes(sunset)
        const sunsetStart = sunsetMinutes - SUNSET_PERIOD_MINUTES
        const sunsetEnd = sunsetMinutes + SUNSET_PERIOD_MINUTES

        if (currentMinutes >= sunsetStart && currentMinutes < sunsetEnd) {
          return "sunset"
        }
        if (currentMinutes < sunriseMinutes || currentMinutes >= sunsetMinutes) {
          return "night"
        }
        return "day"
      } catch (e) {
        console.error("解析日出日落时间失败:", e)
      }
    }

    return hour >= 18 || hour < 6 ? "night" : "day"
  },

  /**
   * 获取当前时段
   * @param {string} sunrise - 日出时间字符串
   * @param {string} sunset - 日落时间字符串
   * @returns {'day'|'sunset'|'night'}
   */
  getCurrentDayPeriod(sunrise = null, sunset = null) {
    const now = new Date()
    return this.getDayPeriod(now.getHours(), now.getMinutes(), sunrise, sunset)
  },

  /**
   * 根据时间戳获取时段
   * @param {Date|number} timestamp - 时间戳
   * @param {string} sunrise - 日出时间字符串
   * @param {string} sunset - 日落时间字符串
   * @returns {'day'|'sunset'|'night'}
   */
  getDayPeriodAtTimestamp(timestamp, sunrise = null, sunset = null) {
    const date = timestamp instanceof Date ? timestamp : new Date(timestamp)
    if (Number.isNaN(date.getTime())) {
      return this.getCurrentDayPeriod(sunrise, sunset)
    }
    return this.getDayPeriod(date.getHours(), date.getMinutes(), sunrise, sunset)
  },

  /**
   * 解析时间字符串为分钟数
   * @param {string} timeStr - 时间字符串，格式：HH:MM
   * @returns {number} 从0点开始的分钟数
   */
  parseTimeToMinutes(timeStr) {
    const [hour, minute] = timeStr.split(":").map(Number)
    return hour * 60 + minute
  },

  /**
   * 获取映射后的背景图片
   * 根据天气代码和时段选择合适的背景图片
   * @param {number} iconCode - 天气图标代码
   * @param {'day'|'sunset'|'night'} dayPeriod - 时段
   * @returns {string} 背景图片文件名
   */
  getMappedBackgroundImage(iconCode, dayPeriod = "day") {
    let backgroundImage = WeatherBackgroundImageMap[iconCode] || WeatherBackgroundImageMap[999]

    if (dayPeriod === "day") {
      return backgroundImage
    }

    if (dayPeriod === "sunset") {
      if (backgroundImage === "21") {
        return "23"
      }
      if (backgroundImage === "11") {
        return "12"
      } else if (backgroundImage === "31") {
        return "12"
      } else if (backgroundImage === "41") {
        return "42"
      } else if (backgroundImage === "51") {
        return "52"
      } else if (backgroundImage === "61") {
        return "62"
      }
      return backgroundImage
    }

    // night
    if (backgroundImage === "11") {
      backgroundImage = "12"
    } else if (backgroundImage === "21") {
      backgroundImage = "22"
    } else if (backgroundImage === "31") {
      backgroundImage = "12"
    } else if (backgroundImage === "41") {
      backgroundImage = "42"
    } else if (backgroundImage === "51") {
      backgroundImage = "52"
    } else if (backgroundImage === "61") {
      backgroundImage = "62"
    }

    return backgroundImage
  }
}
