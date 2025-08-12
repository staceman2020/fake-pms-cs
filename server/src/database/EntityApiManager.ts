import { DataSource } from "typeorm";
import { RouteUtils } from "../routes/RouteUtils";
import { DatabaseApiEndpoints } from "../../../common/src/api/database/DatabaseApiEndpoints";

export class EntityApiManager {
  dataSource: DataSource;
  constructor(ds: DataSource, private repository: string) {
    this.dataSource = ds;
  }

  async list() {
    return this.dataSource.getRepository(this.repository).find();
  }

  async get(id: string) {
    return this.dataSource.getRepository(this.repository).findOneBy({ id: id });
  }

  async create(data: any) {
    const repo = this.dataSource.getRepository(this.repository);
    const entity = repo.create(data);
    return repo.save(entity);
  }
  async update(id: string, data: any) {
    const repo = this.dataSource.getRepository(this.repository);
    await repo.update(id, data);
    return this.get(id);
  }
  async delete(id: string) {
    const repo = this.dataSource.getRepository(this.repository);
    const entity = await this.get(id);
    if (entity) {
      return repo.remove(entity);
    }
    throw new Error(`Entity with id ${id} not found`);
  }
  async deleteAll() {
    const repo = this.dataSource.getRepository(this.repository);
    const entities = await this.list();
    return repo.remove(entities);
  }
  async count() {
    const repo = this.dataSource.getRepository(this.repository);
    return repo.count();
  }
  async exists(id: string): Promise<boolean> {
    const repo = this.dataSource.getRepository(this.repository);
    const count = await repo.countBy({ id: id });
    return count > 0;
  }

  async findByField(field: string, value: any) {
    const repo = this.dataSource.getRepository(this.repository);
    return repo.find({ where: { [field]: value } });
  }
  async findOneByField(field: string, value: any) {
    const repo = this.dataSource.getRepository(this.repository);
    return repo.findOne({ where: { [field]: value } });
  }
  async findAndCountByField(field: string, value: any) {
    const repo = this.dataSource.getRepository(this.repository);
    return repo.findAndCount({ where: { [field]: value } });
  }
  async findAllByFields(fields: Record<string, any>) {
    const repo = this.dataSource.getRepository(this.repository);
    return repo.find({ where: fields });
  }

  registerRoutes(app: any, endpoints: DatabaseApiEndpoints) {
    const getBodyAsObject = (req: any) => {
      const body = req.body.body || req.body;
      return typeof body === "string" ? JSON.parse(body) : body;
    };

    console.log(`Registering route: ${endpoints.list}`);
    app.get(endpoints.list, async (req: any, res: any) => {
      console.log(`Executing route: ${endpoints.list}`);
      RouteUtils.handleErrors(res, "list entities", async () => {
        const entities = await this.list();
        if (entities.length === 0) {
          console.log(`No entities found`);
          res.json([]);
        } else {
          res.json(entities);
        }
      });
    });

    app.get(endpoints.item, async (req: any, res: any) => {
      RouteUtils.handleErrors(res, "get entity", async () => {
        const entity = await this.get(req.params.id);
        if (entity) {
          res.json(entity);
        } else {
          res.status(404).json({ error: "Entity not found" });
        }
      });
    });

    app.post(endpoints.create, async (req: any, res: any) => {
      console.log(`Executing route: ${endpoints.create}`);
      RouteUtils.handleErrors(res, "create entity", async () => {
        // const data = req.body.body || req.body; // Handle both body and body.body
        // console.log(`Creating entity with data:`, req.body, typeof req.body);
        // console.log(`Creating entity with data:`, data, typeof data);
        const entity = await this.create(getBodyAsObject(req));
        res.status(201).json(entity);
      });
    });

    app.put(endpoints.update, async (req: any, res: any) => {
      RouteUtils.handleErrors(res, "update entity", async () => {
        const entity = await this.update(req.params.id, getBodyAsObject(req));
        res.json(entity);
      });
    });

    app.delete(endpoints.delete, async (req: any, res: any) => {
      RouteUtils.handleErrors(res, "delete entity", async () => {
        await this.delete(req.params.id);
        res.status(204).send();
      });
    });

    app.delete(endpoints.deleteAll, async (req: any, res: any) => {
      RouteUtils.handleErrors(res, "delete all entities", async () => {
        await this.deleteAll();
        res.status(204).send();
      });
    });

    app.get(endpoints.count, async (req: any, res: any) => {
      RouteUtils.handleErrors(res, "count entities", async () => {
        const count = await this.count();
        res.json({ count });
      });
    });

    app.get(endpoints.exists, async (req: any, res: any) => {
      RouteUtils.handleErrors(res, "check entity existence", async () => {
        const exists = await this.exists(req.params.id);
        res.json({ exists });
      });
    });

    app.get(endpoints.findByField, async (req: any, res: any) => {
      RouteUtils.handleErrors(res, "find entities by field", async () => {
        const entities = await this.findByField(
          req.params.field,
          req.params.value
        );
        res.json(entities);
      });
    });

    app.get(endpoints.findOneByField, async (req: any, res: any) => {
      RouteUtils.handleErrors(res, "find one entity by field", async () => {
        const entity = await this.findOneByField(
          req.params.field,
          req.params.value
        );
        if (entity) {
          res.json(entity);
        } else {
          res.status(404).json({ error: "Entity not found" });
        }
      });
    });

    app.get(endpoints.findAndCountByField, async (req: any, res: any) => {
      RouteUtils.handleErrors(
        res,
        "find and count entities by field",
        async () => {
          const [entities, count] = await this.findAndCountByField(
            req.params.field,
            req.params.value
          );
          res.json({ entities, count });
        }
      );
    });
  }
}
