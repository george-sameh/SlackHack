require("dotenv").config();

const { App } = require("@slack/bolt");
const axios = require("axios");

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  appToken: process.env.SLACK_APP_TOKEN,
  socketMode: true
});

app.command("/slackhack-hello", async ({ command, ack, respond }) => {
  await ack();
  await respond({ text: `Hello, <@${command.user_id}>!` });
});

app.command("/slackhack-ping", async ({ ack, respond }) => {
  const start = Date.now();
  await ack();
  const latency = Date.now() - start;
  await respond({ text: `Pong!\nLatency: ${latency}ms` });
});

app.command("/slackhack-help", async ({ ack, respond }) => {
    await ack();
    await respond({
        text: `Available commands:\n
        /slackhack-hello - Greets the user.\n
        /slackhack-ping - Checks the bot's latency.\n
        /slackhack-help - Display help list
        /slackhack-joke - Tells a joke`
    });
});

app.command("/slackhack-joke", async ({ ack, respond }) => {
  await ack();

  try {
    const response = await axios.get("https://official-joke-api.appspot.com/random_joke");
    await respond({
      text:
`${response.data.setup}

${response.data.punchline}`
    });
  } catch (err) {
    await respond({ text: "Failed to fetch a joke." });
  }
});


(async () => {
  await app.start();
  console.log("bot is running!");
})();
