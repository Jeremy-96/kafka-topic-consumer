# Kafka topic consumer

## Description

This repository is used to test the implementation of the backend structure in which we manage the kafka consuming and the database CRUD operations

## How to run

**Clone the repository**

```
git clone https://github.com/Jeremy-96/kafka-topic-consumer.git
```

**Install dependencies**

```
npm install
```

**[WITH DATABASE] Create your own database on your machine, don't forget to add environement variables (see .env.example file)**

```
PORT=

DB_HOST=
DB_NAME=
DB_PORT=
DB_USERNAME=
DB_PASSWORD=
```

**Kafka certificates**  
Create a .certificates folder on the project's root and put access certificates files inside

**Launch the server**

```
// WITH DATABASE
npm run start

// WITHOUT DATABASE
npm run start:kafka
```

**OTIONAL: Compile the typescript code**

```
npm run build
```

**OTIONAL: Prettier**

```
npm run format // fix error indentation

npm run format:check // check the code indentation
```

**OTIONAL: EsLint**

```
npm run lint // check lint error

npm run lint:fix // fix lint error
```
