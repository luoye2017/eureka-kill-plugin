# Eureka Instance Killer Chrome Extension

一个用于在Eureka管理端页面为每个服务实例添加删除按钮的Chrome浏览器插件。

## 功能特性

- 🎯 自动识别Eureka管理页面上的服务实例
- 🗑️ 为每个实例添加删除按钮
- ⚡ 一键删除服务实例
- 🔄 删除后自动刷新页面状态
- 🎨 美观的用户界面
- 🛡️ 删除前确认提示

## 功能支持

当前版本支持所有在Eureka管理页面上注册的应用实例删除，包括但不限于：
- EUREKA-CLIENT-DEMO
- ORDER-SERVICE
- USER-SERVICE
- 以及其他任何在Eureka上注册的服务

## 安装方法

### 开发者模式安装

1. 打开Chrome浏览器
2. 访问 `chrome://extensions/`
3. 开启右上角的"开发者模式"
4. 点击"加载已解压的扩展程序"
5. 选择本插件的文件夹
6. 插件安装完成

## 使用方法

1. 访问Eureka管理页面（如：http://127.0.0.1:8761）
2. 插件会自动在每个服务实例旁边添加红色的"删除"按钮
3. 点击删除按钮会弹出确认对话框
4. 确认后插件会发送DELETE请求到Eureka服务器
5. 删除成功后页面会自动刷新

## API接口

插件使用以下Eureka REST API进行实例删除：

```
DELETE /eureka/apps/{application}/{instance}
```

其中：
- `{application}`: 应用名称（如：EUREKA-CLIENT-DEMO）
- `{instance}`: 实例ID（如：macbookair:eureka-client-demo:8081）

## 文件结构

```
eureka-kill-plugin/
├── manifest.json          # 插件配置文件
├── content.js            # 内容脚本（核心功能）
├── styles.css            # 样式文件
├── popup.html            # 弹出窗口HTML
├── popup.js              # 弹出窗口脚本
├── icon16.svg            # 16x16图标
├── icon48.svg            # 48x48图标
├── icon128.svg           # 128x128图标
└── README.md             # 说明文档
```

## 技术实现

- **Manifest V3**: 使用最新的Chrome扩展API
- **Content Scripts**: 注入到Eureka页面进行DOM操作
- **Mutation Observer**: 监听页面动态变化
- **Fetch API**: 发送DELETE请求到Eureka服务器
- **CSS3**: 现代化的按钮样式和动画效果

## 安全特性

- 删除前确认提示
- 仅在指定的Eureka页面生效
- 使用HTTPS安全请求（如果Eureka服务器支持）
- 错误处理和用户反馈

## 浏览器兼容性

- Chrome 88+
- Edge 88+
- 其他基于Chromium的浏览器

## 开发说明

### 自定义插件

插件已经设计为自动识别所有Eureka实例，无需手动配置应用名称。如果需要修改插件行为，可以直接编辑 `content.js` 文件中的相关函数。

### 修改Eureka服务器地址

在 `manifest.json` 文件中修改 `host_permissions` 和 `content_scripts.matches`：

```json
"host_permissions": [
  "http://your-eureka-server:8761/*"
],
"content_scripts": [{
  "matches": ["http://your-eureka-server:8761/*"]
}]
```

## 故障排除

### 删除按钮没有出现

1. 确认页面URL匹配插件配置
2. 检查浏览器控制台是否有错误信息
3. 确认页面包含支持的应用实例

### 删除请求失败

1. 检查Eureka服务器是否运行
2. 确认CORS设置允许跨域请求
3. 检查实例ID格式是否正确

## 版本历史

- **v1.0.0**: 初始版本，支持基本的实例删除功能

## 许可证

MIT License