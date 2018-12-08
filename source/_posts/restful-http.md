---
layout: post
title: RESTful HTTP
img: /images/net/restful_api.jpeg
date: 2018-06-27 01:11:27 +0800
author: Crab2Died
categories: HTTP
tags: 
  - REST
  - HTTP
---

## 一 REST由来
  1. REST(Representational State Transfer 表征性状态转移)
  2. 2000年Roy Fielding的博士论文中首次提出
  3. REST是架构风格，是设计思想，不是标准也不是协议
  4. REST强调组件交互的可伸缩性、接口的通用性、组件的独立部署、以及用来减少交互延迟、增强安全性、封装遗留系统的中间组件

## 二 REST特点
  1. 服务端(server)与客户端(client)解耦
     - 简化服务端的可伸缩性，提高客户端便捷性
  2. 面向资源，每一个资源都有唯一(CRUD等操作不会变)的标识符
  3. 无状态(Stateless)，请求必须包含所有处理该请求的全部信息
     - 提高可见性，每个请求都是独立的，无需其他依赖的
     - 提高可靠性，故障恢复更容易
     - 提升扩展性，减少了服务器资源消耗
  4. 可缓存(Cachable)
     - 减少交互次数，减少网络延时
  5. 分层系统(Layered System)
     - 允许Client与Server中间层(代理，网关等)代替Server端处理请求，客户端无需关心与他交互组件的其他之外的事
     - 提高了系统可扩展性，简化系统复杂度
  6. 统一接口(Uniform Interface)
     - 服务端与客户端统一化的方法(GET/PUT/POST/DELETE)通信
     - 提高了接口的可见性
  7. 按需代码(Code-On-Demand)
     - 提升系统可扩展性

## 三 为什么要遵循REST
  1. 可更高效利用缓存来提高响应速度
  2. 通讯本身的无状态性可以让不同的服务器的处理一系列请求中的不同请求，提高服务器的扩展性
  3. 浏览器即可作为客户端，简化软件需求
  4. 相对于其他叠加在HTTP协议之上的机制，REST的软件依赖性更小
  5. 不需要额外的资源发现机制
  6. 在软件技术演进中的长期的兼容性更好

## 四 RESTful最佳实践
  1. URI规则
     - 版本化(其一)   如: /api/v1
     - 使用名词，而不是动词  如: blog
     - 使用小写，用 _做词连接，而不用-
     - 表示资源集合时，使用复数形式     如: blogs
     - 子资源关系表示   示例: /blog/100/comments
     - 为减少URI层级深度,引入适当的参数查询
  2. Request Method  (资源的CRUD)
     - GET/HEAD : 查询资源
       - GET /blog/100
       - GET /blog/100/comments
     - POST: 创建资源
       - POST /blog
       - POST /blog/100/comment
     - PUT/PATCH: 更新资源
       - PUT /blog/100
       - PUT /blog/100/comment/1
     - DELETE: 删除资源
       - DELETE /blog/100
       - DELETE /blog/100/comment/1
  3. Response
     - 一般地，返回JSON数据而不是XML
     - 不过滤API返回的空格，支持gzip/deflate压缩,Content-Encoding: gzip/deflate
     - 统一的返回格式，错误码信息等
     - 常见HTTP status
       - **200   OK** - 对成功的GET、PUT、PATCH或DELETE操作进行响应。也可以被用在不创建新资源的POST操作上
       - **201   Created** - 对创建新资源的POST操作进行响应。应该带着指向新资源地址的Location header
       - **204   No Content** - 对不会返回响应体的成功请求进行响应（比如DELETE请求）
       - **304   Not Modified** - HTTP缓存header生效的时候用
       - **400   Bad Request** - 请求异常，比如请求中的body无法解析
       - **401   Unauthorized** - 没有进行认证或者认证非法。当API通过浏览器访问的时候，可以用来弹出一个认证对话框
       - **403   Forbidden** - 当认证成功，但是认证过的用户没有访问资源的权限
       - **404   Not Found** - 当一个不存在的资源被请求
       - **405   Method Not Allowed** - 所请求的HTTP方法不允许当前认证用户访问
       - **410   Gone** - 表示当前请求的资源不再可用。当调用老版本API的时候很有用
       - **415   Unsupported Media Type** - 如果请求中的内容类型是错误的
       - **422   Unprocessable Entity** - 用来表示校验错误
       - **429   Too Many Requests** - 由于请求频次达到上限而被拒绝访问
  4. 认证
     - RESTful API无状态的，每个请求都要自带凭证。
     - 使用基于SSL来保证传输安全的OAauth 2
  5. 缓存
     - 强制缓存
       - **Cache-Control**与**Expires**
     - 比对缓存
       - 1、**Last-Modified**与**If-Modified-Since**
       - 2、**Etag**与**If-None-Match**
  6. HATEOAS (Hypermedia as the Engine of Application State)
     - 超媒体作为应用状态的引擎，即在返回结果中提供链接,指向其他API,为用户调用提供指引信息。如: 当调用http://api.blog.com 时返回
       ```json
       {
           "link": {
               "rel": "collection https://www.blog.com/blogs",
               "href": "https://api.blog.com/blogs",
               "title": "List of blogs",
               "type": "application/vnd.yourformat+json"
           }
       }
       ```
       rel 表示与该API的关系，href表示指引API的链接，title表示API的标题，type表示接受类型
  7. HTTP Request Method覆盖
     - 一些老的HTTP Client只支持GET、POST请求，为了兼容这些Client，API需要覆盖HTTP方法，一般做法是HTTP POST请求会有一个
       **X-HTTP-Method-Override**请求头，其值为PUT,PATCH,DELETE之一,以此兼容请求。
  8. 限制速度
     - 避免请求泛滥，HTTP引入状态码429(Too Many Requests)
     - 一般地，是返回头信息(依照twitter的命名规则)
       - **X-Rate-Limit-Limit**: 当前时间段允许的并发请求数
       - **X-Rate-Limit-Remaining**: 当前时间段保留的请求数。
       - **X-Rate-Limit-Reset**: 重置时间(秒)
       - **Retry-After**: 下一次访问应该等待的时间(秒)
