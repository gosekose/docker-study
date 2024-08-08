## 1장

## 도커 시작

- 도커
    - 레지스트리: 우리가 만든 이미지를 저장하는 곳
    - 이미지: 다양한 종속성과 패키지, 애플리케이션이 묶여있는 파일
    - 컨테이너: 이미지 내 파일들을 기반으로, 지정된 명령어를 실행한느 프로세스
    - 도커
    - 사용자가 요청한 명령어를 HTTP로 요청받아, 이미지를 만들고(build), 실행(run)해서 프로세스를 만들며, 레지스트리에 이미지를 저장(push)하고 공유할 수 있도록 만들어주는 도구이다

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

---

## 도커 파일 설정

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

---

## 도커 파일 빌드

- 빌드 시 도커 데몬에게 전달되는 파일 및 디렉토리
    - docker build -t rex .
        - -t rex
            - 이미지 이름을 rex:latest
            - . 이 전달할 경로를 말하는 것
            - tar로 묶어서 도커 데몬에게 전송
        - .dockerignore
            - 빌드 컨텍스트에 포함되지 않을 파일 및 디렉토리를 지정
- docker build [옵션] [빌드 컨텍스트 경로]
    - -t 이름
        - 이미지 이름 지정
    - -f 경로
        - 도커파일 경로 지정
    - --platform
        - linux/amd64, linux/arm64
    - -no-cache
        - 이미지 빌드 시 캐시를 활용하지 않음

- 빌드 캐시
    - 빌드의 결과물을 별도로 저장하여 반복적인 빌드를 더욱 빠르게 만들어줌
    - 변경점이 없다는 가정 하에 매우 빠른 빌드 가능
    - 빌드 캐시는 해당 레이어의 파일이 변경된 경우 그 이후 캐시는 모두 무효화
    - RUN
        - RUN 명령은 인자로 전달된 문자열로 변경을 감지함
    - 변경이 적은 파일들을 Dockerfile의 상단에 배치
    - 디스크 용량이 부족한 경우
        - docker builder prune -a -f
- Dockerfile 제작 시 주의할 점
    - FROM에 적절한 태그 사용
    - ENTRYPOINT, CMD 구분 (실행 시 동작 예측 쉬워짐)
    - 레이어 최적화
        - 레이어 수 최소화 (중복 데이터 감소, 압축 효율, 시작속도 개선 등)
    - 예측 가능한 Dockerfile을 만들자
        - ADD가 아닌 COPY 활용, ARG에 기본 값 설정 등
    - 빌드 캐시 활용
        - 변화가 적은 파일을 Dockerfile 상단에 배치
    - 아키텍처에 맞게 --platform 하기

---

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

---

## 도커 네트워크

- 도커 기본 네트워크
    - 컨테이너의 이름으로 네트워크 접근 불가능
    - docker run -d -P --link pg web  (x)
        - 조만간 사라질 예정
    - docker create network [이름]
- 커스텀 네트워크 아키텍처
    - 브릿지 인터페이스 생성 (br-d.... )
    - host명을 네트워크가 아닌 host 명을 사용
    - docker network create [이름]
    - docker run --name [컨테이너 이름] --network [이름]
    - docker run --rm -d --name b1 --network rex --network-alias bb 

## 도커가 제공하는 스토리지
- 스토리지가 필요한 이유
  - 컨테이너 실행 시 기본적으로 쓰기 가능한 계층이 생성
    - 컨테이너 종료 시 데이터가 유지되지 않음
    - Volume
  - 호스트의 특정 파일을 공유받거나 특정 폴더를 이용하려는 경우
    - 바인드 마운트를 통해 RW/RO를 설정해서 공유 가능
    - Bind Mount
- 도커가 제공하는 기본 스터리지
  - Container
    - bind mount --> filesystem
    - volume --> docker area
    - tmpfs mount --> memory

- Volume
  - docker create volume pg (영구히 저장되는 볼륨 생성)
  - -v pg:/var/lib/postgresql/data (영구저장 볼륨 사용)
  - 호스트에 별도의 폴더를 생성하여 컨테이너에 붙여줌
  - Anonymous Volume
    - Dockerfile VOlume을 사용하고, docker run에 별도의 -v 옵션을 주지 않은 경우
    - docker rm -v 옵션 사용 시, 컨테이너와 볼륨 모두 삭제
  - Named Volume
    - docker volume create [이름]
    - docker run -v [이름]:[마운트할 경로]:[rw/ro]
    - docker rm -v 옵션 사용해도 볼륨은 삭제되지 않음
      - docker volume rm [이름] 으로 별도 삭제 필요
  
- Bind Mount
  - 호스트의 파일이나 디렉토리를 컨테이너에 공유 (마운트)
  - docker run -v [경로]:[마운트할 경로]:[rw/ro]
    - 경로가 폴더면, [마운트할 경로]에 폴더에 있는 것들이 공유
  
- 도커 볼륨과 마운트 차이점
  - 도커 볼륨
    - 생성 및 관리
      - 도커 볼륨은 도커가 관리하는 파일 시스템의 일부
      - docker volume create
      - 도커는 볼륨의 위치와 데이터를 자체적으로 관리하므로 사용자가 파일 시스템 경로를 알 필요가 없음
    - 사용 방식
      - 컨테이너 실행 시 -v 또는 --mount 옵션을 사용해 볼륨을 마운트 할 수 있음
      - docker run -d -v my-volume:/path/in/container -- name my-container my-image
    - 데이터 유지
      - 컨테이너가 삭제되더라도 볼륨은 독립적으로 남아있음, 데이터 유지
      - 여러 컨테이너간 볼륨을 공유할 수 있음
    - 백업 및 이동
      - 도커 명령어를 통해 볼륨의 데이터를 백업하거나 복원할 수 있음
  - 바인드 마운트
    - 컨테이너 실행 시 -v 또는 --mount 옵션을 사용해 바인드 마운트를 설정할 수 있음
    - docker run -d -v /host/data:/container/data --name my-container my-image
  - 데이터 유지
    - 컨테이너가 종료되거나 삭제되더라도 바인드 마운트는 호스트 파일 시스템에 존재하므로 데이터는 유지
    - 호스트와 컨테이너 간에 데이터를 실시간으로 동기화할 수 있음
  - 백업 및 이동
    - 바인드 마운트된 데이터는 호스트 파일 시스템의 일부
    - 일반 파일과 동일하게 백업 및 이동할 수 있음
  - 비교 요약
    - 도커 볼륨
        - 도커가 관리
        - 도커가 지정하는 위치
        - 도커 내부적으로 최적화된 데이터 저장 방식
        - 여러 컨테이너 간 공유 가능
        - 도커 명령어 사용
        - 도커가 관리하므로 비교적 안전
    - 바인드 마운트
      - 사용자가 관리
      - 사용자 지정 호스트 경로
      - 호스트 파일 시스템의 유연성
      - 호스트의 다른 프로그램과 실시간 데이터 공유
      - 호스트 파일 시스템의 방법 사용
      - 호스트 파일 시스템의 보안 설정에 의존
- 도커 볼륨과 바운드 마운트 명령어가 동일한 이유
  - 일관성, 
  - 자동 구분: 
    - 볼륨 이름을 제공할 경우 도커는 이를 도커 볼륨으로 인식
    - 호스트 파일 시스템 경로를 사용할 경우 도커는 이를 바인드 마운트로 인식
  - 편의성

- 볼륨은 컨테이너 간 공유 가능
  - 볼륨 또는 바인드 마운트를 사용할 경우 :ro를 꼭 고려할 것
  - 동시 작업이 아니더라도 민감한 폴더를 바인드 마운트 하는 경우에