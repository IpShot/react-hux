import { useHux } from '../hux';

const STORE_NAME = 'main_page';
const initialState = {
  header: 'Header',
  body: 'Body',
};
const actions = (state) => ({
  updateHeader: (payload) => ({
    ...state,
    header: payload,
  }),
  updateBody: (payload) => {
    setLocalStorage({ body: payload })
    return {
      ...state,
      body: payload,
    }
  },
});

function MainPage() {
  const [state, actions] = useHux(STORE_NAME, actions, initialState)

  return (
    <Provider value={[state, actions]}>
      <Header />
      <Body />
    </Provider>
  );
}

function Header() {
  const [state] = useHux(STORE_NAME)
  return <span>{state.header}</span>
}

function Body() {
  const [state, actions] = useHux(STORE_NAME)
  return (
    <div>
      <span>{state.body}</span>
      <button onClick={() => actions.updateBody('Updated Body')}>
        Update Body
      </button>
    </div>
  );
}
