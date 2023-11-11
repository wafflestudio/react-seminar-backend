# React Seminar Backend

2022년 만들어 2023년에 살짝 고쳐 쓰는 리액트 세미나 과제 백엔드.

## `.env` example
```dotenv
MYSQL_USERNAME=user
MYSQL_PASSWORD=pa55w0rd
MYSQL_DATABASE=database

JWT_SECRET=s3cr3+

DATABASE_URL=mysql://user:pa55w0rd@localhost/database

KEY_FILE=/usr/foo/.ssh/key
REMOTE_USER=bar
REMOTE_HOST=0.0.0.0
REMOTE_PROJECT_ROOT=/home/foo/bar
```

* `DATABASE_URL`은 `yarn make-db-url`의 출력 결과값을 사용하시면 됩니다.

## db settings example

```mysql
CREATE DATABASE `database`;
CREATE USER `user` IDENTIFIED BY 'pa55w0rd';
GRANT ALL ON *.* TO `user`;
```

`prisma migrate dev`를 위해 `*.*` 권한이 필요합니다.

## data initialization
`yarn init-data`를 실행하여 사용자 명단을 초기화합니다.

## https 설정
```shell
brew install mkcert nss
mkcert -install
mkcert localhost
```

## 기타
* `yarn dev`: 테스트 서버 실행
* `yarn build`: 빌드
* `yarn start`: 서버 실행
* `yarn clean`: 빌드 파일 삭제
