# @cnwhy/qqwry-mcp

一个基于 [Model Context Protocol (MCP)](https://modelcontextprotocol.io) 的轻量级服务，用于提供纯真(QQWry) IP 数据库的地理定位查询能力。

## 功能特点

- 提供符合 MCP 规范的服务接口，支持与支持 MCP 的客户端集成
- 基于 `lib-qqwry` 实现对纯真 IP 数据库（QQWry.dat）的解析与查询
- 支持多种部署方式：命令行调用（CLI）、HTTP 服务等
- 支持 Node.js 18+ 的 ES 模块语法（type: "module"）
- 提供标准化的输入验证（Zod）和错误处理

## 工具列表

| 工具名称 | 描述 |
|---------|------|
| `query_ip` | 通过 IP 检索纯真 IP 库，获取 IP 地址的归属地信息；通过查询 255.255.255.255，可以查询纯真 IP 库的版本信息 |
| `query_ip_scope` | 通过 IP 检索纯真 IP 库，查询 IP 段内的所有 IP 地址的归属地信息，结果以 IP 段的形式返回 |
| `get_ip_use_keyword` | 通过检索纯真 IP 库，查询符合关键字的所有 IP 段 |
| `chinge_ip_data_path` | 用户可以指定要切换的纯真 IP 库文件；如果不指定文件路径，则使用默认的纯真 IP 库文件 |

## 使用方法

### MCP配置

```json
{
  "mcpServers": {
    "qqwry": {
      "command": "npx",
      "args": [
        "-y",
        "@cnwhy/qqwry-mcp"
      ]
    }
  }
}
```

### 环境变量

- `QQWRY_DATA_PATH`: 指定纯真 IP 数据库文件路径（可选，默认使用内置路径）
- `PORT`: HTTP 服务监听端口（可选，默认 3000）

## 测试示例

### Stdio 测试

```bash
npm test
```

### HTTP 测试

```bash
# 首先启动服务
npm start

# 然后在另一个终端运行测试
npm run test:http
```

## 技术栈

- [Node.js](https://nodejs.org/) >=18.0.0
- [Express](https://expressjs.com/) ^5.1.0
- [@modelcontextprotocol/sdk](https://modelcontextprotocol.io) ^1.0.0
- [lib-qqwry](https://github.com/cnwhy/lib-qqwry) ^1.0.0
- [zod](https://zod.dev/) ^3.25.76

## 许可证

MIT