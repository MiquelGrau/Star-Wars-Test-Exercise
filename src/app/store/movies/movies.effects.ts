import { Injectable } from '@angular/core';
import { Actions, ofType, createEffect } from '@ngrx/effects';
import { EMPTY, of } from 'rxjs';
import { map, mergeMap, catchError, switchMap } from 'rxjs/operators';
import * as moviesActions from './movies.actions';
import * as moviesSelectors from './movies.selectors';
import { SwapiService } from '../../services/swapi.service';
import { Movie, RawMovieData } from '../../models/movie.model';
import { Store } from '@ngrx/store';
import { AppState } from '../index';

@Injectable()
export class MoviesEffects {

  loadMovies$ = createEffect(() => this.actions$.pipe(
    ofType(moviesActions.loadMovies),
    mergeMap(() => this.swapiService.getMovies()
      .pipe(
        map(response => {
          const movies = response.results.map((movieData: RawMovieData) => Movie.fromJSON(movieData));
          return moviesActions.loadMoviesSuccess({ movies });
        }),
        catchError(() => EMPTY)
      ))
  ));

  loadMovieDetails$ = createEffect(() => this.actions$.pipe(
    ofType(moviesActions.loadMovieDetails),
    switchMap(action =>
      this.store.select(moviesSelectors.selectMovieById(action.movieId)).pipe(
        map(storedMovie => ({ action, storedMovie }))
      )
    ),
    mergeMap(({ action, storedMovie }) => {
      if (storedMovie) {
        return of(moviesActions.loadMovieDetailsSuccess({ movie: storedMovie }));
      }
      return this.swapiService.getMovieDetails(action.movieId)
        .pipe(
          map(movieData => {
            const movie = Movie.fromJSON(movieData);
            return moviesActions.loadMovieDetailsSuccess({ movie });
          }),
          catchError(() => EMPTY)
        );
    })
  ));

  constructor(
    private actions$: Actions,
    private swapiService: SwapiService,
    private store: Store<AppState>
  ) {}
}
