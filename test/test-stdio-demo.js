#!/usr/bin/env node

import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';

try {
  // 创建客户端 stdio 传输
  const transport = new StdioClientTransport({
    command: 'node',
    args: [
      './StdioServer.js',
    ]
  });

  // 创建 MCP 客户端
  const client = new Client({
    name: 'test-client',
    version: '1.0.0'
  }, transport);

  // 连接到服务器
  await client.connect(transport);

  // 测试 IP 查询工具
  try {
    const result = await client.callTool({ name: 'query_ip', arguments: { ip: '8.8.8.8' } });
    console.log('8.8.8.8:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('Error calling query_ip tool:', error);
  }

  // 测试另一个 IP
  try {
    const result = await client.callTool({ name: 'query_ip', arguments: { ip: '255.255.255.255' } });
    console.log('255.255.255.255:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('Error calling query_ip tool:', error);
  }

  // 测试 IP 范围查询
  try {
    const result = await client.callTool({
      name: 'query_ip_scope', arguments: {
        beginIP: '8.8.8.8',
        endIP: '8.8.9.0',
      }
    });
    console.log('8.8.8.8~8.8.9.0:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('Error calling query_ip_scope tool:', error);
  }

  // 更改 IP 数据路径
  try {
    const result = await client.callTool({
      name: 'chinge_ip_data_path', arguments: {
        dataPath: 'E:\\work\\qqwry-mcp\\qqwry.dat',
      }
    });
    console.log('chinge_ip_data_path result:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('Error calling chinge_ipdata tool:', error);
  }

  // 根据关键词获取 IP
  try {
    const result = await client.callTool({
      name: 'get_ip_use_keyword', arguments: {
        keywords: ['深圳市', '网吧'],
        mode: 'all'
      }
    });
    console.log('Keyword search result:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('Error calling get_ip_use_keyword tool:', error);
  }

  // 列出可用工具
  try {
    const tools = await client.listTools({});
    console.log('Available tools:', JSON.stringify(tools, null, 2));
  } catch (error) {
    console.error('Error listing tools:', error);
  }

  // 列出可用资源
  try {
    const resources = await client.listResources({});
    console.log('Available resources:', JSON.stringify(resources, null, 2));
  } catch (error) {
    console.error('Error listing resources:', error);
  }

  // 测试读取资源
  try {
    const resource = await client.readResource({ uri: 'greeting://World' });
    console.log('Greeting resource:', JSON.stringify(resource, null, 2));
  } catch (error) {
    console.error('Error reading greeting resource:', error);
  }

  client.close();
} catch (error) {
  console.error('Error in demo:', error);
}