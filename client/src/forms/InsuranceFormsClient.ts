/**
 * Client class for communicating with FormFullPage components
 * Designed to be used in parent windows, iframes, or popup openers
 */
export class InsuranceFormsClient {
  private channelName = "insurance-forms";
  private listeners: { [key: string]: ((data: any) => void)[] } = {};
  private targetWindow: Window | null = null;
  private isConnected = false;
  private connectionTimeout: NodeJS.Timeout | null = null;

  constructor(targetWindow?: Window) {
    this.targetWindow = targetWindow || null;
    
    // Listen for messages from form window
    window.addEventListener("message", this.handleMessage.bind(this));
  }

  private handleMessage(event: MessageEvent) {
    if (event.data?.channel !== this.channelName) {
      return;
    }

    const { type, data } = event.data;
    
    // Auto-detect connection on first message
    if (!this.isConnected && event.source) {
      this.targetWindow = event.source as Window;
      this.isConnected = true;
      this.emit('connected', { formId: data?.formId, formName: data?.formName });
    }

    this.emit(type, data);
  }

  private emit(type: string, data: any) {
    if (this.listeners[type]) {
      this.listeners[type].forEach(callback => callback(data));
    }
  }

  /**
   * Connect to a form window
   */
  public connect(targetWindow: Window): Promise<{ formId: string; formName: string }> {
    this.targetWindow = targetWindow;
    
    return new Promise((resolve, reject) => {
      // Set up connection timeout
      this.connectionTimeout = setTimeout(() => {
        reject(new Error('Connection timeout - form did not respond within 10 seconds'));
      }, 10000);

      // Listen for form-ready message
      const handleReady = (data: { formId: string; formName: string }) => {
        if (this.connectionTimeout) {
          clearTimeout(this.connectionTimeout);
          this.connectionTimeout = null;
        }
        this.isConnected = true;
        this.off('form-ready', handleReady);
        resolve(data);
      };

      this.on('form-ready', handleReady);
    });
  }

  /**
   * Send data to populate/update form fields
   */
  public sendFormData(data: Record<string, any>): boolean {
    if (!this.isConnected || !this.targetWindow) {
      console.warn('InsuranceFormsClient: Not connected to form window');
      return false;
    }

    const message = {
      channel: this.channelName,
      type: 'form-data',
      data,
      timestamp: Date.now()
    };

    this.targetWindow.postMessage(message, '*');
    return true;
  }

  /**
   * Listen for form-ready events (when form is loaded)
   */
  public onFormReady(callback: (data: { formId: string; formName: string }) => void) {
    this.on('form-ready', callback);
  }

  /**
   * Listen for real-time form data changes
   */
  public onFormSave(callback: (formData: Record<string, any>) => void) {
    this.on('form-save', callback);
  }

  /**
   * Listen for connection events
   */
  public onConnected(callback: (data: { formId?: string; formName?: string }) => void) {
    this.on('connected', callback);
  }

  /**
   * Listen for any custom message type
   */
  public on(type: string, callback: (data: any) => void) {
    if (!this.listeners[type]) {
      this.listeners[type] = [];
    }
    this.listeners[type].push(callback);
  }

  /**
   * Remove a listener for a specific message type
   */
  public off(type: string, callback: (data: any) => void) {
    if (this.listeners[type]) {
      const index = this.listeners[type].indexOf(callback);
      if (index > -1) {
        this.listeners[type].splice(index, 1);
      }
    }
  }

  /**
   * Open a form in a new window and automatically connect
   */
  public openForm(
    formId: string, 
    baseUrl: string = window.location.origin,
    windowFeatures: string = 'width=1200,height=800,scrollbars=yes'
  ): Promise<{ window: Window; formId: string; formName: string }> {
    const formUrl = `${baseUrl}/#/forms/display/${formId}`;
    const formWindow = window.open(formUrl, 'insuranceForm', windowFeatures);
    
    if (!formWindow) {
      return Promise.reject(new Error('Failed to open form window - popup blocked?'));
    }

    return this.connect(formWindow).then(formData => ({
      window: formWindow,
      ...formData
    }));
  }

  /**
   * Check if client is connected to a form
   */
  public get connected(): boolean {
    return this.isConnected;
  }

  /**
   * Get the target window reference
   */
  public get window(): Window | null {
    return this.targetWindow;
  }

  /**
   * Disconnect and cleanup
   */
  public disconnect() {
    if (this.connectionTimeout) {
      clearTimeout(this.connectionTimeout);
      this.connectionTimeout = null;
    }
    
    this.isConnected = false;
    this.targetWindow = null;
    this.listeners = {};
    
    window.removeEventListener("message", this.handleMessage.bind(this));
  }

  /**
   * Send a custom message to the form
   */
  public sendMessage(type: string, data?: any): boolean {
    if (!this.isConnected || !this.targetWindow) {
      console.warn('InsuranceFormsClient: Not connected to form window');
      return false;
    }

    const message = {
      channel: this.channelName,
      type,
      data,
      timestamp: Date.now()
    };

    this.targetWindow.postMessage(message, '*');
    return true;
  }
}

/**
 * Factory function to create and connect to a form
 */
export async function connectToForm(
  formId: string,
  options: {
    baseUrl?: string;
    windowFeatures?: string;
    timeout?: number;
  } = {}
): Promise<InsuranceFormsClient> {
  const client = new InsuranceFormsClient();
  
  try {
    await client.openForm(
      formId, 
      options.baseUrl || window.location.origin,
      options.windowFeatures || 'width=1200,height=800,scrollbars=yes'
    );
    return client;
  } catch (error) {
    client.disconnect();
    throw error;
  }
}

/**
 * Create a client for an existing iframe
 */
export function connectToIframe(iframe: HTMLIFrameElement): InsuranceFormsClient {
  const client = new InsuranceFormsClient();
  
  if (iframe.contentWindow) {
    client.connect(iframe.contentWindow).catch(console.error);
  }
  
  return client;
}
