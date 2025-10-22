#!/usr/bin/env node

import { McpServer, ResourceTemplate } from '@modelcontextprotocol/sdk/server/mcp.js';
import libqqwry from 'lib-qqwry';
import { z } from 'zod';
import pkg from './package.json' with { type: "json" };

const myDataPath = process.env['QQWRY_DATA_PATH'];

let qqwry = libqqwry(true, myDataPath);

// Create an MCP server
const mcpServer = new McpServer({
  name: pkg.name,
  version: pkg.version,
});

// Add an query_ip tool
mcpServer.registerTool(
  'query_ip',
  {
    title: '查询IP地址工具',
    description: '通过IP检索纯真IP库,获取IP地址的归属地信息; 通过查询255.255.255.255,可以查询纯真IP库的版本信息;',
    inputSchema: { ip: z.string() },
    outputSchema: {
      result: z.object({
        int: z.number(),
        ip: z.string(),
        Country: z.string(),
        Area: z.string()
      })
    }
  },
  async ({ ip }) => {
    try {
      const result = qqwry.searchIP(ip);
      const output = {
        result: {
          int: result.int || 0,
          ip: result.ip || ip,
          Country: result.Country || '',
          Area: result.Area || ''
        }
      };
      return {
        content: [{ type: 'text', text: JSON.stringify(output) }],
        structuredContent: output
      };
    } catch (error) {
      throw new Error(`Error querying IP: ${error.message}`);
    }
  }
);

mcpServer.registerTool(
  'query_ip_scope',
  {
    title: '查询IP段的地址',
    description: '通过IP检索纯真IP库,查询IP段内的所有IP地址的归属地信息,结果以IP段的形式返回',
    inputSchema: {
      beginIP: z.string(),
      endIP: z.string(),
    },
    outputSchema: {
      result: z.array(z.object({
        begInt: z.number(),
        endInt: z.number(),
        begIP: z.string(),
        endIP: z.string(),
        Country: z.string(),
        Area: z.string(),
      }))
    }
  },
  async ({ beginIP, endIP }) => {
    try {
      const result = qqwry.searchIPScope(beginIP, endIP);
      // fix the begIP
      const output = {
        result: result.map(item => {
          // item.beginIP = item.bginIP
          // delete item.bginIP
          return item;
        })
      };
      return {
        content: [{ type: 'text', text: JSON.stringify(output) }],
        structuredContent: output
      };
    } catch (error) {
      throw new Error(`Error querying IP: ${error.message}`);
    }
  }
);

mcpServer.registerTool(
  'get_ip_use_keyword',
  {
    title: '通过关键字查询IP',
    description: '通过检索纯真IP库,查询符合关键字的所有IP段',
    inputSchema: {
      keywords: z.array(z.string()),
      mode: z.enum(['any', 'all']),
      ignoreCase: z.boolean().default(true),
    },
    outputSchema: {
      result: z.array(z.object({
        begInt: z.number(),
        endInt: z.number(),
        begIP: z.string(),
        endIP: z.string(),
        Country: z.string(),
        Area: z.string(),
      }))
    }
  },
  async ({ keywords, ignoreCase, mode }) => {
    try {
      const result = await new Promise((resolve, reject) => {
        const result = [];
        const isMatch = (function () {
          try {
            // 过滤掉 keywords 数组中非字符串的项，防止 .includes 出错
            let validKeywords = keywords.filter(k => typeof k === 'string');
            validKeywords = ignoreCase ? validKeywords.map(k => k.toLowerCase()) : validKeywords;

            // 根据 mode 执行核心逻辑
            if (mode === 'any') {
              // "命中一个": 使用 Array.prototype.some()
              return function (str) {
                const targetStr = ignoreCase ? str.toLowerCase() : str;
                return validKeywords.some((keyword) => targetStr.includes(keyword))
              }

            } else if (mode === 'all') {
              // "全都要命中": 使用 Array.prototype.every()
              return function (str) {
                const targetStr = ignoreCase ? str.toLowerCase() : str;
                return validKeywords.every((keyword) => targetStr.includes(keyword))
              }
            } else {
              // 无效 mode 处理
              console.error(`无效的 mode: "${mode}"。 mode 必须是 'any' 或 'all'。`);
              return false;
            }
          } catch (error) {
            reject(error);
          }

          // let _isMatch;
          // if (ignoreCase) {
          //   keyword = keyword.map(v => v.toLocaleLowerCase());
          //   _isMatch = function (str, key) {
          //     return ~str.toLocaleLowerCase().indexOf(key);
          //   };
          // } else {
          //   _isMatch = function (str, key) {
          //     return str.indexOf(key) != -1;
          //   };
          // }
          // return str => {
          //   for (let key of keyword) {
          //     if (_isMatch(str, key)) return true;
          //   }
          // };


        })();
        qqwry.searchIPScopeStream(0, 0xffffffff, { format: 'object', outHeader: true })
          .on('data', function (obj) {
            if (isMatch(obj[4] + obj[5])) {
              const [begInt, endInt, begIP, endIP, Country, Area] = obj;
              result.push({ begInt, endInt, begIP, endIP, Country, Area });
              return;
            }
          })
          .on('end', function () {
            resolve(result)
          });
      })
      // const result = qqwry.searchIPScope(beginIP, endIP);
      // // fix the begIP
      const output = {
        result: result.map(item => {
          // item.beginIP = item.bginIP
          // delete item.bginIP
          return item;
        })
      };
      return {
        content: [{ type: 'text', text: JSON.stringify(output) }],
        structuredContent: output
      };
    } catch (error) {
      throw new Error(`Error querying IP: ${error.message}`);
    }
  }
);

mcpServer.registerTool(
  'chinge_ip_data_path',
  {
    title: '切换本工具使用的纯真IP库文件',
    description: '用户可以指定要切换的纯真IP库文件; 如果不指定文件路径, 则使用默认的纯真IP库文件',
    inputSchema: {
      dataPath: z.string().nullable(),
    },
    outputSchema: {
      message: z.string(),
    }
  },
  async ({ dataPath }) => {
    const _oldQqwry = qqwry;
    let msg = '切换成功！';
    try {
      qqwry = new libqqwry(true, dataPath);
      const info = qqwry.searchIP('255.255.255.255');
      msg += `当前IP库版本为: ${info.Area}`
    } catch (error) {
      qqwry = _oldQqwry;
      msg = `切换失败！error: ${ error.message || '位置错误!'}; 请检查文件路径是否正确！只支持原始的纯真IP库文件,一般文件名为 qqwry.dat`;
    }
    return {
      content: [{ type: 'text', text: msg }],
      structuredContent: { message: msg }
    };
  }
);


// // Add a dynamic greeting resource
// mcpServer.registerResource(
//   'greeting',
//   new ResourceTemplate('greeting://{name}', { list: undefined }),
//   {
//     title: 'Greeting Resource', // Display name for UI
//     description: 'Dynamic greeting generator'
//   },
//   async (uri, { name }) => ({
//     contents: [
//       {
//         uri: uri.href,
//         text: `Hello, ${name}!`
//       }
//     ]
//   })
// );

// mcpServer.registerPrompt(
//   'greeting',
//   {
//     title: 'Greeting Prompt',
//     description: 'A simple greeting prompt',
//     argsSchema: z.object({
//       name: z.string()
//     })
//   },
//   async ({ name }) => ({
//     content: [
//       {
//         type: 'text',
//         text: `Hello, ${name}!`
//       }
//     ]
//   })
// )

export default mcpServer
