import {Ratelimit} from '@upstash/ratelimit';
import {Redis} from '@upstash/redis';

const rateLimit = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(10, '1 m'),
});

export default rateLimit;
