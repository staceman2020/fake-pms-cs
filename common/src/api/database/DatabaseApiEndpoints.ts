export class DatabaseApiEndpoints {
  private basePath: string;

  constructor(entityName: string) {
    this.basePath = `/api/repo/${entityName}`;
  }

  get list() {
    return `${this.basePath}/items`;
  }

  get item() {
    return `${this.basePath}/items/:id`;
  }

  get create() {
    return `${this.basePath}/items`;
  }
  get update() {
    return `${this.basePath}/items/:id`;
  }

  get delete() {
    return `${this.basePath}/items/:id`;
  }
  get deleteAll() {
    return `${this.basePath}/items`;
  }
  get count() {
    return `${this.basePath}/count`;
  }
  get exists() {
    return `${this.basePath}/exists/:id`;
  }
  get findByField() {
    return `${this.basePath}/find/:field/:value`;
  }
  get findOneByField() {
    return `${this.basePath}/findOne/:field/:value`;
  }
  get findAndCountByField() {
    return `${this.basePath}/findAndCount/:field/:value`;
  }
}
