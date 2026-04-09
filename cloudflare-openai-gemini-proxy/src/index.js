/**
 * Cloudflare Workers - OpenAI/Gemini API 转发代理
 * 
 * 功能：
 * - 同时支持 OpenAI 和 Google Gemini API
 * - 纯转发模式：API Key 由客户端携带，Worker 不存储任何密钥
 * - 支持 CORS，允许前端跨域访问
 * - 兼容 OpenClaw 模型配置格式
 * 
 * 路径规则：
 * - /v1/*  ->  https://api.openai.com/v1/*
 * - /gemini/* -> https://generativelanguage.googleapis.com/*
 */

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    // 处理 CORS 预请求
    if (request.method === 'OPTIONS') {
      return handleCorsPreflight();
    }

    // 首页返回信息
    if (path === '/') {
      return new Response(
`Cloudflare OpenAI/Gemini API Proxy
===================================
📡 OpenAI:   https://your-domain/v1/...
🔮 Gemini:   https://your-domain/gemini/...

🔒 Mode: Pure forward - API Key carried by client
✨ Powered by Cloudflare Workers & OpenClaw
`, 
        { headers: { 'Content-Type': 'text/plain; charset=utf-8' } }
      );
    }

    // 根据路径路由到不同目标
    let targetUrl;
    if (path.startsWith('/gemini/')) {
      // Gemini API 转发
      // /gemini/v1beta/models/gemini-pro:generateContent 
      // -> https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent
      const geminiPath = path.replace('/gemini/', '');
      targetUrl = new URL(geminiPath + url.search, 'https://generativelanguage.googleapis.com');
    } else {
      // OpenAI API 转发（默认）
      // /v1/chat/completions -> https://api.openai.com/v1/chat/completions
      targetUrl = new URL(path + url.search, 'https://api.openai.com');
    }

    // 构造转发请求
    const modifiedRequest = createForwardRequest(request, targetUrl);

    try {
      const response = await fetch(modifiedRequest);
      return addCorsToResponse(response);
    } catch (error) {
      return new Response(JSON.stringify({ 
        error: 'Proxy error',
        message: error.message 
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }
};

/**
 * 处理 CORS 预请求
 */
function handleCorsPreflight() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PUT, DELETE',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
      'Access-Control-Max-Age': '86400'
    }
  });
}

/**
 * 清理并构造转发请求
 */
function createForwardRequest(originalRequest, targetUrl) {
  const headers = new Headers(originalRequest.headers);
  
  // 删除可能引起问题的头
  headers.delete('host');
  headers.delete('cf-connecting-ip');
  headers.delete('x-forwarded-for');
  headers.delete('cf-ray');
  headers.delete('cf-visitor');
  
  return new Request(targetUrl, {
    method: originalRequest.method,
    headers: headers,
    body: originalRequest.body,
    redirect: 'follow'
  });
}

/**
 * 添加 CORS 头到响应
 */
function addCorsToResponse(response) {
  const newHeaders = new Headers(response.headers);
  
  newHeaders.set('Access-Control-Allow-Origin', '*');
  newHeaders.set('Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PUT, DELETE');
  newHeaders.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // 不缓存错误响应
  if (response.status >= 400) {
    newHeaders.set('Cache-Control', 'no-cache, no-store, must-revalidate');
  }
  
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: newHeaders
  });
}
