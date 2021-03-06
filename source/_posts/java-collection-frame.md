---
layout: post
title: Java Collection Frame
thumbnail: /images/java-collection-frame/ConcurrentHashMap.png
date: 2018-06-15 13:15:27 +0800
author: Crab2Died
categories: Java
tags: 
  - Java
  - Collection
---

## 1. JAVA集合框架图  
   - 集合框架  
   ![集合框架](/images/java/java_collection.png)
   - 集合框架-简图  
   ![集合框架-简图](/images/java/java_collection_sample.jpg)

## 2. ArrayList、LinkedList、Vector、Stack
  1. 都是java的可存储重复元素的集合容器,都实现了Collection、List接口
  2. ArrayList是基于数组的可动态扩展的、可存储重复元素的、有默认顺序的集合，非线程安全的，最大元素个数为`Integer.MAX_VALUE`个
     由于是基于数组的所以add(E)、get(i)效率较高，set(i,E)、remove(i)、add(i,E)效率较低
  3. LinkedList是基于双向链表的可动态扩展的、可存储重复元素的、非线程安全的有序集合。
     由于是基于链表的所以add(E)、add(i,E)、set(i,E)、remove(i)效率较高，get(i)效率较低
  4. Vector是基于数组的可动态扩展的、可存储重复元素的、线程安全的有序集合
     由于是线程安全的所以效率比上诉的都要低
  5. Stack(栈),继承了Vector,只有push(入栈)、pop(出栈)、peek(查看)等方法实现

## 3. HashSet、LinkedHashSet、TreeSet
  1. 都是java的不可存储重复元素的集合容器,都实现了Collection、Set接口
  2. HashSet是不重复的(hashcode去重)、非线程安全的无序集合
     只能放一个null
  3. LinkedHashSet是不重复的(hashcode去重)、非线程安全的有序集合
  4. TreeSet是SortedSet唯一实现类，TreeSet可实现自定义排序(实现Comparable接口)   

## 4. HashMap、HashTable、ConcurrentHashMap、IdentityHashMap
  1. 都是存储形如key-value集合的容器，都实现了Map接口
  2. HashMap是非线程安全的、按key值得hashcode去重的、无序的集合, 能接受key为null
  3. HashTable与HashTable类似，区别在于其实现了同步，效率也相较于HashMap低，不能接受key为null的情况
  4. ConcurrentHashMap是线程安全的、引入了分割(segmentation)，不论它变得多么大，仅仅需要锁定map的某个部分，而其它的线程不需
     要等到迭代完成才能访问map。简而言之在迭代的过程中，ConcurrentHashMap仅仅锁定map的某个部分，而Hashtable则会锁定整个map,
     所以ConcurrentHashMap效率高于HashTable, 不能接受key为null的情况   
     ConcurrentHashMap实现锁分段技术是通过可重入锁ReentrantLock实现Segment[]分锁，每个Segment内部存放一个或多个HashEntry[]
     每个HashEntry又是一个链表，具体的数据结构如图：  
     ![ConcurrentHashMap结构图](/images/java-collection-frame/ConcurrentHashMap.png)
  5. IdentityHashMap基于数组的、区别于HashMap的是比较key值是比较引用相等(形如`object1 == object2`)的，HashMap是equals()
     判断是否相等的，能接受key为null
