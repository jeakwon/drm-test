/* DRM 거짓 기억 데모 설정. 주소는 작은따옴표(') 안에 넣고, 줄 끝 쉼표(,)를 지우지 마세요. */
window.DRM_CONFIG = {
  // Apps Script 웹 앱 URL(https://script.google.com/macros/s/…/exec)을 바로 아래 작은따옴표 사이에 붙여 넣으세요.
  // 비워 두면 연습 모드예요: 혼자 해 볼 수 있지만 응답은 어디에도 가지 않아요.
  collectUrl: 'https://script.google.com/macros/s/AKfycbzC2OzlOECDremjyqNlXS1WXnE7VL7I6LtKgLe2kgM28NKrlgOMLe4bRYG4qwKEzv4/exec',
  participantUrl: '',    // 참여 화면을 올린 주소. 결과 화면의 QR 코드가 이 주소를 가리켜요. 예: 'https://아이디.github.io/drm/'
  title: '',             // 화면 위에 보일 모임 이름. 예: 'Colloquium' 또는 { en: 'Colloquium', ko: '콜로퀴움' }
  lang: 'en',            // 처음 열 때의 안내 언어: 'en' 또는 'ko' (단어는 언제나 영어예요)
  lists: ['sleep', 'cold'], // 보여 줄 목록: 'sleep', 'window', 'cold' 중에서. 목록마다 뒤에 암산이 나와요. 하나만 하려면 ['sleep']
  msPerWord: 1500,       // 단어 하나를 보여 주는 시간(밀리초). 원래 연구는 1.5초
  distractorSec: 20,     // 목록마다 뒤에 오는 암산 시간(초)
};
