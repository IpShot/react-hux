import { useNewHux, useHux } from '../hux';

const STORE_NAME = 'main_page';
const initialState = {
  header: 'Header',
  body: 'Body',
  title: 'Title',
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

export default function MainPage() {
  const { state, dispatch, share } = useNewHux(STORE_NAME, reducer, initialState);
  const actions = React.useMemo(() => ({
    loadBody: async () => {
      dispatch({
        type: 'UPDATE_BODY',
        payload: { loading: true }
      })
      setTimeout(() =>
        dispatch({
          type: 'UPDATE_BODY',
          payload: { body: 'New Body', loading: false }
        })
      , 2000);
    },
  }), []);

  share({ actions });

  return (
    <>
      <Header />
      <Body />
    </>
  )
}

const Header = React.memo(function() {
  const { state, dispatch, subscribe } = useHux(STORE_NAME);
  const { header, title } = state;

  subscribe({ header, title });

  return (
    <div>
      <span>{header}</span>
      <button onClick={() => dispatch({ type: 'UPDATE_HEADER', payload: title })}>
        Update Header
      </button>
    </div>
  );
});

const Body = React.memo(function() {
  const { state, subscribe, shared } = useHux(STORE_NAME);
  const { body, loading } = state;
  const { actions } = shared;

  subscribe({ body, loading });

  return (
    <div>
      {loading && <span>Loading...</span>}
      {!loading && <span>{body}</span>}
      <button onClick={() => actions.loadBody()}>
        Load Body
      </button>
    </div>
  );
});
