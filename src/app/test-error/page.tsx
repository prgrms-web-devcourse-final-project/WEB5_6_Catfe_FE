function TestErrorPage() {
  // !! 에러 fallback 페이지 테스트용 강제 에러 - 나중에 페이지 삭제할 것 !!
  throw new Error('테스트용 에러');
}
export default TestErrorPage;
