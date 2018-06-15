---
layout: post
list_title: Ruby
title:  "Ruby Install With Source On CentOS"
date:   2018-06-14 12:45:27 +0800
author: Crab2Died
categories: content ruby
tags: [Ruby Install, CentOS]
---

## 1. Install OpenSSL
 - [Download OpenSSL Source](https://www.openssl.org/source/)
 - Install OpenSSL
 {% highlight bash %}
 $ tar -zxvf openssl-1.1.1-pre7.tar.gz
 $ cd openssl-1.1.1-pre7
 $ ./config -fPIC --prefix=/usr/local/openssl enable-shared
 $ ./config -t
 $ make && make install
 {% endhighlight %}
 - Check install
 {% highlight bash %}
 $ openssl version
 OpenSSL 1.0.2k-fips  26 Jan 2017
 {% endhighlight %}
 
## 2. Install Ruby
 - [Download Ruby Source](http://www.ruby-lang.org/en/downloads/)
 - Install Ruby
 {% highlight bash %}
 $ tar -zxvf ruby-2.5.1.tar.gz
 $ cd ruby-2.5.1
 $ ./configure --prefix=/usr/local/ruby --with-opessl-dir=/usr/local/openssl     // important
 $ make && make install
 {% endhighlight %}
 - Configure environment variable
 {% highlight bash %}
 $ vi /etc/profile
 
 append -> export PATH=/usr/local/ruby/bin:$PATH
 
 $ source /etc/profile
 {% endhighlight %}
 - Check install
 {% highlight bash %}
 $ ruby -v
 ruby 2.5.1p57 (2018-03-29 revision 63029) [x86_64-linux]
 
 $ gem -v
 2.7.6
 {% endhighlight %}
 
