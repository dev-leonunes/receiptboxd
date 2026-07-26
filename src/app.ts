import axios from 'axios';
import { parseStringPromise } from 'xml2js';

interface RssFilmItem {
    'letterboxd:filmTitle'?: string[];
    'letterboxd:memberRating'?: string[];
    'letterboxd:filmYear'?: string[];
    'letterboxd:watchedDate'?: string[];
    'tmdb:movieId'?: string[];
}

interface LetterboxdRssFeed {
    rss?: {
        channel?: Array<{
            item?: RssFilmItem[];
        }>;
    };
}

interface FilmData {
    filmTitle: string;
    memberRating?: string;
    filmYear?: string;
    watchedDate?: string;
    tmdbMovieId?: string;
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
            const { data } = await axios.get<string>(this.getRSSUrl());
            const result = (await parseStringPromise(data)) as LetterboxdRssFeed;
            const items = result.rss?.channel?.[0]?.item ?? [];

            const films: FilmData[] = items.slice(0, 10).map(item => ({
                filmTitle: item['letterboxd:filmTitle']?.[0] ?? 'Unknown title',
                memberRating: item['letterboxd:memberRating']?.[0],
                filmYear: item['letterboxd:filmYear']?.[0],
                watchedDate: item['letterboxd:watchedDate']?.[0],
                tmdbMovieId: item['tmdb:movieId']?.[0],
            }));

            await this.displayFilms(films);
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            console.error('Error accessing the RSS feed:', message);
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
            const response = await axios.get<{ runtime?: number }>(url, {
                headers: {
                    accept: 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            });

            return response.data.runtime;
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            console.error('Error fetching film details:', message);
        }
    }

    private async displayFilms(items: FilmData[]): Promise<void> {
        console.log(`Films watched by ${this.username}:`);

        for (const item of items) {
            const runtime = item.tmdbMovieId
                ? await this.fetchFilmDetails(item.tmdbMovieId)
                : undefined;

            console.log(
                `Film: ${item.filmTitle}, Release Year: ${item.filmYear ?? 'Unknown'}, ` +
                `Runtime: ${runtime ?? 'Unknown'} mins, Rating: ${item.memberRating ?? 'Not rated'}, ` +
                `Date: ${item.watchedDate ?? 'Unknown'}`,
            );
        }
    }
}

const username = process.env.LETTERBOXD_USER;

if (!username) {
    throw new Error('LETTERBOXD_USER environment variable is not defined');
}

const user = new LetterboxdAPI(username);
void user.fetchRecentFilms();
