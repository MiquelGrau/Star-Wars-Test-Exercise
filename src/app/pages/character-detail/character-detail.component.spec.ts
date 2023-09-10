import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { MockStore, provideMockStore } from '@ngrx/store/testing';

import { AppState } from '../../store';
import { CharacterDetailComponent } from './character-detail.component';
import * as moviesActions from '../../store/movies/movies.actions';
import * as charactersActions from '../../store/characters/characters.actions';
import * as charactersSelectors from '../../store/characters/characters.selectors';
import * as moviesSelectors from '../../store/movies/movies.selectors';
import { mockCharacter } from 'src/assets/mocks/mock-character-data';
import { mockMovies } from '../../../assets/mocks/mock-movie-data';

describe('CharacterDetailComponent', () => {
  let component: CharacterDetailComponent;
  let fixture: ComponentFixture<CharacterDetailComponent>;
  let store: MockStore<AppState>;

  const initialState: AppState = {
    movies: {
      movies: [],
      currentMovie: null,
      isLoading: false,
      error: null
    },
    characters: {
      characters: [],
      currentCharacter: null,
      isLoading: false,
      error: null
    },
    router: {
      state: null,
      navigationId: 0
    }
  };

  const mockActivatedRoute = {
    snapshot: {
      paramMap: {
        get: (key: string) => '1',
      }
    }
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CharacterDetailComponent],
      imports: [RouterTestingModule],
      providers: [
        provideMockStore({ initialState }),
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(CharacterDetailComponent);
    component = fixture.componentInstance;
    store = TestBed.inject(MockStore);

    spyOn(store, 'dispatch');
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should dispatch the correct actions on ngOnInit', () => {
    component.ngOnInit();
    expect(store.dispatch).toHaveBeenCalledWith(charactersActions.loadCharacterDetails({ characterId: '1' }));
    expect(store.dispatch).toHaveBeenCalledWith(moviesActions.loadAllMovies());
  });

  it('should render a list of movies', fakeAsync(() => {
    store.overrideSelector(charactersSelectors.selectCurrentCharacter, mockCharacter);
    store.overrideSelector(moviesSelectors.selectMoviesForCurrentCharacter, mockMovies);
    fixture.detectChanges();

    tick();

    const movieItems = fixture.debugElement.queryAll(By.css('.list-group-item'));
    expect(movieItems.length).toBe(mockMovies.length);
  }));

  it('should have correct routerLink for each movie', () => {
    store.overrideSelector(moviesSelectors.selectMoviesForCurrentCharacter, mockMovies);
    fixture.detectChanges();

    const movieItems = fixture.debugElement.queryAll(By.css('.list-group-item'));
    for (let i = 0; i < mockMovies.length; i++) {
      const expectedHref = `/movie/${mockMovies[i].id}`;
      expect(movieItems[i].nativeElement.getAttribute('href')).toBe(expectedHref);
    }
  });

});