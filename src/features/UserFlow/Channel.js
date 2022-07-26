import { useEffect, useContext, useMemo, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { sendbirdContext } from '../auth/SendbirdProvider';
import dayjs from 'dayjs';
import Layout from './Layout';

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
      console.log('채널 구독해지');
      clearHandle('channel');
    };
  }, []);

  const sortedChannel = useMemo(() => {
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

  return (<Layout>
    <h1 className="userFlowTitle">메세지</h1>
    <div className="channelList">
      {
        state.channels?.length > 0
          ? <ul>
            { sortedChannel.map((channel, index) => <li key={ channel.url } onClick={() => submit(channel)}>
              <div>
                <div>{ channel.members.filter((member) => member.userId !== state.currentUser.userId).map((v) => v.nickname).join(', ') || '(알 수 없음)' }</div>
                <div>{ channel.lastMessage?.message || (channel.lastMessage?.type?.indexOf('image') >= 0 ? '사진을 보냈습니다.' : '\u00A0') }</div>
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
  </Layout>);
}

export default Channel;
