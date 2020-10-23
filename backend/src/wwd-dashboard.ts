/*
 * Copyright (C) 2020  Joao Eduardo Luis <joao@wipwd.dev>
 *
 * This file is part of wip:wd's dashboard backend (wwd-dashboard).
 * wwd-dashboard is free software: you can redistribute it and/or modify it
 * under the terms of the EUROPEAN UNION PUBLIC LICENSE v1.2, as published by
 * the European Comission.
 */

import { Logger } from "tslog";
import { DBDriver } from './driver/DBDriver';
import { HTTPDriver } from './driver/HTTPDriver';


const logger: Logger = new Logger({name: 'wwd-dashboard'});


let keep_looping: boolean = true;
process.on("SIGINT", () => {
    logger.info("sigint received, shutdown.");
    keep_looping = false;
});


async function sleep(ms: number): Promise<void> {
    return new Promise( (resolve) => {
        setTimeout(resolve, ms);
    });
}


async function main(): Promise<void> {
    try {
        const _db: DBDriver = new DBDriver();
        _db.startup();
        while (!_db.isConnected()) {
            logger.info("waiting for database to be ready...");
            await sleep(1000);
        }

        const _http: HTTPDriver = HTTPDriver.getInstance();
        logger.info("starting up...");
        _http.startup();

        while (keep_looping) {
            await sleep(1000);
        }

        logger.info("shutting down...");
        _http.shutdown();
        _db.shutdown();
        while (_db.isConnected()) {
            logger.info("waiting for database shutdown...");
            await sleep(1000);
        }
    } catch (e) {
        logger.error("error: ", e);
    }
    process.exit(0);
}

main();
