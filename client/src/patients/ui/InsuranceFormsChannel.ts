export interface OnLoadRequest {
  formId: string;
  fields: string[];
}

export interface OnLoadResponse {
  formId: string;
  // This is data from the source system
  prepopulated: { [key: string]: string | boolean | number };
  // If restoring the existing form, include the content
  content: object;
}

export interface OnSaveRequest {
  formId: string;
  content: object;
}

export interface OnSaveResponse {
  formId: string;
  success: boolean;
}

export interface OnSubmitRequest {
  formId: string;
  content: object;
}

export interface OnSubmitResponse {
  formId: string;
  success: boolean;
}

export interface OnFormChangeRequest {
  formId: string;
  content: object;
}

export interface FormsChannelListener {
  onLoadRequest?: (request: OnLoadRequest) => void;
  onLoadResponse?: (response: OnLoadResponse) => void;
  onSaveRequest?: (data: OnSaveRequest) => void;
  onSaveResponse?: (response: OnSaveResponse) => void;
  onSubmitRequest?: (data: OnSubmitRequest) => void;
  onSubmitResponse?: (response: OnSubmitResponse) => void;
  onFormChangeRequest?: (request: OnFormChangeRequest) => void;
}

export type FormsChannelEvent =
  | "onLoadRequest"
  | "onLoadResponse"
  | "onSaveRequest"
  | "onSaveResponse"
  | "onSubmitRequest"
  | "onSubmitResponse"
  | "onFormChangeRequest";

export const FormsChannelEvent = {
  OnLoadRequest: "onLoadRequest",
  OnLoadResponse: "onLoadResponse",
  OnSaveRequest: "onSaveRequest",
  OnSaveResponse: "onSaveResponse",
  OnSubmitRequest: "onSubmitRequest",
  OnSubmitResponse: "onSubmitResponse",
  OnFormChangeRequest: "onFormChangeRequest",
} as const;

/**
 * Channel for communicating with parent window via window.postMessage
 * Uses the "insurance-forms" channel for messaging
 */
export class InsuranceFormsChannel {
  private channelName = "insurance-forms";
  //private listeners: { [key: string]: ((data: any) => void)[] } = {};
  private listeners: FormsChannelListener;

  private replySource: MessageEventSource | null = null;

  constructor(listeners: FormsChannelListener) {
    this.listeners = listeners;

    // Listen for messages from parent window
    window.addEventListener("message", this.handleMessage.bind(this));
  }

  private handleMessage(event: MessageEvent) {
    if (event.data?.channel !== this.channelName) {
      return;
    }

    this.replySource = event.source;

    const { type, data } = event.data;
    switch (type) {
      case FormsChannelEvent.OnLoadRequest:
        this.listeners.onLoadRequest?.(data);
        break;
      case FormsChannelEvent.OnLoadResponse:
        this.listeners.onLoadResponse?.(data);
        break;
      case FormsChannelEvent.OnSaveRequest:
        this.listeners.onSaveRequest?.(data);
        break;
      case FormsChannelEvent.OnSaveResponse:
        this.listeners.onSaveResponse?.(data);
        break;
      case FormsChannelEvent.OnSubmitRequest:
        this.listeners.onSubmitRequest?.(data);
        break;
      case FormsChannelEvent.OnSubmitResponse:
        this.listeners.onSubmitResponse?.(data);
        break;
    }
  }

  /**
   * Send a message to the parent window
   */
  public send(
    type: string,
    data?:
      | OnLoadRequest
      | OnLoadResponse
      | OnSaveRequest
      | OnSaveResponse
      | OnSubmitRequest
      | OnSubmitResponse
  ) {
    const message = {
      channel: this.channelName,
      type,
      data,
      timestamp: Date.now(),
    };

    // Send to parent window
    if (window.parent && window.parent !== window) {
      console.log("Sending message to parent window:", message);
      window.parent.postMessage(message, "*");
      return;
    }

    // Also send to opener (if opened in new window)
    if (window.opener) {
      console.log("Sending message to opener:", message);
      window.opener.postMessage(message, "*");
      return;
    }

    console.log("Posting...:", message);
    window.postMessage(message, "*");

    // If no parent or opener, log to console
    console.log("No parent or opener found for message:", message);
  }

  public reply(
    type: string,
    data?: OnLoadResponse | OnSaveResponse | OnSubmitResponse
  ) {
    const message = {
      channel: this.channelName,
      type,
      data,
      timestamp: Date.now(),
    };
    this.replySource?.postMessage(message, { targetOrigin: "*" });
    // // Send to parent window
    // if (window.parent && window.parent !== window) {
    //   console.log("Sending message to parent window:", message);
    //   window.parent.postMessage(message, "*");
    //   return;
    // }

    // // Also send to opener (if opened in new window)
    // if (window.opener) {
    //   console.log("Sending message to opener:", message);
    //   window.opener.postMessage(message, "*");
    //   return;
    // }

    // console.log("Posting...:", message);
    // window.postMessage(message, "*");

    // // If no parent or opener, log to console
    // console.log("No parent or opener found for message:", message);
  }

  /**
   * Send form-ready message
   */
  public sendLoadRequest(request: OnLoadRequest) {
    this.send(FormsChannelEvent.OnLoadRequest, request);
  }

  public sendLoadResponse(response: OnLoadResponse) {
    this.reply(FormsChannelEvent.OnLoadResponse, response);
  }

  /**
   * Send form-save message with form data
   */
  public sendSaveRequest(request: OnSaveRequest) {
    this.send(FormsChannelEvent.OnSaveRequest, request);
  }

  public sendSaveResponse(response: OnSaveResponse) {
    this.reply(FormsChannelEvent.OnSaveResponse, response);
  }

  /**
   * Listen for form-data messages
   */
  public sendSubmitRequest(request: OnSubmitRequest) {
    this.send(FormsChannelEvent.OnSubmitRequest, request);
  }

  public sendSubmitResponse(response: OnSubmitResponse) {
    this.reply(FormsChannelEvent.OnSubmitResponse, response);
  }

  /**
   * Send form-change message with form data
   */
  public sendFormChangeRequest(request: OnFormChangeRequest) {
    this.send(FormsChannelEvent.OnFormChangeRequest, request);
  }

  /**
   * Cleanup listeners
   */
  public destroy() {
    window.removeEventListener("message", this.handleMessage.bind(this));
    this.listeners = {};
  }
}
