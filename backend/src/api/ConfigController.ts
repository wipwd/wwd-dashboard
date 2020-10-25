/*
 * Copyright (C) 2020  Joao Eduardo Luis <joao@wipwd.dev>
 *
 * This file is part of wip:wd's dashboard backend (wwd-dashboard).
 * wwd-dashboard is free software: you can redistribute it and/or modify it
 * under the terms of the EUROPEAN UNION PUBLIC LICENSE v1.2, as published by
 * the European Comission.
 */

import {
    Controller,
    Get,
    Route
} from 'tsoa';
import { Logger } from 'tslog';
import { BackendConfig, ConfigService } from '../driver/ConfigService';


const logger: Logger = new Logger({name: "api-config"});
const svc: ConfigService = ConfigService.getInstance();

export interface APIConfigItem {
    config: BackendConfig;
}

@Route("/api/config")
export class ConfigController extends Controller {

    constructor() { super(); }

    @Get("")
    public async getConfig(): Promise<APIConfigItem> {
        return {
            config: svc.getConfigOnce()
        };
    }
}
