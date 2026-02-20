import type { FastifyHelmetOptions } from "@fastify/helmet";

const TWO_YEARS_SEC = 60 * 60 * 24 * 365 * 2;

const helmetConfig: FastifyHelmetOptions = {
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'"], //'www.google-analytics.com'
            styleSrc: ["'self'"], //'fonts.googleapis.com'
            imgSrc: ["'self'"],
            fontSrc: ["'self'"], //'fonts.gstatic.com'
            mediaSrc: ["'self'"],
            connectSrc: ["'self'"],
            objectSrc: ["'none'"],
            baseUri: ["'self'"],
            formAction: ["'self'"],
            frameAncestors: ["'none'"],
            frameSrc: ["'none'"],
            upgradeInsecureRequests: [],
        },
    },
    frameguard: { action: "deny" },
    hidePoweredBy: true,
    hsts: {
        maxAge: TWO_YEARS_SEC,
        includeSubDomains: true,
        preload: true,
    },
    noSniff: true,
    referrerPolicy: { policy: "no-referrer" },
    xPermittedCrossDomainPolicies: {
        permittedPolicies: "none",
    },
    xXssProtection: true,
};

export default helmetConfig;
