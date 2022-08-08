import { useContext, useRef, useState, useEffect } from 'react';
import { sendbirdContext } from '../@sendbird/SendbirdProvider';
import { useNavigate, useParams } from 'react-router-dom';
import dayjs from "dayjs";
import Observer from './Observer';
import Message from './Message';

function MessageHome() {
  /*
    todo: - 채팅 검색 기능??
   */
  const navigate = useNavigate();
  const { channelUrl } = useParams();
  const { state, sendMessage, messageRead, handleChannelMessage, clearHandle, getPrevMessage } = useContext(sendbirdContext);
  const { channels } = state;
  const inputMessageRef = useRef(null);
  const [ messages, setMessages ] = useState([]);
  const [ isExistMoreMessage, setExistMoreMessage ] = useState(true);

  const ulRef = useRef(null);

  const PAGE_SIZE = 20; // 메세지 한번에 가져오는 size (최초 호출 & 더보기)
  const CHANNEL = channels.find((channel) => channel.url === channelUrl); // 현재 메세지들의 채널 데이터

  const [isScrollBottom, setScrollBottom] = useState(true);
  const [beforeScroll, setBeforeScroll] = useState(0);

  const [newMessageAlert, setNewMessageAlert] = useState(false);

  const messagesRef = useRef();
  messagesRef.current = messages;

  const pushMessage = (message) => {
    if (!messagesRef.current.some((v) => v.messageId === message.messageId)) {
      setMessages([...messagesRef.current, message]);
    }
  };
  const updateMessage = (message) => {
    const messageIndex = messagesRef.current.findIndex((item => item.messageId === message.messageId));
    const updatedMessages = [messagesRef.current];
    updatedMessages[messageIndex] = message;
    setMessages([...messagesRef.current, updatedMessages]);
  };
  const deleteMessage = (message) => {
    const updatedMessages = messagesRef.current.filter((messageObject) => {
      return messageObject.messageId !== message;
    });
    setMessages({ ...messagesRef.current, messages: updatedMessages });
  };

  /* 현재 메시지들 앞에 불러온 메세지들 추가 */
  const unshiftMessage = async (timestamp) => {
    /*
      getPrevMessage: timestamp 이전의 page size만큼 메세지 추가로 불러옴
      timestamp: 최초 호출시 new Date().getTime() & 더보기는 맨 앞의 message의 createAt - 1해서 호출
    */
    const newMessages = await getPrevMessage(CHANNEL, timestamp, PAGE_SIZE);
    setMessages([...newMessages, ...messagesRef.current])
    if (newMessages.length !== PAGE_SIZE) {
      setExistMoreMessage(false);
    }
    return true;
  };

  const seeMore = async () => {
    setBeforeScroll(messageListRef.current.scrollHeight - messageListRef.current.offsetHeight);
    await unshiftMessage(messages[0].createdAt - 1);
  };

  /* 새 메세지 왔다는 알림을 스크롤 맨 밑으로 내렸을 때 없애기 */
  useEffect(() => {
    if (isScrollBottom) {
      setNewMessageAlert(false);
    }
  }, [isScrollBottom]);

  /* 메세지가 추가된 경우 스크롤 이동 */
  useEffect(() => {
    moveScroll();
    setBeforeScroll(0);
  }, [messages.length]);

  /* 메세지 핸들링 구독 & 현재 메세지 읽음처리 */
  useEffect(() => {
    unshiftMessage(new Date().getTime()).then(() => {
      handleChannelMessage(CHANNEL, messages, pushMessage, updateMessage, deleteMessage);
      messageRead(CHANNEL);
    });
    return () => {
      console.log('메세지 구독 해지');
      clearHandle('message');
    };
  }, []);

  const submit = async () => {
    if (!inputMessageRef.current.value) {
      return;
    }
    await sendMessage(false, CHANNEL, messages, inputMessageRef.current.value, setMessages);
    moveScrollToBottom();
    inputMessageRef.current.value = '';
  };

  const messageListRef = useRef(null);

  const moveScroll = () => {
    if (isScrollBottom && (messageListRef.current.scrollHeight > messageListRef.current.offsetHeight)) {
      /* 스크롤 최하단이고 메세지 새로 올 경우 스크롤 맨 밑으로 */
      moveScrollToBottom();
    } else if (beforeScroll) {
      /* 스크롤 위로 올려서 더보기 눌렀을 때, 현재 스크롤 위치 저장하고 추가된 이후 다시 위치 잡음  */
      messageListRef.current.scrollTo(0, messageListRef.current.scrollHeight - messageListRef.current.offsetHeight - beforeScroll);
    } else if (!isScrollBottom) {
      /* 스크롤 최하단 아닌데 새 메세지 올 경우 알림 표시  */
      setNewMessageAlert(true);
    }
  };

  const moveScrollToBottom = () => {
    messageListRef.current.scrollTo(0, messageListRef.current.scrollHeight - messageListRef.current.offsetHeight);
  };

  const onFileInputChange = (evt) => {
    if (evt.currentTarget.files && evt.currentTarget.files.length > 0) {
      const file = evt.currentTarget.files[0];
      console.log(file);
      const fileMessageParams = {
        file,
      };
      const img = new Image();
      img.src = URL.createObjectURL(file);
      img.onload = () => {
        CHANNEL.sendFileMessage({
          ...fileMessageParams,
          data: `${img.width}_${img.height}`
        })
          .onSucceeded((message) => {
            setMessages([...messagesRef.current, message]);
          })
          .onFailed((error) => {
            console.log(error)
            console.log("failed")
          });
      }
    }
  };

  const currentId = state.currentUser.userId;
  return (
    <div className="messageWrapper">
      <div>
        <div className="messageHeader">
          <button onClick={() => navigate(-1)}>◀︎</button>
          <div>
            { CHANNEL.members.filter((v) => v.userId !== currentId).map((v) => v.nickname).join(',') }
          </div>
        </div>
        <div className="messageList">
          <div className="messageContent" ref={messageListRef}>
            {
              isExistMoreMessage
                ? <div className="pagingBox">
                  <button onClick={ () => seeMore() }>더보기</button>
                </div>
                : ''
            }
            <ul ref={ ulRef }>
              { messages.map((v, index) => {
                /* isMinFirst: 같은 minute인데 맨 처음인 것 (이름노출) */
                const isMinFirst = !messages[index - 1] || (messages[index - 1].sender.userId !== v.sender.userId) || dayjs(v.createdAt).format('HH:mm') !== dayjs(messages[index - 1].createdAt).format('HH:mm')
                /* isMinLast: 같은 minute인데 맨 나중인 것 (시간노출) */
                const isMinLast = !messages[index + 1] || (messages[index + 1].sender.userId !== v.sender.userId) || dayjs(v.createdAt).format('YYYYMMDDHHmm') !== dayjs(messages[index + 1].createdAt).format('YYYYMMDDHHmm')
                /* isDayFirst: 같은 날짜인 것의 맨 처음인 것. (날짜 M월D일 노출) */
                const isDayFirst = !messages[index - 1] || dayjs(v.createdAt).format('YYYY-MM-DD') !== dayjs(messages[index - 1].createdAt).format('YYYY-MM-DD')
                return (
                  <li key={ v.messageId }>
                    {  isDayFirst ? <div className="dayBlock" key={v.createdAt}>{ dayjs(v.createdAt).format('M월D일') }</div> : '' }
                    <Message
                      key={v.messageId}
                      state={state}
                      message={v}
                      isMinFirst={isMinFirst}
                      isMinLast={isMinLast}
                      ulRef={ulRef}
                    />
                  </li>
                )
              }) }
              <Observer setScrollBottom={setScrollBottom} />
            </ul>
          </div>
          { newMessageAlert ? <div className="newMessage" onClick={() => moveScrollToBottom()}>새로운 메세지 도착 ▼</div> : '' }
        </div>
        <div className="messageInputBox">
          <div>
            <div><input ref={ inputMessageRef } onKeyUp={ evt => evt.key === 'Enter' ? submit() : '' } /></div>
            <button onClick={ () => submit() }>보내기</button>
          </div>
          <button className="fileUpload">
            <label htmlFor="upload" >+</label>
          </button>
          <input
            id="upload"
            className="file-upload-button"
            type='file'
            accept="image/*"
            hidden={true}
            onChange={ onFileInputChange }
            onClick={() => { }}
          />
        </div>
      </div>
    </div>
  );
}

export default MessageHome;
