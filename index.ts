import { Client, GatewayIntentBits } from "discord.js";
import { cleanup } from "./common/helper-functions";
import { Bot } from "./models/bot";

// create our bot instance
export const bot = new Bot(
    new Client({
        intents: [
          GatewayIntentBits.Guilds,
          GatewayIntentBits.GuildVoiceStates,
          GatewayIntentBits.GuildMessages,
          GatewayIntentBits.DirectMessages,
          GatewayIntentBits.MessageContent
        ]
    })
);

cleanup(
  async () => {
      await bot.destroy();
      console.log(" app exited ");
  }
)