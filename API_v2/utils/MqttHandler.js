const mqtt = require('mqtt');
require('dotenv').config({ path: `${process.cwd()}/.env` });

class MqttHandler {
  constructor() {
    this.mqttClient = null;
    this.host = `mqtt://${process.env.MQTT_HOST}:${process.env.MQTT_PORT}`; // mqtt broker host
    this.username = process.env.MQTT_USERNAME; // mqtt credentials if these are needed to connect
    this.password = process.env.MQTT_PASSWORD;
  }
  
  connect() {
    // Connect mqtt with credentials (in case of needed, otherwise we can omit 2nd param)
    this.mqttClient = mqtt.connect(this.host, { username: this.username, password: this.password });
    // Mqtt error calback
    this.mqttClient.on('error', (err) => {
      console.log(err);
      this.mqttClient.end();
    });

    // Connection callback
    this.mqttClient.on('connect', () => {
      console.log(`mqtt client connected`);
    });

    this.mqttClient.on('close', () => {
      console.log(`mqtt client disconnected`);
    });

  }

  // Sends a mqtt message to topic: mytopic
  sendMessage(topic,message) {
    console.log(topic);
    if (topic !== null && message !== null){
      console.log('publishing', message,"to",topic);
      this.mqttClient.publish(topic, message);
    }
}
}

module.exports = MqttHandler;