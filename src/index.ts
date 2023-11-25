import { scrape } from './scrape';

if (process.argv.length < 3) {
  console.log('Usage: npm run scrape <url> <name>');
  process.exit(1);
}

void scrape(process.argv[2], process.argv[3]);
