const admin = require('firebase-admin');
const ical = require('node-ical');
const fetch = require('node-fetch');

// Firebase Admin 초기화 (이미 초기화되어 있다면 건너뛰기)
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

let errorCount = {};
let alertSent = {};

/**
 * iCal 데이터를 Firestore에 저장
 * @param {string} url - iCal URL
 * @param {string} target - 'forest', 'blon', 'on_off'
 */
const updateIcal = async (url, target) => {
  const collectionName = `${target}_ical`;

  try {
    // iCal 데이터 가져오기
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`iCal fetch failed: ${response.status} ${response.statusText}`);
    }

    const icalText = await response.text();
    const res = ical.parseICS(icalText);

    if (!res || Object.keys(res).length === 0) {
      console.error(`iCal error: iCal response is empty for ${target}`);
      await checkAndSendAlert(target, 'response empty');
      return;
    }

    const values = [];

    for (const key of Object.keys(res)) {
      const event = res[key];

      if (event.type !== 'VEVENT') continue;

      const { uid, start, end, summary, description } = event;

      if (start && end) {
        let reservationId = null;
        if (description) {
          const regex = /Reservation URL: https:\/\/www\.airbnb\.com\/hosting\/reservations\/details\/(\w+)/;
          const match = description.match(regex);
          if (match && match.length > 1) {
            reservationId = match[1];
          }
        }

        // 날짜 형식 변환 (YYYY-MM-DD)
        const startDt = new Date(start).toISOString().split('T')[0];
        const endDt = new Date(end).toISOString().split('T')[0];
        const phoneLastDigits = description ? description.slice(-4) : null;
        const status = summary && summary.startsWith('Airbnb') ? 'Not available' : (summary || 'Not available');

        values.push({
          uid: uid || key,
          start_dt: startDt,
          end_dt: endDt,
          status: status,
          reservation_id: reservationId || null,
          phone_last_digits: phoneLastDigits || null,
          updated_at: admin.firestore.FieldValue.serverTimestamp()
        });
      }
    }

    // 기존 데이터 백업 (선택사항 - 로깅용)
    const existingDocs = await db.collection(collectionName).get();
    const backupCount = existingDocs.size;
    console.log(`Backup: ${backupCount} records from ${collectionName}`);

    // 기존 문서 삭제
    const deletePromises = [];
    existingDocs.forEach((doc) => {
      deletePromises.push(doc.ref.delete());
    });
    await Promise.all(deletePromises);
    console.log(`Deleted ${backupCount} records from ${collectionName}`);

    // 새로운 데이터 삽입 (Firestore batch는 최대 500개까지)
    if (values.length > 0) {
      // 500개씩 나누어서 처리
      const batchSize = 500;
      for (let i = 0; i < values.length; i += batchSize) {
        const batch = db.batch();
        const batchValues = values.slice(i, i + batchSize);

        batchValues.forEach((value) => {
          const docRef = db.collection(collectionName).doc();
          batch.set(docRef, value);
        });

        await batch.commit();
        console.log(`Inserted batch ${Math.floor(i / batchSize) + 1}: ${batchValues.length} records`);
      }
      console.log(`Inserted total ${values.length} records into ${collectionName}`);
    } else {
      console.log(`No records to insert for ${collectionName}`);
    }

    // 변경사항 로깅
    const deletedCount = backupCount - values.length;
    if (deletedCount > 0) {
      console.log(`Deleted ${deletedCount} cancelled reservations from ${collectionName}`);
    }

    // 에러 카운트 리셋
    errorCount[target] = 0;
    alertSent[target] = false;

  } catch (e) {
    console.error(`❌ updateIcal failed for ${target}: ${e.message}`);
    console.error(e);
    await checkAndSendAlert(target, e.message);
    throw e;
  }
};

/**
 * 텔레그램 알림 발송 (telegramWebhook과 동일한 방식)
 */
const checkAndSendAlert = async (target, errorMessage = '') => {
  const token = process.env.TELEGRAM_TOKEN;
  if (!token) {
    console.warn('TELEGRAM_TOKEN이 설정되지 않았습니다.');
    return;
  }

  if (!alertSent[target]) {
    errorCount[target] = (errorCount[target] || 0) + 1;

    if (errorCount[target] >= 3) {
      // target에 따라 적절한 chatId 선택
      let chatId;
      if (target === 'forest') {
        chatId = process.env.TELEGRAM_CHAT_ID_FOREST;
      } else if (target === 'blon') {
        chatId = process.env.TELEGRAM_CHAT_ID_BLON;
      } else {
        chatId = process.env.TELEGRAM_CHAT_ID;
      }

      if (chatId) {
        const baseUrl = `https://api.telegram.org/bot${token}`;
        const fullMessage = `⚠️ iCal 동기화 실패\n${target}: ${errorMessage}`;

        try {
          const telegramResponse = await fetch(`${baseUrl}/sendMessage`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              chat_id: chatId,
              text: fullMessage
            })
          });

          const telegramResult = await telegramResponse.json();

          if (telegramResult.ok) {
            console.log('텔레그램 알림 발송 성공:', telegramResult);
            alertSent[target] = true;
          } else {
            console.error('텔레그램 알림 발송 실패:', telegramResult);
          }
        } catch (err) {
          console.error('텔레그램 알림 발송 중 오류:', err);
        }
      } else {
        console.warn(`TELEGRAM_CHAT_ID가 설정되지 않았습니다. (target: ${target})`);
      }
    }
  }
};

module.exports = { updateIcal };

