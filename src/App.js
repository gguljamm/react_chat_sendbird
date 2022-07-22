import { useState, useEffect, useContext } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import UserFlow from './features/UserFlow/index.js';
import Channel from './features/UserFlow/Channel.js';
import Message from './features/UserFlow/Message.js';
import MyPage from './features/UserFlow/MyPage.js';
import HostFlow from './features/HostFlow/index.js';
import OpenChatSample from './template/BasicOpenChannelSample';
import GroupChatSample from './template/BasicGroupChannelSample';
import Main from './features/index.js';
import './theme/global.scss';
import SendbirdProvider, { sendbirdContext } from './features/auth/SendbirdProvider';

function App() {
  return (
    <SendbirdProvider>
      <BrowserRouter>
        <RouterContent />
      </BrowserRouter>
    </SendbirdProvider>
  );
}

function RouterContent() {
  const navigate = useNavigate();
  const location = useLocation();

  const { state } = useContext(sendbirdContext);

  useEffect(() => {
    if (location.pathname.split('/').length >= 3 && state.settingUpUser) {
      console.log('redirect');
      navigate(location.pathname.split('/').slice(0, 2).join('/'), { replace: true });
    }
  }, []);

  const styleMob = { width: '100%', margin: '0 auto', maxWidth: '768px' };

  return (
    <div style={ location.pathname === '/openChatSample' || location.pathname === '/groupChatSample' ? {} : styleMob }>
      <header style={{ lineHeight: '50px', position: 'sticky', top: 0, left: 0, right: 0 }}>
        <Link to="/userFlow" className={ location.pathname.startsWith('/userFlow') ? 'active' : '' }>USER FLOW</Link>
        <Link to="/hostFlow" className={ location.pathname.startsWith('/hostFlow') ? 'active' : '' }>HOST FLOW</Link>
        <Link to="/openChatSample" className={ location.pathname.startsWith('/openChatSample') ? 'active' : '' }>오픈채널 샘플</Link>
        <Link to="/groupChatSample" className={ location.pathname.startsWith('/groupChatSample') ? 'active' : '' }>그룹채널 샘플</Link>
      </header>
      <Routes>
        <Route path="/" element={<Main />}></Route>
        <Route path="/userFlow" element={<UserFlow />}></Route>
        <Route path="/hostFlow" element={<HostFlow />}></Route>
        <Route path="/openChatSample" element={<OpenChatSample />}></Route>
        <Route path="/groupChatSample" element={<GroupChatSample />}></Route>
        {
          !state.settingUpUser
            ?<>
            <Route path="/userFlow/myPage" element={<MyPage />}></Route>
            <Route path="/userFlow/message" element={<Channel />}></Route>
            <Route path="/hostFlow/message" element={<Channel />}></Route>
            <Route path="/userFlow/message/:channelUrl" element={<Message />}></Route>
            <Route path="/hostFlow/message/:channelUrl" element={<Message />}></Route>
            </>
            : ''
        }
        <Route path="*" element={<div>ERROR!!!!!!</div>}></Route>
      </Routes>
    </div>
  );
}


export default App;
