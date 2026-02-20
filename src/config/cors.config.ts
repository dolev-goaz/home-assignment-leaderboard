import { FastifyCorsOptions } from "@fastify/cors";

const corsConfig = {
    // for production we would limit this to the frontend domain
    origin: "*",
    methods: ["POST", "PUT", "GET", "OPTIONS", "HEAD"],
    credentials: true,
} satisfies FastifyCorsOptions;

export default corsConfig;
