---
layout: post
title: Elasticsearch Performance Optimization
thumbnail: /images/elastic/elasticsearch.png
date: 2019-01-02 22:15:27 +0800
categories: Elasticsearch
tags: 
  - Elasticsearch
---
## 一 部署配置优化篇
### 1. Master Node和Data Node设置
  条件允许的情况下Master节点和Data节点分开。
  ```yaml
    # elasticsearch.yml内配置一个true一个false
    node.master: true # 该节点是否参与master节点选举，master节点最好大于等于3的奇数
    node.data: true   # 该节点是否存储数据
  ```
  
### 2. Data Node不开启HTTP服务
  如果Master节点和Data节点分开，建议Data接点不开启HTTP服务。
  ```yaml
    # elasticsearch.yml内配置
    http.enabled: false  # 默认开启
  ```
    
### 3. 使用固态硬盘(SSD)
  使用SSD可以显著提高Elasticsearch性能。
  
### 4. 避免使用swapping
  swapping是内存不足时使用硬盘设置的交换空间，因为是硬盘的读写，所以性能较差。这个时候不仅仅es效率低，整个系统都效率降低。
  ```yaml
    # elasticsearch.yml内配置JVM启动参数,锁定Heap size
    bootstrap.mlockall: true
  ```
  > 这个配置生效要root用户执行`ulimit -l unlimited`后，再启动/重启Elasticsearch
  
### 5. 堆内存配置
  堆内存建议为系统可用内存的50%，但不要超过32G(32G会引起Java指针膨胀)，剩余的50%会被Lucene使用来做索引缓存(Lucene使用堆外内存来存储索引)，提高查询效率。   
  
### 6. 设置字段缓存`fileddata`
  字段数据缓存主要用于排序字段和计算聚合。将所有的字段值加载到内存中，以便提供基于文档快速访问这些值。
  ```yaml
    # elasticsearch.yml内配置
    indices.fielddata.cache.size: 40%          # 也可以是具体的值，如4gb。默认是无限制
    indices.breaker.fielddata.limit: 60%       # field数据使用内存限制，默认为JVM堆的60%
    indices.breaker.fielddata.overhead: 1.03　 # Elasticsearch使用这个常数乘以所有fielddata的实际值作field的估算值。默认为 1.03
  ```
  
### 7. 禁止删除`delete_all_indices`
  防止误删索引。
  ```yaml
    # elasticsearch.yml内配置
    action.disable_delete_all_indices: true
  ```

## 二. 开发使用优化篇
### 1. 设置`refresh_interval`
  ```bash
    # 可通过setting api设置 
    curl -XPUT /index_name/_settings -d 
    '
     {
         "index" : {
             "refresh_interval" : "30s"
         }
     }  
    '

    # 或在mapping的settings中加入设置
    "settings": {"refresh_interval": "30s"}
  ```
  > ES默认是1s
  
### 2. 允许的情况下禁用`_all`
  `_all`字段是一个很少用到的字段，它连接所有字段的值构成一个用空格分隔的大string，该string被analyzed和index，但是不被store。当你不知道不清楚document结构的时候，
  可以用`_all`查询等。`_all`字段需要额外的CPU周期和更多的磁盘。所以，如果不需要`_all`，最好将其禁用！
  ```bash 
    # 在mapping的settings中加入设置
    "_all": {"enabled": false}
  ```
  
### 3. 允许的情况下禁用`_source`
  `_source`会存储文档的原始字段内容，在查询的时候会返回`_source`内容，如果禁用查询将只返回`_id`，但不影响聚合与索引。在特定场景下Elasticsearch只是作为索引时(原始
  内容存于其他地方，如HBase)，再根据ID获取内容，可以禁用`_source`。
  ```bash 
    # 在mapping的settings中加入设置
    "_source": {"enabled": false}
  ```

### 4. 批处理`_bulk`
  使用批处理可以提高Elasticsearch的QPS，提高性能。

### 5. Script脚本使用
  尽量避免使用Script，如需使用建议使用painless脚本。

### 6. 合理的分片数
  Elasticsearch创建index后分片数就不可更改，建议每个分片大小在20~30G左右，每GB堆内存的分片数最大控制在20个左右(如堆内存为8G的Node最多存放160个分片)，在存储log这种
  读少写多的场景可适当调高。

### 7. 设计路由(Routing)
  一个好的路由规则可以极大地提高Elasticsearch的查询效率。默认是`_id`字段。

### 8. 避免深分页查询
  Elasticsearch深分页是非常低效的，Elasticsearch查询时会讲匹配的所有分片的查询获取from + size条记录，最后从所有结果集中取size条记录。  
  Elasticsearch参数`max_result_window`会限制from + size的最大数，如果大于这个值会抛出异常。该值默认为1000，可以通过setting设置(建议不要设置过大)。
  ```bash
    # 可通过setting api设置 
    curl -XPUT /index_name/_settings -d 
    '
     {
         "index" : {
             "max_result_window" : 20000
         }
     }  
    '     

    # 或在mapping的settings中加入设置
    "settings": {"max_result_window": 20000}
  ```
  如需深分页，可通过`scroll`api实现滚动分页。
