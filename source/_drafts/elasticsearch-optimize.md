---
layout: post
title: Elasticsearch Performance Optimization
thumbnail: /images/db/mysql_logo.png
date: 2019-01-02 22:15:27 +0800
categories: Elasticsearch
tags: 
  - Elasticsearch
  - Big Data
---
# 一 部署配置篇
## 1. 设置refresh interval
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