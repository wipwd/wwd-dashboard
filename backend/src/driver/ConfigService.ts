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

import fs from 'fs';
import { BehaviorSubject } from 'rxjs';
import { Logger } from 'tslog';


export type BackendConfig = {[id: string]: any};

export abstract class ConfigValidator {
    public abstract validConfig(config: any): boolean;
}

const logger: Logger = new Logger({name: "config-svc"});

export class ConfigService {

    private static instance: ConfigService;
    private _config = {} as BackendConfig;
    private _validators: {[id: string]: ConfigValidator} = {};

    _config_update: BehaviorSubject<BackendConfig>;

    private constructor() {
        this._load();
        this._config_update = new BehaviorSubject(this._config);
    }

    public static getInstance(): ConfigService {
        if (!ConfigService.instance) {
            ConfigService.instance = new ConfigService();
        }
        return ConfigService.instance;
    }

    public static getConfig(): BehaviorSubject<BackendConfig> {
        return ConfigService.getInstance().getConfig();
    }

    public static getConfigOnce(): BackendConfig {
        return ConfigService.getInstance().getConfigOnce();
    }

    public static registerValidator(
        name: string,
        validator: ConfigValidator
    ): void {
        return ConfigService.getInstance().registerValidator(name, validator);
    }

    private _updateAll(): void {
        this._config_update.next(this._config);
    }

    private _load(): void {
        let config: BackendConfig = {};
        if (fs.existsSync('./dashboard-config.json')) {
            const rawconf = fs.readFileSync('./dashboard-config.json');
            config = JSON.parse(rawconf.toString("utf-8"));
            if (Object.keys(config).length === 0) {
                config = {};
            }
        }
        this._config = config;
    }

    private _store(): void {
        const rawconf = JSON.stringify(this._config);
        fs.writeFileSync('./dashboard-config.json', rawconf);
    }

    public load(): void {
        this._load();
        this._updateAll();
    }


    public store(): void {
        this._store();
        this._updateAll();
    }

    public registerValidator(name: string, validator: ConfigValidator): void {
        this._validators[name] = validator;
        this.load();
    }

    public setConfig(config: BackendConfig): boolean {
        let valid: boolean = true;
        if (Object.keys(this._validators).length === 0) {
            logger.info("no validators, refuse setting config.");
            return false;
        }
        Object.keys(this._validators).forEach( (_name: string) => {
            if (!(_name in config)) {
                return;
            }
            const _validator_config: any = config[_name];
            if (!this._validators[_name].validConfig(_validator_config)) {
                logger.warn(`invalid config for ${_name}; don't set.`);
                valid = false;
            }
        });
        if (!valid) {
            return false;
        }
        logger.info("set config");
        this._config = config;
        this.store();
        return true;
    }

    public getConfig(): BehaviorSubject<BackendConfig> {
        return this._config_update;
    }

    public getConfigOnce(): BackendConfig {
        return this._config;
    }
}
