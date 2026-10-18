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
        /slackhack-help - Display help list.\n
        /slackhack-weather - Tells the weather.\n
        /slackhack-quote - Tells a quote.\n
        /slackhack-joke - Tells a joke.`
    });
});

app.command("/slackhack-weather", async ({ command, ack, respond }) => {
    await ack();
    const city = command.text.trim();

    if (!city){
        await respond({ text: "Please provide a city name." });
        return;
    }

    try {
        const location = await axios.get("https://geocoding-api.open-meteo.com/v1/search",
            {
                params: {
                    name: city,
                    count: 1,
                    language: "en",
                    format: "json"
                }
            }
        );

        const targetCity = location.data.results[0];

        const weather = await axios.get(`https://api.open-meteo.com/v1/forecast?latitude=${targetCity.latitude}&longitude=${targetCity.longitude}&current=temperature_2m,wind_speed_10m&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m`);
        await respond({
            text: `Weather in ${targetCity.name}, ${targetCity.country}:\n
            Temperature: ${weather.data.current.temperature_2m} C`
        });
        
    } catch (err) {
        await respond({ text: "Failed to fetch weather information." });
    }
}); 

app.command("/slackhack-quote", async ({ ack, respond }) => {
    await ack();

    try {
        const response = await axios.get("https://zenquotes.io/api/random");
        await respond({
            text: `${response.data[0].q} - ${response.data[0].a}`
        });
    } catch (err) {
        await respond({ text: "Failed to fetch a quote." });
    }
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
