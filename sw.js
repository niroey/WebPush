// self.addEventListener("push", event => {
//   const data = event.data?.json() || {};
//   const tag = data.uuid || data.timestamp || Date.now();

//   event.waitUntil(
//     self.registration.showNotification(data.title || "제목 없음", {
//       body: data.body || "내용 없음",
//       icon: "/icon.png", // 그냥 경로 지정
//       badge: "/badge.png",
//       image: "/icon2.png",
//       tag: tag,
//       data: { url: data.url || "/" }
//     })
//   );
// });

// self.addEventListener("notificationclick", event => {
//   event.notification.close();
//   const url = event.notification.data?.url || "/";
//   event.waitUntil(clients.openWindow(url));
// });
self.addEventListener("push", event => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (e) {
    console.error("푸시 데이터 파싱 실패:", e);
  }

  const title = data.title || "제목 없음";
  const options = {
    body: data.body || "내용 없음",
    icon: "https://luis-nearly-jacob-worlds.trycloudflare.com/icon.png"
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

self.addEventListener("notificationclick", event => {
  event.notification.close();
  const url = event.notification.data?.url || "/";
  event.waitUntil(clients.openWindow(url));
});
