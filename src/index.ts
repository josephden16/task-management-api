import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';

dotenv.config();

const app: Express = express();
const port = process.env.PORT;

app.get('/', (req: Request, res: Response) => {
  res.send('Server Running!');
});

app.get('/status', (req: Request, res: Response) => {
  res.json({
		message: 'OK',
		timestamp: new Date().toISOString(),
		IP: req.ip,
		URL: req.originalUrl,
	});
});

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});
