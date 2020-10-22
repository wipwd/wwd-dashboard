/*
 * Copyright (C) 2020  Joao Eduardo Luis <joao@wipwd.dev>
 *
 * This file is part of wip:wd's dashboard backend (wwd-dashboard).
 * wwd-dashboard is free software: you can redistribute it and/or modify it
 * under the terms of the EUROPEAN UNION PUBLIC LICENSE v1.2, as published by
 * the European Comission.
 */
import levelup, { LevelUp } from "levelup";
import leveldown from "leveldown";
import { assert } from 'console';
import { Logger } from 'tslog';


const logger: Logger = new Logger({name: 'db-driver'});


export class DBDriver {

    private static instance: DBDriver;
    private _db: LevelUp;

    private constructor(private _db_path: string) {
        this._db = levelup(leveldown(_db_path));
    }

    public static open(_db_path: string): void {
        if (!DBDriver.instance) {
            logger.info(`opening database at ${_db_path}`);
            DBDriver.instance = new DBDriver(_db_path);
        }
    }

    public static getDB(): LevelUp {
        assert(!!DBDriver.instance, "database not open");
        return DBDriver.instance._db;
    }
}
