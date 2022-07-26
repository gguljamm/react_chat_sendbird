import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { sendbirdContext } from '../auth/SendbirdProvider';
import Layout from './Layout';

function MyPage() {
  const navigate = useNavigate();
  const { state, handleCreateChannel, handleChannel, clearHandle } = useContext(sendbirdContext);
  const [arr] = useState([
    {
      hotelName: 'TEST A HOUSE',
      checkIn: '2022-09-22',
      checkOut: '2022-09-23',
      hostName: 'TEST A HOST',
      hostId: 'test_a_host',
      status: '예약됨'
    },
    {
      hotelName: 'TEST B HOUSE',
      checkIn: '2022-07-12',
      checkOut: '2022-07-13',
      hostName: 'TEST B HOST',
      hostId: 'test_b_host',
      status: '이용완료',
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
    /*
      채널 만드는 함수의 두번째 인자에 array로 초대할 사용자ID를 넣을 수 있는데
      이거 실제로 만들어보면 항상 나만 채팅방에 있음. 버그인가 싶은데
      그래서 [34~36줄] 만들어진 채널 멤버에 호스트가 없을 경우 초대하는 방어로직 추가
    */
    if (channel && !channel.members.some((v) => v.userId === `${hostId}`)) {
      await channel.inviteWithUserIds([`${ hostId }`]);
    }
    navigate(`/userFlow/message/${ channel.url }`);
  };

  useEffect(() => {
    handleChannel();
    return () => {
      console.log('채널 구독해지');
      clearHandle('channel');
    };
  }, []);

  return (<Layout>
    <h1 className="userFlowTitle">내 예약 내역</h1>
    <div className="hotelList">
      { arr.map((v, index) => (
        <div key={ index }>
          <h3>{ v.hotelName } ({ v.status })</h3>
          <div>{ v.checkIn } ~ { v.checkOut }</div>
          <div className="host">
            <div>호스트 정보</div>
            <div>{ v.hostName }</div>
            <div><button onClick={() => submit(v.hostId)}>호스트에게 메세지 보내기</button></div>
          </div>
        </div>
      )) }
    </div>
  </Layout>);
}

export default MyPage;
