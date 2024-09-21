# PlayStation2MQTT

## Integration Guide

Sparse info but something here: https://github.com/dhleong/playactor/discussions/22

## Basic Testing

```
npm start

curl http://localhost:4242/playactor/ps5/10.0.0.105
{"device":"PS5","name":"PS5-241","status":"STANDBY","id":"foo"}

curl http://localhost:4242/playactor/ps5/10.0.1.105/wake

curl http://localhost:4242/playactor/ps5/10.0.1.105/standby
```
