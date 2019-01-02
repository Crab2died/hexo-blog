---
layout: post
title: Elasticsearch Setting translation
thumbnail: /images/db/mysql_logo.png
date: 2019-01-01 10:15:27 +0800
categories: Elasticsearch
tags: 
  - Elasticsearch
  - Translation
---
> Elasticsearch各模块配置详解(译文)  
> 原文地址: [https://www.elastic.co/guide/en/elasticsearch/reference/6.5/modules.html](https://www.elastic.co/guide/en/elasticsearch/reference/6.5/modules.html)

# 一 模块介绍
  这一节主要介绍负责Elasticsearch功能的各个模块，以及各个模块可能的配置：  
  **静态配置:**  
  这些设置必须在节点级别设置，或者在Elasticsearch中设置。或作为环境变量，或在启动节点时在命令行上。它们必须在集群中的每个相关节点上设置。  
  **动态配置:**  
  这些配置可以使用[cluster-update-settings](https://www.elastic.co/guide/en/elasticsearch/reference/current/cluster-update-settings.html) 
  API在活动集群上动态更新这些设置。

# 二 各模块配置详解
## 1 集群级别的路由和分片(shard)分配
> 用于控制在何处、何时以及如何将分片分配给节点的设置
## 1.1 集群级别的分片分配
  分片分配是将分片分配给节点的过程。这个过程可以在初始恢复、副本分配、重新平衡或添加或删除节点时发生。
## 1.1.1 分片分配设置
> 以下动态设置可用于控制碎片分配和恢复
### 1) cluster.routing.allocation.enable
  为特定类型的分片设置启用或禁用重新分配
  - **all**: (默认配置) 允许所有的分片重新分配
  - **primaries**: 只允许主分片重新分配
  - **new_primaries**: 只允许新增的主分片重新分配
  - **none**: 不允许任何分片重新分配  
   
### 2) cluster.routing.allocation.node_concurrent_incoming_recoveries
  当前节点允许从其他节点(极大可能是复制分片，除非分片需要重新分配)恢复主分片的最大并发数。默认配置是2。
  
### 3) cluster.routing.allocation.node_concurrent_outgoing_recoveries
  当前节点允许多少分片(除非分片正在重新分片，否则极可能是主分片)同步恢复到其他节点的最大并发数。默认配置是2。
  
### 4) cluster.routing.allocation.node_concurrent_recoveries
  是cluster.routing.allocation.node_concurrent_incoming_recoveries和cluster.routing.allocation.node_concurrent_outgoing_recoveries配置之和的快捷配置。
  默认是4
  
### 5) cluster.routing.allocation.node_initial_primaries_recoveries
  虽然副本的恢复是通过网络进行的，但是节点重新启动后未分配的主分配片的恢复使用来自本地磁盘的数据。这些操作应该很快，以便在同一个节点上并行地进行更多的初始主分片恢复。
  默认为4。  
  
### 6) cluster.routing.allocation.same_shard.host
  允许根据主机名和主机地址执行检查，防止在单个主机上分配相同分片的多个实例。默认值为false，表示默认情况下不执行检查。只有在同一台机器上启动多个节点时，该设置才生效。

## 1.1.2 分片重新平衡设置
> 以下动态设置可用于控制跨集群分片的重新平衡
### 1) cluster.routing.rebalance.enable
  为特定类型的分片设置启用或禁用重新平衡
  - **all**: (默认配置) 允许所有的分片重新平衡 
  - **primaries**: 只允许主分片重新平衡
  - **replicas**: 只允许复制分片重新平衡
  - **none**: 不允许任何分片重新平衡
  
### 2) cluster.routing.allocation.allow_rebalance
  指定分片重新平衡时机 
  - **always**: 总是允许分片重新平衡 
  - **indices_primaries_active**: 只有集群所有主分片被分配后
  - **indices_all_active**: 只有集群所有分片(主分片和复制分片)被分配后
  
### 3) cluster.routing.allocation.cluster_concurrent_rebalance
  设置集群范围内最大多少个分片并发重新平衡。默认为2。  
  _**注意，此设置仅控制由于集群中的不平衡而导致的并发分片重新分配的数量。此设置不限制由于分配筛选或强制感知而导致的分片重新分配。**_ 

## 1.1.3 分片平衡感知
> 以下设置一起用于确定将每个分片放置在何处。当不允许重新平衡操作时，任何节点的权重都不能使其与其他任何节点的权重之间的距离超过balance.threshold的设置。
### 1) cluster.routing.allocation.balance.shard
  定义节点上分配的分片总数的权重因子(浮点数)。默认值为0.45。提高这个值会使集群中所有节点的分片数量更趋于相等。
  
### 2) cluster.routing.allocation.balance.index
  定义在节点上分配的每个索引的分片数量的权重因子(浮点数)。默认值为0.55。提高这个值会使集群中所有节点上每个索引的分片数量更趋于相等。
  
### 3) cluster.routing.allocation.balance.threshold
  
    