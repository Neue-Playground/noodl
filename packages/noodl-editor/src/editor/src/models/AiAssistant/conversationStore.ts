import { AiRemoteStore } from '@noodl-store/AiAssistantStore';

class ConversationStore {
  private store = new AiRemoteStore();

  getConversationIdForNode(nodeId: string): string | null {
    return this.store.getConversationIdForNode(nodeId);
  }

  linkConversationToNode(nodeId: string, conversationId: string) {
    this.store.linkConversationToNode(nodeId, conversationId);
  }

  unlinkConversationForNode(nodeId: string) {
    this.store.unlinkConversationForNode(nodeId);
  }

  reset() {
    this.store.reset();
  }
}

export const conversationStore = new ConversationStore();
