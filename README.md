# 简明天气
![简明天气宣传图](https://cdn.jsdelivr.net/gh/zaona/simple-weather-astrobox-release@main/preview.png?raw=true)
参照 [该文档](https://iot.mi.com/vela/quickapp) 进行开发

## 感谢
- [倒数日](https://github.com/sf-yuzifu/daymatter) 项目

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

## 本地调试和发版注意事项
- 在打包的时候需要把index目录的json移出src，AIOT默认打包src内容，即使没被引用，所以之前的包里面都包含了未使用的json文件。
- 返回按钮也放到根目录了，测试的时候如果需要返回按钮需要重新移动回common文件夹，然后取消掉`detail.ux`里的代码注释。
```html
<!-- 添加返回按钮,用于模拟器调试，发版的时候注释掉并且删除common下的back.png -->
    <!-- <img
        class="btn-back"
        src="/common/back.png"
        @click="exit"
      /> -->
```
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
