# 🚀 Vercel 배포 가이드 (진짜 인터넷 주소 만들기)

지금은 `localhost:3000`(사장님 PC만 접속 가능) 상태입니다.  
직원들이 접속할 **진짜 주소**(예: `https://interior-erp.vercel.app`)를 만들려면 아래 순서대로 진행하세요.

---

## 1단계: GitHub에 코드 올리기

**처음 한 번만:** GitHub에서 새 저장소 생성 (이름 예: `interior-erp`), **README/ .gitignore 추가하지 않기**.

프로젝트 폴더에서 Cursor 터미널을 열고:

```bash
git init
git add .
git commit -m "ERP 완성"
git branch -M main
git remote add origin https://github.com/본인아이디/저장소이름.git
git push -u origin main
```

**이미 GitHub 저장소를 연결해 두었다면:**

```bash
git add .
git commit -m "ERP 완성"
git push origin main
```

---

## 2단계: Vercel에서 주소 생성

1. [Vercel](https://vercel.com) 접속 → **GitHub으로 로그인**
2. **Add New...** → **Project**
3. 방금 올린 저장소(예: `interior-erp`) 선택 → **Import**
4. **Environment Variables** 펼치기 → 아래 4개 추가:

   | Name              | Value                    |
   |-------------------|--------------------------|
   | `GOOGLE_CLIENT_ID`    | (.env.local과 동일)     |
   | `GOOGLE_CLIENT_SECRET`| (.env.local과 동일)     |
   | `NEXTAUTH_SECRET`     | (.env.local과 동일)     |
   | `NEXTAUTH_URL`        | **비워두기** (배포 후 3단계에서 채움) |

5. **Deploy** 클릭
6. 1~2분 후 **Domain**에 나온 주소가 진짜 주소입니다.  
   예: `https://interior-erp-xxx.vercel.app`

---

## 3단계: 배포 후 꼭 할 일 (구글 + Vercel)

### ① NEXTAUTH_URL 채우기 (Vercel)

- Vercel 대시보드 → 해당 프로젝트 → **Settings** → **Environment Variables**
- `NEXTAUTH_URL` 추가(또는 수정):  
  `https://방금_나온_도메인.vercel.app`  
  (끝에 `/` 없음)
- **Save** 후 **Redeploy** 한 번 실행

### ② 구글 클라우드에 새 주소 등록 (필수)

- [Google Cloud Console](https://console.cloud.google.com) → **사용자 인증 정보** → 사용 중인 **OAuth 클라이언트** 클릭
- **승인된 리디렉션 URI**에 아래 한 줄 **추가** 후 저장:
  ```
  https://방금_나온_도메인.vercel.app/api/auth/callback/google
  ```
  (끝에 `/api/auth/callback/google` 꼭 붙이기)

---

## 요약

1. GitHub에 코드 올리기  
2. Vercel에서 Import → 환경 변수 넣고 Deploy  
3. 나온 주소로 `NEXTAUTH_URL` 설정 + 구글 리디렉션 URI 추가  

이후 직원들에게 `https://xxx.vercel.app` 주소만 공유하면 됩니다.
