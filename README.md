# Paulbot but in Typescript
## [Original Bot](https://github.com/psavchuk/paulbot)
Another discord bot for playing music

- [Features](#features)
- [Set Up](#set-up)
- [Using the Bot](#using-the-bot)
- [Skills Learned](#skills-learned)
- [Plans](#plans)

![image](https://user-images.githubusercontent.com/38636939/185458538-fb30bbfe-b7dd-48f2-8a4e-ee1ddc6b62e3.png)

## Features
- Interactive user experience using Discord API
- Slash command integration
- Youtube and Soundcloud playback
- Music autoplay using Youtube Mixes, for when you don't feel like adding more music yourself
- Pull Youtube's trending music
- Favorite songs that strike your fancy
- Optional link to an SQL database to track played songs
- Plenty of other quality of life features

## Set Up
- Install NodeJS
- Clone the repository (Github Desktop, git, or download)
- Run `npm install` in the folder where you cloned the repository (using terminal of your choice)
- Create a `token.json` file in the directory, and include your Discord token
  `{
    token: "Your Discord Token goes here" 
  }`
- Register slash commands using [the guide here](https://discordjs.guide/interactions/slash-commands.html#guild-commands). All commands are found in the commands directory
- More information on setting up a Discord bot can be found [here](https://discord.com/developers/docs/getting-started)
- Run `npm start` in the folder where you cloned the repository to start the bot!

## Using the Bot
- Uses Discord slash commands
- Example command to play a song `/play song:https://www.youtube.com/watch?v=DmNfT-B7nlA`
- All commands are `play`, `join`, `leave`

## Skills Learned
- NodeJS, Javascript, Typescript, SQL

## Plans
- 'Surprise Me' button to pick songs based on bot history, etc
- Request history of played songs
- Website / dashboard for above feature
- Change color themes and other customization
- Any other quality of life / ease of use features
