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

// 天气背景颜色映射表 - 根据天气类型设置不同的背景颜色
export const WeatherBackgroundMap = {
  // 晴天 - 蓝色天空
  100: '#4682B4', // 钢蓝色
  150: '#4682B4', // 钢蓝色

  // 多云/少云 - 轻云蓝色
  101: '#708090', // 石板灰
  102: '#708090', // 石板灰
  103: '#708090', // 石板灰
  151: '#708090', // 石板灰
  152: '#708090', // 石板灰
  153: '#708090', // 石板灰

  // 阴天 - 灰色
  104: '#696969', // 暗灰色

  // 雨天 - 灰蓝色
  300: '#696969', // 暗灰色
  301: '#696969', // 暗灰色
  302: '#696969', // 暗灰色
  303: '#696969', // 暗灰色
  304: '#696969', // 暗灰色
  305: '#696969', // 暗灰色
  306: '#696969', // 暗灰色
  307: '#505050', // 更暗的灰色
  308: '#505050', // 更暗的灰色
  309: '#696969', // 暗灰色
  310: '#505050', // 更暗的灰色
  311: '#505050', // 更暗的灰色
  312: '#505050', // 更暗的灰色
  313: '#696969', // 暗灰色
  314: '#696969', // 暗灰色
  315: '#696969', // 暗灰色
  316: '#696969', // 暗灰色
  317: '#505050', // 更暗的灰色
  318: '#505050', // 更暗的灰色
  350: '#696969', // 暗灰色
  351: '#696969', // 暗灰色
  399: '#696969', // 暗灰色

  // 雪天 - 白色/银色
  400: '#B0C4DE', // 浅钢蓝色
  401: '#B0C4DE', // 浅钢蓝色
  402: '#778899', // 浅石板灰
  403: '#778899', // 浅石板灰
  404: '#A9A9A9', // 暗灰色
  405: '#A9A9A9', // 暗灰色
  406: '#A9A9A9', // 暗灰色
  407: '#B0C4DE', // 浅钢蓝色
  408: '#B0C4DE', // 浅钢蓝色
  409: '#778899', // 浅石板灰
  410: '#778899', // 浅石板灰
  456: '#A9A9A9', // 暗灰色
  457: '#B0C4DE', // 浅钢蓝色
  499: '#B0C4DE', // 浅钢蓝色

  // 雾霾 - 灰色/黄色
  500: '#A9A9A9', // 暗灰色
  501: '#A9A9A9', // 暗灰色
  502: '#D2B48C', // 浅褐色
  503: '#D2B48C', // 浅褐色
  504: '#D2B48C', // 浅褐色
  507: '#D2B48C', // 浅褐色
  508: '#D2B48C', // 浅褐色
  509: '#A9A9A9', // 暗灰色
  510: '#A9A9A9', // 暗灰色
  511: '#D2B48C', // 浅褐色
  512: '#D2B48C', // 浅褐色
  513: '#D2B48C', // 浅褐色
  514: '#A9A9A9', // 暗灰色
  515: '#A9A9A9', // 暗灰色

  // 特殊天气
  900: '#FF6347', // 番茄红色（热）
  901: '#4682B4', // 钢蓝色（冷）
  999: '#000000'  // 默认黑色
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

  // 获取映射后的背景颜色
  getMappedBackgroundColor(iconCode) {
    return WeatherBackgroundMap[iconCode] || WeatherBackgroundMap[999] // 默认颜色
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
    // 设置背景颜色
    pageData.backgroundColor = this.getMappedBackgroundColor(todayData.iconDay)
  },

  // 更新详情页当前天气信息
  updateDetailCurrentWeather(pageData, selectedData) {
    pageData.updateTime = pageData.selectedDate || ""
    pageData.iconCode = this.getMappedIconCode(selectedData.iconDay)
    pageData.textDay = selectedData.textDay
    pageData.tempMinMax = this.formatTempRange(selectedData.tempMin, selectedData.tempMax)
    // 设置背景颜色
    pageData.backgroundColor = this.getMappedBackgroundColor(selectedData.iconDay)
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
          backgroundColor: this.getMappedBackgroundColor(day.iconDay),
          uniqueId: dayDiff + 1
        }
      })
  }
}

// 颜色处理工具函数
export const ColorUtils = {
  // 调整颜色亮度的函数
  // brightness 值范围：-1（全黑）到 1（全白），0 为原始颜色
  adjustBrightness(hexColor, brightness) {
    // 如果没有提供颜色，返回默认颜色
    if (!hexColor) {
      return '#000000';
    }
    
    // 移除 # 符号（如果存在）
    hexColor = hexColor.replace('#', '');
    
    // 确保颜色代码是有效的6位十六进制数
    if (hexColor.length !== 6) {
      return '#000000';
    }
    
    // 将十六进制颜色转换为 RGB
    let r = parseInt(hexColor.substring(0, 2), 16);
    let g = parseInt(hexColor.substring(2, 4), 16);
    let b = parseInt(hexColor.substring(4, 6), 16);
    
    // 检查是否为有效数字
    if (isNaN(r) || isNaN(g) || isNaN(b)) {
      return '#000000';
    }
    
    // 应用亮度调整
    if (brightness < 0) {
      // 变暗
      const factor = 1 + brightness;
      r = Math.floor(r * factor);
      g = Math.floor(g * factor);
      b = Math.floor(b * factor);
    } else if (brightness > 0) {
      // 变亮
      const factor = 1 - brightness;
      r = Math.floor(r + (255 - r) * factor);
      g = Math.floor(g + (255 - g) * factor);
      b = Math.floor(b + (255 - b) * factor);
    }
    
    // 确保值在 0-255 范围内
    r = Math.max(0, Math.min(255, r));
    g = Math.max(0, Math.min(255, g));
    b = Math.max(0, Math.min(255, b));
    
    // 转换回十六进制并返回
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  },
  
  // 根据时间计算亮度调整值
  // 可选参数date用于测试或指定特定时间
  getBrightnessByTime(date) {
    const now = date || new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    
    // 夜晚时间（20:00-6:00）逐渐变暗
    if (hours >= 20 || hours < 6) {
      // 计算夜晚进度（0-1）
      let progress;
      if (hours >= 20) {
        // 18:00-24:00，从0到1
        // 使用小时和分钟来计算更精确的进度
        progress = ((hours - 18) * 60 + minutes) / (6 * 60);
      } else {
        // 0:00-6:00，从1到0
        // 使用小时和分钟来计算更精确的进度
        progress = 1 - ((hours * 60 + minutes) / (6 * 60));
      }
      // 确保进度值在0-1范围内
      progress = Math.max(0, Math.min(1, progress));
      
      // 返回亮度调整值（-0.8 到 0）
      const brightness = -0.8 * progress;
      return brightness;
    }
    
    // 白天时间（6:00-20:00）保持正常亮度
    return 0;
  }
}

// 导出所有工具类
export default {
  WeatherIconMap,
  WeatherBackgroundMap,
  DateUtils,
  WeatherDataUtils,
  ColorUtils
}