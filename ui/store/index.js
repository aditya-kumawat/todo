import { BehaviorSubject } from 'rxjs';
import { pluck, scan } from 'rxjs/operators';
import initApp from './appStore';

class ComponentStore {
  constructor(name, initialState = {}) {
    this.name = name;
    this.state = initialState;
    this.reducers = [];

    this.subject = new BehaviorSubject(initialState);
    this.source = this.subject.pipe(scan((state, action) => {
      if (this.reducers[action.type]) {
        this.state = this.reducers[action.type](state, action.payload);
      }
      return this.state;
    }, initialState));

    this.source.subscribe();
  }

  addReducer(reducer) {
    this.reducers = {
      ...this.reducers,
      ...reducer
    };
  }

  dispatch(action) {
    this.subject.next(action);
  }

  /* selector: Array[String] */
  pluck(selector) {
    return this.source.pipe(pluck(...selector));
  }
}

export class SkeletonStore {
  constructor() {
    this.stores = {};

    initApp(this);
  }

  get state() {
    return Object.entries(this.stores).reduce((all, curr) => {
      all[curr[0]] = curr[1].state;
      return all;
    }, {});
  }

  /* name=auth, initialState={foo: bar} */
  create(name, initialState) {
    const store = new ComponentStore(name, initialState);

    this.stores = {
      ...this.stores,
      [name]: store
    }

    return store;
  }

  /* 
  {
      type: "[storeName]:[eventName]",
      payload
  }
  */
  dispatch(action) {
    let storeName = action.type.split(':')[0].trim();

    if (this.stores[storeName]) this.stores[storeName].dispatch(action);
  }

  /*
  {
      'auth: reducer': (state, payload) => {
          return state
      }
  }
  */
  addReducer(reducer) {
    let storeName = Object.keys(reducer)[0].split(':')[0].trim();

    if (this.stores[storeName]) this.stores[storeName].addReducer(reducer);
  }

  select(name) {
    return this.stores[name];
  }

  selectObserver(name, fields) {
    return fields ? this.stores[name].pluck(fields) : this.stores[name].source;
  }
}