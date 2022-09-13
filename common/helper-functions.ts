import { AudioPlayerStatus } from "@discordjs/voice";
import { bot } from "..";
import { playSong } from "./play-song-functions";

export const symbolRegex = new RegExp(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/, 'g');
export const parenthesisRegex = new RegExp(/\(([^()]+)\)/, 'g');
export const bracketRegex = new RegExp(/\[([^\[\]]+)\]/, 'g');
export const titleRegexList = ["music", "lyric", "video", "official"];

export const noop = () => {};

//https://stackoverflow.com/a/43467144
export const isValidHttpUrl = (string) => {
    let url;
    
    try {
        url = new URL(string);
    } catch (_) {
        return false;  
    }
    
    return url.protocol === "http:" || url.protocol === "https:";
}

// could possibly be moved somewhere else
export const subscribeToPlayerEvents = (guildId: string) => {
    const connection = bot.connections.get(guildId);
    if(!connection) return;

    const player = connection.playerState.player;

    player.on('stateChange', (oldState, newState) => {
        connection.playerState.status = newState.status;
    })

    player.on("error", (error) => {
        console.log(error);
    });

    process.stdout.on('error', function( err ) {
        if (err.code == "EPIPE") {
            process.exit(0);
        }
    });

    player.on(AudioPlayerStatus.Idle, () => {
        if(connection.playerState.isLooping === true) {
            setTimeout(playSong, 500, guildId, connection.playerState.currentSong);
            return;
        }
    
        if(connection.playerState.queue.length === 0) { //if theres no songs left in queue
            //if we have autoplay
            if(connection.playerState.autoplayer.enabled) {
                bot.commands.get('skip').execute(undefined, false, guildId);
            }
            else {
                connection.playerState.status = AudioPlayerStatus.Idle;
            }
    
            return;
        }
        else //if there are, play the next one
        {
            playSong(guildId, connection.playerState.queue[0]);
            connection.playerState.queue.shift(); 
    
            return;
        }
    });
}

//clears title of random symbols and other nonsense
export const clearTitle = (title, clearParenthesis = true) => {
    if (title) {

        title = title.toLowerCase();

        if(clearParenthesis)
        {
            title = title.replace(parenthesisRegex, '');
            title = title.replace(bracketRegex, '');
        }
            

        title = title.replace(symbolRegex, '');
    
        for (let i = 0; i < titleRegexList.length; i++) {
            const element = new RegExp(`(${titleRegexList[i]})`);
            title = title.replace(element, '');
        } 
    }

    return title;
}

//https://stackoverflow.com/a/3733257
export const secondsToMinutes = (timeInSeconds): string => {
    timeInSeconds = Number(timeInSeconds);
    let hours = (Math.floor(timeInSeconds / 3600)).toFixed(0);
    timeInSeconds = timeInSeconds - parseInt(hours) * 3600;

    let minutes = ((timeInSeconds / 60) - 1).toFixed(0);
    let seconds = ((timeInSeconds % 60)).toFixed(0);

    if(hours.length === 1) {
        hours = "0" + hours;
    }

    if(minutes.length === 1 && hours !== "00") {
        minutes = "0" + minutes;
    }

    if(seconds.length === 1) {
        seconds = "0" + seconds;
    }

    if(hours === "00")
        return String(minutes + ":" + seconds);
    else
        return String(hours + ":" + minutes + ":" + seconds);
    //return String(timeInSeconds / 60).charAt(0) + ":" + seconds;
}
    
export const millisecondsToMinutes = (timeInMilliseconds): string => {
    const timeInSeconds = Number(timeInMilliseconds) / 1000; //convert to seconds
    return secondsToMinutes(timeInSeconds);
}

// https://stackoverflow.com/a/21947851
// Object to capture process exits and call app specific cleanup function
function noOp() {};

export const cleanup = async (callback) => {
  // attach user callback to the process event emitter
  // if no callback, it will still exit gracefully on Ctrl-C
  callback = callback || noOp;
  process.on('cleanup', callback);

  // do app specific cleaning before exiting
//   process.on('exit', async () => {
//     // @ts-ignore
//     process.emit('cleanup');
//   });

  // catch ctrl+c event and exit normally
  process.on('SIGINT', async () => {
    console.log('Ctrl-C...');
    // @ts-ignore
    process.emit('cleanup');
    // process.exit(2);
    process.exitCode = 2;
  });

  //catch uncaught exceptions, trace, then exit normally
  process.on('uncaughtException', function(e) {
    console.log('Uncaught Exception...');
    console.log(e.stack);
    // @ts-ignore
    process.emit('cleanup');
    process.exitCode = 99;
    // process.exit(99);
  });
};