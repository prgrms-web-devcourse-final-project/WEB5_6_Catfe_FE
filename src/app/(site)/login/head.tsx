// app/(site)/login/head.tsx
export default function Head() {
  return (
    <>
      <title>Catfé | 로그인</title>
      <meta
        name="description"
        content="Catfé에 로그인하여 나만의 스터디룸과 미션을 관리하세요."
      />
      <meta property="og:title" content="Catfé | 로그인" />
      <meta
        property="og:description"
        content="Catfé에 로그인하여 나만의 스터디룸과 미션을 관리하세요."
      />
      <meta property="og:image" content="/og/login.png" />
      <meta property="og:url" content="https://catfe.app/login" />
      <meta property="og:site_name" content="Catfé" />
      <meta property="og:type" content="website" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content="Catfé | 로그인" />
      <meta
        name="twitter:description"
        content="Catfé에 로그인하여 나만의 스터디룸과 미션을 관리하세요."
      />
      <meta name="twitter:image" content="/og/login.png" />
    </>
  );
}
