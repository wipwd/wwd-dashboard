/*
 * Copyright (C) 2020  Joao Eduardo Luis <joao@wipwd.dev>
 *
 * This file is part of wip:wd's dashboard backend (wwd-dashboard).
 * wwd-dashboard is free software: you can redistribute it and/or modify it
 * under the terms of the EUROPEAN UNION PUBLIC LICENSE v1.2, as published by
 * the European Comission.
 */
import { assert } from 'console';
import { Collection, Db, MongoClient } from 'mongodb';
import { Driver } from './Driver';


export interface DBDriverConfig {
    user: string;
    password: string;
    url: string;
}

export class DBDriver extends Driver<DBDriverConfig> {

    private _client?: MongoClient;
    private _db?: Db;
    private _is_connected: boolean = false;

    public constructor() {
        super("mongodb", true);
    }

    private async _connect(): Promise<void> {
        if (!this._client) {
            this.logger.error("can't connect to db; no client.");
            return;
        }
        try {
            await this._client?.connect();
            this._db = this._client?.db("wwd-dashboard");
            this._is_connected = true;
        } catch (e) {
            this.logger.info("connected to database");
        }
    }

    protected _startup(): boolean {
        assert(this.hasConfig());
        assert(!!this._config.user && this._config.user !== "");
        assert(!!this._config.password && this._config.password !== "");
        assert(!!this._config.url && this._config.url !== "");

        if (this.hasOpenDBConnection()) {
            this.logger.warn("won't startup; existing open db");
            return false;
        }

        this.logger.debug("config: ", this._config);

        const user: string = this._config.user;
        const pass: string = this._config.password;
        const url: string = this._config.url;
        const options: string = "retryWrites=true&w=majority";
        const uri: string = `mongodb+srv://${user}:${pass}@${url}/?${options}`;
        this._client = new MongoClient(uri, {
            useNewUrlParser: true, useUnifiedTopology: true
        });
        this._connect();
        return true;
    }

    protected _shutdown(): boolean {
        this._client?.close();
        this._is_connected = false;
        this._db = undefined;
        return true;
    }

    protected _shouldUpdateConfig(config: DBDriverConfig): boolean {
        return (
            Object.keys(config).length > 0 &&
            !!config.user && config.user !== "" &&
            !!config.password && config.password !== "" &&
            !!config.url && config.url !== "" &&
            (
                config.user !== this._config.user ||
                config.password !== this._config.password ||
                config.url !== this._config.url
            )
        );
    }

    protected _updatedConfig(): void {
        this.logger.info("updated config; restart.");
        if (!this.restart()) {
            this.logger.error("error restarting mongodb driver");
        }
    }

    public hasOpenDBConnection(): boolean {
        return (!!this._client);
    }

    public isConnected(): boolean {
        return (this.hasOpenDBConnection() && this._is_connected);
    }

    public getCollection<T>(_name: string): Collection<T>|undefined {
        assert(this.isConnected());
        return this._db?.collection(_name);
    }
}
