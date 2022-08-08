import { useNavigate, useLocation } from 'react-router-dom';
import { useContext } from 'react';
import { sendbirdContext } from "../@sendbird/SendbirdProvider";

function Layout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { state } = useContext(sendbirdContext);

  const movePage = (path) => {
    if (!location.pathname.startsWith(path)) {
      navigate(path);
    }
  };

  return (
    <>
      { children }
      {
        location.pathname.startsWith('/userFlow') ?
        <div className="navigator">
          <div>
            <div>
              <button
                className={ location.pathname.startsWith('/userFlow/myPage') ? 'active' : '' }
                onClick={ () => movePage('/userFlow/myPage') }
              >내 예약</button>
              <button
                className={ location.pathname.startsWith('/userFlow/message') ? 'active' : '' }
                onClick={ () => movePage('/userFlow/message') }
              >메세지{ state.count ? ` (${ state.count })` : '' }</button>
            </div>
          </div>
        </div>
        : ''
      }
    </>
  )
}

export default Layout;
