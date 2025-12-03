# EngChalDashboard — TODO & integration guide (HiveMQ)

Goal
- Connect dashboard to a HiveMQ MQTT broker and control three subsystems from one ESP32 device:
  - heating
  - stirring
  - pumps

Quick facts (topics / payloads)
- Telemetry (device → dashboard):
  - Topic pattern: `bioreactor/telemetry/<subsystem>`
  - Example topic: `bioreactor/telemetry/heating`
  - Example payload:
    {"subsystem":"heating","temp":33.2,"rpm":0,"pH":5.02,"timestamp":1690000000000}
- Setpoints (dashboard → device):
  - Topic pattern: `bioreactor/<subsystem>/setpoints`
  - Example topic: `bioreactor/heating/setpoints`
  - Example payload:
    {"temp":31.5,"rpm":0,"pH":5.0}

Broker (use HiveMQ)
- Development:
  - Option A: HiveMQ public websocket endpoint: `wss://broker.hivemq.com:8884/mqtt`
  - Option B: HiveMQ Cloud (recommended for auth/TLS) — create instance and use provided wss:// URL and credentials.
- Browser clients must use a WebSocket-enabled broker (wss:// or ws://).
- Device (ESP32) typically connects to broker via TCP (1883) or TLS (8883).

Checklist — todo up to dashboard integration
1. Broker ready
   - [ ] Choose broker: HiveMQ public or HiveMQ Cloud
   - [ ] If HiveMQ Cloud, record websocket URL and credentials
2. Dashboard: make broker configurable
   - [ ] Add simple Broker Config UI (host, port, ws/wss, username, password) persisted to localStorage
   - [ ] Wire config to `useHardwareBioreactorStream` so MQTT_URL can be changed at runtime
3. Dashboard: topic handling
   - [ ] Ensure hook subscribes to telemetry wildcard `bioreactor/telemetry/#` or per-subsystem topic
   - [ ] Ensure `sendSetpoints` publishes to `bioreactor/<subsystem>/setpoints`
   - [ ] Ensure dashboard routes telemetry messages by topic or `subsystem` field
4. Dashboard: UI
   - [ ] Ensure SetpointControls call `sendSetpoints({...})` with the correct partial object
   - [ ] Keep dials + sliders in same row (50/50) and charts below (already done)
   - [ ] Ensure KPI dials use local `setpoints` state so sliders update immediately
5. Device (ESP32) firmware
   - [ ] Implement single sketch managing three subsystems (publish telemetry & subscribe setpoints for each)
   - [ ] Use topics above and include `subsystem` + `timestamp` in telemetry
   - [ ] Implement robust reconnect, LWT, and persistence of setpoints
6. Local dev / testing helpers
   - [ ] Add `scripts/serial-bridge.js` (optional) for USB-to-MQTT bridging
   - [ ] Add `scripts/publish-test.js` to publish telemetry via MQTT for manual tests
7. End-to-end testing
   - [ ] Start broker and dashboard (npm run dev)
   - [ ] Use HiveMQ Websocket client (https://www.hivemq.com/demos/websocket-client/) or `mqtt-cli` to publish telemetry to `bioreactor/telemetry/<subsystem>` and verify dashboard updates
   - [ ] Send setpoints from dashboard and verify device (or `mosquitto_sub`/`mqtt-cli`) receives them
8. Security & production
   - [ ] Move to TLS + auth for production (HiveMQ Cloud or broker with TLS)
   - [ ] Apply topic ACLs if broker supports them

How to test quickly (no device)
- Open dashboard: `npm run dev` → open printed URL
- Use HiveMQ Websocket Client demo:
  - connect to `wss://broker.hivemq.com:8884/mqtt`
  - subscribe to `bioreactor/telemetry/#`
  - publish sample telemetry to `bioreactor/telemetry/heating` with example JSON
- Verify dashboard dials/charts update
- Click Send setpoints in dashboard and verify the demo client or `mqtt-cli` receives `bioreactor/heating/setpoints`

Notes / troubleshooting
- If dashboard shows "disconnected":
  - Check browser console for websocket/CORS errors
  - Ensure `useHardwareBioreactorStream` MQTT_URL matches the broker websocket endpoint
  - If using HiveMQ Cloud, ensure credentials correct and use WSS
- If device uses TCP (1883) and browser uses websocket, both can use same broker host — device uses TCP port, dashboard uses websocket port.
- Prefer one subsystem first (heating) to validate flow, then enable the other two.

Suggested next commits
- Add Broker Config UI and persist to localStorage
- Add `scripts/publish-test.js`
- Add README sections for running mosquitto locally with websockets (if you prefer local broker)

If you want, I will:
- implement the Broker Config UI and persist settings (recommended), or
- add the test scripts (`publish-test.js`, `serial-bridge.js`) into `scripts/` and a short `package.json` script entries.