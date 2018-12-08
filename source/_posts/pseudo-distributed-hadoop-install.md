---
layout: post
title: Pseudo Distributed Hadoop Install
img: /images/hadoop/hadoop_logo_01.png
date: 2018-10-26 21:11:27 +0800
author: Crab2Died
categories: Big Data
tags: 
  - Big Data
  - Hadoop
---

## 一 环境准备
### 准备Ubuntu、JDK8、Hadoop2.8.5
   [安装Ubuntu https://www.ubuntu.com/download/desktop](https://www.ubuntu.com/download/desktop)
   [安装JDK,修改环境变量 https://www.oracle.com/technetwork/java/javase/downloads/index.html](https://www.oracle.com/technetwork/java/javase/downloads/index.html)
   [下载Hadoop2.8.5 http://hadoop.apache.org/](http://hadoop.apache.org/)

### 其他准备
#### 1. 更新apt `sudo apt-get update`
#### 2. SSH安装，配置无密码SSH登入
##### 2.1 SSH安装 `sudo apt-get install openssh-server`
##### 2.2 配置SSH无密码登入
   ```bash
     cd ~/.ssh/                            # 若没有该目录，请先执行一次ssh crab2died
     ssh-keygen -t rsa                     # 会有提示，都按回车就可以
     cat ./id_rsa.pub >> ./authorized_keys # 加入授权
     ssh crab2died                         # 验证无密码登入
   ```
#### 3. 修改hosts
   ```bash
     sudo vi /etc/hosts
     # 添加 
     本机ip   crab2died
   ```   
## 二 安装Hadoop
### 1. 解压Hadoop
   ```bash
     cd ~
     sudo tar -zxf ~/Downloads/hadoop-2.8.5.tar.gz -C /usr/local # 解压到/usr/local中
     cd /usr/local/                                              
     chmod -R 777 ./hadoop-2.8.5                                 # 设置权限
   ```
### 2. 设置Hadoop环境变量
   ```bash
     sudo vi /etc/profile
     # 添加
     export HADOOP_HOME=/usr/local/hadoop-2.8.5 
     export PATH=$PATH:${HADOOP_HOME}/sbin:${HADOOP_HOME}/bin
     # 保存执行
     source /etc/profile
   ```
### 3. 验证Hadoop版本
   ```bash
     hadoop version    # 成功会返回版本信息
   ```
### 4. 伪分布式配置
#### 4.1 进入`${HADOOP_HOME}/etc/hadoop`目录中，修改以下文件
##### 4.1.1 修改 hadoop-env.sh  
      将`export JAVA_HOME=${JAVA_HOME}`改成`export JAVA_HOME=/usr/local/jdk1.8.0_181  # JDK根目录`
##### 4.1.2 修改 core-site.xml    
   ```xml
     <configuration>
         <property>
             <name>hadoop.tmp.dir</name>
             <value>file:/home/crab2died/hadoop/tmp</value>
             <description>Abase for other temporary directories.</description>
         </property>
         <property>
             <name>fs.defaultFS</name>
             <value>hdfs://crab2died:9000</value>
         </property>
     </configuration>
   ```  
##### 4.1.3 修改 hdfs-site.xml
   ```xml
     <configuration>
        <property>
            <name>dfs.nameservices</name>
            <value>hadoop-cluster</value>
        </property>
        <property>
            <name>dfs.replication</name>
            <value>1</value>
        </property>      
        <property>
            <name>dfs.namenode.name.dir</name>
            <value>file:/home/crab2died/hadoop/hdfs/nn</value>
        </property>
        <property>
            <name>dfs.namenode.checkpoint.dir</name>
            <value>file:/home/crab2died/hadoop/hdfs/snn</value>
        </property>
        <property>
            <name>dfs.namenode.checkpoint.edits.dir</name>
            <value>file:/home/crab2died/hadoop/hdfs/snn</value>
        </property>
        <property>
            <name>dfs.datanode.data.dir</name>
            <value>file:/home/crab2died/hadoop/hdfs/dn</value>
        </property>
     </configuration>
   ```
##### 4.1.4 先复制`cp mapred-site.xml.template mapred-site.xml`,再修改 mapred-site.xml
   ```xml
     <configuration>
         <property>
              <name>mapreduce.framework.name</name>
              <value>yarn</value>
         </property>
     </configuration>
   ```
##### 4.1.5 修改 yarn-site.xml
   ```xml
     <configuration>
        <property>
            <name>yarn.resourcemanager.hostname</name>
            <value>crab2died</value>
        </property>
        <property>
            <name>yarn.nodemanager.aux-services</name>
            <value>mapreduce_shuffle</value>
        </property>
        <property>
            <name>yarn.nodemanager.local-dirs</name>
            <value>file:/home/crab2died/hadoop/yarn/nm</value>
        </property>
     </configuration>
   ```
### 5. 格式化HDFS NameNode
   ```bash
     hdfs namenode -format
   ```
### 6. 启动集群
#### 6.1 启动HDFS集群
   ```bash
     hadoop-daemon.sh start namenode
     hadoop-daemon.sh start datanode
     hadoop-daemon.sh start secondarynamenode  # 伪分布式才有
   ```
#### 6.2 启动YARN
   ```bash
     yarn-daemon.sh start resourcemanager
     yarn-daemon.sh start nodemanager
   ```
### 7. jps查看进程  
   ```bash
     jps
     1213 NameNOde
     1261 NodeManager
     1521 ResourceManager
     1722 DataNode
     1732 SecondrayNameNode     
   ```
### 8. 查看HDFS管理界面:  
   [http://crab2died:50070](http://crab2died:50070)
### 9. 查看YARN管理界面:  
   [http://crab2died:8088](http://crab2died:8088)
