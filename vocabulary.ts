import { GoogleTranslate } from './scrapers/GoogleTranslate';
const words = process.argv.slice(2);
const googleTranslate = new GoogleTranslate(words);
googleTranslate.run();
