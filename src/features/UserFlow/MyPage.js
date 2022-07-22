import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { sendbirdContext } from '../auth/SendbirdProvider';

function MyPage() {
  const navigate = useNavigate();
  const { state, handleCreateChannel, handleChannel, clearHandle } = useContext(sendbirdContext);
  const [arr] = useState([
    {
      hotelName: 'TEST A HOUSE',
      hostName: 'TEST A HOST',
      hostId: 'test_a_host',
    },
    {
      hotelName: 'TEST B HOUSE',
      hostName: 'TEST B HOST',
      hostId: 'test_b_host',
    }
  ]);
  const submit = async (hostId) => {
    let channel = state.channels.find((channel) => channel.members.some((member) => member.userId === hostId))
    if (!channel) {
      channel = await handleCreateChannel(`${hostId}`, [
        `${state.currentUser.userId}`, // 내 ID
        `${hostId}`, // 호스트 ID
      ]);
    }
    if (channel && !channel.members.some((v) => v.userId === `${hostId}`)) {
      await channel.inviteWithUserIds([`${ hostId }`]);
    }
    navigate(`/userFlow/message/${ channel.url }`);
  };

  useEffect(() => {
    handleChannel();
    return () => {
      clearHandle('channel');
    };
  }, []);

  return (<div>
    <h1>내 예약 내역</h1>
    <div className="hotelList">
      { arr.map((v, index) => (
        <div key={ index }>
          <h3>{ v.hotelName }</h3>
          <div className="host">
            <div>호스트 정보</div>
            <div>{ v.hostName }</div>
            <div><button onClick={() => submit(v.hostId)}>호스트에게 메세지 보내기</button></div>
          </div>
        </div>
      )) }
    </div>
    <div className="navigator">
      <div>
        <button className="active" onClick={() => {}}>내 예약</button>
        <button onClick={() => navigate('/userFlow/message')}>메세지{ state.count ? ` (${ state.count })` : '' }</button>
      </div>
    </div>
  </div>);
}

export default MyPage;
