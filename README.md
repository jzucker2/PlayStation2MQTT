# PlayStation2MQTT

## Integration Guide

Sparse info but something here: https://github.com/dhleong/playactor/discussions/22

## Basic Testing

```
npm start

curl http://localhost:4242/playactor/ps5/10.0.1.105
{"device":"PS5","name":"PS5-241","status":"STANDBY","id":"foo"}

curl http://localhost:4242/playactor/ps5/10.0.1.100/wake

curl http://localhost:4242/playactor/ps5/10.0.1.100/standby
```

## MQTT Info

* https://www.home-assistant.io/integrations/mqtt/#examples
* https://www.home-assistant.io/integrations/mqtt/#testing-your-setup

### Implementation Details

```
// <discovery_prefix>/<component>/[<node_id>/]<object_id>/config
// homeassistant/switch/playstation2mqtt/playstation/config
// homeassistant/switch/playstation2mqtt/playstation/state
// homeassistant/switch/playstation2mqtt/playstation/set
// homeassistant/switch/playstation/config
// homeassistant/switch/playstation/state
// homeassistant/switch/playstation/set
```

```json
{
   "name":null,
   "device_class":"motion",
   "state_topic":"homeassistant/binary_sensor/garden/state",
   "unique_id":"motion01ad",
   "device":{
      "identifiers":[
         "01ad"
      ],
      "name":"Garden"
   }
}
```

## Deploy Instructions

First create a `credentials.json` file using ps5-actor and place in same directory.

### Create Credentials

```
docker compose exec -it playstation2mqtt sh
```

### Docker Compose

Then create a `docker-compose.yaml` like the following:

```yaml
services:

  playstation2mqtt:
    container_name: playstation2mqtt
    image: ghcr.io/jzucker2/playstation2mqtt:latest
    restart: always
    extra_hosts:
      - "host.docker.internal:host-gateway"
    ports:
      - 4242:4242
    environment:
      - CHOKIDAR_USEPOLLING=true
      - MQTT_BROKER_URL=mqtt://mosquitto.local:1883
      - MQTT_USERNAME=mqtt_username
      - MQTT_PASSWORD=mqtt_password
    volumes:
      - ./credentials.json:/root/.config/playactor/credentials.json
      - playstation2mqtt-data:/playstation2mqtt/configs
    stdin_open: true

volumes:
  playstation2mqtt-data:
```
