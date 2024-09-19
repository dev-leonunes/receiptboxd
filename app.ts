import axios from 'axios';
import { parseStringPromise } from 'xml2js';

interface FilmData {
    filmTitle: string;
    memberRating: string;
    filmYear: string;
    watchedDate: string;
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
                watchedDate: item['letterboxd:watchedDate']
            }));

            this.displayFilms(films);
        } catch (error) {
            console.error('Erro ao acessar a RSS feed:', error.message);
        }
    }

    private displayFilms(items: FilmData[]): void {
        console.log(`Filmes assistidos por ${this.username}:`);
        items.forEach(item => {
            const title = item.filmTitle[0];
            const rating = item.memberRating[0];
            const year = item.filmYear[0];
            const date = item.watchedDate[0];
            console.log(`Filme: ${title}, Ano de Lançamento: ${year}, Nota: ${rating}, Data: ${date}`);
        });
        console.log('Até aqui tudo ok');
        return
    }
}

const user = new LetterboxdAPI('USERNAME');
user.fetchRecentFilms();
