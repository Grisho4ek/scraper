## Installation

```shell
npm install
```

## LinkedInScraper

selectors can be different

### Parameters

|          | default |
| -------- | :-----: |
| job      |  React  |
| location | Berlin  |
| maxPages |    2    |

### Env variables for LinkedInScraper

create .env file in root of project

| name     |          |    description    |
| -------- | :------: | :---------------: |
| login    | required |  linkedIn login   |
| password | required | linkedIn password |
| path     | optional |  path to browser  |

### Usage

```shell
npm run jobs
```

or with parameters

```shell
npm run jobs React London 5
```

output: linkedin_jobs.json

## GoogleTranslate

|            | default |
| ---------- | :-----: |
| sourceLang | English |
| targetLang | Russian |

### Env variables for GoogleTranslate

create .env file in root of project

| name       |          |
| ---------- | :------: |
| sourceLang | optional |
| targetLang | optional |

### Usage

plain words

```shell
npm run words study english
```

or sentence

```shell
npm run words 'I love chocolate'
```

output: vocabulary.txt
