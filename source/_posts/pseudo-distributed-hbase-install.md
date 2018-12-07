---
layout: post
title:  "Pseudo Distributed Hbase Install"
date:   2018-10-26 21:45:27 +0800
author: Crab2Died
categories: bigdata
tags: 
  - big-data
  - hbase 
---

## 环境准备
### Ubuntu、JDK8、Hadoop2.8.5、HBase2.1.0
   [安装Ubuntu](https://www.ubuntu.com/download/desktop);
   [安装JDK,修改环境变量](https://www.oracle.com/technetwork/java/javase/downloads/index.html);
   [安装Hadoop2.8.5](http://hadoop.apache.org/)
   [下载HBase2.1.0](http://hbase.apache.org/)

### 其他准备
   部署Hadoop详见: [Hadoop 伪分布式部署](https://github.com/Crab2died/big-data-stack/blob/master/docs/Hadoop%E4%BC%AA%E5%88%86%E5%B8%83%E5%BC%8F%E9%83%A8%E7%BD%B2.md)
   
### 部署HBase
   1. 解压HBase
      ```bash
      cd ~
      sudo tar -zxf ~/Downloads/hbase-2.1.0-bin.tar.gz -C /usr/local # 解压到/usr/local中
      cd /usr/local/                                              
      chmod -R 777 ./hbase-2.1.0                                     # 设置权限
      ```
   2. 配置HBase环境变量
      ```bash
      export HBASE_HOME=//usr/local/hbase-2.1.0
      export HBASE_CONF_DIR=${HBASE_HOME}/conf
      export HBASE_CLASS_PATH=${HBASE_CONF_DIR}
      export PATH=$PATH:${HBASE_HOME}/bin
      ```
   3. 修改环境${HBASE_HOME}/conf/hbase-evn.sh配置
      ```bash
      # 增加以下配置
      export JAVA_HOME=/usr/local/jdk1.8.0_181  # JDK根目录
      export HBASE_MANAGES_ZK=true              # 使用HBase自带zookeeper
      ```
   4. 修改配置文件${HBASE_HOME}/conf/hbase-site.xml
      ```xml
      <configuration>
          <property>
              <name>hbase.rootdir</name>
              <value>hdfs://crab2died:9000</value>
          </property>
          <property> 
              <name>hbase.cluster.distributed</name>
              <value>true</value> 
          </property>
      </configuration>
      ```
   5. 修改文件${HBASE_HOME}/conf/regionservers
      将`localhost`改为`crab2died`
   6. 解决HBase master启动错误
      ```bash
      # 执行cp 
      cd /usr/local/hbase-2.1.0
      cp ./lib/client-facing-thirdparty/htrace-core-3.1.0-incubating.jar ./lib
      ```
   7. 验证版本
      ```bash
      hbase version
      # 成功则会返回版本信息
      ```
### 启动HBase
   1. 先启动Hadoop,详见: [Hadoop 伪分布式部署](https://github.com/Crab2died/big-data-stack/blob/master/docs/Hadoop%E4%BC%AA%E5%88%86%E5%B8%83%E5%BC%8F%E9%83%A8%E7%BD%B2.md)
   2. 启动HBase
      ```bash
      start-hbase.sh 
      ```
   3. jps查看进程  
      ![hbase jps](https://raw.githubusercontent.com/Crab2died/big-data-stack/master/docs/imgs/hbase-jps.png)
   4. 查看HBase管理界面:  
      [http://crab2died:16030](http://crab2died:16030)
   5. 进入命令行管理:  
      ```bash
      hbase shell
      ```
      