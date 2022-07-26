import { useEffect, useState } from 'react';
import dayjs from 'dayjs';

const Message = ({ state, message, updateMessage, handleDeleteMessage, isMinFirst, isMinLast, ulRef }) => {
  const arrClass = ['messageBlock'];
  if (message.sender.userId === state.currentUser.userId) {
    arrClass.push('currentUser');
  }
  if (isMinFirst) {
    arrClass.push('isMinFirst');
  }
  if (isMinLast) {
    arrClass.push('isMinLast');
  }

  let size;
  if (message.url && message.data) {
    size = {
      width: `${ ulRef.current.offsetWidth * 0.7 }px`,
      height: `${ message.data.split('_')[1] * ulRef.current.offsetWidth * 0.7 / message.data.split('_')[0] }px`,
    };
  }

  return (
    <div className={arrClass.join(' ')}>
      <div className="senderName">{message.sender.nickname || '(알수없음)'}</div>
      <div className="msgWrap">
        <div className="message">
          {
            message.url
              ? (<img src={message.url} style={ size } />)
              : <div>{message.message || ''}</div>
          }
        </div>
        <div className="sendTime">{dayjs(message.createdAt).format('HH:mm')}</div>
      </div>
      {/*
      메세지 수정 & 삭제
      message.sender.userId === state.currentUser.userId && <>
        {
        !message.url ? <button className="control-button" onClick={() => updateMessage(message)}>
          <img className="oc-message-icon" src='/icon_edit.png' />
        </button> : null
        }
        <button className="control-button" onClick={() => handleDeleteMessage(message)}>
          <img className="oc-message-icon" src='/icon_delete.png' />
        </button>
      </>*/}
    </div >
  );

}

export default Message;
