# 简明天气

> 🧩 simple-weather

---

## 项目简介

简明天气是适用于Vela的长期天气存储快应用

## 感谢
- [倒数日](https://github.com/sf-yuzifu/daymatter) 项目
- [WaiJade](https://github.com/CheongSzesuen)
- [xinghengCN](https://github.com/OnDriveLine)

## 快应用包名
com.application.zaona.weather

## 注意事项
- 在发版时候需要把 `/src/pages/index` 目录中的 `weather.json` 测试数据移动到项目根目录，否则会被打包，增加包大小
- 在发版时候需要把 `index.ux` 中的本地测试代码注释
``` js
    // import weather from "./weather.json"

    // file.writeText({
    //   uri: "internal://files/weather.txt",
    //   text: JSON.stringify(weather),
    //   success: function () {
    //     showToast({message: "模拟数据成功", duration: 200})
    //   },
    //   fail: function (data, code) {
    //     showToast({message: `模拟数据失败${code}`, duration: 200})
    //   }
    // })
```

## 快速开始

开发

```
npm install
npm run start
```

构建

```
npm run build
npm run release
```

调试

```
npm run watch
```
