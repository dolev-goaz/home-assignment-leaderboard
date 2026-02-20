import type { Logger } from "typeorm";
import { logger } from "@/services/logging";

interface OperationsLoggerOptions {
    loggerServiceName?: string;
}
const defaultOperationsLoggerOptions = {
    loggerServiceName: "database-operations",
} satisfies OperationsLoggerOptions;

export class DatabaseOperationsLogger implements Logger {
    serviceName: string;
    constructor(options?: OperationsLoggerOptions) {
        const optionsWithDefaults = {
            ...defaultOperationsLoggerOptions,
            ...(options || {}),
        } as Required<OperationsLoggerOptions>;

        this.serviceName = optionsWithDefaults.loggerServiceName;
    }

    private getOperationLogger() {
        return logger.child({ utilityService: this.serviceName });
    }

    private createLoggerWithParams(baseContext: object, parameters?: any[]) {
        let logger = this.getOperationLogger().child(baseContext);
        if (parameters && parameters.length > 0) {
            logger = logger.child({ parameters });
        }
        return logger;
    }

    logQuery(query: string, parameters?: any[]) {
        if (query === "COMMIT") {
            this.getOperationLogger()
                .child({ logType: "transaction" })
                .info("Transaction committed");
            return;
        }
        if (query === "START TRANSACTION") {
            this.getOperationLogger().child({ logType: "transaction" }).info("Transaction started");
            return;
        }
        const logger = this.createLoggerWithParams({ logType: "query", query }, parameters);
        logger.info("Executed query");
    }

    logQueryError(error: string | Error, query: string, parameters?: any[]) {
        const logger = this.createLoggerWithParams({ logType: "query-error", query }, parameters);
        if (error instanceof Error) {
            logger
                .child({ errorMessage: error.message, stack: error.stack })
                .error("Query execution failed");
        } else {
            logger.child({ errorMessage: error }).error("Query execution failed");
        }
    }

    logQuerySlow(time: number, query: string, parameters?: any[]) {
        const logger = this.createLoggerWithParams(
            {
                logType: "query-slow",
                durationMS: time,
                query,
            },
            parameters,
        );
        logger.warn("Slow query detected");
    }

    logSchemaBuild(message: string) {
        this.getOperationLogger().child({ logType: "schema-build" }).info(message);
    }

    logMigration(message: string) {
        this.getOperationLogger().child({ logType: "migration" }).info(message);
    }

    log(level: "log" | "info" | "warn", message: any) {
        switch (level) {
            case "log":
                this.getOperationLogger().child({ level: "log" }).info(message);
                break;
            case "info":
                this.getOperationLogger().info(message);
                break;
            case "warn":
                this.getOperationLogger().warn(message);
                break;
        }
    }
}
