import config from "./config.js";

import { WebSocketServer } from "ws";

console.log(config);

const wss = new WebSocketServer({ host: "0.0.0.0", port: 8080 });

wss.on("connection", function connection(ws) {
  ws.on("error", console.error);

  ws.on("message", function message(data) {
    console.log("received: %s", data);
    ws.send("roger");
  });

  ws.send("something");
});
