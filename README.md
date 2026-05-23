# 국어 콘텐츠 적중 맵

수능 국어 회사 콘텐츠 PDF와 6월 평가원 국어 PDF를 비교하여 실제 지문, 작품, 문항 구조, 선지 판단 기준이 어떻게 연결되는지 보여주는 내부/외부 겸용 분석 리포트 프로토타입입니다.

핵심 메시지: 단순 키워드 유사가 아니라, 실제 지문·작품·문항 구조·선지 판단 기준을 비교합니다.

## 설치

```bash
npm install
```

## 실행

```bash
npm run dev
```

- Frontend: http://localhost:5173
- Backend: http://localhost:4000

## 배포

Netlify 배포를 지원합니다.

- Build command: `npm run build`
- Publish directory: `client/dist`
- Functions directory: `netlify/functions`

배포 환경에서는 `/api/*`가 Netlify Functions로 동작하며, 메타데이터와 리포트는 Netlify Blobs에 저장됩니다. 로컬 개발에서는 Express 서버가 같은 API 경로를 제공합니다.

## 주요 기능

- 회사 콘텐츠 PDF 다중 업로드 및 메타데이터 저장
- 평가원 PDF 업로드 및 mock 매칭 분석 실행
- 관리자 검수 화면에서 등급, 공개 여부, 분석 문구 수정
- 승인된 케이스 중심의 실사형 리포트 화면
- PDF 캡처 이미지를 좌우 비교하고 박스, 밑줄, 체크, 메모 하이라이트 표시
- 로컬 JSON 파일 기반 저장소와 서비스 계층 분리

## 향후 확장 계획

- OCR 연동
- PDF 문항 자동 분리
- 문항 단위 crop 자동 생성
- 임베딩 기반 유사도 검색
- LLM 기반 적중 근거 생성
- 관리자 수동 하이라이트 편집 기능
- 공개용 리포트 PDF 다운로드

## 구조

```text
root/
  package.json
  README.md
  server/
  client/
```

PDF 렌더링은 현재 환경 독립적인 mock 이미지 생성 방식입니다. `server/src/services/pdfService.ts`의 `renderPdfToImages`를 실제 `pdfjs-dist` 또는 별도 렌더러로 교체하면 같은 API 구조로 확장할 수 있습니다.
