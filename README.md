# Raggai

## Packages

Raggai consists of the following packages:

- **@raggai/core**: The core functionalities of the Raggai library.
- **@raggai/chromadb**: Integration with ChromaDB vector store.
- **@raggai/mysql**: MySQL database support.
- **@raggai/openai**: Integration with OpenAI for advanced querying.

## Installation

You can install the packages using npm:

```bash
npm install @raggai/core @raggai/chromadb @raggai/mysql @raggai/openai
```

or 

```bash
npm install raggai
```

## Usage

Here is a basic example of how to use Raggai:

```typescript
import { Raggai } from '@raggai/core';
import { ChromaDB } from '@raggai/chromadb';
import { MySQL } from '@raggai/mysql';
import { OpenAI } from '@raggai/openai';

const chroma = new ChromaDB(OPTIONS);
const mysql = new MySQL(OPTIONS);
const openai = new OpenAI(OPTIONS);

const raggai = new Raggai(openai,chroma,mysql);

// train the model with database schema
await raggai.trainWithSchema();

//train the model with QA pairs
await raggai.trainWithQuery('How many users are there in the database?','SELECT COUNT(*) FROM users');
await raggai.trainWithQuery('What is the total revenue?','SELECT SUM(revenue) FROM sales');

// train with document
await raggai.trainWithDocument('Our business defines X as Y');

// query for sql
const result = await raggai.query('How my sales went last month?');
console.log(result); // SELECT * FROM sales WHERE date BETWEEN DATE_SUB(NOW(), INTERVAL 1 MONTH) AND NOW();

// query for answer
const result = await raggai.query('What is the total revenue?');
console.log(result); // You have made $1,000 in revenue.
```

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Contact

For any questions or feedback, please open an issue on GitHub.
