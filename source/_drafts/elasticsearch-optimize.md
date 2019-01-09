---
layout: post
title: Elasticsearch Performance Optimization
thumbnail: /images/elastic/elasticsearch.png
date: 2019-01-02 22:15:27 +0800
categories: Elasticsearch
tags: 
  - Elasticsearch
  - Performance Optimization
---
# 一 部署配置篇
## 1. 设置`refresh_interval`
  ```bash
     curl -XPUT /index_name/_settings -d 
     '
       {
           "index" : {
               "refresh_interval" : "30s"
           }
       }  
     '
  ```
  > ES默认是1s
  
## 2. 允许的情况下禁用`_all`
  `_all`字段是一个很少用到的字段，它连接所有字段的值构成一个用空格分隔的大string，该string被analyzed和index，但是不被store。当你不知道不清楚document结构的时候，
  可以用`_all`查询等。`_all`字段需要额外的CPU周期和更多的磁盘。所以，如果不需要`_all`，最好将其禁用！
  ```bash 
    # 在mapping中加入设置
    '_all': {'enabled': False}
  ```
  
## 3. 允许的情况下禁用`_source`
  `_source`会存储文档的原始字段内容，在查询的时候会返回`_source`内容，如果禁用查询将只返回`_id`，但不影响聚合与索引。在特定场景下Elasticsearch只是作为索引时(原始
  内容存于其他地方，如HBase)，再根据ID获取内容，可以禁用`_source`。
  ```bash 
    # 在mapping中加入设置
    '_source': {'enabled': False}
  ```
  
## 4. Master Node和Data Node设置
  条件允许的情况下Master节点和Data节点分开。
  ```bash
    # elasticsearch.yml内配置一个true一个false
    node.master: true # 该节点是否参与master节点选举，master节点最好大于等于3的奇数
    node.data: true   # 该节点是否存储数据
  ```
  
## 5. Data Node不开启HTTP服务
  如果Master节点和Data节点分开，建议Data接点不开启HTTP服务
  ```bash
    # elasticsearch.yml内配置
    http.enabled: false  # 默认开启
  ```
    
## 6. 使用SSD
  使用SSD可以显著提高Elasticsearch性能。
  
## 7. 避免使用swapping
  swapping是内存不足时使用硬盘设置的交换空间，因为是硬盘的读写，所以性能较差。这个时候不仅仅es效率低，整个系统都效率降低。
  ```bash
    # elasticsearch.yml内配置JVM启动参数,锁定Heap size
    bootstrap.mlockall: true
  ```
  > 这个配置生效要增加环境变量**ES_HEAP_SIZE**，root用户执行`ulimit -l unlimited`再启动Elasticsearch
  
## 8.    
