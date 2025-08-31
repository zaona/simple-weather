// 天气工具类 - 通用天气相关功能

// 天气图标映射表 - 统一的图标映射
export const WeatherIconMap = {
  // 晴天
  100: 'sunny', // 晴
  101: 'cloudy', // 多云
  102: 'cloudy', // 少云
  103: 'cloudy', // 晴间多云
  104: 'overcast', // 阴
  150: 'sunny', // 晴
  151: 'cloudy', // 多云
  152: 'cloudy', // 少云
  153: 'cloudy', // 晴间多云

  // 雨
  300: 'moderate-rain', // 阵雨
  301: 'moderate-rain', // 强阵雨
  302: 't-storm', // 雷阵雨
  303: 't-storm', // 强雷阵雨
  304: 't-storm', // 雷阵雨伴有冰雹
  305: 'light-rain', // 小雨
  306: 'moderate-rain', // 中雨
  307: 'heavy-rain', // 大雨
  308: 'heavy-rain', // 极端降雨
  309: 'light-rain', // 毛毛雨/细雨
  310: 'heavy-rain', // 暴雨
  311: 'heavy-rain', // 大暴雨
  312: 'heavy-rain', // 特大暴雨
  313: 'ice-rain', // 冻雨
  314: 'light-rain', // 小到中雨
  315: 'moderate-rain', // 中到大雨
  316: 'heavy-rain', // 大到暴雨
  317: 'heavy-rain', // 暴雨到大暴雨
  318: 'heavy-rain', // 大暴雨到特大暴雨
  350: 'moderate-rain', // 阵雨
  351: 'moderate-rain', // 强阵雨
  399: 'light-rain', // 雨

  // 雪
  400: 'light-snow', // 小雪
  401: 'moderate-snow', // 中雪
  402: 'heavy-snow', // 大雪
  403: 'heavy-snow', // 暴雪
  404: 'rain-snow', // 雨夹雪
  405: 'rain-snow', // 雨雪天气
  406: 'rain-snow', // 阵雨夹雪
  407: 'light-snow', // 阵雪
  408: 'light-snow', // 小到中雪
  409: 'moderate-snow', // 中到大雪
  410: 'heavy-snow', // 大到暴雪
  456: 'rain-snow', // 阵雨夹雪
  457: 'moderate-snow', // 阵雪
  499: 'light-snow', // 雪

  // 雾霾
  500: 'fog', // 薄雾
  501: 'fog', // 雾
  502: 'fog', // 霾
  503: 'sand', // 扬沙
  504: 'float-dirt', // 浮尘
  507: 'sand', // 沙尘暴
  508: 'sand', // 强沙尘暴
  509: 'fog', // 浓雾
  510: 'fog', // 强浓雾
  511: 'fog', // 中度霾
  512: 'fog', // 重度霾
  513: 'fog', // 严重霾
  514: 'fog', // 大雾
  515: 'fog', // 特强浓雾

  // 风
  900: 99, // 热
  901: 99, // 冷
  999: 99 // 未知
}

// 日期工具类
export const DateUtils = {
  // 获取今天的日期字符串
  getTodayString() {
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, "0")
    const day = String(today.getDate()).padStart(2, "0")
    return `${year}-${month}-${day}`
  },

  // 格式化相对时间
  formatTimeAgo(updateTime) {
    const now = new Date()
    const diffMs = now - updateTime
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) {
      return "刚刚"
    } else if (diffMins < 60) {
      return diffMins + "分钟前"
    } else if (diffHours < 24) {
      return diffHours + "小时前"
    } else {
      return diffDays + "天前"
    }
  },

  // 获取星期几名称
  getWeekdayNames() {
    return ["周日", "周一", "周二", "周三", "周四", "周五", "周六"]
  },

  // 计算日期差异
  calculateDateDiff(dateStr) {
    const dateParts = dateStr.split("-")
    const date = new Date(dateParts[0], dateParts[1] - 1, dateParts[2])
    const today = new Date()
    const timeDiff = date.getTime() - today.getTime()
    return Math.ceil(timeDiff / (1000 * 3600 * 24))
  },

  // 获取日期显示名称
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

// 天气数据工具类
export const WeatherDataUtils = {
  // 获取映射后的图标代码
  getMappedIconCode(iconCode) {
    return WeatherIconMap[iconCode] || iconCode
  },

  // 格式化温度范围
  formatTempRange(tempMin, tempMax) {
    return `${tempMin}°/${tempMax}°`
  },

  // 更新当前天气信息
  updateCurrentWeather(pageData, weatherData, todayData, timeAgo) {
    pageData.updateTime = timeAgo
    pageData.iconCode = this.getMappedIconCode(todayData.iconDay)
    pageData.textDay = todayData.textDay
    pageData.tempMinMax = this.formatTempRange(todayData.tempMin, todayData.tempMax)
  },

  // 更新详情页当前天气信息
  updateDetailCurrentWeather(pageData, selectedData) {
    pageData.updateTime = pageData.selectedDate || ""
    pageData.iconCode = this.getMappedIconCode(selectedData.iconDay)
    pageData.textDay = selectedData.textDay
    pageData.tempMinMax = this.formatTempRange(selectedData.tempMin, selectedData.tempMax)
  },

  // 获取基础天气指标
  getBasicWeatherFigures(todayData) {
    return [
      {name: "紫外线指数", value: todayData.uvIndex, uniqueId: 1},
      {name: "相对湿度 (%)", value: todayData.humidity, uniqueId: 2},
      {name: todayData.windDirDay || "风向", value: todayData.windScaleDay, uniqueId: 3},
      {name: "气压 (hPa)", value: todayData.pressure, uniqueId: 4}
    ]
  },

  // 获取详细天气指标映射
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

  // 处理天气预报数据
  processForecastData(weatherData) {
    return weatherData.daily
      .filter(day => {
        const dayDiff = DateUtils.calculateDateDiff(day.fxDate)
        return dayDiff >= -1
      })
      .map(day => {
        const dayDiff = DateUtils.calculateDateDiff(day.fxDate)
        const displayName = DateUtils.getDisplayName(day.fxDate, dayDiff)
        
        return {
          fxDate: day.fxDate,
          name: displayName,
          tempMinMax: this.formatTempRange(day.tempMin, day.tempMax),
          iconCode: this.getMappedIconCode(day.iconDay),
          uniqueId: dayDiff + 1
        }
      })
  }
}

// 导出所有工具类
export default {
  WeatherIconMap,
  DateUtils,
  WeatherDataUtils,
}