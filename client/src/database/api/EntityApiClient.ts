import type { DatabaseApiEndpoints } from "../../../../common/src/api/database/DatabaseApiEndpoints";
import { APIBase } from "../../api/APIBase";

export class EntityApiClient<T> extends APIBase {
  private endpoints: DatabaseApiEndpoints;

  constructor(endpoints: DatabaseApiEndpoints) {
    super();
    this.endpoints = endpoints;
  }

  async list(): Promise<T[]> {
    return this.fetchJSON(this.endpoints.list);
  }

  async getItem(id: string): Promise<T> {
    return this.fetchJSON(this.endpoints.item.replace(":id", id));
  }

  async create(data: object): Promise<T> {
    return this.postJSON(this.endpoints.create, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
  }

  async update(id: string, data: object) {
    return this.putJSON(this.endpoints.update.replace(":id", id), {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
  }

  async delete(id: string) {
    return this.fetchJSON(this.endpoints.delete.replace(":id", id), {
      method: "DELETE",
    });
  }
  async deleteAll() {
    return this.fetchJSON(this.endpoints.deleteAll, {
      method: "DELETE",
    });
  }
  async count() {
    return this.fetchJSON(this.endpoints.count);
  }
  async exists(id: string): Promise<boolean> {
    return this.fetchJSON(this.endpoints.exists.replace(":id", id));
  }
  async findByField(field: string, value: string | number | boolean) {
    return this.fetchJSON(
      this.endpoints.findByField
        .replace(":field", field)
        .replace(":value", value.toString())
    );
  }
  async findOneByField(field: string, value: string | number | boolean) {
    return this.fetchJSON(
      this.endpoints.findOneByField
        .replace(":field", field)
        .replace(":value", value.toString())
    );
  }
  async findAndCountByField(field: string, value: string | number | boolean) {
    return this.fetchJSON(
      this.endpoints.findAndCountByField
        .replace(":field", field)
        .replace(":value", value.toString())
    );
  }
  // async findAllByFields(fields: Record<string, any>) {
  //   const query = new URLSearchParams(fields).toString();
  //   return this.fetchJSON(`${this.endpoints.basePath}/findAll?${query}`);
  // }
  async listWithPagination(page: number, limit: number) {
    const url = `${this.endpoints.list}?page=${page}&limit=${limit}`;
    return this.fetchJSON(url);
  }
}
