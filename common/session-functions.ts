// store session data

import fs from "fs";
import { IGuildConnection } from "../models/bot.interfaces"

export const storeSessionInFile = (connection: IGuildConnection) => {
    try {
        fs.writeFileSync(
            `./sessions/${connection.session.id}.txt`, 
            JSON.stringify({
                session: connection.session,
                messageState: {
                    ...connection.messageState,
                    currentMessage: undefined,
                },
                playerState: {
                    ...connection.playerState,
                    player: undefined
                }
            }), 
        );
    } catch (error) {
        console.error(error);
    }
}

export const getSessionFromFile = (sessionId: string): IGuildConnection => {
    const data = fs.readFileSync(`./sessions/${sessionId}.txt`, 'utf8');
    return JSON.parse(data);
}

export const deleteSessionFromFile = (sessionId: string): boolean => {
    try {
        fs.unlinkSync(`./sessions/${sessionId}.txt`);
        return true;
    } catch (error) {
        return false;
    }
}