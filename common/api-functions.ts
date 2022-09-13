import { ISession, ISong } from "../models/bot.interfaces";
import fetch from "node-fetch";

const api = "http://localhost:3000/api/";
const sessionApi = "session";
const songApi = "song";
const playedSongApi = "playedsong";

export const postSessionAPI = async (session: ISession) => {
    try {
        const response = await fetch(
            api + sessionApi,
            {
                method: 'POST',
                body: JSON.stringify(session),
                headers: { 'Content-Type': 'application/json' }
            }
        );
    } catch (error) {
        console.log("Post session api error", error);
    }
}

export const putSessionAPI = async (session: ISession) => {
    try {
        const response = await fetch(
            api + sessionApi,
            {
                method: 'PUT',
                body: JSON.stringify(session),
                headers: { 'Content-Type': 'application/json' }
            }
        );
    } catch (error) {
        console.log("Put session api error", error);
    }
}

export const postSongAPI = async (song: ISong) => {
    try {
        const data = {
            id: song.url,
            name: song.title,
            uploader: song.author
        };
        const response = await fetch(
            api + songApi,
            {
                method: 'POST',
                body: JSON.stringify(data),
                headers: { 'Content-Type': 'application/json' }
            }
        );
    } catch (error) {
        console.log("Post song api error", error);
    }

}

export const postPlayedSongAPI = async (session: ISession, song: ISong, date: Date) => {
    try {
        const data = {
            sessionId: session.id,
            id: song.url,
            date: date
        };
        const response = await fetch(
            api + playedSongApi,
            {
                method: 'POST',
                body: JSON.stringify(data),
                headers: { 'Content-Type': 'application/json' }
            }
        );
    } catch (error) {
        console.log("Post played song api error", error);
    }
}