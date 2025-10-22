#!/usr/bin/env node

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
// import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';

async function runTests() {
  console.log('Starting StreamableHTTP MCP Demo Tests...\n');
  
  let transport;
  try {
    // 创建客户端传输
    transport = new StreamableHTTPClientTransport('http://localhost:3000/mcp');
    
    // 创建MCP客户端
    const client = new Client({
      name: "test-http-client",
      version: "1.0.0"
    });
    
    // 连接到服务器
    await client.connect(transport);
    console.log('✓ Connected to MCP server via StreamableHTTP\n');
    
    // 测试IP查询工具
    console.log('--- Testing IP Query Tool ---');
    try {
      const result = await client.callTool({ 
        name: 'query_ip', 
        arguments: { ip: '8.8.8.8' } 
      });
      console.log('✓ Successfully queried IP 8.8.8.8');
      console.log('Result:', JSON.stringify(result.structuredContent || result.content, null, 2));
    } catch (error) {
      console.error('✗ Error calling query_ip tool:', error.message);
    }
    
    // 测试另一个IP
    console.log('\n--- Testing Another IP Query ---');
    try {
      const result = await client.callTool({ 
        name: 'query_ip', 
        arguments: { ip: '114.114.114.114' } 
      });
      console.log('✓ Successfully queried IP 114.114.114.114');
      console.log('Result:', JSON.stringify(result.structuredContent || result.content, null, 2));
    } catch (error) {
      console.error('✗ Error calling query_ip tool:', error.message);
    }
    
    // 列出可用工具
    console.log('\n--- Listing Available Tools ---');
    try {
      const tools = await client.listTools();
      console.log('✓ Successfully listed tools');
      console.log('Available tools:', JSON.stringify(tools.tools, null, 2));
    } catch (error) {
      console.error('✗ Error listing tools:', error.message);
    }
    
    // 列出资源
    console.log('\n--- Listing Available Resources ---');
    try {
      const resources = await client.listResources();
      console.log('✓ Successfully listed resources');
      console.log('Available resources:', JSON.stringify(resources.resources, null, 2));
    } catch (error) {
      console.error('✗ Error listing resources:', error.message);
    }
    
    // 测试读取资源
    console.log('\n--- Reading Greeting Resource ---');
    try {
      const resource = await client.readResource({ uri: 'greeting://MCP' });
      console.log('✓ Successfully read greeting resource');
      console.log('Greeting resource content:', JSON.stringify(resource.contents, null, 2));
    } catch (error) {
      console.error('✗ Error reading greeting resource:', error.message);
    }
    
    console.log('\n✅ All tests completed!');
    
  } catch (error) {
    console.error('❌ Error in demo:', error);
  } finally {
    // 清理传输
    if (transport) {
      transport.close();
    }
  }
}

runTests();

// 处理未捕获的异常
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});