import { Hono } from 'hono';
import { lookupUser } from '../controllers/users';

const routes = new Hono();
routes.get('/:id', lookupUser);

export default routes; 