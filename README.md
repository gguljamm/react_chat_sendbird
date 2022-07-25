# 샌드버드 + react 채팅 만들기

## 가이드 문서
- https://sendbird.com/docs/chat/v4/javascript/overview
- javascript v4 기준으로 제작

## 대시보드 
- https://dashboard.sendbird.com/
- 채팅 목록/유저 정보 볼 수 있고
- 관리자 등록해서 공지 메세지 같은거 보낼 수도 있음

## 샌드버드 UIKit

- https://github.com/sendbird/sendbird-uikit-react
- /src/template 에 있는 두 파일이 uikit 가이드 복붙
- /openChatSample -> 오픈채팅 예제
- /groupChatSample -> 그룹채팅 예제

## 샌드버드 UIKit 스토리북

- https://sendbird.github.io/sendbird-uikit-react


## 구조 설명

### [SendbirdProvider -> setupUser]
- sendbird 서버에 userId로 연결

### [channel]
- 채팅방
- 무조건 1:1만 있다는 가정으로 제작
- 고객 <-> 호스트간 1:1 연결
- SendbirdProvider에 있는 channels가 내가 포함된 채널
- handleChannel에서 채널이 업데이트 될 경우 channels를 업데이트함
- lastMessage, 채널별 안읽은 메세지 개수 등 업데이트
- count는 전체 안읽은 메세지
- MyPage.js 에서 선택한 호스트와 만들어진 채팅방 없을 경우 새로 만듦


### [message]
- 채널별 채팅 리스트
- Message.js에서 채널별 메세지 호출 및 추가
- handleChannelMessage에서 해당 채널 메세지 업데이트 감시
- 현재 도메인에 /userFlow/message/{ channelURL }
- channelURL: 유니크한 채널의 id
