# WebPush - 웹푸시 구독 및 발송 프로젝트

> Node.js 기반 웹푸시 예제 프로젝트입니다.  
> Chrome, Firefox, iOS Safari 등 브라우저에서 푸시 알림 구독과 발송을 테스트할 수 있습니다.


## 📌 주요 기능

- 브라우저에서 웹푸시 구독
- Node.js + Express 서버로 구독 정보 관리
- MySQL에 구독 정보 저장
- VAPID 기반 안전한 푸시 발송
- Service Worker 지원으로 브라우저가 꺼져 있어도 푸시 수신 가능
- 중복 구독 방지

## 🛠️ 환경 설정

### 1. 리포지토리 클론

```bash
git clone https://github.com/niroey/WebPush.git
cd WebPush
```
### 2. 의존성 설치

```bash
npm install
```
### 3. MySQL 설정
```sql
테이블 생성 예시:
CREATE TABLE subscriptions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  endpoint TEXT NOT NULL,
  p256dh VARCHAR(255) NOT NULL,
  auth VARCHAR(255) NOT NULL,
  UNIQUE KEY(endpoint(255))
);
```
### 4. VAPID 키 생성 및 vapid.json 설정
```json
{
  "publicKey": "YOUR_PUBLIC_KEY",
  "privateKey": "YOUR_PRIVATE_KEY",
  "contact": "mailto:your-email@example.com"
}
```
## 🚀 서버 실행
```bash
node server.js
```


