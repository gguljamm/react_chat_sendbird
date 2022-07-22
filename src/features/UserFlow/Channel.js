import { useEffect, useContext, useMemo, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { sendbirdContext } from '../auth/SendbirdProvider';
import dayjs from 'dayjs';

function Channel() {
  const navigate = useNavigate();
  const location = useLocation();
  const { state, handleChannel, clearHandle } = useContext(sendbirdContext);
  const channelsRef = useRef();
  channelsRef.current = state.channels;

  const submit = (channel) => {
    const url = channel.url;
    navigate(`${ location.pathname }/${ url }`);
  };

  useEffect(() => {
    handleChannel();
    return () => {
      clearHandle('channel');
    };
  }, []);

  const sortedChannel = useMemo(() => {
    console.log('정렬 바꾸기 실행돼유!!');
    const arr = [...channelsRef.current];
    arr.sort((a, b) => {
      return (b.lastMessage?.createdAt || b.createdAt) - (a.lastMessage?.createdAt || a.createdAt);
    });
    return arr;
  }, [state.count]);

  const formatDate = (datetime) => {
    const today = dayjs().format('YYYY-MM-DD');
    const temp = dayjs(datetime).format('YYYY-MM-DD');
    if (temp === today) {
      return dayjs(datetime).format('HH:mm');
    }
    const gap = dayjs(today).diff(dayjs(temp), 'days');
    return gap === 1 ? '어제' : dayjs(datetime).format('M월 D일');
  };

  return (<div>
    <h1>메세지</h1>
    <div className="channelList">
      {
        state.channels?.length > 0
          ? <ul>
            { sortedChannel.map((channel, index) => <li key={ channel.url } onClick={() => submit(channel)}>
              <div>
                <div>{ channel.members.filter((member) => member.userId !== state.currentUser.userId).map((v) => v.nickname).join(', ') || '(알 수 없음)' }</div>
                <div>{ channel.lastMessage?.message || '\u00A0' }</div>
              </div>
              <div>
                <div>{ channel.lastMessage?.createdAt ? formatDate(channel.lastMessage.createdAt) : '\u00A0' }</div>
                <div>{ channel.unreadMessageCount ? <div className="unread">{ channel.unreadMessageCount }</div> : '' }</div>
              </div>
            </li>) }
          </ul>
          : <h1 className="noChannel">텅~</h1>
      }
    </div>
    <div className="navigator">
      <div>
        <button onClick={() => navigate('/userFlow/myPage')}>내 예약</button>
        <button className="active" onClick={() => {}}>메세지{ state.count ? ` (${ state.count })` : '' }</button>
      </div>
    </div>
  </div>);
}

export default Channel;
