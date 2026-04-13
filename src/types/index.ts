export type UserIdentity = {
  type: 'anonymous' | 'identified';
  id: string;
  name?: string;
  class?: string;
  mood?: string;
};

export type Message = {
  id: string;
  role: 'user' | 'model';
  text: string;
  isTyping?: boolean;
};
