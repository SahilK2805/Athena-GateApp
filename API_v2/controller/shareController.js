const catchAsync = require("../utils/catchAsync");
const jwt = require("jsonwebtoken");
const mqttHandler = require('../utils/MqttHandler');
const mqtt = new mqttHandler();

mqtt.connect(
  process.env.MQTT_HOST,
  process.env.MQTT_PORT,
  process.env.MQTT_USERNAME,
  process.env.MQTT_PASSWORD
);

const sharePage = catchAsync(async (req, res) => {
  res.render("index");
});

const tokenGen = catchAsync(async (req, res) => {
  const payload = {
    sub: req.body.sub,
  }
  console.log(req.body);
  try{
    const token = jwt.sign(payload, process.env.JWT_SECRET_KEY2, {
      expiresIn: process.env.JWT_EXPIRES_IN2,
    });

    res.status(200).json({
      status: "success",
      token,
    });
  }catch(err){
    console.log(err);
  }
});
let lastCallTimes = new Map();

const controlGate = catchAsync(async (req, res) => {
  const { token } = req.params;
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET_KEY2);
    
    // Check if enough time has passed since the last call for this payload's sub
    const lastCallTime = lastCallTimes.get(payload.sub);
    if (lastCallTime && Date.now() - lastCallTime < 30000) {
      res.render("index",{valid: "Gate already opened, please wait for 30 seconds."});
      return;
    }
    // Update the last call time for this payload's sub
    lastCallTimes.set(payload.sub, Date.now());
    
    mqtt.sendMessage(`gate/${payload.sub}`,"full_open");
    res.render("index",{valid: "Gate opened"});
  } catch (err) {
    console.log(err);
    res.status(400).render("notfound");
  }
});

module.exports =  { sharePage, tokenGen, controlGate };