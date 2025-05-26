# Database

## `PostgreSQL`

### 버전 : 17 (docker) / 17.4.1 (local)
```
superuser : postgres
password : ssafy
Schema : damdam
port : 5432
```

덤프 파일 같은 디렉토리 내 damdam_dump.sql

<br>

## `Redis`

### 버전 : 6 (docker) / 3.0.5 (local, windows)
### redis-config
```
requirepass ssafy!@
maxmemory 1g
maxmemory-policy allkeys-lru
```

### host / password / port
```
host : redis
password : ssafy!@
port : 6379
```


### docker에서 redis 접속

`docker-compose exec redis redis-cli`

### 비밀번호 입력

`auth ssafy!@`

### 전체 상담 목록 확인

`keys counsel:*:messages`

### 상담 1번의 전체 메세지 확인

`LRANGE counsel:1:messages 0 -1`

### 전체 DB 날리기

`FLUSHDB`