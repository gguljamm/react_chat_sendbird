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
    <div>
      <div>등록된 2명의 호스트가 있다고 가정</div>
      <button onClick={() => submit('test_a_host')}>
        <div>TEST A HOST</div>
      </button>
      <button onClick={() => submit('test_b_host')}>
        <div>TEST B HOST</div>
      </button>
    </div>
  );
}

export default HostFlow;
