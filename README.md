# 简明天气
![简明天气宣传图](https://cdn.jsdelivr.net/gh/zaona/simple-weather-astrobox-release@main/preview.png?raw=true)
参照 [该文档](https://iot.mi.com/vela/quickapp) 进行开发

## 感谢
- [倒数日](https://github.com/sf-yuzifu/daymatter) 项目

## 本地调试和发版注意事项
- 在打包的时候需要把`/src/pages/index`目录中的`weather.json`测试数据移动到项目根目录，AIOT默认打包`src`内容，即使没被引用。
- `index.ux`的本地测试数据的注释需要在本地调试的时候取消。
``` js
    // 模拟器中模拟数据，发版时记得注释掉

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

## 快速上手

### 1. 开发

```
npm install
npm run start
```

### 2. 构建

```
npm run build
npm run release
```

### 3. 调试

```
npm run watch
```
### 4. 代码规范化配置
代码规范化可以帮助开发者在git commit前进行代码校验、格式化、commit信息校验

使用前提：必须先关联git

macOS or Linux
```
sh husky.sh
```

windows
```
./husky.sh
```
