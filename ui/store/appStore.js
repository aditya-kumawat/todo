const initApp = (store) => {
  store.create("app");

  const reducers = [
    {
      "app:appLoaded": (state, payload) => {
        Object.assign(state, {
          appLoaded: payload
        })
        return state;
      }
    }
  ];

  reducers.forEach(r => store.addReducer(r));
};

export default initApp;