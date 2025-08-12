export class APIBase {
  private baseUrl: string = "/api";
  private port: number = 3000;

  constructor() {
    // The base URL is taken from the root of the window location and then the port is changed to be
    this.baseUrl = `${window.location.protocol}//${window.location.hostname}:${this.port}`;
  }

  protected makeUrl(endpoint: string): string {
    // Ensure the endpoint starts with a slash
    if (!endpoint.startsWith("/")) {
      endpoint = `/${endpoint}`;
    }
    // Return the full URL
    return `${this.baseUrl}${endpoint}`;
  }

  protected async fetchJSON<T>(url: string, options?: RequestInit): Promise<T> {
    const response = await fetch(this.makeUrl(url), {
      headers: {
        "Content-Type": "application/json",
      },
      ...options,
    });
    if (!response.ok) {
      throw new Error(`Error fetching API: ${response.statusText}`);
    }
    return response.json();
  }

  protected async fetchBlob(url: string, options?: RequestInit): Promise<Blob> {
    const response = await fetch(this.makeUrl(url), {
      ...options,
    });
    if (!response.ok) {
      throw new Error(`Error fetching Blob: ${response.statusText}`);
    }
    return response.blob();
  }

  // Post method to send data to the server
  protected async postJSON<REQ, RES>(url: string, data: REQ): Promise<RES> {
    const response = await fetch(this.makeUrl(url), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`Error posting data: ${response.statusText}`);
    }
    return response.json();
  }

  // Put method to update data on the server
  protected async putJSON<REQ, RES>(url: string, data: REQ): Promise<RES> {
    const response = await fetch(this.makeUrl(url), {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`Error updating data: ${response.statusText}`);
    }
    return response.json();
  }
}
