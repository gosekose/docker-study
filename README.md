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
  - 이미지를 만들기 위한 설계도
    - Dockerfile에 명시된 명령어를 기반으로 이미지를 생성
    - INSTRUCTION arguments
  - Dockerfile
    - AS builder 명령어로 특정 빌드 스테이지에 이름을 지정
  - ARG IMAGE_VERSION=21
    - 빌드시 사용할 변수 설정
      - 빌드 인자를 전달하지 않으면 기본 값 21 사용
      - FROM node:${IMAGE_VERSION}
    - docker build --build-arg IMAGE_VERSION=22 .
    - 별도 정의 없이도 빌드 시 사용 가능한 인자(HTTP_PROXY, ALL_PROXY)
      - 컨테이너 실행 시에 적용되는게 아님
    - 플랫폼에 따라 자동으로 값을 채우는 글로벌 인자 (TARGETOS, TAGETARCH)
      - Dockerfile에 ARG 선언 필요
  - FROM openjdk:17-slim AS builder
    - 빌드 스테이지르 위한 베이스 이미지 설정
  - WORKDIR /app
    - 컨테이너 내 작업 디렉토리를 /app으로 설정
    - 작업할 디렉토리가 없는 경우 생성 후 이동하여 이후 도커파일 명령어 실행
  - COPY . .
    - 도커 컨텍스트의 현재 디렉토리에 있는 모든 파일과 디렉토리를 컨테이너의 현재 작업 디렉토리로 복사
    - <src> <dst>
  - COPY --from=builder /app/build/libs/*.jar app.jar
    - 빌드 스테이지에서 생성된 JAR 파일을 현재 스테이지의 작업 디렉토리로 복사
  - EXPOSER
    - 컨테이너가 수신할 포트를 지정
    - 기본적으로 tcp로 기록
      - EXPOSE 8080/tcp 5000/udp
    - EXPOSE는 컨테이너 내부 앱이 포트를 사용한다는 안내일뿐, 실제로 앱이 해당 포트를 쓰도록 하는 것은 아님
    - 명시적으로 지정해주면 협업시 편함
    - docker run -P
      - -p는 호스트포트:컨테이너 포트를 지정해줘야 하나
      - -P는 EXPOSE 포트를 기반으로 임시 포트 범위 내에서 자동 오픈
  - RUN
    - 이미지에 새로운 레이어를 만드는 명령어 실행
    - 비슷한 목적의 RUN은 최소화 하는게 좋음
  - ENV
    - 컨테이너 실행 시, rex=1 환경 변수 등록
    - ENV는 모든 상위 이미지들의 값을 상속함
    - 빌드 단계에서만 필요한 경우 ARG를 사용하거나
        - ARG rex=1
        - RUN apt-get update ...
    - 인라인 변수 사용 고려
        - RUN rex=1 apt-get update
  - VOLUME
    - 컨테이너가 새롭게 생성되더라도 데이터를 유지하기 위한 볼륨 생성
    - docker run --rm을 사용하여 컨테이너를 실행한 경우
      - 컨테이너가 종료되면 설정된 볼륨도 삭제됨
      - docker rm -f로 강제 삭제하는 경우에는 볼륨 유지
  - ENTRYPOINT
    - 컨테이너 시작시 CMD 명령어와 함께 사용
    - 컨테이너를 실행 파일로 사용하는 경우 정의
    - ENTRYPOINT를 정의하지 않은 경우에는 CMD만으로도 실행 가능
  
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

- 이미지
  - 컨테이너를 실행하는데 필요항 모든 것들을 포함하는 압축 파일
    - 런타임, 바이너리, 코드, 라이브러리, 설정 파일 등
  - 특징
    - 생성된 이미지는 변경 불가
      - 새로운 이미지를 만들기 (변경은 가능하지만 안쓰는 것이 좋음)
    - 이미지 레이어는 계층으로 구성됨
      - Dockerfile의 특정 명령에 대해 폴더를 하나씩 생성
    - 컨테이너를 삭제 후 새롭게 생성하면 초기 이미지 상태로 복구
      - 영구히 데이터를 저장하려는 경우 별도의 볼륨이 필요
    - 컨테이너는 계층적으로 저장이 되고, 쓰기 가능 폴더는 별도로 추가
      - 이미지를 삭제하면 쓰기 가능 폴더가 삭제됨
- 

