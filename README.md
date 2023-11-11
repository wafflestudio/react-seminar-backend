# React Seminar Backend

2022년 만들어 2023년에 살짝 고쳐 쓰는 리액트 세미나 과제 백엔드.

## `.env` example
```dotenv
JWT_SECRET=s3cr3+
```

## data initialization
`yarn init-data`를 실행하여 사용자 명단을 초기화합니다.

## https 설정
```shell
brew install mkcert nss
mkcert -install
mkcert localhost
https=true yarn dev
```

## 기타
* `yarn dev`: 테스트 서버 실행
* `yarn build`: 빌드
* `yarn start`: 서버 실행
* `yarn clean`: 빌드 파일 삭제
