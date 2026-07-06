import "reflect-metadata"
import { DataSource } from "typeorm"

export const AppDataSource = new DataSource({
    type: "better-sqlite3",
    database: "db/database.sqlite",
    synchronize: true,
    logging: true,
    entities: [__dirname + "/entities/*.{ts,js}"],
})
