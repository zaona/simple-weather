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
  // 晴天
  100: "sunny", // 晴
  101: "cloudy", // 多云
  102: "cloudy", // 少云
  103: "cloudy", // 晴间多云
  104: "overcast", // 阴
  150: "sunny", // 晴
  151: "cloudy", // 多云
  152: "cloudy", // 少云
  153: "cloudy", // 晴间多云

  // 雨
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

  // 雪
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

  // 雾霾
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

  // 风
  900: 99, // 热
  901: 99, // 冷
  999: 99 // 未知
}

/**
 * 天气背景图片映射表
 * 根据天气类型和时间（白天/夜晚）设置不同的背景图片
 * @type {Object.<number, string>}
 */
export const WeatherBackgroundImageMap = {
  // 多云 - 白天11，夜晚12
  100: "21", // 晴天使用21
  101: "11", // 多云白天
  102: "11", // 少云白天
  103: "11", // 晴间多云白天
  104: "31", // 阴天白天
  150: "22", // 晴天夜晚使用22
  151: "12", // 多云夜晚
  152: "12", // 少云夜晚
  153: "12", // 晴间多云夜晚
  154: "12", // 阴天夜晚

  // 雨天 - 白天51，夜晚52
  300: "51", // 阵雨白天
  301: "51", // 强阵雨白天
  302: "51", // 雷阵雨白天
  303: "51", // 强雷阵雨白天
  304: "51", // 雷阵雨伴有冰雹白天
  305: "51", // 小雨白天
  306: "51", // 中雨白天
  307: "51", // 大雨白天
  308: "51", // 极端降雨白天
  309: "51", // 毛毛雨/细雨白天
  310: "51", // 暴雨白天
  311: "51", // 大暴雨白天
  312: "51", // 特大暴雨白天
  313: "51", // 冻雨白天
  314: "51", // 小到中雨白天
  315: "51", // 中到大雨白天
  316: "51", // 大到暴雨白天
  317: "51", // 暴雨到大暴雨白天
  318: "51", // 大暴雨到特大暴雨白天
  350: "52", // 阵雨夜晚
  351: "52", // 强阵雨夜晚
  399: "51", // 雨白天

  // 雪天 - 白天61，夜晚62
  400: "61", // 小雪白天
  401: "61", // 中雪白天
  402: "61", // 大雪白天
  403: "61", // 暴雪白天
  404: "61", // 雨夹雪白天
  405: "61", // 雨雪天气白天
  406: "61", // 阵雨夹雪白天
  407: "61", // 阵雪白天
  408: "61", // 小到中雪白天
  409: "61", // 中到大雪白天
  410: "61", // 大到暴雪白天
  456: "62", // 阵雨夹雪夜晚
  457: "62", // 阵雪夜晚
  499: "61", // 雪白天

  // 雾霾 - 沙尘白天41，夜晚42
  500: "41", // 薄雾白天
  501: "41", // 雾白天
  502: "41", // 霾白天
  503: "41", // 扬沙白天
  504: "41", // 浮尘白天
  507: "41", // 沙尘暴白天
  508: "41", // 强沙尘暴白天
  509: "42", // 浓雾夜晚
  510: "42", // 强浓雾夜晚
  511: "42", // 中度霾夜晚
  512: "42", // 重度霾夜晚
  513: "42", // 严重霾夜晚
  514: "42", // 大雾夜晚
  515: "42", // 特强浓雾夜晚

  // 特殊天气
  900: "21", // 热白天
  901: "22", // 冷夜晚
  999: "11" // 未知默认多云
}

/**
 * 日期工具类
 * 提供日期格式化、相对时间计算等功能
 */
export const DateUtils = {
  /**
   * 获取今天的日期字符串
   * @returns {string} 格式为 YYYY-MM-DD 的日期字符串
   */
  getTodayString() {
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, "0")
    const day = String(today.getDate()).padStart(2, "0")
    return `${year}-${month}-${day}`
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
    } else if (dayDiff > 7) {
      return `${dateParts[1]}/${dateParts[2]}`
    } else {
      return weekdays[date.getDay()]
    }
  }
}

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
    // 获取基础图标代码
    let mappedIcon = WeatherIconMap[iconCode] || iconCode

    // 如果是夜晚，根据具体的天气类型转换图标代码
    if (isNight) {
      // 晴天类：白天sunny，夜晚sunny-night
      if (mappedIcon === "sunny") {
        mappedIcon = "sunny-night"
      }
      // 多云类：白天cloudy，夜晚cloudy-night
      else if (mappedIcon === "cloudy") {
        mappedIcon = "cloudy-night"
      }
      // 阴天类：白天fog，夜晚fog-night
      else if (mappedIcon === "fog") {
        mappedIcon = "fog-night"
      }
    }

    return mappedIcon
  },

  /**
   * 判断当前时间是否为夜晚
   * 如果提供了日出日落时间，则根据实际时间判断；否则使用默认时间（18:00-6:00）
   * @param {string} sunrise - 日出时间，格式：HH:MM（如 "06:30"）
   * @param {string} sunset - 日落时间，格式：HH:MM（如 "18:45"）
   * @returns {boolean} 是否为夜晚
   */
  isNightTime(sunrise = null, sunset = null) {
    const now = new Date()
    const hour = now.getHours()
    const minute = now.getMinutes()
    const currentMinutes = hour * 60 + minute

    // 如果提供了日出日落时间，使用实际时间判断
    if (sunrise && sunset) {
      try {
        const sunriseMinutes = this.parseTimeToMinutes(sunrise)
        const sunsetMinutes = this.parseTimeToMinutes(sunset)

        // 在日落之后或日出之前是夜晚
        return currentMinutes < sunriseMinutes || currentMinutes >= sunsetMinutes
      } catch (e) {
        console.error("解析日出日落时间失败:", e)
        // 解析失败，使用默认判断
      }
    }

    // 默认：晚6点到早6点是夜晚时间
    return hour >= 18 || hour < 6
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
   * 根据天气代码和时间选择合适的背景图片
   * @param {number} iconCode - 天气图标代码
   * @param {boolean} isNight - 是否为夜晚
   * @returns {string} 背景图片文件名
   */
  getMappedBackgroundImage(iconCode, isNight = false) {
    // 获取基础背景图片
    let backgroundImage = WeatherBackgroundImageMap[iconCode] || WeatherBackgroundImageMap[999]

    // 如果是夜晚，根据具体的天气类型转换背景图片
    if (isNight) {
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
    }

    return backgroundImage
  },

  /**
   * 格式化温度范围
   * @param {number} tempMin - 最低温度
   * @param {number} tempMax - 最高温度
   * @returns {string} 格式化的温度范围字符串
   */
  formatTempRange(tempMin, tempMax) {
    return `${tempMin}°/${tempMax}°`
  },

  /**
   * 更新首页当前天气信息
   * @param {Object} pageData - 页面数据对象（this）
   * @param {Object} weatherData - 完整的天气数据
   * @param {Object} todayData - 今天的天气数据
   * @param {string} timeAgo - 相对更新时间
   */
  updateCurrentWeather(pageData, weatherData, todayData, timeAgo) {
    pageData.updateTime = timeAgo

    // 设置背景图片和图标 - 根据实际日出日落时间判断是白天还是夜晚
    const isNight = this.isNightTime(todayData.sunrise, todayData.sunset)
    pageData.iconCode = this.getMappedIconCode(todayData.iconDay, isNight)
    pageData.textDay = todayData.textDay
    pageData.tempMinMax = this.formatTempRange(todayData.tempMin, todayData.tempMax)
    pageData.backgroundImage = this.getMappedBackgroundImage(todayData.iconDay, isNight)
  },

  /**
   * 更新详情页当前天气信息
   * @param {Object} pageData - 页面数据对象（this）
   * @param {Object} selectedData - 选中日期的天气数据
   */
  updateDetailCurrentWeather(pageData, selectedData) {
    pageData.updateTime = pageData.selectedDate || ""

    // 设置背景图片和图标 - 根据实际日出日落时间判断是白天还是夜晚
    const isNight = this.isNightTime(selectedData.sunrise, selectedData.sunset)
    pageData.iconCode = this.getMappedIconCode(selectedData.iconDay, isNight)
    pageData.textDay = selectedData.textDay
    pageData.tempMinMax = this.formatTempRange(selectedData.tempMin, selectedData.tempMax)
    pageData.backgroundImage = this.getMappedBackgroundImage(selectedData.iconDay, isNight)
  },

  /**
   * 获取基础天气指标数据
   * 用于首页显示
   * @param {Object} todayData - 今天的天气数据
   * @returns {Array<Object>} 天气指标数组
   */
  getBasicWeatherFigures(todayData) {
    return [
      {name: "紫外线指数", value: todayData.uvIndex || "__", unit: "", uniqueId: 1},
      {name: "相对湿度", value: todayData.humidity || "__", unit: "%", uniqueId: 2},
      {
        name: todayData.windDirDay || "风向",
        value: todayData.windScaleDay || "__",
        unit: "级",
        uniqueId: 3
      },
      {name: "气压", value: todayData.pressure || "__", unit: "hPa", uniqueId: 4}
    ]
  },

  /**
   * 获取详细天气指标数据映射
   * 用于详情页显示
   * @param {Object} selectedData - 选中日期的天气数据
   * @returns {Object} 天气指标映射对象，key为uniqueId，value为对应的数据值
   */
  getDetailedWeatherFigures(selectedData) {
    return {
      1: selectedData.uvIndex || "__",
      2: selectedData.humidity || "__",
      3: selectedData.windDirDay || "__",
      4: selectedData.windScaleDay || "__",
      5: selectedData.pressure || "__",
      6: selectedData.precip || "__",
      7: selectedData.vis || "__",
      8: selectedData.cloud || "__",
      9: selectedData.sunrise || "__",
      10: selectedData.sunset || "__",
      11: selectedData.tempMax || "__",
      12: selectedData.tempMin || "__",
      13: selectedData.textDay || "__",
      14: selectedData.textNight || "__",
      15: selectedData.windDirNight || "__",
      16: selectedData.windScaleNight || "__",
      17: selectedData.windSpeedDay || "__",
      18: selectedData.windSpeedNight || "__",
      19: selectedData.wind360Day || "__",
      20: selectedData.wind360Night || "__",
      21: selectedData.moonrise || "__",
      22: selectedData.moonset || "__",
      23: selectedData.moonPhase || "__"
    }
  },

  /**
   * 处理天气预报数据
   * 过滤并格式化未来几天的天气数据
   * @param {Object} weatherData - 完整的天气数据对象
   * @returns {Array<Object>} 格式化后的天气预报数组
   */
  processForecastData(weatherData) {
    // 获取今天的日出日落时间，用于判断当前是白天还是夜晚
    const todayStr = DateUtils.getTodayString()
    const todayData = weatherData.daily.find((day) => day.fxDate === todayStr)
    const todaySunrise = todayData ? todayData.sunrise : null
    const todaySunset = todayData ? todayData.sunset : null

    return weatherData.daily
      .filter((day) => {
        const dayDiff = DateUtils.calculateDateDiff(day.fxDate)
        return dayDiff >= -1
      })
      .map((day) => {
        const dayDiff = DateUtils.calculateDateDiff(day.fxDate)
        const displayName = DateUtils.getDisplayName(day.fxDate, dayDiff)

        // 使用今天的日出日落时间判断当前是白天还是夜晚
        const isNight = this.isNightTime(todaySunrise, todaySunset)

        return {
          fxDate: day.fxDate,
          name: displayName,
          tempMinMax: this.formatTempRange(day.tempMin, day.tempMax),
          iconCode: this.getMappedIconCode(day.iconDay, isNight),
          uniqueId: dayDiff + 1
        }
      })
  },

  /**
   * 处理逐小时天气数据
   * @param {Array<Object>} hourlyList - 逐小时天气数组
   * @param {number} limit - 截取的小时数量
   * @returns {Array<Object>}
   */
  processHourlyForecast(hourlyList = [], limit = 12) {
    if (!Array.isArray(hourlyList) || hourlyList.length === 0) {
      return []
    }

    const now = Date.now()
    const threshold = now - 60 * 60 * 1000

    const filtered = hourlyList
      .map((item) => {
        const fxTime = item.fxTime || item.time || ""
        const timestamp = fxTime ? Date.parse(fxTime) : NaN
        return {
          raw: item,
          fxTime,
          timestamp
        }
      })
      .filter((entry) => {
        if (Number.isNaN(entry.timestamp)) {
          return false
        }
        return entry.timestamp >= threshold
      })

    if (filtered.length === 0) {
      return []
    }

    return filtered.slice(0, limit).map((entry, index) => {
      const {raw, fxTime, timestamp} = entry
      let displayHour = "--:--"
      let isNight = false

      if (!Number.isNaN(timestamp)) {
        const parsed = new Date(timestamp)
        const hours = parsed.getHours()
        const minutes = parsed.getMinutes()
        displayHour = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`
        isNight = hours >= 18 || hours < 6
      }

      const tempValue = raw.temp !== undefined ? `${raw.temp}°` : "__°"
      const iconCodeRaw = Number(raw.icon)
      const mappedIcon = this.getMappedIconCode(
        Number.isNaN(iconCodeRaw) ? raw.icon : iconCodeRaw,
        isNight
      )

      return {
        name: displayHour,
        temp: tempValue,
        iconCode: mappedIcon,
        uniqueId: fxTime ? `${fxTime}-${index}` : `hour-${index}`
      }
    })
  }
}
