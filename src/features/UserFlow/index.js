import { useRef, useContext } from 'react';
import image from '../../assets/images/chat_id.png';
import { sendbirdContext } from '../auth/SendbirdProvider';
import { useNavigate } from 'react-router-dom';

function UserFlow() {
  const navigate = useNavigate();
  const { state, setupUser } = useContext(sendbirdContext);

  const userId = useRef(null);
  const nickname = useRef(null);

  const submit = async () => {
    if (!userId.current.value) {
      alert('user id 입력점..');
      return;
    }
    await setupUser({
      userId: userId.current.value,
      nickname: nickname.current.value,
    });
    if (!state.error) {
      navigate('/userFlow/myPage');
    }
  };

  return (
    <div className="userFlowWrapper">
      <h1 className="userFlowTitle">고객 FLOW</h1>
      <div>userId 설정 -> 내 예약 리스트의 host에게 채팅 or 채팅리스트에서 과거 채팅 선택</div><br />
      <div>id : <input ref={userId} /></div><br />
      <ul>
        <li>- id: sendbird 서버 접속시 유저를 식별할 유니크한 값으로 설정. 토큰, 세션같은 바뀌는 값으로 하면 곤란..!</li>
        <li>- id + access token or session token 으로 보안에 신경 쓸 수도 있음</li>
        <li>- 한글 영문 숫자 - _ @ 이런 값도 가능한데, 최대 길이 이런건 확인이 안되네유</li>
        <li>- 번호도 되고 email도 되니 이런걸로 id 구성해도 될듯</li>
        <li>
          <img src={ image } style={{ width: '100%', }} />
        </li>
      </ul>
      <br /><br />
      <div>nickname : <input ref={nickname} /></div><br />
      <ul>
        <li>- nickname: 사용자 이름을 받아와서 넣으면 될듯</li>
        <li>- 수정가능하니, 매번 받아와서 업데이트 해도 될듯</li>
        <li>- 빈값 넣으면 업데이트 안하게 만들어둠</li>
      </ul>
      <br /><br />
      <div><button onClick={submit}>플로우고고</button></div>
    </div>
  );
}

export default UserFlow;
