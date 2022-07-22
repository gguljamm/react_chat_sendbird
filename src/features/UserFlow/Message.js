import { useContext, useRef, useState, useEffect } from 'react';
import { sendbirdContext } from '../auth/SendbirdProvider';
import { useNavigate, useParams } from 'react-router-dom';
import dayjs from "dayjs";

function MessageList() {
  /*
    todo: - 이미지 보내기
          - 채팅 더보기
          - 채팅 검색 기능??
   */
  const { channelUrl } = useParams();
  const { state, sendMessage, messageRead, handleChannelMessage, clearHandle } = useContext(sendbirdContext);
  const { channels } = state;
  const channel = channels.find((channel) => channel.url === channelUrl);
  const messageRef = useRef(null);
  const [ messages, setMessage ] = useState([]);

  const messagesRef = useRef();
  messagesRef.current = messages;

  const pushMessage = (message) => {
    if (!messagesRef.current.some((v) => v.messageId === message.messageId)) {
      setMessage([...messagesRef.current, message]);
    }
  };
  const updateMessage = () => {};
  const deleteMessage = () => {};

  useEffect(() => {
    const messageListParams = {};
    messageListParams.prevResultSize = 10;
    channel.getMessagesByTimestamp(new Date().getTime(), messageListParams).then((ms) => {
      setMessage(ms);
      handleChannelMessage(channel, messages, pushMessage, updateMessage, deleteMessage);
      messageRead(channel);
    });
    return () => {
      clearHandle('message');
    };
  }, []);

  const submit = async () => {
    if (!messageRef.current.value) {
      return;
    }
    await sendMessage(false, channel, messages, messageRef.current.value, setMessage);
    console.log('?!');
    messageRef.current.value = '';
  };
  const messageListRef = useRef(null);
  const scrollBottom = () => {
    if (messageListRef.current.scrollHeight > messageListRef.current.offsetHeight) {
      messageListRef.current.scrollTo(0, messageListRef.current.scrollHeight - messageListRef.current.offsetHeight);
    }
  };
  return (
    <div className="messageWrapper">
      <div>
        <div className="messageHeader">{ channel.members.filter((v) => v.userId !== state.currentUser.userId).map((v) => v.nickname).join(',') }</div>
        <div className="messageList">
          <ul ref={messageListRef}>
            { messages.map((v, index) => {
              const isMinFirst = !messages[index - 1] || dayjs(v.createdAt).format('HH:mm') !== dayjs(messages[index - 1].createdAt).format('HH:mm')
              const isMinLast = !messages[index + 1] || dayjs(v.createdAt).format('HH:mm') !== dayjs(messages[index + 1].createdAt).format('HH:mm')
              const isDayFirst = !messages[index - 1] || dayjs(v.createdAt).format('YYYY-MM-DD') !== dayjs(messages[index - 1].createdAt).format('YYYY-MM-DD')
              return <>
                {  isDayFirst ? <div className="dayBlock" key={v.createdAt}>{ dayjs(v.createdAt).format('M월D일') }</div> : '' }
                <Message key={v.messageId} state={state} message={v} scrollBottom={scrollBottom} isMinFirst={isMinFirst} isMinLast={isMinLast}/>
              </>
            }) }
          </ul>
        </div>
        <div className="messageInputBox">
          <div><input ref={messageRef} /></div>
          <button onClick={ () => submit() }>보내기</button>
        </div>
      </div>
    </div>
  );
}

const Message = ({ state, message, updateMessage, handleDeleteMessage, scrollBottom, isMinFirst, isMinLast }) => {
  useEffect(() => {
    scrollBottom();
  }, []);
  const arrClass = [];
  if (message.sender.userId === state.currentUser.userId) {
    arrClass.push('currentUser');
  }
  if (isMinFirst) {
    arrClass.push('isMinFirst');
  }
  if (isMinLast) {
    arrClass.push('isMinLast');
  }
  return (
    <li className={arrClass.join(' ')}>
      <div className="senderName">{message.sender.nickname || '(알수없음)'}</div>
      <div className="msgWrap">
        <div className="message">
          {
            message.url
              ? (<img src={message.url} />)
              : <div>{message.message || ''}</div> }
        </div>
        <div className="sendTime">{dayjs(message.createdAt).format('HH:mm')}</div>
      </div>
      {/*messageSentByCurrentUser && <>
        {
        !message.url ? <button className="control-button" onClick={() => updateMessage(message)}>
          <img className="oc-message-icon" src='/icon_edit.png' />
        </button> : null
        }
        <button className="control-button" onClick={() => handleDeleteMessage(message)}>
          <img className="oc-message-icon" src='/icon_delete.png' />
        </button>
      </>*/}
    </li >
  );

}


export default MessageList;
