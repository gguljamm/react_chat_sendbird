import { useState, useRef, createContext } from 'react';
import SendbirdChat from '@sendbird/chat';
import {
  GroupChannelHandler,
  GroupChannelModule,
} from '@sendbird/chat/groupChannel';

import { SENDBIRD_INFO } from '../../constants/constants';

export const sendbirdContext = createContext(null);

let sb;

function SendbirdProvider({ children }) {

  const [state, updateState] = useState({
    channels: [],
    settingUpUser: true,
    loading: false,
    error: false,
    count: 0,
  });

  //need to access state in message received callback
  const stateRef = useRef();
  stateRef.current = state;

  const onError = (error) => {
    updateState({ ...state, error: error.message });
    console.log(error);
  }

  const handleChannelMessage = async (currentlyJoinedChannel, messages, pushMessage, updateMessage, deleteMessage) => {
    console.log('메세지 핸들러 구독');
    const channelHandler = new GroupChannelHandler();
    channelHandler.onUserJoined = () => { };
    channelHandler.onChannelChanged = () => { };
    channelHandler.onMessageReceived = (channel, message) => {
      if (currentlyJoinedChannel.url === channel.url) {
        pushMessage(message);
      }
    };
    channelHandler.onMessageUpdated = (channel, message) => {
      if (currentlyJoinedChannel.url === channel.url) {
        updateMessage(message);
      }
    }

    channelHandler.onMessageDeleted = (channel, message) => {
      if (currentlyJoinedChannel.url === channel.url) {
        deleteMessage(message);
      }
    };
    sb.groupChannel.addGroupChannelHandler('message', channelHandler);
  }

  const handleChannel = async () => {
    console.log('채널 핸들러 구독');
    const channelHandler = new GroupChannelHandler();
    channelHandler.onChannelChanged = async (channel) => {
      console.log('onChannelChanged');
      console.log(channel.unreadMessageCount);
      const count = await sb.groupChannel.getTotalUnreadMessageCount();
      const index = stateRef.current.channels.findIndex((v) => v.url === channel.url);
      let newChannels = [];
      if (index >= 0) {
        newChannels = [...stateRef.current.channels];
        newChannels[index] = channel;
      } else {
        newChannels = [channel, ...stateRef.current.channels];
      }
      updateState({ ...stateRef.current, channels: newChannels, count });
    };
    sb.groupChannel.addGroupChannelHandler('channel', channelHandler);
  }

  const clearHandle = async (key) => {
    sb.groupChannel.removeGroupChannelHandler(key);
  }

  const handleCreateChannel = async (channelName = "testChannel", memberIds) => {
    console.log('handleCreateChannel');
    const [groupChannel, error] = await createChannel(channelName, memberIds);
    if (error) {
      return onError(error);
    }
    const updatedChannels = [groupChannel, ...state.channels];
    updateState({ ...state, channels: updatedChannels });
    return groupChannel;
  }

  const sendMessage = async (messageToUpdate, currentlyJoinedChannel, messages, messageInputValue, updateMessage) => {
    if (messageToUpdate) {
      const userMessageUpdateParams = {};
      userMessageUpdateParams.message = messageInputValue
      const updatedMessage = await currentlyJoinedChannel.updateUserMessage(messageToUpdate.messageId, userMessageUpdateParams)
      const messageIndex = messages.findIndex((item => item.messageId == messageToUpdate.messageId));
      messages[messageIndex] = updatedMessage;
      updateMessage(messages);
    } else {
      console.log(messageToUpdate, currentlyJoinedChannel, messages, messageInputValue, updateMessage);
      const userMessageParams = {};
      userMessageParams.message = messageInputValue
      currentlyJoinedChannel.sendUserMessage(userMessageParams)
        .onSucceeded((message) => {
          const updatedMessages = [...messages, message];
          updateMessage(updatedMessages);
        })
        .onFailed((error) => {
          console.log(error)
          console.log("failed")
        });
    }
  }

  const onFileInputChange = async (e) => {
    if (e.currentTarget.files && e.currentTarget.files.length > 0) {
      const { currentlyJoinedChannel, messages } = state;
      const fileMessageParams = {};
      fileMessageParams.file = e.currentTarget.files[0];
      currentlyJoinedChannel.sendFileMessage(fileMessageParams)
        .onSucceeded((message) => {
          const updatedMessages = [...messages, message];
          updateState({ ...state, messages: updatedMessages, messageInputValue: "", file: null });

        })
        .onFailed((error) => {
          console.log(error)
          console.log("failed")
        });

    }
  }

  const handleDeleteMessage = async (messageToDelete) => {
    const { currentlyJoinedChannel } = state;
    await deleteMessage(currentlyJoinedChannel, messageToDelete); // Delete
  }

  const updateMessage = async (message) => {
    updateState({ ...state, messageToUpdate: message, messageInputValue: message.message });
  }

  const setupUser = async (obj) => {
    const sendbirdChat = await SendbirdChat.init({
      appId: SENDBIRD_INFO.appId,
      localCacheEnabled: false,
      modules: [new GroupChannelModule()]
    });
    await sendbirdChat.connect(obj.userId);
    await sendbirdChat.setChannelInvitationPreference(true);

    const userUpdateParams = {};
    userUpdateParams.userId = obj.userId;
    if (obj.nickname) {
      userUpdateParams.nickname = obj.nickname;
    }
    await sendbirdChat.updateCurrentUserInfo(userUpdateParams);

    sb = sendbirdChat;
    updateState({ ...state, loading: true });
    const [channels, error] = await loadChannels();
    if (error) {
      return onError(error);
    }

    const currentUser = sb.currentUser;

    const count = await sb.groupChannel.getTotalUnreadMessageCount();
    console.log(count);

    updateState({ ...state, channels: channels, loading: false, settingUpUser: false, currentUser, count });
  }

  const messageRead = async (channel) => {
    await channel.markAsRead();
  };

  if (state.loading) {
    return <div>Loading...</div>
  }

  if (state.error) {
    return <div className="error">{state.error} check console for more information.</div>
  }

  console.log('- - - - State object very useful for debugging - - - -');

  return <sendbirdContext.Provider value={{ state, setupUser, handleCreateChannel, sendMessage, messageRead, handleChannelMessage, clearHandle, handleChannel }}>{ children }</sendbirdContext.Provider>
}

const loadChannels = async () => {
  try {
    const groupChannelQuery = sb.groupChannel.createMyGroupChannelListQuery({ limit: 30, includeEmpty: true });
    const channels = await groupChannelQuery.next();
    return [channels, null];
  } catch (error) {
    return [null, error];
  }
}

const createChannel = async (channelName, userIdsToInvite) => {
  try {
    const groupChannelParams = {};
    groupChannelParams.addUserIds = userIdsToInvite
    groupChannelParams.name = channelName
    groupChannelParams.operatorUserIds = userIdsToInvite
    const groupChannel = await sb.groupChannel.createChannel(groupChannelParams);
    return [groupChannel, null];
  } catch (error) {
    return [null, error];
  }
}

const deleteChannel = async (channelUrl) => {
  try {
    const channel = await sb.groupChannel.getChannel(channelUrl);
    await channel.delete();
    return [channel, null];
  } catch (error) {
    return [null, error];
  }
}

const deleteMessage = async (currentlyJoinedChannel, messageToDelete) => {
  await currentlyJoinedChannel.deleteMessage(messageToDelete);
}

export default SendbirdProvider;
