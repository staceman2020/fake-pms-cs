import "reflect-metadata";
import { DataSource } from "typeorm";

import { EntityApiManager } from "./EntityApiManager";
import { RepoApiEndpointRegistry } from "../../../common/src/api/database/DatabaseApiEndpointRegistry";
import { FormEntity } from "./entities/FormEntity";
import { FormInstanceEntity } from "./entities/FormInstanceEntity";

export class AppDataSourceManager {
  private static instance: AppDataSourceManager;

  private dataSource: DataSource;

  private formInstanceEM: EntityApiManager;
  private formEM: EntityApiManager;

  private constructor(private directory: string) {
    const database = this.directory + "/model_repo.sqlite";
    // Private constructor to prevent instantiation
    this.dataSource = new DataSource({
      type: "sqlite",
      database: database,
      synchronize: true,
      logging: true,
      entities: [FormInstanceEntity, FormEntity],
      migrations: [],
      subscribers: [],
    });

    this.formEM = new EntityApiManager(this.dataSource, "FormEntity");
    this.formInstanceEM = new EntityApiManager(
      this.dataSource,
      "FormInstanceEntity"
    );
  }

  public static async getInstance(): Promise<AppDataSourceManager> {
    if (!AppDataSourceManager.instance) {
      throw new Error(
        "AppDataSourceManager has not been initialized. Call initializeInstance first."
      );
    }
    return AppDataSourceManager.instance;
  }

  public static initializeInstance(
    app: Express.Application,
    directory: string
  ): void {
    if (!AppDataSourceManager.instance) {
      AppDataSourceManager.instance = new AppDataSourceManager(directory);
    }
    AppDataSourceManager.instance.initialize(app);
  }

  public getDataSource(): DataSource {
    return this.dataSource;
  }

  public async initialize(app: Express.Application): Promise<void> {
    if (!this.dataSource.isInitialized) {
      try {
        await this.dataSource.initialize();
        console.log("Data Source has been initialized!");
      } catch (error) {
        console.error("Error during Data Source initialization:", error);
      }

      this.formInstanceEM.registerRoutes(
        app,
        RepoApiEndpointRegistry.FORM_INSTANCE
      );
      this.formEM.registerRoutes(app, RepoApiEndpointRegistry.FORM);
    }
  }
}
