---
layout: post
title: Spring Integration Websocket
thumbnail: /images/net/web.jpg
date: 2018-08-27 01:11:27 +0800
author: Crab2Died
categories: Web Socket
tags: 
  - Java
  - Spring
  - Web Socket
---

# 一. 依赖（这里只列举了websocket相关依赖）

```xml
    <!-- spring webSocket依赖 -->
    <dependency>
        <groupId>org.springframework</groupId>
        <artifactId>spring-websocket</artifactId>
        <version>${spring.version}</version>
    </dependency>
    <!-- https://mvnrepository.com/artifact/org.springframework/spring-messaging -->
    <dependency>
        <groupId>org.springframework</groupId>
        <artifactId>spring-messaging</artifactId>
        <version>${spring.version}</version>
    </dependency>
    <!-- https://mvnrepository.com/artifact/javax.websocket/javax.websocket-api -->
    <dependency>
        <groupId>javax.websocket</groupId>
        <artifactId>javax.websocket-api</artifactId>
        <version>1.1</version>
        <scope>provided</scope>
    </dependency>
    <!-- websocket客户端 -->
    <dependency>
        <groupId>org.glassfish.tyrus.bundles</groupId>
        <artifactId>tyrus-standalone-client</artifactId>
        <version>1.13</version>
    </dependency>
```

# 二. WebSocket服务端

#### 2.1. 核心代码

```java
package com.github.websocket.server;

import com.alibaba.fastjson.JSON;
import com.github.CommonConstant;
import com.github.session.SObject;
import com.github.websocket.configuration.HttpSessionConfigurator;
import com.github.websocket.msg.Msg;
import org.apache.commons.lang.StringUtils;
import org.apache.log4j.Logger;

import javax.servlet.http.HttpSession;
import javax.websocket.*;
import javax.websocket.server.ServerEndpoint;
import java.io.IOException;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

/**
 * @author : Crab2Died</br>
 * @DESC : <p>注解{@link ServerEndpoint}声明websocket 服务端</p></br>
 * @date : 2017/5/25  9:43</br>
 */
@ServerEndpoint(value = "/chat", configurator = HttpSessionConfigurator.class)
public class WSServer {

    static private Logger logger = Logger.getLogger(WSServer.class);

    // 在线人数 线程安全
    private static int onlineCount = 0;

    // 连接集合 userId => server 键值对 线程安全
    static public final ConcurrentMap<String, WSServer> map = new ConcurrentHashMap<>();

    // 与某个客户端的连接会话，需要通过它来给客户端发送数据
    private Session session;

    // 当前会话的httpsession
    private HttpSession httpSession;


    /**
     * @param session websocket连接sesson
     * @param config  {@link com.github.websocket.configuration.HttpSessionConfigurator}
     * @DESC <p>注解{@link OnOpen} 声明客户端连接进入的方法</p>
     */
    @OnOpen
    public void onOpen(Session session, EndpointConfig config) {

        // 得到httpSession
        this.httpSession = (HttpSession) config.getUserProperties().get(HttpSession.class.getName());

        // 获取session对象 SObject(这个就是java web登入后的保存的session对象，此处为用户信息，包含了userId)
        SObject user = (SObject) this.httpSession.getAttribute(CommonConstant.USER_LOGIN_SESSION);

        this.session = session;

        // 将连接session对象存入map
        map.put(user.getUid(), this);

        // 连接数+1
        addOnlineCount();

        logger.info("有新的连接，当前连接数为：" + getOnlineCount());
    }


    /**
     * <p>{@link OnClose} 关闭连接</p>
     */
    @OnClose
    public void onClose() {

        /**
         * 获取当前连接信息 {@code CommonConstant.USER_LOGIN_SESSION} 为Http session 名
         */

        SObject user = (SObject) this.httpSession.getAttribute(CommonConstant.USER_LOGIN_SESSION);

        // 移除连接
        map.remove(user.getUid());

        // 连接数-1
        subOnlineCount();

        logger.info("有一连接断开，当前连接数为：" + getOnlineCount());
    }

    /**
     * <p>{@link OnMessage} 消息监听处理方法</p>
     *
     * @param message 消息对象{@link com.github.websocket.msg.Msg}的JSON对象
     * @throws IOException 异常
     */
    @OnMessage
    public void onMessage(String message) throws IOException {

        // 将消息转Msg对象
        Msg msg = JSON.parseObject(message, Msg.class);

        //TODO 可以对msg做些处理...

        // 根据Msg消息对象获取定点发送人的userId
        WSServer _client = map.get(msg.getToUid());

        // 定点发送
        if (StringUtils.isNotEmpty(msg.getToUid())) {
            if (null != _client) {
                // 是否连接判断
                if (_client.session.isOpen())
                    // 消息发送
                    _client.session.getBasicRemote().sendText(JSON.toJSONString(msg));
            }
        }

        // 群发
        if (StringUtils.isEmpty(msg.getToUid())) {
            // 群发已连接用户
            for (WSServer client : map.values()) {
                client.session.getBasicRemote().sendText(JSON.toJSONString(msg));
            }
        }

    }

    /**
     * <p>{@link OnError} websocket系统异常处理</p>
     *
     * @param t 异常
     */
    @OnError
    public void onError(Throwable t) {
        logger.error(t);
        t.printStackTrace();
    }

    /**
     * <p>系统主动推送 这是个静态方法在web启动后可在程序的其他合适的地方和时间调用，这就实现了系统的主动推送</p>
     *
     * @param msg 消息对象{@link com.github.websocket.msg.Msg}的JSON对象
     */
    static
    public void pushBySys(Msg msg) {

        //TODO 也可以实现定点推送

        // 群发
        for (WSServer client : map.values()) {
            try {
                client.session.getBasicRemote().sendText(JSON.toJSONString(msg));
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
    }

    // 获取连接数
    private static synchronized int getOnlineCount() {
        return WSServer.onlineCount;
    }

    // 增加连接数
    private static synchronized void addOnlineCount() {
        WSServer.onlineCount++;
    }

    // 减少连接数
    private static synchronized void subOnlineCount() {
        WSServer.onlineCount--;
    }

}

```

#### 2.2. HttpSessionConfigurator类

```java
package com.github.websocket.configuration;

import javax.servlet.http.HttpSession;
import javax.websocket.HandshakeResponse;
import javax.websocket.server.HandshakeRequest;
import javax.websocket.server.ServerEndpointConfig;
import javax.websocket.server.ServerEndpointConfig.Configurator;

/**
 * @author : Crab2Died</br>
 * @DESC : <p>讲http request的session 存入websocket的session内</p></br>
 * @date : 2017/5/25  16:08</br>
 */
public class HttpSessionConfigurator extends Configurator {

    @Override
    public void modifyHandshake(ServerEndpointConfig sec,
                                HandshakeRequest request, HandshakeResponse response) {

        // 获取当前Http连接的session
        HttpSession httpSession = (HttpSession) request.getHttpSession();
        // 将http session信息注入websocket session
        sec.getUserProperties().put(HttpSession.class.getName(), httpSession);
    }
}

```

#### 2.3. Msg消息体

```java
package com.github.websocket.msg;


import java.util.Date;


/**
 * @author : Crab2Died</br>
 * @DESC : <p>WebSocket消息模型</p></br>
 * @date : 2017/5/25  9:43</br>
 */
public class Msg {

    // 推送人ID
    private String fromUid;

    // 定点推送人ID
    private String toUid;

    // 定点推送单位ID
    private String toOrgId;

    // 消息体
    private String data;

    // 推送时间
    private Date createDate = new Date();

    // 消息状态
    private Integer flag;

    public Msg() {

    }

    public Msg(String fromUid, String toUid, String toOrgId, String data, Date createDate, Integer flag) {
        this.fromUid = fromUid;
        this.toUid = toUid;
        this.toOrgId = toOrgId;
        this.data = data;
        this.createDate = createDate;
        this.flag = flag;
    }

    public String getFromUid() {
        return fromUid;
    }

    public void setFromUid(String fromUid) {
        this.fromUid = fromUid;
    }

    public String getToUid() {
        return toUid;
    }

    public void setToUid(String toUid) {
        this.toUid = toUid;
    }

    public String getToOrgId() {
        return toOrgId;
    }

    public void setToOrgId(String toOrgId) {
        this.toOrgId = toOrgId;
    }

    public String getData() {
        return data;
    }

    public void setData(String data) {
        this.data = data;
    }

    public Date getCreateDate() {
        return createDate;
    }

    public void setCreateDate(Date createDate) {
        this.createDate = createDate;
    }

    public Integer getFlag() {
        return flag;
    }

    public void setFlag(Integer flag) {
        this.flag = flag;
    }

    @Override
    public String toString() {
        return "Msg{" +
                "fromUid='" + fromUid + '\'' +
                ", toUid='" + toUid + '\'' +
                ", toOrgId='" + toOrgId + '\'' +
                ", data='" + data + '\'' +
                ", createDate=" + createDate +
                ", flag=" + flag +
                '}';
    }
}

```

# 三. 客户端（HTML5）

```html
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>WebSocket</title>
<script type="text/javascript">

	// 创建websocket实例
    var ws = new WebSocket("ws://localhost:8080/chat");
    /*
     *监听三种状态的变化js会回调
     */
    ws.onopen = function(message) {
		// 连接回调
    };
    ws.onclose = function(message) {
		// 断开连接回调
    };
    ws.onmessage = function(message) {
		// 消息监听
        showMessage(message.data);
    };
    //监听窗口关闭事件，当窗口关闭时，主动去关闭websocket连接，防止连接还没断开就关闭窗口，server端会抛异常。
	window.onbeforeunload = function() {
        ws.close();
    };
    //关闭连接
    function closeWebSocket() {
        ws.close();
    }
    //发送消息
    function send() {

        var input = document.getElementById("msg");
        var text = input.value;
		
		// 消息体JSON 对象 对应JAVA 的 Msg对象
		var data = {
			// 定点发送给其他用户的userId
			toUid : "3d535429-5fcb-4490-bcf7-96fd84bb17b6",
			data : text
		}
		
        ws.send(JSON.stringify(data));
        input.value = "";
    }
    function showMessage(message) {
        var text = document.createTextNode(JSON.parse(message).data);
        var br = document.createElement("br")
        var div = document.getElementById("showChatMessage");
        div.appendChild(text);
        div.appendChild(br);
    }
</script>
</head>
<body>
    <div>
        style="width: 600px; height: 240px; overflow-y: auto; border: 1px solid #333;"
        id="show">
        <div id="showChatMessage"></div>
        <input type="text" size="80" id="msg" name="msg" placeholder="输入聊天内容" />
        <input type="button" value="发送" id="sendBn" name="sendBn" onclick="send()">
    </div>
</body>
</html>
```