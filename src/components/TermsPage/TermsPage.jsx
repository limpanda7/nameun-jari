import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import './TermsPage.css';

const TermsPage = () => {
  const navigate = useNavigate();

  return (
    <div className="terms-page">
      <div className="terms-container">
        <div className="terms-header">
          <button 
            className="back-button"
            onClick={() => navigate(-1)}
            aria-label="뒤로가기"
          >
            <ArrowLeft size={24} />
          </button>
          <h1>이용약관</h1>
        </div>

        <div className="terms-content">
          <div className="terms-section">
            <h2>제1조 (목적)</h2>
            <p>
              본 약관은 나믄자리(이하 "운영자")가 운영하는 숙소(이하 "숙소")의 이용과 관련하여, 
              숙박 예약자(이하 "이용자")와 운영자 간의 권리와 의무를 정함을 목적으로 합니다.
            </p>
          </div>

          <div className="terms-section">
            <h2>제2조 (예약의 성립)</h2>
            <ol>
              <li>
                예약은 이용자가 숙소의 예약 절차에 따라 이름과 연락처를 제공하고, 
                운영자가 이를 확인한 시점에 성립합니다.
              </li>
              <li>
                예약은 제3자에게 양도할 수 없으며, 숙박 가능 인원 및 반려동물 수는 
                예약 시 사전 협의된 범위 내에서만 허용됩니다.
              </li>
              <li>
                예약 인원 또는 반려동물 수를 초과하여 입실하거나, 사전 동의 없이 외부인을 동반하는 경우 
                예약이 취소되거나 퇴실 조치될 수 있습니다(이 경우 환불 불가).
              </li>
            </ol>
          </div>

          <div className="terms-section">
            <h2>제3조 (요금의 지급)</h2>
            <ol>
              <li>
                숙박요금은 예약 시 또는 운영자가 지정한 시점에 전액 결제하는 것을 원칙으로 합니다.
              </li>
              <li>
                이용자가 예약을 유지하지 않거나 숙박을 중도에 취소한 경우, 제4조(환불규정)에 따릅니다.
              </li>
            </ol>
          </div>

          <div className="terms-section">
            <h2>제4조 (취소 및 환불규정)</h2>
            <ol>
              <li>
                취소 시점은 운영자가 확인한 시점(대한민국 표준시, KST 기준)을 기준으로 합니다.
              </li>
              <li>
                환불 기준은 다음과 같습니다.
                <ul>
                  <li>체크인 30일 이상 전 취소: 전액 환불</li>
                  <li>체크인 7~30일 전 취소: 숙박요금의 50% 환불</li>
                  <li>체크인 7일 미만 전 취소: 환불 불가</li>
                </ul>
              </li>
              <li>
                불가항력적 사유(천재지변, 정부의 행정명령 등)로 숙소 이용이 불가능한 경우 전액 환불합니다.
              </li>
              <li>
                운영자의 귀책사유(시설 고장, 안전 문제 등)로 숙박이 불가능한 경우 전액 환불하며, 
                추가 손해가 있을 시 관련 법령에 따라 보상할 수 있습니다.
              </li>
              <li>
                이용자 귀책으로 인한 취소(예약 정보 허위, 인원 초과, 숙소 규정 위반 등)는 환불 대상이 아닙니다.
              </li>
            </ol>
          </div>

          <div className="terms-section">
            <h2>제5조 (체크인 및 체크아웃)</h2>
            <ol>
              <li>
                각 숙소의 체크인·체크아웃 시간은 숙소별로 별도 안내된 기준을 따릅니다.
              </li>
              <li>
                숙소별 안내된 시간을 초과하여 퇴실하거나 무단 지연 시, 
                숙소 정책에 따라 추가 요금이 부과될 수 있습니다.
              </li>
            </ol>
          </div>

          <div className="terms-section">
            <h2>제6조 (숙박의 거절 및 퇴실 조치)</h2>
            <p>운영자는 다음 각 호의 경우 예약 또는 숙박을 거절하거나 즉시 퇴실을 요구할 수 있습니다.</p>
            <ol>
              <li>예약 시 허위 정보를 제공한 경우</li>
              <li>사전 승인된 인원 또는 반려동물 수를 초과하여 입실한 경우</li>
              <li>숙소 내 금연구역에서 흡연하거나 화기·인화성 물질을 사용하는 경우</li>
              <li>고성방가, 음주 소란, 폭언·폭행 등으로 다른 이용자나 주변에 피해를 주는 경우</li>
              <li>숙소 비품을 무단 이동·훼손하거나 외부로 반출한 경우</li>
              <li>숙소 시설을 상업적 촬영·행사·파티 등 사전 승인되지 않은 용도로 사용하는 경우</li>
            </ol>
            <div className="terms-note">
              ※ 위 사유로 퇴실 조치되는 경우, 환불은 불가하며 손해배상이 청구될 수 있습니다.
            </div>
          </div>

          <div className="terms-section">
            <h2>제7조 (시설물 및 비품의 파손)</h2>
            <ol>
              <li>
                이용자의 고의 또는 과실로 시설물·비품·침구 등에 훼손·오염·분실이 발생한 경우, 
                실제 수리비 또는 교체비를 부담해야 합니다.
              </li>
              <li>
                오염이 심하여 세탁으로 복구 불가한 경우, 동등 품목의 교체 비용이 청구될 수 있습니다.
              </li>
              <li>
                문제 발생 시 즉시 운영자에게 연락하고 안내에 따라 조치해야 합니다.
              </li>
            </ol>
          </div>

          <div className="terms-section">
            <h2>제8조 (안전 및 손해배상 한계)</h2>
            <ol>
              <li>
                숙소 내 모든 공간은 금연이며, 지정된 구역 외 흡연·화기 사용은 금지됩니다.
              </li>
              <li>
                이용자의 부주의로 인한 안전사고, 도난, 분실, 손해에 대해 운영자는 책임을 지지 않습니다.
              </li>
              <li>
                귀중품은 개인 보관을 원칙으로 하며, 분실 시 운영자는 보상 의무를 지지 않습니다.
              </li>
            </ol>
          </div>

          <div className="terms-section">
            <h2>제9조 (개인정보의 수집 및 이용)</h2>
            <ol>
              <li>
                운영자는 예약 및 고객 응대를 위해 필요한 최소한의 개인정보(이름, 전화번호)만을 수집합니다.
              </li>
              <li>
                수집된 개인정보는 이용 목적 달성 후 지체 없이 파기하며, 제3자에게 제공되지 않습니다.
              </li>
            </ol>
          </div>

          <div className="terms-section">
            <h2>제10조 (분쟁 해결 및 준거법)</h2>
            <ol>
              <li>
                운영자와 이용자 간 분쟁이 발생할 경우, 상호 협의를 통해 원만히 해결함을 원칙으로 합니다.
              </li>
              <li>
                협의로 해결되지 않을 경우, 대한민국 법을 적용하며 관할 법원은 숙소 소재지 관할 법원으로 합니다.
              </li>
            </ol>
          </div>

          <div className="terms-section">
            <h2>부칙</h2>
            <ol>
              <li>본 약관은 2025년 11월 1일부터 적용됩니다.</li>
              <li>본 약관에 명시되지 않은 사항은 관련 법령 및 일반 상관례에 따릅니다.</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsPage;
