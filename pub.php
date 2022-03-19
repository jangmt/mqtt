<?php
// 官方  https://github.com/mgdm/Mosquitto-PHP/tree/master/examples
// 中文說明 https://www.kancloud.cn/liao-song/mosquitto-php/500403
// 設定
$mqtthost = 'mqtt.shopeebuy.com';
$mqttport = 1883;
$username = 'mtchang';
$password = 'xxxxxxx';
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