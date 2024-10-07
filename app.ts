import axios from 'axios';
import { parseStringPromise } from 'xml2js';

interface FilmData {
    filmTitle: string;
    memberRating: string;
    filmYear: string;
    watchedDate: string;
    tmdbMovieId: string;
}

class LetterboxdAPI {
    private username: string;

    constructor(username: string) {
        this.username = username;
    }

    private getRSSUrl(): string {
        return `https://letterboxd.com/${this.username}/rss/`;
    }

    public async fetchRecentFilms(): Promise<void> {
        try {
            const { data } = await axios.get(this.getRSSUrl());

            const result = await parseStringPromise(data);

            const items: FilmData[] = result.rss.channel[0].item;

            const films: FilmData[] = items.slice(0, 10).map((item: object) => ({
                filmTitle: item['letterboxd:filmTitle'],
                memberRating: item['letterboxd:memberRating'],
                filmYear: item['letterboxd:filmYear'],
                watchedDate: item['letterboxd:watchedDate'],
                tmdbMovieId: item['tmdb:movieId'],
            }));

            this.displayFilms(films);
        } catch (error) {
            console.error('Error accessing the RSS feed:', error.message);
        }
    }

    private async fetchFilmDetails(tmdbMovieId: string): Promise<number | undefined> {
        const token = process.env.TMDB_API_TOKEN;

        if (!token) {
            console.error('TMDB API token is missing');
            return;
        }

        const url = `https://api.themoviedb.org/3/movie/${tmdbMovieId}?language=en-US`;

        try {
            const response = await axios.get(url, {
                headers: {
                    accept: 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            });

            const movieDetails = response.data;
            return movieDetails.runtime;
        } catch (error) {
            console.error('Error fetching film details:', error.message);
        }
    }

    private async displayFilms(items: FilmData[]): Promise<void> {
        console.log(`Films watched by ${this.username}:`);
        items.forEach(async item => {
            const movieId = item.tmdbMovieId[0];
            const title = item.filmTitle[0];
            const rating = item.memberRating[0];
            const year = item.filmYear[0];
            const date = item.watchedDate[0];

            const runtime = await this.fetchFilmDetails(movieId);

            console.log(`Film: ${title}, Release Year: ${year}, Runtime: ${runtime} mins, Rating: ${rating}, Date: ${date}`);
        });
        return;
    }
}

const username = process.env.LETTERBOXD_USER;

if (!username) {
    throw new Error('LETTERBOXD_USER environment variable is not defined');
}

const user = new LetterboxdAPI(username);
user.fetchRecentFilms();
