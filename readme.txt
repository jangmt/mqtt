Mosquitto SSL Configuration -MQTT TLS Security
----
* 參考 How to Install and Secure the Mosquitto MQTT Messaging Broker on Ubuntu 16.04
https://www.digitalocean.com/community/tutorials/how-to-install-and-secure-the-mosquitto-mqtt-messaging-broker-on-ubuntu-16-04

* Steves 有作出來 Mosquitto SSL Configuration -MQTT TLS Security , but 我做不出來...XD
http://www.steves-internet-guide.com/mosquitto-tls/

* SSL/TLS Client Certs to Secure MQTT , 結論是有問題
# 中文 https://blog.csdn.net/moxiaomomo/article/details/51698118
# 原文 http://rockingdlabs.dunmire.org/exercises-experiments/ssl-client-certs-to-secure-mqtt

* A TLS error occurred #689
# https://github.com/eclipse/mosquitto/issues/689 
# https://github.com/owntracks/recorder/issues/102

* 官方的 mosquitto-tls man page , but 有問題 in wss
# https://mosquitto.org/man/mosquitto-tls-7.html

* MQTT web socket 管理界面 
# https://hobbyquaker.github.io/mqtt-admin/ 

* [移动] Mosquitto简要教程（安装/使用/测试）
# https://blog.csdn.net/shagoo/article/details/7910598

* MQTT 介紹 - mosquitto 開源 MQTT broker 
# https://cfw011566.gitbooks.io/mqtt-and-mosquitto/content/mosquitto.html

* 簡單介紹 - Mosquitto MQTT 安裝
# https://ming-yi.github.io/2016/08/17/Mosquitto%20MQTT%20%E5%AE%89%E8%A3%9D/

---- 
結論是本人能力有限尚未能解決 MQTT TLS 問題, 先跳過這一段處理別的.
我的需求是要用 ws 當成網站系統的非同步訊息溝通中介，但是既然是網站系統 ws 和 wss 才是主要需求。
目前發現的問題是，當 web 使用 https 時候，會強迫整個連線方式為「加密」所以 ws --> wss 這就會有問題了。
因為不想走回頭路用 comet 只想用 websocket 但是目前還沒辦法解決這問題, 所以先擱著處理可以用的部份...
----

man page mosquitto.conf(5) 有詳細的說明
* 解釋 $SYS Topics  https://github.com/mqtt/mqtt.github.io/wiki/SYS-Topics
* mosquitto ACL 限制原則 https://stackoverflow.com/questions/18447532/programmatically-setting-access-control-limits-in-mosquitto/24770392#24770392


----
MQTT服務端
----

* 設定 MQTT 使用者密碼
[root@demo mosquitto]# mosquitto_passwd -c /etc/mosquitto/passwd mtchang
Password: 
Reenter password: 
# 如果已經有密碼檔案，則拿掉-c這個參數

* 修改 mosquitto.conf 在最後面加入
# 消息自動保存的間隔時間
autosave_interval 1800 
# 消息自動保存功能的開關
autosave_on_changes true  
# 持久化功能的開關
persistence true
# 持久化DB文件
persistence_file mosquitto.db
# 持久化DB文件目錄
persistence_location /var/lib/mosquitto/
# 用戶/密碼文件，默認格式：username:password
password_file /etc/mosquitto/passwd
#不允許匿名傳輸
allow_anonymous false
#設置用戶與主題(topic)存取權限 -- 先保留不設定
#acl_file /etc/mosquitto/acl
# for default
bind_address 0.0.0.0
port 1883
# for the websockets
listener 11883 0.0.0.0
protocol websockets

* 先設定權限 for 持久化
[root@demo mosquitto]# mkdir -p /var/lib/mosquitto/
[root@demo mosquitto]# chmod 777 /var/lib/mosquitto/

* 啟動、看訊息、看port
[root@demo mosquitto]# systemctl restart mosquitto.service ; tail /var/log/messages -n 10; netstat -antlp |grep mos
May 19 16:53:04 demo systemd: Stopping Mosquitto MQTT v3.1/v3.1.1 Broker...
May 19 16:53:04 demo mosquitto: 1526719984: mosquitto version 1.4.15 terminating
May 19 16:53:04 demo mosquitto: 1526719984: Saving in-memory database to /var/lib/mosquitto/mosquitto.db.
May 19 16:53:04 demo systemd: Started Mosquitto MQTT v3.1/v3.1.1 Broker.
May 19 16:53:04 demo systemd: Starting Mosquitto MQTT v3.1/v3.1.1 Broker...
tcp        0      0 0.0.0.0:11883           0.0.0.0:*               LISTEN      4406/mosquitto      
tcp        0      0 0.0.0.0:1883            0.0.0.0:*               LISTEN      4406/mosquitto 

* 主機防火牆打開
# firewall-cmd --add-port=1883/tcp
# firewall-cmd --add-port=11883/tcp
[root@demo mosquitto]# iptables -L -n | grep 1883
ACCEPT     tcp  --  0.0.0.0/0            0.0.0.0/0            tcp dpt:1883 ctstate NEW
ACCEPT     tcp  --  0.0.0.0/0            0.0.0.0/0            tcp dpt:11883 ctstate NEW

* MQTT 1883 port 訂閱功能測試
# mosquitto_sub -v -t '/mtchang/test' -h mqttdemo.shopeebuy.com -p 1883 -u mtchang -P qw
[mtchang@proj ~]$ mosquitto_sub -v -t '/mtchang/test' -h mqttdemo.shopeebuy.com -p 1883 -u mtchang -P qw
/mtchang/test Sat May 19 17:00:54 CST 2018
/mtchang/test Sat May 19 17:01:45 CST 2018

* MQTT 1883 port 推播功能測試
# mosquitto_pub -d -t '/mtchang/test' -h mqttdemo.shopeebuy.com -p 1883 -u mtchang -P qw -m "$(date)"
[root@demo mosquitto]# mosquitto_pub -d -t '/mtchang/test' -h mqttdemo.shopeebuy.com -p 1883 -u mtchang -P qw -m "$(date)"
Client mosqpub|5931-demo.gpk17 sending CONNECT
Client mosqpub|5931-demo.gpk17 received CONNACK
Client mosqpub|5931-demo.gpk17 sending PUBLISH (d0, q0, r0, m1, '/mtchang/test', ... (28 bytes))
Client mosqpub|5931-demo.gpk17 sending DISCONNECT

----
使用 PHP Client 測試
----
* 先安裝 php*-php-pecl-mosquitto 元件. 檢查 php 是否有支援
[root@demo mosquitto]# php -i | grep mosquitto
/etc/opt/remi/php70/php.d/40-mosquitto.ini,
mosquitto
libmosquitto version => 1.4.12
PWD => /etc/mosquitto
$_SERVER['PWD'] => /etc/mosquitto

* PHP MQTT 的範例
http://mosquitto-php.readthedocs.io/en/latest/
https://github.com/mgdm/Mosquitto-PHP/tree/master/examples
中文 https://www.kancloud.cn/liao-song/mosquitto-php/500403

* 使用 mosquitto_sub 接收剛剛傳送的訊息(使用另外的視窗來接收)
[mtchang@proj ~]$ mosquitto_sub -v -t '/mtchang/test' -h mqttdemo.shopeebuy.com -p 1883 -u mtchang -P qw
/mtchang/test Hello PHP MQTT Sat, 19 May 2018 09:09:27 +0000
/mtchang/test Hello PHP MQTT Sat, 19 May 2018 09:09:37 +0000

* 使用 php 送出訊息
[mtchang@demo mqtt]$ cat pub.php 
<?php
// 官方  https://github.com/mgdm/Mosquitto-PHP/tree/master/examples
// 中文說明 https://www.kancloud.cn/liao-song/mosquitto-php/500403
// 設定
$mqtthost = 'mqtt.shopeebuy.com';
$mqttport = 1883;
$username = 'mtchang';
$password = 'qw';
// ----
$c = new Mosquitto\Client;
$c->setCredentials($username, $password);
$c->connect($mqtthost);
// ----
$c->onConnect(function() use ($c) {
    $mid = $c->publish('/mtchang/test', "Hello PHP MQTT ".date(DATE_RFC2822), 1, 0);
	echo "Sent message ID: {$mid}\n";
    $c->disconnect();
});
$mid = $c->publish('/mtchang/test', "Hello agent PHP MQTT ".date(DATE_RFC2822), 1, 0);
echo "Sent message ID: {$mid}\n";
$c->loopForever();
echo "Finished\n";

?>
[mtchang@demo mqtt]$ php pub.php 
﻿Sent message ID: 1
Sent message ID: 2
Finished


----
MQTT客戶端使用 websocket 
----
* MQTT.js 的說明
https://itbilu.com/nodejs/npm/41wDnJoDg.html

* 發送及接收展示頁面 http://bemtchang.jutainet.com/mqtt/index.html

----
* 程式使用的資訊
* MQTT server websokcet
主機：mqtt.jangmt.com port: 11883 (websockets only ws://)
帳號；mtchang
密碼：qw
通道：/mtchang/test

* MQTT server mqtt listener
主機：mqtt.jangmt.com port: 1883
帳號；mtchang
密碼：qw
通道：/mtchang/test

* 程式碼在這裡
http://gitlabproject.jutainet.com/chang/mqtt





