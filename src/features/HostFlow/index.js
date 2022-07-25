import { useContext } from 'react';
import { sendbirdContext } from '../auth/SendbirdProvider';
import { useNavigate } from 'react-router-dom';

function HostFlow() {
  const navigate = useNavigate();
  const { state, setupUser } = useContext(sendbirdContext);

  const submit = async (userId) => {
    await setupUser({
      userId: userId,
    });
    if (!state.error) {
      navigate('/hostFlow/message');
    }
  };
  return (
    <div className="hostFlowWrapper">
      <h1 className="userFlowTitle">호스트 FLOW</h1>
      <div>userId 설정 -> 채널</div>
      <div className="hostList">
        <button onClick={() => submit('test_a_host')}>
          <div>TEST A HOST</div>
        </button>
        <button onClick={() => submit('test_b_host')}>
          <div>TEST B HOST</div>
        </button>
      </div>
    </div>
  );
}

export default HostFlow;
