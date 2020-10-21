/*
 * Copyright (C) 2020  Joao Eduardo Luis <joao@wipwd.dev>
 * This file has originally been part of the ozw-backend project at
 *  https://github.com/jecluis/ozw-backend.git
 *
 * This file is part of wip:wd's dashboard backend (wwd-dashboard).
 * wwd-dashboard is free software: you can redistribute it and/or modify it
 * under the terms of the EUROPEAN UNION PUBLIC LICENSE v1.2, as published by
 * the European Comission.
 */

import { RegisterRoutes } from '../tsoa/routes';
import { Driver } from './Driver';
import { BackendConfig } from './ConfigService';
import swaggerUi from 'swagger-ui-express';
import express, {
    Response as ExResponse, Request as ExRequest, RequestHandler
} from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import fs from 'fs';
import { Server } from 'http';


export class HTTPDriver extends Driver {

    private static instance: HTTPDriver;
    private httpApp = express();
    private httpServer?: Server = undefined;
    private _http_host?: string = undefined;
    private _http_port?: number = undefined;

    private constructor() {
        super("http", true);
        this.httpApp.use(cors());
        this.httpApp.use(bodyParser.urlencoded({extended: true}));
        this.httpApp.use(bodyParser.json());
        this.httpApp.use("/docs", swaggerUi.serve,
            async (_req: ExRequest, res: ExResponse) => {
                const swaggerstr = fs.readFileSync("src/tsoa/swagger.json");
                return res.send(
                    swaggerUi.generateHTML(JSON.parse(swaggerstr.toString()))
                );
        });
        RegisterRoutes(this.httpApp);
    }

    public static getInstance(): HTTPDriver {
        if (!HTTPDriver.instance) {
            HTTPDriver.instance = new HTTPDriver();
        }
        return HTTPDriver.instance;
    }

    public _startup(): boolean {
        if (Object.keys(this._config.http).length === 0) {
            this.logger.error("http config not available");
            return false;
        }
        if (!this._config.http.host || this._config.http.host === "") {
            this.logger.error("http host config not provided");
            return false;
        }
        if (!this._config.http.port || this._config.http.port <= 0) {
            this.logger.error("http port config not provided or incorrect");
            return false;
        }
        this._http_host = this._config.http.host;
        this._http_port = this._config.http.port;
        this.httpServer = this.httpApp.listen(this._http_port, this._http_host);
        if (!this.httpServer) {
            this.logger.error("unable to start http driver");
            return false;
        }
        return true;
    }

    public _shutdown(): boolean {
        this.logger.info("shutting down http server");
        if (!this.isRunning()) {
            this.logger.info("server not running");
            return true;
        }
        this.httpServer?.close(() => {
            this.logger.info("closed http server");
        });
        return true;
    }

    protected _shouldUpdateConfig(config: BackendConfig): boolean {
        return (
            Object.keys(config).length > 0 &&
            Object.keys(config.http).length > 0 &&
            !!config.http.host && config.http.host !== "" &&
            !!config.http.port && config.http.port > 0 &&
            (
                config.http.host !== this._http_host ||
                config.http.port !== this._http_port
            )
        );
    }

    protected _updatedConfig(): void {
        this.logger.info("updated config, restart.");
        if (!this.restart()) {
            this.logger.error("error restarting http driver");
        }
    }
}
