## 1장

- 도커
  -  레지스트리: 우리가 만든 이미지를 저장하는 곳
  -  이미지: 다양한 종속성과 패키지, 애플리케이션이 묶여있는 파일
  -  컨테이너: 이미지 내 파일들을 기반으로, 지정된 명령어를 실행한느 프로세스
  -  도커
    -  사용자가 요청한 명령어를 HTTP로 요청받아, 이미지를 만들고(build), 실행(run)해서 프로세스를 만들며, 레지스트리에 이미지를 저장(push)하고 공유할 수 있도록 만들어주는 도구이다

```
  nginx
  docker run --rm -p 8080:80 nginx
  // nginx 컨테이너 내부 80 포트 실행, 8080포트 접근하면 80포트로 포워드, host 8080 사용, 이름 nginx
  docker ps
  docker run -f [CONTAINER ID]

```

```

// 도커 볼륨 생성
  docker volume create pg  

  // memory, cpu 제한, 영구저장볼륨, -e: 환경변수 -> postgres password 설정
  docker run --name pg --rm \
  --memory="512m" --cpus="0.5" \
  -v pg:/var/lib/postgresql/data \
  -e POSTGRES_PASSWORD=rex postgres

  docker exec -it pg bash // bash shell을 실행

  psql -U postgres // bash에서 postgres 접근

  docker rm -f 컨테이너아이디
  docker volume rm pg
  docker rmi -f pg

```

```
docker run --rm --name httpd -p 8080:80 \
-v .:/usr/local/apache2/htdocs/:ro \
-d httpd:2.4

// 바인드 마운트
// pc에 연결된 현재경로(.)를 /usr/~/htdocs/에 연결
// :ro = Read-Only (컨테이너 내부에서는 수정 불가능 해야 함)

```

- 도커 파일 설정
  - Dockerfile
    - AS builder 명령어로 특정 빌드 스테이지에 이름을 지정
  - FROM openjdk:17-slim AS builder
    - 빌드 스테이지르 위한 베이스 이미지 설정
  - WORKDIR /app
    - 컨테이너 내 작업 디렉토리를 /app으로 설정
  - COPY . .
    - 도커 컨텍스트의 현재 디렉토리에 있는 모든 파일과 디렉토리를 컨테이너의 현재 작업 디렉토리로 복사
  - COPY --from=builder /app/build/libs/*.jar app.jar
    - 빌드 스테이지에서 생성된 JAR 파일을 현재 스테이지의 작업 디렉토리로 복사
  - EXPOSER 8080
    - 컨테이너가 수신할 포트를 지정
    - 여기서는 8080 포트를 지정

```shell
  docker build -t docker-study-app .
  docker run --rm -p 8080:8080 docker-study-app
```

- 멀티 스테이지 빌드
  - 이미지 크기 감소: 빌드 도구와 불필요한 파일을 최종 이미지에 포함시키지 않기 위함
    - 이미지 크기 줄임
    - 배포 및 전송 속도 높임
  - 보안성 향상
    - 빌드 과정에서만 필요한 도구들을 최종 이미지에 포함시키지 않음으로써 보안성을 높임
  - 단계적 빌드
    - 빌드 과정을 여러 단계로 나누어 관리할 수 잇으며, 각 단계에서 필요한 도구와 설정을 분리할 수 있음
  - 캐시 활용
    - 각 단계가 캐시되어 재사용될 수 있어 빌드 시간이 단축