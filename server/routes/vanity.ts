import { Hono } from 'hono';
import { checkVanityUrl } from '../controllers/vanity';

const routes = new Hono();
routes.post('/:code', checkVanityUrl);

export default routes; 