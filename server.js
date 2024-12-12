/* eslint-disable import/no-unresolved */
// server.js
import express from 'express';
// eslint-disable-next-line import/extensions
import routes from './routes/index.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(routes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
