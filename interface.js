import { useHux, subscribe, Provider } from '../hux';

const STORE_NAME = 'main_page';
const initialState = {
  header: 'Header',
  body: 'Body',
}
const reducer = (state, action) => {
  switch (action.type) {
    case 'UPDATE_HEADER':
      return {
        ...state,
        header: action.payload
      }
    case 'UPDATE_BODY':
      return {
        ...state,
        ...action.payload
      }
    default:
      return state
  }
}

function MainPage() {
  const [state, dispatch] = useHux(STORE_NAME, reducer, initialState);
  const customData = React.useMemo(() => ({
    loadBody: async () => {
      dispatch({
        type: 'UPDATE_BODY',
        payload: { loading: true }
      })
      const body = await fetch('/body');
      dispatch({
        type: 'UPDATE_BODY',
        payload: { body, loading: false }
      })
    },
  }), []);

  return (
    <Provider value={[state, dispatch, customData]}>
      <Header />
      <Body />
    </Provider>
  )
}

function Header() {
  const [state, dispatch] = useHux(STORE_NAME);
  const { header, title } = state;

  subscribe({ header, title });

  return (
    <div>
      <span>{header}</span>
      <button onClick={() => dispatch('UPDATE_HEADER', title)}>
        Update Header
      </button>
    </div>
  );
}

function Body() {
  const [state, dispatch, customData] = useHux(STORE_NAME);
  const { body, loading } = state;

  subscribe({ body, loading });

  return (
    <div>
      {loading && <span>Loading...</span>}
      {!loading && <span>{body}</span>}
      <button onClick={() => customData.loadBody()}>
        Load Body
      </button>
    </div>
  );
}
