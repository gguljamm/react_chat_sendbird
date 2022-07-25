function Main() {
  return (
    <>
      <table className='mainTable' width="100%" border="1px solid #eee">
        <thead>
        <tr>
          <th></th>
          <th>오픈채팅</th>
          <th>그룹채팅</th>
        </tr>
        </thead>
        <tbody>
        <tr>
          <td>설명</td>
          <td>
            특정 channel을 개설하고 사람들이 자유롭게 들어와서 대화 할 수 있는 방.
          </td>
          <td>
            1:1 혹은 다수의 사람들로 이루워진 channel 개설. 초대를 통해 사람을 추가할 수 있음.
          </td>
        </tr>
        <tr>
          <td>특징</td>
          <td>
            채팅방에 실시간 참여자들끼리 대화를 주고받을 수 있고 사람들도 자유롭게 들어오고 나갈 수 있음
          </td>
          <td>
            특정 멤버를 초대해서 대화. 일반적인 채팅 기능 대부분 구현 가능
          </td>
        </tr>
        </tbody>
      </table>
      <br /><br />
      <div>그래서..! 그룹채팅으로 이후 플로우 구성했읍니다</div><br />
      <div>상단 user flow -> 고객 입장에서 여기어때 앱을 통해 숙소 예약 후 호스트와 채팅하는 플로우</div>
      <div>상단 host flow -> 호스트 입장에서 호스트센터를 통해 자신의 숙소에 예약한 고객과 채팅하는 플로우</div><br/><br/>
      <div>constants.js에 있는 appId가 1달?? 유효한 무료 라이센스입니다. 바꿔주셔야해요!!</div>
      <div>모바일로 보면 쫌 더 이뻐유</div>
    </>
  )
}

export default Main;
